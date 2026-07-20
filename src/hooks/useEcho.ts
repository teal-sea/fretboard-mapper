// ─── Echo: call and response ───
// App plays a short phrase over the backing, you play it back by ear.
// Miss the phrase and it repeats exactly — no partial credit, no new
// notes to confuse what you're re-attempting. Land it and the phrase
// grows by one note (capped) for the next round. The neck stays dark
// the whole time; this is ear-only, unlike Find It's name-then-locate.
//
// Deliberately NOT part of AppState — same transient-game-state rule as
// useFindIt (docs/03-state.md).
import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import type { FretNote, Tuning } from '../types/music'
import { computeFretboard } from '../utils/musicTheory'
import { playChordPad } from '../utils/audioEngine'

const ECHO_MAX_LEN = 8
const ECHO_NOTE_MS = 550

export function useEcho({ active, board, tuning, fretboardRoot, numFrets, heardMidi }: {
  /** flowJam === 'echo' && the shared transport is playing */
  active: boolean
  board: FretNote[][]
  tuning: Tuning
  fretboardRoot: string
  numFrets: number
  heardMidi: number | null
}) {
  const [echoOn, setEchoOn] = useState(false)
  const [echoPhrase, setEchoPhrase] = useState<number[]>([])
  const [echoPlayedIdx, setEchoPlayedIdx] = useState(0)
  const [echoStatus, setEchoStatus] = useState<'playing' | 'listening' | 'success' | 'miss'>('playing')
  const [echoScore, setEchoScore] = useState(0)
  const [echoStreak, setEchoStreak] = useState(0)
  const [echoLength, setEchoLength] = useState(3)

  const playEchoPhrase = useCallback((phrase: number[]) => {
    phrase.forEach((midi, i) => setTimeout(() => playChordPad([midi], false), i * ECHO_NOTE_MS))
  }, [])

  // Starts (or restarts) a round: reset progress, play the phrase, then
  // switch to listening once it's done playing. Shared by "a fresh phrase
  // is needed" and "the same phrase repeats after a miss".
  const playPhraseAndListen = useCallback((phrase: number[]) => {
    setEchoPlayedIdx(0)
    setEchoStatus('playing')
    playEchoPhrase(phrase)
    setTimeout(() => setEchoStatus('listening'), phrase.length * ECHO_NOTE_MS + 300)
  }, [playEchoPhrase])

  const startNewEchoPhrase = useCallback(() => {
    const pool = board.flat().filter(fn => fn.isInScale)
    if (!pool.length) { setEchoPhrase([]); return }
    const phrase: number[] = []
    for (let i = 0; i < echoLength; i++) {
      let pick: number
      do { pick = pool[Math.floor(Math.random() * pool.length)].midi } while (phrase.length > 0 && pick === phrase[phrase.length - 1])
      phrase.push(pick)
    }
    setEchoPhrase(phrase)
    playPhraseAndListen(phrase)
  }, [board, echoLength, playPhraseAndListen])

  useEffect(() => {
    if (active && !echoOn) {
      setEchoOn(true); setEchoScore(0); setEchoStreak(0); setEchoLength(3)
    } else if (!active && echoOn) {
      setEchoOn(false); setEchoPhrase([]); setEchoPlayedIdx(0)
    }
  }, [active, echoOn])

  useEffect(() => {
    if (echoOn && echoPhrase.length === 0) startNewEchoPhrase()
  }, [echoOn, echoPhrase, startNewEchoPhrase])

  // Detection: reads progress through refs, not state, and depends on
  // ONLY [heardMidi, echoOn] — not echoPlayedIdx/echoStatus. Advancing
  // echoPlayedIdx mid-phrase is itself a state change; if it were also a
  // dependency here, setting it would re-run this same effect against the
  // SAME (now stale) heardMidi value, check it against the NEXT expected
  // note, mismatch, and immediately overwrite the correct partial match
  // with a false "miss" — same family of bug as Find It's timeout getting
  // cancelled by its own trigger, just one step earlier in the chain.
  const echoPlayedIdxRef = useRef(0)
  const echoPhraseRef = useRef<number[]>([])
  const echoStatusRef = useRef<typeof echoStatus>('playing')
  useEffect(() => { echoPlayedIdxRef.current = echoPlayedIdx }, [echoPlayedIdx])
  useEffect(() => { echoPhraseRef.current = echoPhrase }, [echoPhrase])
  useEffect(() => { echoStatusRef.current = echoStatus }, [echoStatus])

  useEffect(() => {
    if (!echoOn || heardMidi === null) return
    if (echoStatusRef.current !== 'listening') return
    const phrase = echoPhraseRef.current
    if (phrase.length === 0) return
    const idx = echoPlayedIdxRef.current
    const expected = phrase[idx]
    if (heardMidi === expected) {
      const nextIdx = idx + 1
      if (nextIdx >= phrase.length) {
        setEchoScore(s => s + 20 * phrase.length)
        setEchoStreak(s => s + 1)
        setEchoLength(l => Math.min(ECHO_MAX_LEN, l + 1))
        setEchoStatus('success')
      } else {
        setEchoPlayedIdx(nextIdx)
      }
    } else {
      setEchoStreak(0)
      setEchoStatus('miss')
    }
  }, [heardMidi, echoOn])

  // Advancing after success/miss is its own effect, same reason as Find
  // It's: the detection effect above lists echoStatus as a dep, so setting
  // it inside that effect would re-trigger it immediately and any timer
  // scheduled there would get cancelled by its own cleanup before firing.
  // This effect's timeout callback moves echoStatus to 'playing', which
  // DOES re-run this effect — but the guard below excludes 'playing', so
  // that re-entry just no-ops instead of scheduling a second timer.
  useEffect(() => {
    if (echoStatus !== 'success' && echoStatus !== 'miss') return
    const t = setTimeout(() => {
      if (echoStatus === 'miss') playPhraseAndListen(echoPhrase)
      else setEchoPhrase([]) // triggers the "generate a new phrase" effect above
    }, 900)
    return () => clearTimeout(t)
  }, [echoStatus, echoPhrase, playPhraseAndListen])

  // Echo is ear-only — the neck stays blank the whole round, no reveal even
  // on a landed phrase (unlike Find It, which confirms visually on a hit).
  const echoBoard = useMemo(() => {
    if (!echoOn) return board
    return computeFretboard(tuning, fretboardRoot, new Set(), numFrets)
  }, [echoOn, tuning, fretboardRoot, numFrets, board])

  return { echoPhrase, echoPlayedIdx, echoStatus, echoScore, echoStreak, echoLength, echoBoard }
}
