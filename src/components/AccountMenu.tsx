// Login / upgrade / manage-subscription controls for the header, plus the
// cross-device sync effect for subscribers. Only mounted by App.tsx when
// VITE_CLERK_PUBLISHABLE_KEY is set (see main.tsx) — every hook here
// assumes a ClerkProvider ancestor exists.
import { useCallback, useEffect, useRef, useState } from 'react'
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useAuth, useUser } from '@clerk/clerk-react'
import type { AppState } from '../types/music'
import { pickSyncedState, pickSyncedPartial } from '../utils/cloudSync'
import { t, tf } from '../utils/i18n'

async function callApi(path: string, token: string | null): Promise<{ url?: string; error?: string }> {
  const res = await fetch(path, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  return res.json()
}

export default function AccountMenu({ state, up }: { state: AppState; up: (partial: Partial<AppState>) => void }) {
  const { getToken } = useAuth()
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const subscribed = user?.publicMetadata?.subscribed === true

  // Pull once per subscribed session, then push on every change after that.
  // serverState remembers (serialized) what the server already has, so the
  // pull's own up() call doesn't bounce back out as a push — and, unlike a
  // consumed-once boolean, it can never swallow a real edit when the pulled
  // state happens to equal local state.
  const serverState = useRef<string | null>(null)
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!subscribed) return
    let cancelled = false
    ;(async () => {
      const token = await getToken()
      if (!token || cancelled) return
      try {
        const res = await fetch('/api/sync', { headers: { Authorization: `Bearer ${token}` } })
        if (!res.ok) return
        const { appState } = (await res.json()) as { appState: unknown }
        // Never trust the wire: re-whitelist before merging into AppState.
        const pulled = pickSyncedPartial(appState)
        if (Object.keys(pulled).length && !cancelled) {
          serverState.current = JSON.stringify(pulled)
          up(pulled)
        }
      } catch { /* offline or API down — keep local state, push will retry */ }
    })()
    return () => { cancelled = true }
    // Only re-pull when the subscribed flag itself flips (login/upgrade),
    // not on every render — `up` and `getToken` are stable across renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscribed])

  // After checkout, App.tsx leaves this session flag (from ?upgraded=1).
  // The Polar webhook that flips publicMetadata.subscribed races our page
  // load — poll reload() until it lands so the $5 CTA swaps to the manage
  // gear without the user having to refresh. Give up after a minute.
  useEffect(() => {
    if (!user) return
    if (subscribed) { sessionStorage.removeItem('mr-upgraded'); return }
    if (sessionStorage.getItem('mr-upgraded') !== '1') return
    const poll = setInterval(() => { user.reload().catch(() => {}) }, 3000)
    const giveUp = setTimeout(() => clearInterval(poll), 60000)
    return () => { clearInterval(poll); clearTimeout(giveUp) }
  }, [user, subscribed])

  const synced = pickSyncedState(state)
  useEffect(() => {
    if (!subscribed) return
    const serialized = JSON.stringify(synced)
    // Don't push what the server already has (including what we just pulled)
    if (serialized === serverState.current) return
    if (pushTimer.current) clearTimeout(pushTimer.current)
    pushTimer.current = setTimeout(async () => {
      const token = await getToken()
      if (!token) return
      try {
        const res = await fetch('/api/sync', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: serialized,
        })
        if (res.ok) serverState.current = serialized
      } catch { /* offline — the next state change retries */ }
    }, 1500)
    return () => { if (pushTimer.current) clearTimeout(pushTimer.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscribed, JSON.stringify(synced)])

  const startCheckout = useCallback(async () => {
    setLoading(true)
    try {
      const token = await getToken()
      const { url, error } = await callApi('/api/checkout', token)
      if (url) window.location.href = url
      else if (error) console.error('Checkout failed:', error)
    } finally {
      setLoading(false)
    }
  }, [getToken])

  const openPortal = useCallback(async () => {
    setLoading(true)
    try {
      const token = await getToken()
      const { url, error } = await callApi('/api/portal', token)
      if (url) window.location.href = url
      else if (error) console.error('Portal open failed:', error)
    } finally {
      setLoading(false)
    }
  }, [getToken])

  const streak = state.practiceStreak
  const ctaLabel = streak >= 2
    ? tf('Keep your {n}-day streak · $5/mo', state.language, { n: streak })
    : t('Make practice stick · $5/mo', state.language)
  return (
    <div className="account-menu">
      <SignedOut>
        <SignUpButton mode="modal">
          <button className="upgrade-btn" title="Sign up free — then $5/mo syncs your streak, favorites, and settings to every device">
            {ctaLabel}
          </button>
        </SignUpButton>
        <SignInButton mode="modal">
          <button className="icon-btn" title="Log in" aria-label="Log in">&#128100;</button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        {subscribed ? (
          <button
            className="icon-btn"
            onClick={openPortal}
            disabled={loading}
            title="Manage subscription"
            aria-label="Manage subscription"
          >
            &#9881;&#65039;
          </button>
        ) : (
          <button className="upgrade-btn" onClick={startCheckout} disabled={loading} title="Your streak, favorites, and settings — synced and safe on every device">
            {ctaLabel}
          </button>
        )}
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
    </div>
  )
}
