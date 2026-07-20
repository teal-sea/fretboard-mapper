// ─── Full-screen veils: post-checkout thank-you, desktop nudge, intro ───
// All three are once-in-a-while overlays, never load-bearing. The desktop
// nudge owns its state here (self-contained localStorage logic); the
// upgrade celebration and intro are driven by App, which owns the audio
// payoff and the onboarding writes.
import { useState, useEffect, useCallback } from 'react'

export default function Veils({ upgradedOpen, onDismissUpgraded, introOpen, onIntroChoose, T }: {
  upgradedOpen: boolean
  onDismissUpgraded: () => void
  introOpen: boolean
  /** 'study' | 'flow' pick a mode; null is the plain Close */
  onIntroChoose: (dest: 'study' | 'flow' | null) => void
  T: (s: string) => string
}) {
  // ─── "Looks better on desktop" nudge ───
  // Reddit sends a lot of phones. This never blocks the app (same rule as
  // the rotate-prompt) — it's a once-ever aside, dismissed for good,
  // shown only to touch-primary devices (hover:none + pointer:coarse),
  // not merely narrow desktop windows, which a width breakpoint alone
  // would catch.
  const DESKTOP_NUDGE_KEY = 'fm.desktopNudgeSeen'
  const [desktopNudgeOpen, setDesktopNudgeOpen] = useState(false)
  useEffect(() => {
    try {
      if (localStorage.getItem(DESKTOP_NUDGE_KEY)) return
    } catch { /* storage unavailable — just don't nag every load */ return }
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
      setDesktopNudgeOpen(true)
    }
  }, [])
  const dismissDesktopNudge = useCallback(() => {
    setDesktopNudgeOpen(false)
    try { localStorage.setItem(DESKTOP_NUDGE_KEY, '1') } catch { /* no-op */ }
  }, [])

  return (
    <>
      {/* ─── They just paid. Say it back with the product: a thank-you in
             brand voice, closed by a resolved chord in their own key. ─── */}
      {upgradedOpen && (
        <div className="intro-veil upgrade-veil">
          <div className="upgrade-card">
            <img className="upgrade-logo" src="/logo.webp" alt="Modal Runs" />
            <h1 className="upgrade-title">{T('You’re in.')}</h1>
            <p className="upgrade-sub">
              {T('Your streak, favorites, and settings now follow you to every device — and you’re keeping an independent tool alive. That matters.')}
            </p>
            <button className="upgrade-go" onClick={onDismissUpgraded}>{T('Hear it')}</button>
          </div>
        </div>
      )}

      {desktopNudgeOpen && (
        <div className="intro-veil desktop-nudge-veil">
          <div className="desktop-nudge-card">
            <button className="desktop-nudge-close" onClick={dismissDesktopNudge} aria-label={T('Continue on mobile')} title={T('Continue on mobile')}>
              &#10005;
            </button>
            <div className="desktop-nudge">
              <img className="desktop-nudge-logo" src="/mark.webp" alt="" />
              <h2 className="desktop-nudge-title"><span className="desktop-nudge-title-brand">modalruns</span> {T('looks best on desktop')}</h2>
              <p className="desktop-nudge-sub">
                {T('The whole neck, every mode, side by side — a bigger screen shows a lot more of it at once. Totally playable here too.')}
              </p>
              <img className="desktop-nudge-frame" src="/desktop-nudge-art.webp" alt="Modal Runs open on a desktop monitor" />
              <button className="desktop-nudge-dismiss" onClick={dismissDesktopNudge}>{T('Continue on mobile')}</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── The welcome never ambushes anyone — the domain loads straight
             into the app. It opens on demand from the "What is this?" button
             in Modes. (onboarded persists but no longer gates anything.) ─── */}
      {introOpen && (
        <div className="intro-veil in-stage">
          <div className="intro">
            <img className="intro-logo" src="/logo.webp" alt="Modal Runs" />
            <h1 className="intro-title">
              {T('It')} <em>{T('listens while you play,')}</em> {T('and answers on the neck.')}
            </h1>
            <p className="intro-sub">
              {T('In 1959, Miles Davis walked into a studio bored of chasing chord changes and cut an album built on almost none.')}{' '}
              <em>Kind of Blue</em>{' '}
              {T('— still the best-selling jazz record ever made — runs on scales instead of progressions. He called it modal jazz: hold one note underneath (a drone), improvise inside a single scale (a mode), and let the mode do the emotional work a wall of chords usually does.')}
            </p>
            <p className="intro-sub">
              {T('That’s this app, on a fretboard. Hold a drone in any key and the neck fills with the notes that work over it. Play, and Modal Runs hears you through the mic — it lights up what you just played and tells you the moment you land the note it’s hunting for. Move the tonic and the same seven notes turn from A Aeolian into D Dorian — same frets, same notes, just a different one as home. Seven different moods out of one shape. You find them by ear, the way Miles did — not off a chart.')}
            </p>

            {/* The thesis, made concrete — the thing a textbook can't do. */}
            <div className="intro-how">
              <div className="intro-step">
                <span className="intro-step-n">1</span>
                <span className="intro-step-t">{T('Set the key')}</span>
                <span className="intro-step-d">
                  {T('The neck fills with the notes that belong to it. Each one is coloured by its interval rather than its name, so you read what a note does against the tonic, not merely what it’s called. The root is amber.')}
                </span>
              </div>
              <div className="intro-step">
                <span className="intro-step-n">2</span>
                <span className="intro-step-t">{T('Start the drone')}</span>
                <span className="intro-step-d">
                  {T('It sustains the tonic underneath you, so every note you play finally has something to lean against. The b6 aches against it; the natural 6 opens up. Intervals stop being arithmetic and start being sounds.')}
                </span>
              </div>
              <div className="intro-step">
                <span className="intro-step-n">3</span>
                <span className="intro-step-t">{T('Move the tonic')}</span>
                <span className="intro-step-d">
                  {T('Tap Dorian in the same-notes strip. Same frets, same notes — the drone simply moves home to D, and the app names the one note that separates it from where you just were.')}
                </span>
              </div>
            </div>

            <div className="intro-modes">
              <button className="intro-mode" onClick={() => onIntroChoose('study')}>
                <span className="intro-mode-name">{T('Explore')}</span>
                <span className="intro-mode-desc">
                  {T('Any key, any mode. Chords laid over scales, arpeggios, positions, the whole fretboard at once — and the theory that accounts for what you’re looking at, written for someone who wants to understand it rather than recite it.')}
                </span>
              </button>
              <button className="intro-mode" onClick={() => onIntroChoose('flow')}>
                <span className="intro-mode-name">{T('Just play')}</span>
                <span className="intro-mode-desc">
                  {T('One idea, chosen for you, with the shape already sitting on the neck. Start the drone and play over it; if you let it listen through your mic, it will tell you when you land the note it asked for.')}
                </span>
              </button>
            </div>
            <button className="intro-skip" onClick={() => onIntroChoose(null)}>{T('Close')}</button>
          </div>
        </div>
      )}
    </>
  )
}
