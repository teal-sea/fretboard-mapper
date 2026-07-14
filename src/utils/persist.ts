// ─── State persistence ──────────────────────────────────────────────
// The one place AppState touches localStorage. No backend, no account —
// just "remember what I was looking at" across a refresh.

import type { AppState } from '../types/music'

const STORAGE_KEY = 'fm.appState'

// Bump this whenever DEFAULT_INTERVAL_COLORS changes. Persisted state
// snapshots the whole palette, so without a version stamp every browser
// that ever visited keeps the palette it first saw FOREVER — the logo
// palette shipped and returning visitors kept seeing the old colors while
// every fresh-profile check showed the new ones. Bumping discards the
// stored palette once (custom colors included — redoable, stale isn't).
const PALETTE_VERSION = 2

// Fields that shouldn't survive a refresh verbatim: anything that would
// auto-start audio or resume a transient playback state without a fresh
// user gesture.
const TRANSIENT_RESET: Partial<AppState> = {
  progressionPlaying: false,
  progressionIndex: -1,
}

export function loadPersistedState(): Partial<AppState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<AppState> & { __paletteV?: number }
    const { __paletteV, ...rest } = parsed
    if ((__paletteV ?? 1) < PALETTE_VERSION) delete rest.intervalColors
    return { ...rest, ...TRANSIENT_RESET }
  } catch {
    return null
  }
}

export function savePersistedState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, __paletteV: PALETTE_VERSION }))
  } catch {
    // storage unavailable (private browsing, quota) — session still works,
    // it just won't remember
  }
}
