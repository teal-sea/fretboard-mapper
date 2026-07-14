// ─── Flow: the endless jam's evolution engine ───────────────────────
// Pure logic, no React, no audio. Flow's one job is to move HOME slowly
// underneath a player who never stops playing. Because every destination is
// a sibling mode (identical pitch-class set), the notes under the player's
// fingers never change — only the gravity does. The app's core insight,
// running on a timer instead of a click.

import type { FlowEvolve } from '../types/music'
import type { SiblingMode } from './modes'
import type { Language } from './noteNames'
import { t, tf } from './i18n'

// Where does home go on step N? Returns the sibling to move to, or null to
// stay put (static mode, no siblings to walk, or an empty custom order).
export function nextFlowHome(
  evolve: FlowEvolve,
  step: number,               // 1-based: the Nth evolution since Play
  siblings: SiblingMode[],    // from getSameNoteModes — includes the current tonic
  customDegrees: number[]     // flowChords: diatonic degree indices, in order
): SiblingMode | null {
  if (evolve === 'static') return null
  if (siblings.length <= 1) return null

  if (evolve === 'custom') {
    if (customDegrees.length === 0) return null
    const degree = customDegrees[(step - 1) % customDegrees.length]
    return siblings.find(s => s.degree === degree) ?? null
  }

  // Diatonic drift: walk the sibling modes in degree order, skipping wherever
  // we currently are so a step always actually moves.
  const ordered = [...siblings].sort((a, b) => a.degree - b.degree)
  const others = ordered.filter(s => !s.isCurrent)
  if (others.length === 0) return null
  return others[(step - 1) % others.length]
}

// The one line whispered when home moves. No instruction, no task — just
// telling the player what they're already hearing. `rootLabel` is the
// display name (letters or solfège) — the caller owns note naming.
export function describeFlowShift(to: SiblingMode, lang: Language = 'en', rootLabel?: string): string {
  return tf('home is now {root} — same notes, new gravity', lang, { root: rootLabel ?? to.root })
}

export interface FlowSummary {
  minutes: number
  notesHeard: number
  homesVisited: number
}

// No fail state, no score — the summary is a mirror, not a grade.
export function describeFlowSession(s: FlowSummary, lang: Language = 'en'): string {
  if (s.minutes < 1 && s.notesHeard === 0) return t('under a minute of sound.', lang)
  if (s.notesHeard === 0) return t('under a minute of sound.', lang)
  const mins = s.minutes < 1 ? 1 : Math.round(s.minutes)
  const base = tf('{mins} min · {notes} notes heard', lang, { mins, notes: s.notesHeard })
  const homes = s.homesVisited > 1 ? tf(' across {homes} homes', lang, { homes: s.homesVisited }) : ''
  return `${base}${homes}.`
}
