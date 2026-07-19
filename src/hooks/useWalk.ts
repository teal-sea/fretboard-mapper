// ═══ THE WALK ═══════════════════════════════════════════════════
// Same seven notes, seven positions, seven modes. Move up the neck and the
// drone moves home with you. Claim each mode by improvising in its position
// and resolving to its tonic.
//
// Per-attempt progress lives here (transient, session-local); the shared
// key/scale on the neck still changes ONLY through up() — no parallel store.
// Claims persist through utils/progress, exactly as before.
import { useState, useMemo, useCallback, useEffect } from 'react'
import type { AppState, Tuning } from '../types/music'
import { SCALES, getScaleNotes } from '../utils/musicTheory'
import {
  getWalkPositions, currentWalkIndex, describeStep,
  initWalk, feedWalk, enterPosition, walkProgress,
} from '../utils/walk'
import { familyId, getClaims, claimMode, markCompleted, totalClaimed } from '../utils/progress'
import { loadOwned } from '../utils/concepts'

export function useWalk({ active, conceptId, state, up, tuning, listening, heardMidi, dn, setSoundsOwned, setJustLanded }: {
  /** the current Learn concept is the Walk */
  active: boolean
  /** currentConcept?.id — a new concept resets the attempt */
  conceptId: string | undefined
  state: AppState
  up: (partial: Partial<AppState>) => void
  tuning: Tuning
  listening: boolean
  heardMidi: number | null
  dn: (n: string) => string
  setSoundsOwned: (n: number) => void
  setJustLanded: (b: boolean) => void
}) {
  const walkPositions = useMemo(() => {
    if (!active) return []
    return getWalkPositions(
      state.selectedScaleRoot || state.keyRoot,
      state.selectedScaleKey || state.keyQuality,
      tuning,
      state.numFrets
    )
  }, [active, state.selectedScaleRoot, state.keyRoot, state.selectedScaleKey, state.keyQuality, tuning, state.numFrets])

  const walkIdx = useMemo(
    () => currentWalkIndex(walkPositions, state.selectedScaleRoot || state.keyRoot),
    [walkPositions, state.selectedScaleRoot, state.keyRoot]
  )
  const walkPos = walkPositions[walkIdx] ?? null

  const [walkState, setWalkState] = useState(initWalk)
  const [walkStory, setWalkStory] = useState<string | null>(null)

  // Which scale family are we walking? A minor and C major are the SAME walk,
  // so a mode you claimed from one door stays claimed through the other.
  const walkFamily = useMemo(
    () => familyId(
      state.selectedScaleRoot || state.keyRoot,
      state.selectedScaleKey || state.keyQuality
    ),
    [state.selectedScaleRoot, state.keyRoot, state.selectedScaleKey, state.keyQuality]
  )

  // Pick up where you left off. Modes you've already earned are still yours.
  useEffect(() => {
    if (!active) return
    setWalkState({ ...initWalk(), claimed: getClaims(walkFamily) })
    setWalkStory(null)
  }, [active, conceptId, walkFamily])

  const scalePcs = useMemo(() => {
    const sk = state.selectedScaleKey || state.keyQuality
    const sr = state.selectedScaleRoot || state.keyRoot
    const sc = SCALES[sk]
    return sc ? getScaleNotes(sr, sc) : new Set<number>()
  }, [state.selectedScaleKey, state.keyQuality, state.selectedScaleRoot, state.keyRoot])

  // The mic drives the game.
  useEffect(() => {
    if (!active || !walkPos || !listening || heardMidi === null) return
    setWalkState(s => feedWalk(s, { position: walkPos, scalePcs, heardMidi }))
  }, [heardMidi, active, walkPos, listening, scalePcs])

  const walkProg = useMemo(
    () => (walkPos ? walkProgress(walkState, walkPos, state.language, dn(walkPos.tonic)) : null),
    [walkState, walkPos, state.language, dn]
  )

  // Step to a position: the notes on the neck do NOT move. Only home does.
  const goToPosition = useCallback((i: number) => {
    const p = walkPositions[i]
    if (!p) return
    setWalkStory(describeStep(walkPos, p, state.language, { tonic: dn(p.tonic), from: walkPos ? dn(walkPos.tonic) : undefined }))
    setWalkState(enterPosition)
    up({
      keyRoot: p.tonic,
      keyQuality: p.modeKey,
      selectedScaleRoot: p.tonic,
      selectedScaleKey: p.modeKey,
      viewMode: 'scales',
      selectedChordRoot: null,
      selectedChordKey: null,
      scalePosition: null,
      chordPosition: null,
      fretRange: null,
    })
    // If the drone is already on it follows you home; it does not switch itself on.
  }, [walkPositions, walkPos, up])

  // Claiming a mode is owning a sound — and it is written down immediately, so
  // closing the tab can never take it back.
  useEffect(() => {
    if (!walkState.justClaimed) return
    claimMode(walkFamily, walkState.justClaimed)
    setSoundsOwned(loadOwned().length + totalClaimed())
    setJustLanded(true)
    const t = setTimeout(() => setJustLanded(false), 900)
    return () => clearTimeout(t)
  }, [walkState.justClaimed, walkFamily])

  const walkComplete = active && walkPositions.length > 0 &&
    walkState.claimed.length >= walkPositions.length

  useEffect(() => {
    if (walkComplete) markCompleted(walkFamily)
  }, [walkComplete, walkFamily])

  return { walkPositions, walkIdx, walkPos, walkState, walkStory, walkProg, goToPosition, walkComplete }
}
