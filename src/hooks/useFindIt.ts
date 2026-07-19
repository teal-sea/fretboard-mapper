// ─── Find It: sound (or name) first, fretboard second ───
// The neck stays blank while hunting — it lights back up only to confirm
// a hit, so lighting up is the reward, not the instruction. Backing
// (Pad/Drone/Arp — whatever's already selected) keeps playing underneath;
// this doesn't require the drone specifically.
//
// Deliberately NOT part of AppState: per-round game state is transient and
// session-local (see docs/03-state.md). App passes everything in and gets
// the game surface back — no parallel store, same single source of truth.
import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import type { FretNote, Tuning } from '../types/music'
import { computeFretboard } from '../utils/musicTheory'
import { playChordPad } from '../utils/audioEngine'

export interface FindItTarget { stringIndex: number; fret: number; midi: number; note: string }

export function useFindIt({ active, board, tuning, fretboardRoot, numFrets, heardMidi }: {
  /** flowJam === 'findit' && the shared transport is playing */
  active: boolean
  board: FretNote[][]
  tuning: Tuning
  fretboardRoot: string
  numFrets: number
  heardMidi: number | null
}) {
  const [findItOn, setFindItOn] = useState(false)
  const [findItTarget, setFindItTarget] = useState<FindItTarget | null>(null)
  const [findItRevealed, setFindItRevealed] = useState(false)
  const [findItScore, setFindItScore] = useState(0)
  const [findItStreak, setFindItStreak] = useState(0)
  const [findItLastMs, setFindItLastMs] = useState<number | null>(null)
  const [findItStrings, setFindItStrings] = useState<number[]>([]) // empty = every string
  const [findItFretRange, setFindItFretRange] = useState<[number, number] | null>(null) // null = full neck
  const findItStartedAtRef = useRef<number | null>(null)

  const findItCandidates = useMemo(() => {
    const out: FindItTarget[] = []
    for (let s = 0; s < board.length; s++) {
      if (findItStrings.length && !findItStrings.includes(s)) continue
      for (const fn of board[s]) {
        if (!fn.isInScale) continue
        if (findItFretRange && (fn.fret < findItFretRange[0] || fn.fret > findItFretRange[1])) continue
        out.push({ stringIndex: fn.stringIndex, fret: fn.fret, midi: fn.midi, note: fn.note })
      }
    }
    return out
  }, [board, findItStrings, findItFretRange])

  const pickFindItTarget = useCallback(() => {
    if (!findItCandidates.length) { setFindItTarget(null); return }
    const pick = findItCandidates[Math.floor(Math.random() * findItCandidates.length)]
    setFindItTarget(pick)
    setFindItRevealed(false)
    findItStartedAtRef.current = Date.now()
    playChordPad([pick.midi], false)
  }, [findItCandidates])

  // Enter/leave the game with the JAM switch + transport, same Play button
  // as Modes/Changes — no separate start control to learn.
  useEffect(() => {
    if (active && !findItOn) {
      setFindItOn(true); setFindItScore(0); setFindItStreak(0); setFindItLastMs(null)
    } else if (!active && findItOn) {
      setFindItOn(false); setFindItTarget(null); setFindItRevealed(false)
    }
  }, [active, findItOn])

  useEffect(() => {
    if (findItOn && !findItTarget) pickFindItTarget()
  }, [findItOn, findItTarget, pickFindItTarget])

  // The hit: exact MIDI match, not just pitch class — "find it on this
  // string/section" only means something if the octave has to match too.
  useEffect(() => {
    if (!findItOn || !findItTarget || findItRevealed || heardMidi === null) return
    if (heardMidi !== findItTarget.midi) return
    const elapsed = findItStartedAtRef.current ? Date.now() - findItStartedAtRef.current : 0
    const points = Math.max(5, Math.round(200 - elapsed / 50))
    setFindItScore(s => s + points)
    setFindItStreak(s => s + 1)
    setFindItLastMs(elapsed)
    setFindItRevealed(true)
  }, [heardMidi, findItOn, findItTarget, findItRevealed])

  // Advancing after a hit is its OWN effect, deliberately not folded into
  // the detection effect above: that one lists findItRevealed as a dep (it
  // needs to stop reacting once revealed), so setting findItRevealed(true)
  // inside it would re-run it immediately — whose cleanup would cancel this
  // same setTimeout before it ever fires, freezing the game on the first
  // hit forever. This effect's only trigger is findItRevealed itself.
  useEffect(() => {
    if (!findItRevealed) return
    const t = setTimeout(() => setFindItTarget(null), 900)
    return () => clearTimeout(t)
  }, [findItRevealed])

  // A dedicated board for the game: blank while hunting, lights up the
  // target's pitch class (every fret it appears at) once confirmed.
  const findItBoard = useMemo(() => {
    if (!findItOn) return board
    return computeFretboard(tuning, fretboardRoot, findItRevealed && findItTarget ? new Set([findItTarget.midi % 12]) : new Set(), numFrets)
  }, [findItOn, findItRevealed, findItTarget, tuning, fretboardRoot, numFrets, board])

  return {
    findItTarget, findItRevealed, findItScore, findItStreak, findItLastMs,
    findItStrings, setFindItStrings, findItFretRange, setFindItFretRange,
    findItBoard,
  }
}
