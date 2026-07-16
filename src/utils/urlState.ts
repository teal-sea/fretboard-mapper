// ─── Shareable URL state ─────────────────────────────────────────────
// The address bar is a share button: /?key=A&mode=dorian opens the app in
// A Dorian. Read once at boot (URL beats localStorage — a link someone sent
// you must win over whatever you last looked at), written back with
// replaceState so copying the URL always captures where you are.
//
// Only key + mode live in the URL. Everything else (theme, tuning, volumes)
// is personal setup, not something you'd send to a friend.

import type { AppState } from '../types/music'
import { NOTE_NAMES, NOTE_NAMES_FLAT } from '../types/music'
import { SCALES } from './musicTheory'
import { LANGUAGES } from './noteNames'

const VALID_ROOTS = new Set<string>([...NOTE_NAMES, ...NOTE_NAMES_FLAT])

// Accept the spellings people (and our own mode pages) actually put in URLs:
// "A", "f#", "Bb", "d-flat", "F sharp". Returns the engine's canonical name
// or null if it isn't a note.
export function canonicalRoot(raw: string): string | null {
  const cleaned = raw
    .trim()
    .toLowerCase()
    .replace(/[\s_-]*sharp$/, '#')
    .replace(/[\s_-]*flat$/, 'b')
  if (cleaned.length < 1 || cleaned.length > 2) return null
  const name = cleaned[0].toUpperCase() + cleaned.slice(1)
  return VALID_ROOTS.has(name) ? name : null
}

const APP_MODES = new Set<AppState['appMode']>(['study', 'learn', 'flow'])

// Parse ?key=&mode=&app= into a state partial. Invalid values are dropped,
// never guessed — a bad link opens the app in its normal state rather than
// in C by accident.
export function parseUrlState(search: string): Partial<AppState> {
  const params = new URLSearchParams(search)
  const out: Partial<AppState> = {}

  const root = canonicalRoot(params.get('key') ?? '')
  if (root) {
    out.keyRoot = root
    out.selectedScaleRoot = root
  }

  const mode = (params.get('mode') ?? '').trim().toLowerCase()
  if (mode && SCALES[mode]) {
    out.keyQuality = mode
    out.selectedScaleKey = mode
    out.viewMode = 'scales'
  }

  const app = (params.get('app') ?? '').trim().toLowerCase() as AppState['appMode']
  if (APP_MODES.has(app)) out.appMode = app

  // Localized landing pages arrive with ?lang= — mirror what the in-app
  // language switcher does: set the language AND its note-naming default.
  const langParam = (params.get('lang') ?? '').trim().toLowerCase()
  const lang = LANGUAGES.find(l => l.key === langParam)
  if (lang) {
    out.language = lang.key
    out.noteStyle = lang.defaultStyle
  }

  return out
}

export function serializeUrlState(state: Pick<AppState, 'keyRoot' | 'keyQuality'>): string {
  return `?key=${encodeURIComponent(state.keyRoot)}&mode=${encodeURIComponent(state.keyQuality)}`
}

// Mirror the current key into the address bar. replaceState (not pushState):
// changing key is not navigation, and Back must never walk a user through
// every key they touched.
export function syncUrl(state: Pick<AppState, 'keyRoot' | 'keyQuality'>): void {
  try {
    const next = serializeUrlState(state)
    if (window.location.search !== next) {
      window.history.replaceState(null, '', next + window.location.hash)
    }
  } catch {
    // history unavailable (odd embeds) — sharing degrades, the app doesn't
  }
}
