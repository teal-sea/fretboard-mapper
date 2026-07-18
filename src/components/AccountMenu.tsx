// Login / upgrade / manage-subscription controls for the header, plus the
// cross-device sync effect for subscribers. Only mounted by App.tsx when
// VITE_CLERK_PUBLISHABLE_KEY is set (see main.tsx) — every hook here
// assumes a ClerkProvider ancestor exists.
import { useCallback, useEffect, useRef, useState } from 'react'
import { SignedIn, SignedOut, SignInButton, UserButton, useAuth, useUser } from '@clerk/clerk-react'
import type { AppState } from '../types/music'
import { pickSyncedState, type SyncedState } from '../utils/cloudSync'

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

  // Pull once per subscribed session, then push on every change after
  // that — guarded by justPulled so the pull's own up() call doesn't
  // immediately bounce back out as a push.
  const justPulled = useRef(false)
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!subscribed) return
    let cancelled = false
    ;(async () => {
      const token = await getToken()
      if (!token || cancelled) return
      const res = await fetch('/api/sync', { headers: { Authorization: `Bearer ${token}` } })
      const { appState } = (await res.json()) as { appState: SyncedState | null }
      if (appState && !cancelled) {
        justPulled.current = true
        up(appState)
      }
    })()
    return () => { cancelled = true }
    // Only re-pull when the subscribed flag itself flips (login/upgrade),
    // not on every render — `up` and `getToken` are stable across renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscribed])

  const synced = pickSyncedState(state)
  useEffect(() => {
    if (!subscribed) return
    if (justPulled.current) { justPulled.current = false; return }
    if (pushTimer.current) clearTimeout(pushTimer.current)
    pushTimer.current = setTimeout(async () => {
      const token = await getToken()
      if (!token) return
      await fetch('/api/sync', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(synced),
      })
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

  return (
    <div className="account-menu">
      <SignedOut>
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
            &#128293; Keep your streak — $5/mo
          </button>
        )}
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
    </div>
  )
}
