// ─── The run player: the app follows your hands through the arpeggio ───
// Builds the run for the current concept's technique, advances it from the
// mic, scores the attempt, and offers the Twist (same shape, new home).
// Attempt state is transient and lives here; the shared key only ever moves
// through up() (applyTwist), preserving the single-AppState rule.
import { useState, useMemo, useCallback, useEffect } from 'react'
import type { Tuning } from '../types/music'
import { CHORDS } from '../utils/musicTheory'
import { getSweepShape, getArpeggioShapes, buildRun } from '../utils/arpeggios'
import { initRun, advanceRun, scoreRun, stepStates } from '../utils/runner'
import { getSameNoteModes, recontextualise, type SiblingMode } from '../utils/modes'
import type { Concept } from '../utils/concepts'
import type { RunNoteMark } from '../components/Fretboard'
import type { AppState } from '../types/music'

export function useRun({ concept, tuning, numFrets, listening, heardMidi, language, dn, up }: {
  /** the active Learn concept (null outside a lesson) */
  concept: Concept | null
  tuning: Tuning
  numFrets: number
  listening: boolean
  heardMidi: number | null
  language: AppState['language']
  dn: (n: string) => string
  up: (partial: Partial<AppState>) => void
}) {
  const currentRun = useMemo(() => {
    if (!concept?.run) return null
    const chord = CHORDS[concept.run.chordKey]
    if (!chord) return null

    // Sweeps need a rakeable (one-note-per-string) shape; everything else can
    // use a full position shape, which has more notes in it.
    const shape =
      concept.run.kind === 'sweep'
        ? getSweepShape(concept.root, chord, tuning, concept.run.shapeIndex ?? 0, numFrets)
        : getArpeggioShapes(concept.root, chord, tuning, numFrets)[
            concept.run.shapeIndex ?? 1
          ] ?? getArpeggioShapes(concept.root, chord, tuning, numFrets)[0]

    if (!shape) return null
    return buildRun(shape, concept.run.kind)
  }, [concept, tuning, numFrets])

  const [runState, setRunState] = useState(initRun)

  // New exercise → fresh attempt.
  useEffect(() => { setRunState(initRun()) }, [concept?.id])

  // The mic drives the run. One heard note = at most one advance (heardMidi only
  // changes when the NOTE changes, so a sustained note can't run away with it).
  useEffect(() => {
    if (!currentRun || !listening || heardMidi === null) return
    setRunState(s => advanceRun(currentRun, s, heardMidi, Date.now()))
  }, [heardMidi, currentRun, listening])

  const runMarks = useMemo((): RunNoteMark[] | null => {
    if (!currentRun) return null
    return stepStates(currentRun, runState).map(s => ({
      stringIndex: s.step.note.stringIndex,
      fret: s.step.note.fret,
      order: s.order,
      status: s.status,
      roll: s.step.roll,
    }))
  }, [currentRun, runState])

  const runResult = useMemo(
    () => (currentRun ? scoreRun(currentRun, runState, language) : null),
    [currentRun, runState, language]
  )

  // The payoff: same shape, move the drone, and it means something else entirely.
  const [twistTonic, setTwistTonic] = useState<string | null>(null)

  const twist = useMemo(() => {
    if (!concept?.run || !twistTonic) return null
    const chord = CHORDS[concept.run.chordKey]
    if (!chord) return null
    return recontextualise(concept.root, chord.intervals, twistTonic, language, dn)
  }, [concept, twistTonic])

  // Where can we move home to and still keep every note of the shape in key?
  const twistOptions = useMemo(() => {
    if (!concept?.run) return []
    return getSameNoteModes(concept.root, concept.mode)
      .filter(s => !s.isCurrent)
      .slice(0, 3)
  }, [concept])

  const applyTwist = useCallback((s: SiblingMode) => {
    setTwistTonic(s.root)
    // Move ONLY the drone's home. The shape under the hands does not move.
    // A running drone retunes to the new home; a silent one stays silent.
    up({ keyRoot: s.root, keyQuality: s.scaleKey, selectedScaleRoot: s.root, selectedScaleKey: s.scaleKey })
  }, [up])

  useEffect(() => { setTwistTonic(null) }, [concept?.id])

  const resetRun = useCallback(() => setRunState(initRun()), [])

  return { currentRun, runState, runMarks, runResult, twist, twistOptions, applyTwist, resetRun }
}
