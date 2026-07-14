// ─── Walk the Neck ──────────────────────────────────────────────────
// The exercise this whole app exists for.
//
// Play A minor (= C major — the same seven notes) across the neck. Each playing
// position STARTS on a different degree of the scale, so each position is a
// different mode:
//
//   position starting on A → A Aeolian      position starting on D → D Dorian
//   position starting on C → C Ionian       position starting on G → G Mixolydian
//
// Your hands never stop playing the same scale. But as you move up the neck,
// the drone moves home with you — and the identical notes stop sounding sad and
// start sounding hopeful, then bright, then unsettled. You feel the modes
// instead of memorising them.
//
// This is why the drone matters. Without it, all seven positions sound the same,
// which is exactly why guitarists learn the shapes and never hear the modes.

import type { Tuning } from '../types/music'
import type { Language } from './noteNames'
import { t, tf } from './i18n'
import { SCALES, noteIndex } from './musicTheory'
import { getSameNoteModes } from './modes'
import { plainScaleName } from './theory'

export interface WalkPosition {
  index: number             // 1-based, in neck order (low → high)
  degree: number            // which degree of the parent scale it starts on
  startFret: number         // where it begins on the lowest string
  range: [number, number]   // the fret window your hand lives in
  tonic: string             // THIS position's home note
  modeKey: string           // key into SCALES
  modeName: string          // "Dorian"
  plain: string | null      // plain-English gloss of the mode
}

// A hand covers about five frets without shifting.
const SPAN = 5

export function getWalkPositions(
  root: string,
  scaleKey: string,
  tuning: Tuning,
  numFrets = 15
): WalkPosition[] {
  const scale = SCALES[scaleKey]
  if (!scale || scale.intervals.length < 5) return []

  const siblings = getSameNoteModes(root, scaleKey)
  if (siblings.length === 0) return []

  const rootPc = noteIndex(root)
  const lowString = tuning.notes[0]

  // Where does the root sit on the lowest string?
  let rootFret = -1
  for (let f = 0; f < 12; f++) {
    if (((lowString + f) % 12 + 12) % 12 === rootPc) { rootFret = f; break }
  }
  if (rootFret < 0) return []

  // Each degree of the scale opens a position on the neck.
  const raw = scale.intervals.map((iv, degree) => {
    const sib = siblings.find(s => s.degree === degree)
    const start = (rootFret + iv) % 12
    return { degree, start, sib }
  }).filter(r => r.sib)

  // Order them the way you'd actually walk them: up the neck.
  raw.sort((a, b) => a.start - b.start)

  return raw.map((r, i) => {
    const lo = Math.max(0, r.start - 1)
    const hi = Math.min(numFrets, lo + SPAN)
    return {
      index: i + 1,
      degree: r.degree,
      startFret: r.start,
      range: [lo, hi] as [number, number],
      tonic: r.sib!.root,
      modeKey: r.sib!.scaleKey,
      modeName: r.sib!.name,
      plain: plainScaleName(r.sib!.scaleKey),
    }
  })
}

// Which position are you standing in? Derived from where home currently is —
// so the walker never needs its own state to get out of sync.
export function currentWalkIndex(positions: WalkPosition[], tonic: string): number {
  const i = positions.findIndex(p => p.tonic === tonic)
  return i < 0 ? 0 : i
}

// ─── The game ───────────────────────────────────────────────────────
// Claiming a position is not a scavenger hunt. It's the actual skill:
//
//   IMPROVISE in the position (play at least a handful of its notes),
//   then RESOLVE HOME (land on that position's tonic).
//
// That is what playing in a mode IS. Do it, and the mode is yours.
// There is no fail state — you cannot lose a claim, only earn one.

const NOTES_TO_EXPLORE = 4

export interface WalkState {
  claimed: string[]          // tonics you've earned, in order
  explored: number[]         // distinct pitch classes played in the current position
  justClaimed: string | null // fires once, for the celebration
  combo: number              // claims in a row without backtracking
}

export function initWalk(): WalkState {
  return { claimed: [], explored: [], justClaimed: null, combo: 0 }
}

export interface WalkFeed {
  position: WalkPosition
  scalePcs: Set<number>      // the notes that belong to this scale
  heardMidi: number | null
}

export function feedWalk(state: WalkState, feed: WalkFeed): WalkState {
  const { position, scalePcs, heardMidi } = feed
  if (heardMidi === null) return { ...state, justClaimed: null }

  const pc = ((heardMidi % 12) + 12) % 12

  // Playing something outside the scale isn't a mistake — it just isn't
  // progress. Nothing is taken away from you, ever.
  if (!scalePcs.has(pc)) return { ...state, justClaimed: null }

  const alreadyClaimed = state.claimed.includes(position.tonic)
  const tonicPc = noteIndex(position.tonic)

  const explored = state.explored.includes(pc)
    ? state.explored
    : [...state.explored, pc]

  // You've wandered the position, and now you've come home. That's the mode.
  const resolved =
    pc === tonicPc &&
    explored.length >= NOTES_TO_EXPLORE &&
    !alreadyClaimed

  if (resolved) {
    return {
      claimed: [...state.claimed, position.tonic],
      explored: [],
      justClaimed: position.tonic,
      combo: state.combo + 1,
    }
  }

  return { ...state, explored, justClaimed: null }
}

// Moving to a new position starts a fresh exploration, but never costs you a
// claim you've already earned.
export function enterPosition(state: WalkState): WalkState {
  return { ...state, explored: [], justClaimed: null }
}

export interface WalkProgress {
  explored: number
  needed: number
  readyToResolve: boolean
  claimed: boolean
  instruction: string
}

export function walkProgress(
  state: WalkState,
  position: WalkPosition,
  lang: Language = 'en',
  tonicLabel?: string  // display name (letters or solfège); caller owns naming
): WalkProgress {
  const claimed = state.claimed.includes(position.tonic)
  const explored = state.explored.length
  const readyToResolve = explored >= NOTES_TO_EXPLORE
  const tonic = tonicLabel ?? position.tonic

  const instruction = claimed
    ? tf('{tonic} {mode} is yours. Play it for the joy of it, or move up the neck.', lang, { tonic, mode: t(position.modeName, lang) })
    : readyToResolve
      ? tf('Now come home — land on {tonic} and this mode is yours.', lang, { tonic })
      : tf('Improvise in this position. Play {n} more of its notes, then resolve to {tonic}.', lang, { n: NOTES_TO_EXPLORE - explored, tonic })

  return { explored, needed: NOTES_TO_EXPLORE, readyToResolve, claimed, instruction }
}

// What just happened when you stepped to a new position. Note labels come in
// display-converted; `plain` on the position is stored in English and doubles
// as its own translation key.
export function describeStep(
  from: WalkPosition | null,
  to: WalkPosition,
  lang: Language = 'en',
  labels?: { tonic?: string; from?: string }
): string {
  const tonic = labels?.tonic ?? to.tonic
  const plain = to.plain ? tf(', which is {plain}', lang, { plain: t(to.plain, lang) }) : ''
  const mode = t(to.modeName, lang)

  if (!from || from.tonic === to.tonic) {
    return tf('Position {index} begins on {tonic}. That makes home {tonic}, so these notes are {tonic} {mode}{plain}.', lang, {
      index: to.index, tonic, mode, plain,
    })
  }

  return tf('You moved up the neck and nothing about the notes changed — it’s still the same scale under your fingers. But this position starts on {tonic}, so the drone moved home from {from} to {tonic}. The same notes are now {tonic} {mode}{plain}. Hear how different they feel.', lang, {
    tonic, from: labels?.from ?? from.tonic, mode, plain,
  })
}
