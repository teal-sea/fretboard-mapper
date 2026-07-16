// ─── Practice streak ───────────────────────────────────────────────────
// A day only counts once real engagement happens — pressing Play — not
// just opening the tab, matching the same "did they ever press play"
// signal the app's own analytics already treat as the real engagement
// event (see the trackEvent comment in App.tsx). Pure and date-injected so
// it's testable without touching the clock.

export interface StreakState {
  streak: number
  lastDate: string | null // YYYY-MM-DD
}

const DAY_MS = 24 * 60 * 60 * 1000

export function recordPractice(prev: StreakState, todayIso: string): StreakState {
  if (prev.lastDate === todayIso) return prev // already counted today — no double-increment
  if (prev.lastDate) {
    const gapDays = Math.round((Date.parse(todayIso) - Date.parse(prev.lastDate)) / DAY_MS)
    if (gapDays === 1) return { streak: prev.streak + 1, lastDate: todayIso }
  }
  return { streak: 1, lastDate: todayIso } // first ever practice, or the streak broke
}
