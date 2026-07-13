// ─── State persistence ──────────────────────────────────────────────
// The one place AppState touches localStorage. No backend, no account —
// just "remember what I was looking at" across a refresh.

import type { AppState } from '../types/music'

const STORAGE_KEY = 'fm.appState'

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
    const parsed = JSON.parse(raw) as Partial<AppState>
    return { ...parsed, ...TRANSIENT_RESET }
  } catch {
    return null
  }
}

export function savePersistedState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // storage unavailable (private browsing, quota) — session still works,
    // it just won't remember
  }
}
