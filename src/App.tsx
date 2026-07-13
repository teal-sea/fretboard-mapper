import { useState, useMemo, useCallback, useEffect, useRef, Fragment } from 'react'
import type { AppState } from './types/music'
import {
  SCALES, CHORDS, TUNINGS,
  getScaleNotes, getChordNotes, computeFretboard,
  noteIndex, noteName, useFlats, intervalName,
  getDiatonicChords, getCompatibleScales, getRelatedModes,
  compute3NPSPattern, computeSweepShape, computeTappingPattern,
  getScalePositions,
} from './utils/musicTheory'
import type { DiatonicChord, FretPosition } from './utils/musicTheory'
import { DEFAULT_INTERVAL_COLORS, ALL_INTERVALS } from './utils/defaultColors'
import Fretboard from './components/Fretboard'
import { playChordPad, stopChordPad, chordToMidi, startMetronome, stopMetronome, startDrone, stopDrone, setDroneVolume, setDroneSpread, setDroneTone } from './utils/audioEngine'
import { CONCEPTS, getNextConcept, markSeen, loadOwned, markOwned, type Concept } from './utils/concepts'
import { startMic, stopMic, readPitch, recalibrateMic, getMicError } from './utils/micInput'
import { intervalSemitones } from './utils/musicTheory'
import { getScaleInsight, getChordInsight, chordsInScale, getObjective, PRIMER } from './utils/theory'
import { getSameNoteModes, describeModalShift, contrastWithKey, recontextualise, type SiblingMode } from './utils/modes'
import { loadPersistedState, savePersistedState } from './utils/persist'
import { familyId, getClaims, claimMode, markCompleted, totalClaimed } from './utils/progress'
import { getSweepShape, getArpeggioShapes, buildRun } from './utils/arpeggios'
import {
  getWalkPositions, currentWalkIndex, describeStep,
  initWalk, feedWalk, enterPosition, walkProgress,
} from './utils/walk'
import { initRun, advanceRun, scoreRun, stepStates } from './utils/runner'
import type { RunNoteMark } from './components/Fretboard'

// ─── Harmony Map row definitions ────────────────────────────
const HARMONY_ROWS = [
  { label: 'Triad', keys: new Set(['major','minor','dim','aug']) },
  { label: 'Sus',   keys: new Set(['sus2','sus4']) },
  { label: '7th',   keys: new Set(['maj7','min7','dom7','dim7','half_dim7','min_maj7','aug7','aug_maj7']) },
  { label: '6th',   keys: new Set(['6','m6']) },
  { label: '9th',   keys: new Set(['add9','maj9','min9','dom9']) },
  { label: '11/13', keys: new Set(['dom11','min11','maj13','dom13']) },
]

const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']

const ROOT_HUES: Record<string, number> = {
  'C': 210, 'C#': 240, 'D': 270, 'D#': 300, 'E': 330,
  'F': 0, 'F#': 30, 'G': 55, 'G#': 80, 'A': 120,
  'A#': 150, 'B': 185,
}

const KEY_QUALITIES = [
  { key: 'ionian', label: 'Major' },
  { key: 'aeolian', label: 'Minor' },
  { key: 'dorian', label: 'Dorian' },
  { key: 'phrygian', label: 'Phrygian' },
  { key: 'lydian', label: 'Lydian' },
  { key: 'mixolydian', label: 'Mixolydian' },
  { key: 'locrian', label: 'Locrian' },
  { key: 'harmonic_minor', label: 'Harm. Minor' },
  { key: 'melodic_minor', label: 'Mel. Minor' },
]

// A concept's scale isn't always a viable KEY. Pentatonics/blues borrow a
// 7-note parent so diatonic harmony + technique patterns stay coherent.
const PARENT_KEY: Record<string, string> = {
  minor_penta: 'aeolian',
  blues: 'aeolian',
  major_penta: 'ionian',
}

const MINOR_QUALITIES = new Set(['aeolian', 'harmonic_minor', 'melodic_minor', 'dorian', 'phrygian'])

const MAJOR_MODES = ['ionian', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'aeolian', 'locrian']

function getDiatonicScaleKey(degreeIndex: number, keyQuality: string): string {
  const idx = MAJOR_MODES.indexOf(keyQuality)
  if (idx >= 0) return MAJOR_MODES[(idx + degreeIndex) % 7]
  return keyQuality
}

const THEME_OPTIONS: { key: AppState['colorTheme']; label: string; accent: string }[] = [
  { key: 'obsidian', label: 'Obsidian', accent: '#d4a017' },
  { key: 'midnight', label: 'Midnight', accent: '#5b8def' },
  { key: 'ember', label: 'Ember', accent: '#e07830' },
  { key: 'vapor', label: 'Vapor', accent: '#d050a0' },
  { key: 'sage', label: 'Sage', accent: '#40b870' },
]

const initialState: AppState = {
  keyRoot: 'A',
  keyQuality: 'aeolian',
  viewMode: 'scales',
  selectedChordRoot: null,
  selectedChordKey: null,
  selectedScaleRoot: 'A',
  selectedScaleKey: 'aeolian',
  tuningKey: 'standard',
  inlayStyle: 'dots',
  showNoteNames: true,
  showIntervals: true,
  highlightRoot: true,
  showLeftHanded: false,
  scalePosition: null,
  numFrets: 15,
  fretRange: null,
  intervalColors: { ...DEFAULT_INTERVAL_COLORS },
  theme: 'dark',
  colorTheme: 'obsidian',
  guitarModel: 'strat',
  zoomToPosition: false,
  padLatched: false,
  droneVolume: 1,
  droneSpread: 1,
  droneTone: 0.5,
  appMode: 'study',
  conceptId: null,
  showTheory: true,
  onboarded: false,
  advancedMode: false,
  activeTab: 'explore',
  techniqueMode: '3nps',
  selectedPattern: 0,
  progression: [0, 3, 4],
  progressionIndex: -1,
  progressionPlaying: false,
  progressionBpm: 80,
  progressionBarsPerChord: 2,
}

export default function App() {
  const [state, setState] = useState<AppState>(() => ({ ...initialState, ...loadPersistedState() }))
  const up = useCallback((p: Partial<AppState>) => setState(s => ({ ...s, ...p })), [])

  // Remember what you were looking at — key, mode, settings, whether you've
  // seen the intro — across a refresh. No account, no server: just this tab.
  useEffect(() => { savePersistedState(state) }, [state])
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [chordTier, setChordTier] = useState(0) // index into HARMONY_ROWS (0=Triad, 2=7th, etc.)

  const tuning = TUNINGS[state.tuningKey]
  const keyScale = SCALES[state.keyQuality]
  const flats = useFlats(state.keyRoot)

  // Diatonic chords for current key
  const diatonicChords = useMemo(
    () => keyScale ? getDiatonicChords(state.keyRoot, keyScale) : [],
    [state.keyRoot, keyScale]
  )
  const primaryChords: DiatonicChord[] = useMemo(
    () => diatonicChords.map(deg => deg[0]).filter(Boolean),
    [diatonicChords]
  )

  // Harmony map grid
  const harmonyGrid = useMemo(() => {
    return HARMONY_ROWS.map(row => ({
      label: row.label,
      chords: diatonicChords.map(degChords =>
        degChords.find(dc => row.keys.has(dc.chordKey)) || null
      ),
    }))
  }, [diatonicChords])

  const degreeHeaders = useMemo(() => {
    return diatonicChords.map(degChords => {
      const primary = degChords[0]
      return primary
        ? { roman: primary.romanNumeral, note: primary.root }
        : { roman: '?', note: '' }
    })
  }, [diatonicChords])

  // Compatible scales for selected chord
  const compatScales = useMemo(() => {
    if (!state.selectedChordRoot || !state.selectedChordKey) return []
    const chord = CHORDS[state.selectedChordKey]
    if (!chord) return []
    return getCompatibleScales(state.selectedChordRoot, chord)
  }, [state.selectedChordRoot, state.selectedChordKey])

  // Related modes
  const relatedModes = useMemo(() => {
    if (state.viewMode !== 'scales' || !state.selectedScaleKey || !state.selectedScaleRoot) return []
    return getRelatedModes(state.selectedScaleRoot, state.selectedScaleKey)
  }, [state.viewMode, state.selectedScaleRoot, state.selectedScaleKey])

  // Chord tone overlay
  const chordToneNotes = useMemo(() => {
    if (state.selectedChordKey && state.selectedChordRoot) {
      const chord = CHORDS[state.selectedChordKey]
      if (chord) return getChordNotes(state.selectedChordRoot, chord)
    }
    return null
  }, [state.selectedChordKey, state.selectedChordRoot])

  const chordRootIndex = state.selectedChordRoot ? noteIndex(state.selectedChordRoot) : null

  // Next chord in progression — shown as ring outlines so player can anticipate
  const nextChordInfo = useMemo(() => {
    if (!state.progressionPlaying || state.progression.length < 2) return null
    const nextIdx = (state.progressionIndex + 1) % state.progression.length
    const nextDeg = state.progression[nextIdx]
    const dc = primaryChords[nextDeg]
    if (!dc) return null
    return {
      notes: getChordNotes(dc.root, dc.chordDef),
      rootIndex: noteIndex(dc.root),
      name: dc.fullName,
    }
  }, [state.progressionPlaying, state.progressionIndex, state.progression, primaryChords])

  // What to show on the fretboard — always the scale, with chord tones overlaid when selected
  const { activeNotes, fretboardRoot } = useMemo(() => {
    if (state.activeTab === 'technique') {
      if (keyScale) return { activeNotes: getScaleNotes(state.keyRoot, keyScale), fretboardRoot: state.keyRoot }
    }
    const scaleKey = state.selectedScaleKey || state.keyQuality
    const scaleRoot = state.selectedScaleRoot || state.keyRoot
    const scale = SCALES[scaleKey]
    if (scale) {
      const scaleNotes = getScaleNotes(scaleRoot, scale)
      if (state.viewMode === 'chords' && state.selectedChordKey && state.selectedChordRoot) {
        const chord = CHORDS[state.selectedChordKey]
        if (chord) {
          const chordNotes = getChordNotes(state.selectedChordRoot, chord)
          return { activeNotes: new Set([...scaleNotes, ...chordNotes]), fretboardRoot: scaleRoot }
        }
      }
      return { activeNotes: scaleNotes, fretboardRoot: scaleRoot }
    }
    if (keyScale) return { activeNotes: getScaleNotes(state.keyRoot, keyScale), fretboardRoot: state.keyRoot }
    return { activeNotes: new Set<number>(), fretboardRoot: state.keyRoot }
  }, [state, keyScale])

  const board = useMemo(
    () => computeFretboard(tuning, fretboardRoot, activeNotes, state.numFrets),
    [tuning, fretboardRoot, activeNotes, state.numFrets]
  )

  // Scale positions: root-aware fret ranges
  const scalePositions = useMemo(() => {
    const scaleKey = state.viewMode === 'scales' ? (state.selectedScaleKey || state.keyQuality) : state.keyQuality
    const scaleRoot = state.viewMode === 'scales' ? (state.selectedScaleRoot || state.keyRoot) : state.keyRoot
    const scale = SCALES[scaleKey]
    if (!scale) return []
    return getScalePositions(scaleRoot, scale, tuning, state.numFrets)
  }, [state.viewMode, state.selectedScaleKey, state.keyQuality, state.selectedScaleRoot, state.keyRoot, tuning, state.numFrets])

  const activePosRange: [number, number] | null = useMemo(() => {
    if (state.scalePosition === null || scalePositions.length === 0) return null
    const idx = Math.min(state.scalePosition - 1, scalePositions.length - 1)
    return scalePositions[idx] || null
  }, [state.scalePosition, scalePositions])

  const displayMode = state.showNoteNames && state.showIntervals ? 'both'
    : state.showNoteNames ? 'notes' : state.showIntervals ? 'intervals' : 'notes'

  // Labels
  const chordLabel = state.selectedChordRoot && state.selectedChordKey
    ? `${state.selectedChordRoot}${CHORDS[state.selectedChordKey]?.suffix || ''}`
    : null
  const scaleLabel = state.viewMode === 'scales' && state.selectedScaleRoot && state.selectedScaleKey
    ? `${state.selectedScaleRoot} ${SCALES[state.selectedScaleKey]?.name || ''}`
    : `${state.keyRoot} ${keyScale?.name || ''}`

  const activeLabel = state.activeTab === 'technique'
    ? `${state.keyRoot} ${keyScale?.name || ''}`
    : state.viewMode === 'chords' && chordLabel
      ? `${chordLabel} over ${scaleLabel}`
      : scaleLabel

  const activeIntervals = state.viewMode === 'scales' && state.selectedScaleKey
    ? SCALES[state.selectedScaleKey]?.intervals || []
    : keyScale?.intervals || []

  const chordFormula = state.selectedChordKey
    ? CHORDS[state.selectedChordKey]?.intervals.map(i => intervalName(i % 12)).join(' \u00B7 ')
    : null

  const rootIdx = noteIndex(fretboardRoot)
  const formulaStr = activeIntervals.map(i => intervalName(i % 12)).join(' \u00B7 ')

  // Grouped pickers
  const scalesByCategory = useMemo(() => {
    const POPULAR_KEYS = ['minor_penta', 'major_penta', 'aeolian', 'ionian', 'blues', 'dorian', 'mixolydian', 'harmonic_minor']
    const cats: Record<string, [string, { name: string }][]> = {}
    cats['Popular'] = POPULAR_KEYS
      .map(k => [k, SCALES[k]] as [string, { name: string }])
      .filter(([, s]) => s != null)
    const popularSet = new Set(POPULAR_KEYS)
    for (const [key, scale] of Object.entries(SCALES)) {
      if (popularSet.has(key)) continue
      if (!cats[scale.category]) cats[scale.category] = []
      cats[scale.category].push([key, scale])
    }
    return cats
  }, [])

  const chordsByCategory = useMemo(() => {
    const cats: Record<string, [string, { name: string; suffix: string }][]> = {}
    for (const [key, chord] of Object.entries(CHORDS)) {
      if (!cats[chord.category]) cats[chord.category] = []
      cats[chord.category].push([key, chord])
    }
    return cats
  }, [])

  // Simple mode root
  const simpleRoot = state.viewMode === 'scales'
    ? (state.selectedScaleRoot || state.keyRoot)
    : (state.selectedChordRoot || state.keyRoot)
  const handleSimpleRootChange = (root: string) => {
    if (state.advancedMode) {
      // Advanced: note pills select diatonic chord or mode for this root
      const degIdx = degreeHeaders.findIndex(dh => dh.note === root)
      if (state.viewMode === 'chords') {
        const dc = degIdx >= 0 ? primaryChords[degIdx] : null
        up({
          selectedChordRoot: root,
          selectedChordKey: dc?.chordKey || (MINOR_QUALITIES.has(state.keyQuality) ? 'minor' : 'major'),
        })
      } else {
        // Scale view: show the diatonic mode for this degree
        const modeKey = degIdx >= 0 ? getDiatonicScaleKey(degIdx, state.keyQuality) : state.keyQuality
        up({
          selectedScaleRoot: root,
          selectedScaleKey: modeKey,
        })
      }
    } else {
      // Simple: note pills change root + key together
      if (state.viewMode === 'scales') {
        up({ selectedScaleRoot: root, keyRoot: root })
      } else {
        up({ selectedChordRoot: root, keyRoot: root })
      }
    }
  }

  // Ambient glow hue
  const rootHue = ROOT_HUES[simpleRoot] ?? 210

  // ─── Technique computation ───
  const techniquePositions = useMemo((): FretPosition[] => {
    if (state.activeTab !== 'technique') return []
    if (state.techniqueMode === '3nps') {
      const scale = SCALES[state.keyQuality]
      if (!scale) return []
      return compute3NPSPattern(state.keyRoot, scale, tuning, state.selectedPattern, state.numFrets)
    }
    if (state.techniqueMode === 'arpeggios') {
      const degChords = diatonicChords[state.selectedPattern]
      const dc = degChords?.[0]
      if (!dc) return []
      return computeSweepShape(dc.root, dc.chordDef, tuning, 0, state.numFrets)
    }
    if (state.techniqueMode === 'tapping') {
      const degChords = diatonicChords[state.selectedPattern]
      const dc = degChords?.[0]
      if (!dc) return []
      return computeTappingPattern(dc.root, dc.chordDef, tuning, 0, state.numFrets)
    }
    return []
  }, [state.activeTab, state.techniqueMode, state.keyRoot, state.keyQuality, state.selectedPattern, tuning, state.numFrets, diatonicChords])

  const highlightedPosSet = useMemo(() => {
    if (techniquePositions.length === 0) return null
    return new Set(techniquePositions.map(p => `${p.stringIndex}-${p.fret}`))
  }, [techniquePositions])

  const numPatterns = state.techniqueMode === '3nps'
    ? (SCALES[state.keyQuality]?.intervals.length || 7)
    : diatonicChords.length

  // ─── Handlers ───
  const handleChordClick = (dc: DiatonicChord) => {
    // Toggle: click same chord again to deselect → back to scale view
    if (state.selectedChordRoot === dc.root && state.selectedChordKey === dc.chordKey) {
      up({ selectedChordRoot: null, selectedChordKey: null, viewMode: 'scales' })
      stopChordPad()
      return
    }
    up({ selectedChordRoot: dc.root, selectedChordKey: dc.chordKey, viewMode: 'chords', activeTab: 'explore' })
    if (state.padLatched) {
      playChordPad(chordToMidi(noteIndex(dc.root), dc.chordDef.intervals), true)
    }
  }
  const handleScaleClick = (root: string, scaleKey: string) => {
    up({ selectedScaleRoot: root, selectedScaleKey: scaleKey, viewMode: 'scales' })
  }
  const handlePlayChord = (dc: DiatonicChord) => {
    playChordPad(chordToMidi(noteIndex(dc.root), dc.chordDef.intervals), state.padLatched)
  }
  const handleLatchToggle = () => {
    const newLatched = !state.padLatched
    up({ padLatched: newLatched })
    if (!newLatched) stopChordPad()
  }

  // ─── Progression stepper ───
  const progressionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const advanceProgression = useCallback(() => {
    setState(s => {
      const nextIdx = (s.progressionIndex + 1) % s.progression.length
      const degree = s.progression[nextIdx]
      const dc = diatonicChords[degree]?.[0]
      if (dc) {
        playChordPad(chordToMidi(noteIndex(dc.root), dc.chordDef.intervals), true)
        return {
          ...s,
          progressionIndex: nextIdx,
          selectedChordRoot: dc.root,
          selectedChordKey: dc.chordKey,
          viewMode: 'chords' as const,
        }
      }
      return { ...s, progressionIndex: nextIdx }
    })
  }, [diatonicChords])

  const [metronomeOn, setMetronomeOn] = useState(false)
  const [droneOn, setDroneOn] = useState(false)
  const [listening, setListening] = useState(false)
  const [micError, setMicError] = useState<string | null>(null)

  // Narrow + portrait — the moment the neck is hardest to read. We only ever
  // suggest turning the phone; nothing here blocks using the app in portrait.
  const [isPortraitNarrow, setIsPortraitNarrow] = useState(false)
  const [rotateDismissed, setRotateDismissed] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px) and (orientation: portrait)')
    setIsPortraitNarrow(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setIsPortraitNarrow(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  useEffect(() => { if (listening) setRotateDismissed(false) }, [listening])
  const [heardMidi, setHeardMidi] = useState<number | null>(null)
  const [focusFound, setFocusFound] = useState(false)
  const [justLanded, setJustLanded] = useState(false)
  // Two independent collections feed the same number: concepts you've
  // mic-landed (loadOwned, this branch) and Walk positions you've claimed
  // (totalClaimed, from #20's progress.ts) — different mechanics, same idea.
  const [soundsOwned, setSoundsOwned] = useState(() => loadOwned().length + totalClaimed())
  const [collectionOpen, setCollectionOpen] = useState(false)
  // Recomputed whenever the panel opens or the owned count changes — the
  // panel itself can't be open while a new sound lands, so this stays in sync.
  const ownedIds = useMemo(() => (collectionOpen ? loadOwned() : []), [collectionOpen, soundsOwned])

  const startProgression = useCallback(() => {
    if (progressionTimerRef.current) clearInterval(progressionTimerRef.current)
    const msPerChord = (60 / state.progressionBpm) * 4 * state.progressionBarsPerChord * 1000
    up({ progressionPlaying: true, progressionIndex: -1 })
    setTimeout(() => advanceProgression(), 50)
    progressionTimerRef.current = setInterval(advanceProgression, msPerChord)
    startMetronome(state.progressionBpm)
    setMetronomeOn(true)
  }, [state.progressionBpm, advanceProgression])

  const stopProgression = useCallback(() => {
    if (progressionTimerRef.current) {
      clearInterval(progressionTimerRef.current)
      progressionTimerRef.current = null
    }
    stopChordPad()
    stopMetronome()
    setMetronomeOn(false)
    up({ progressionPlaying: false, progressionIndex: -1 })
  }, [])

  const toggleMetronome = useCallback(() => {
    if (metronomeOn) {
      stopMetronome()
      setMetronomeOn(false)
    } else {
      startMetronome(state.progressionBpm)
      setMetronomeOn(true)
    }
  }, [metronomeOn, state.progressionBpm])

  useEffect(() => {
    return () => {
      if (progressionTimerRef.current) clearInterval(progressionTimerRef.current)
      stopMetronome()
      stopDrone()
      stopMic()
    }
  }, [])

  // ─── Ambient drone ───
  // The drone always follows whatever the neck is currently showing, so a
  // concept can retune it just by writing state.
  const droneTuning = useMemo(() => ({
    root: state.activeTab === 'technique' ? state.keyRoot : (state.selectedScaleRoot || state.keyRoot),
    scaleKey: state.activeTab === 'technique' ? state.keyQuality : (state.selectedScaleKey || state.keyQuality),
  }), [state.activeTab, state.keyRoot, state.keyQuality, state.selectedScaleRoot, state.selectedScaleKey])


  useEffect(() => {
    if (droneOn) {
      startDrone(noteIndex(droneTuning.root), SCALES[droneTuning.scaleKey]?.intervals || [])
    } else {
      stopDrone()
    }
  }, [droneOn, droneTuning])

  // Volume/spread/tone apply live — the drone doesn't need to restart for
  // these to take effect, and starting fresh also picks up the latest value.
  useEffect(() => { setDroneVolume(state.droneVolume) }, [state.droneVolume])
  useEffect(() => { setDroneSpread(state.droneSpread) }, [state.droneSpread])
  useEffect(() => { setDroneTone(state.droneTone) }, [state.droneTone])

  // ─── Flow mode: the session engine ───
  // concept → shape on the neck → drone in key → hands. One click, zero config.
  const currentConcept = useMemo(
    () => CONCEPTS.find(c => c.id === state.conceptId) || null,
    [state.conceptId]
  )

  const applyConcept = useCallback((c: Concept) => {
    up({
      appMode: 'flow',
      conceptId: c.id,
      keyRoot: c.root,
      keyQuality: PARENT_KEY[c.mode] ?? c.mode,
      selectedScaleRoot: c.root,
      selectedScaleKey: c.mode,
      viewMode: 'scales',
      selectedChordRoot: null,
      selectedChordKey: null,
      scalePosition: c.position,
      zoomToPosition: false,
      fretRange: null,
      activeTab: c.technique ? 'technique' : 'explore',
      techniqueMode: c.technique ?? '3nps',
      selectedPattern: c.patternIndex ?? 0,
      showNoteNames: true,
      showIntervals: true,
    })
    markSeen(c.id)
    setFocusFound(false) // new idea, new ear-hunt
    setJustLanded(false)
    // The drone is never started for you — sound only ever begins on an explicit
    // press of the Drone button. If it's already running, the effect above retunes
    // it to the new key.
  }, [up])

  const startSession = useCallback(() => applyConcept(getNextConcept(null)), [applyConcept])

  // The Walk is the centrepiece, so it must be one press away — ALWAYS.
  // It used to appear only for a brand-new user with empty storage, which meant
  // anyone who'd already used the app could never find it again.
  const startWalk = useCallback(() => {
    const walk = CONCEPTS.find(c => c.walk)
    if (walk) applyConcept(walk)
  }, [applyConcept])
  const nextConcept = useCallback(
    () => applyConcept(getNextConcept(state.conceptId)),
    [applyConcept, state.conceptId]
  )

  // Switching modes never destroys your work — Study keeps whatever's on the
  // neck; Flow picks up (or starts) a session.
  const goStudy = useCallback(() => up({ appMode: 'study' }), [up])
  const goFlow = useCallback(() => {
    if (state.conceptId) up({ appMode: 'flow' })
    else startSession()
  }, [state.conceptId, up, startSession])

  const shiftPosition = useCallback(() => {
    const n = scalePositions.length
    if (n === 0) return
    const cur = state.scalePosition ?? 0
    up({ scalePosition: cur >= n ? 1 : cur + 1 })
  }, [scalePositions.length, state.scalePosition, up])

  // ─── Play: one button, not two ───
  // Drone and Listen used to be separate toggles — most people want both
  // at once (that's the whole app), and a mic-only "Listen" button playing
  // total silence looked broken. One press starts the room; the same press
  // stops it. Drone always succeeds; Listen can fail (permission, no mic)
  // without taking the drone down with it.
  const isPlaying = droneOn || listening
  const [justTapped, setJustTapped] = useState(0)
  const togglePlay = useCallback(async () => {
    setJustTapped(n => n + 1)
    if (isPlaying) {
      if (droneOn) setDroneOn(false)
      if (listening) { stopMic(); setListening(false); setHeardMidi(null) }
    } else {
      setDroneOn(true)
      setMicError(null)
      const ok = await startMic()
      setListening(ok)
      if (!ok) setMicError(getMicError())
    }
  }, [isPlaying, droneOn, listening])

  // Poll the detector ~20×/s. A note must be heard twice in a row to commit
  // (kills flicker from transients); it lingers ~200ms after you stop (kills
  // strobing between notes). State only changes when the NOTE changes.
  const lastRawRef = useRef<number | null>(null)
  const emptyCountRef = useRef(0)
  useEffect(() => {
    if (!listening) return
    const timer = setInterval(() => {
      const p = readPitch()
      if (p !== null) {
        emptyCountRef.current = 0
        if (p.midi === lastRawRef.current) {
          setHeardMidi(cur => (cur === p.midi ? cur : p.midi))
        }
        lastRawRef.current = p.midi
      } else {
        lastRawRef.current = null
        emptyCountRef.current++
        if (emptyCountRef.current >= 4) {
          setHeardMidi(cur => (cur === null ? cur : null))
        }
      }
    }, 50)
    return () => clearInterval(timer)
  }, [listening])

  // The soundscape changed — relearn the ambient floor. Delayed so the
  // drone's slow bloom (or fade) has mostly settled before we measure it.
  useEffect(() => {
    if (!listening) return
    const t = setTimeout(() => recalibrateMic(), 3000)
    return () => clearTimeout(t)
  }, [droneOn, listening])

  // Did you find the note the concept told you to listen for?
  const focusPc = useMemo(() => {
    if (!currentConcept) return null
    const semis = intervalSemitones(currentConcept.focus)
    if (semis === null) return null
    return (noteIndex(currentConcept.root) + semis) % 12
  }, [currentConcept])

  const hearingFocus = heardMidi !== null && focusPc !== null && heardMidi % 12 === focusPc

  // ─── The reward. You didn't score a point — you now OWN a sound. ───
  // Owning is per concept (id), persisted, and mic-confirmed — not a page
  // view. Re-landing a concept you already own still feels good but doesn't
  // double-count the collection.
  useEffect(() => {
    if (!hearingFocus || focusFound || !currentConcept) return
    setFocusFound(true)
    setJustLanded(true)
    setSoundsOwned(markOwned(currentConcept.id).length + totalClaimed())
    const t = setTimeout(() => setJustLanded(false), 900)
    return () => clearTimeout(t)
  }, [hearingFocus, focusFound, currentConcept])

  // ─── The theory layer: why what you're looking at works ───
  const insight = useMemo(() => {
    if (state.viewMode === 'chords' && state.selectedChordRoot && state.selectedChordKey) {
      const dc = diatonicChords
        .flat()
        .find(c => c.root === state.selectedChordRoot && c.chordKey === state.selectedChordKey)
      if (dc) return getChordInsight(state.keyRoot, state.keyQuality, dc, primaryChords[0] ?? null)
    }
    const sKey = state.selectedScaleKey || state.keyQuality
    const sRoot = state.selectedScaleRoot || state.keyRoot
    return getScaleInsight(sRoot, sKey)
  }, [
    state.viewMode, state.selectedChordRoot, state.selectedChordKey,
    state.selectedScaleKey, state.selectedScaleRoot, state.keyRoot, state.keyQuality,
    diatonicChords, primaryChords,
  ])

  // ─── Modal relativity: the same notes, a different home ───
  // The whole reason this app exists. These siblings use the IDENTICAL pitch
  // set — only the drone's home note differs. The neck does not move.
  const sameNoteModes = useMemo(
    () => getSameNoteModes(
      state.selectedScaleRoot || state.keyRoot,
      state.selectedScaleKey || state.keyQuality
    ),
    [state.selectedScaleRoot, state.keyRoot, state.selectedScaleKey, state.keyQuality]
  )

  const [lastShift, setLastShift] = useState<string | null>(null)

  const selectSibling = useCallback((s: SiblingMode) => {
    const prevRoot = state.selectedScaleRoot || state.keyRoot
    const prevKey = state.selectedScaleKey || state.keyQuality
    if (s.isCurrent) return
    setLastShift(describeModalShift(prevRoot, prevKey, s.root, s.scaleKey))
    up({
      keyRoot: s.root,
      keyQuality: s.scaleKey,
      selectedScaleRoot: s.root,
      selectedScaleKey: s.scaleKey,
      viewMode: 'scales',
      selectedChordRoot: null,
      selectedChordKey: null,
    })
  }, [state.selectedScaleRoot, state.keyRoot, state.selectedScaleKey, state.keyQuality, up])

  // Explain the mode against the tonic you're ACTUALLY sitting on, not in the
  // abstract: "You're in A. A Aeolian uses F. A Dorian swaps it for F#."
  const keyContrast = useMemo(() => {
    const root = state.selectedScaleRoot || state.keyRoot
    const sk = state.selectedScaleKey || state.keyQuality
    const scale = SCALES[sk]
    if (!scale) return null
    const isMinorish = scale.intervals.some(i => i % 12 === 3)
    const base = isMinorish ? 'aeolian' : 'ionian'
    if (base === sk) return null
    return contrastWithKey(root, base, sk)
  }, [state.selectedScaleRoot, state.keyRoot, state.selectedScaleKey, state.keyQuality])

  const playableChords = useMemo(
    () => chordsInScale(
      state.selectedScaleRoot || state.keyRoot,
      state.selectedScaleKey || state.keyQuality
    ),
    [state.selectedScaleRoot, state.keyRoot, state.selectedScaleKey, state.keyQuality]
  )

  useEffect(() => {
    if (state.progressionPlaying && progressionTimerRef.current) {
      clearInterval(progressionTimerRef.current)
      const msPerChord = (60 / state.progressionBpm) * 4 * state.progressionBarsPerChord * 1000
      progressionTimerRef.current = setInterval(advanceProgression, msPerChord)
    }
  }, [state.progressionBpm, state.progressionPlaying, advanceProgression])

  const addDegreeToProgression = useCallback((degree: number) => {
    setState(s => ({ ...s, progression: [...s.progression, degree] }))
  }, [])

  const removeFromProgression = useCallback((index: number) => {
    setState(s => {
      const prog = [...s.progression]
      prog.splice(index, 1)
      return { ...s, progression: prog }
    })
  }, [])

  const isFlow = state.appMode === 'flow'
  const [primerOpen, setPrimerOpen] = useState(false)

  // "A Dorian" — the name of the SOUND, not the exercise. The old copy read
  // "the sound of A Dorian — tonic arpeggio", which is not a sound.
  const soundName = useMemo(() => {
    if (!currentConcept) return ''
    const s = SCALES[currentConcept.mode]
    return s ? `${currentConcept.root} ${s.name.replace(/\s*\(.*\)/, '')}` : currentConcept.title
  }, [currentConcept])

  // The actual note behind the interval — nobody new knows what "the 6" is
  // until you tell them it's F♯.
  const focusNoteName = useMemo(() => {
    if (!currentConcept || focusPc === null) return null
    return noteName(focusPc, useFlats(currentConcept.root))
  }, [currentConcept, focusPc])

  // ═══ THE WALK ═══════════════════════════════════════════════════
  // Same seven notes, seven positions, seven modes. Move up the neck and the
  // drone moves home with you. Claim each mode by improvising in its position
  // and resolving to its tonic.
  const isWalk = Boolean(currentConcept?.walk)

  const walkPositions = useMemo(() => {
    if (!isWalk) return []
    return getWalkPositions(
      state.selectedScaleRoot || state.keyRoot,
      state.selectedScaleKey || state.keyQuality,
      tuning,
      state.numFrets
    )
  }, [isWalk, state.selectedScaleRoot, state.keyRoot, state.selectedScaleKey, state.keyQuality, tuning, state.numFrets])

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
    if (!isWalk) return
    setWalkState({ ...initWalk(), claimed: getClaims(walkFamily) })
    setWalkStory(null)
  }, [isWalk, currentConcept?.id, walkFamily])

  const scalePcs = useMemo(() => {
    const sk = state.selectedScaleKey || state.keyQuality
    const sr = state.selectedScaleRoot || state.keyRoot
    const sc = SCALES[sk]
    return sc ? getScaleNotes(sr, sc) : new Set<number>()
  }, [state.selectedScaleKey, state.keyQuality, state.selectedScaleRoot, state.keyRoot])

  // The mic drives the game.
  useEffect(() => {
    if (!isWalk || !walkPos || !listening || heardMidi === null) return
    setWalkState(s => feedWalk(s, { position: walkPos, scalePcs, heardMidi }))
  }, [heardMidi, isWalk, walkPos, listening, scalePcs])

  const walkProg = useMemo(
    () => (walkPos ? walkProgress(walkState, walkPos) : null),
    [walkState, walkPos]
  )

  // Step to a position: the notes on the neck do NOT move. Only home does.
  const goToPosition = useCallback((i: number) => {
    const p = walkPositions[i]
    if (!p) return
    setWalkStory(describeStep(walkPos, p))
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

  const walkComplete = isWalk && walkPositions.length > 0 &&
    walkState.claimed.length >= walkPositions.length

  useEffect(() => {
    if (walkComplete) markCompleted(walkFamily)
  }, [walkComplete, walkFamily])

  // ─── The run player: the app follows your hands through the arpeggio ───
  const currentRun = useMemo(() => {
    if (!currentConcept?.run) return null
    const chord = CHORDS[currentConcept.run.chordKey]
    if (!chord) return null

    // Sweeps need a rakeable (one-note-per-string) shape; everything else can
    // use a full position shape, which has more notes in it.
    const shape =
      currentConcept.run.kind === 'sweep'
        ? getSweepShape(currentConcept.root, chord, tuning, currentConcept.run.shapeIndex ?? 0, state.numFrets)
        : getArpeggioShapes(currentConcept.root, chord, tuning, state.numFrets)[
            currentConcept.run.shapeIndex ?? 1
          ] ?? getArpeggioShapes(currentConcept.root, chord, tuning, state.numFrets)[0]

    if (!shape) return null
    return buildRun(shape, currentConcept.run.kind)
  }, [currentConcept, tuning, state.numFrets])

  const [runState, setRunState] = useState(initRun)

  // New exercise → fresh attempt.
  useEffect(() => { setRunState(initRun()) }, [currentConcept?.id])

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
    () => (currentRun ? scoreRun(currentRun, runState) : null),
    [currentRun, runState]
  )

  // The payoff: same shape, move the drone, and it means something else entirely.
  const [twistTonic, setTwistTonic] = useState<string | null>(null)

  const twist = useMemo(() => {
    if (!currentConcept?.run || !twistTonic) return null
    const chord = CHORDS[currentConcept.run.chordKey]
    if (!chord) return null
    return recontextualise(currentConcept.root, chord.intervals, twistTonic)
  }, [currentConcept, twistTonic])

  // Where can we move home to and still keep every note of the shape in key?
  const twistOptions = useMemo(() => {
    if (!currentConcept?.run) return []
    return getSameNoteModes(currentConcept.root, currentConcept.mode)
      .filter(s => !s.isCurrent)
      .slice(0, 3)
  }, [currentConcept])

  const applyTwist = useCallback((s: SiblingMode) => {
    setTwistTonic(s.root)
    // Move ONLY the drone's home. The shape under the hands does not move.
    // A running drone retunes to the new home; a silent one stays silent.
    up({ keyRoot: s.root, keyQuality: s.scaleKey, selectedScaleRoot: s.root, selectedScaleKey: s.scaleKey })
  }, [up])

  useEffect(() => { setTwistTonic(null) }, [currentConcept?.id])

  // The objective, in words someone who's never heard the word "mode" can act on.
  const objective = useMemo(() => {
    if (!currentConcept || !focusNoteName) return ''
    return getObjective({
      root: currentConcept.root,
      scaleKey: currentConcept.mode,
      focusInterval: currentConcept.focus,
      focusNote: focusNoteName,
      hasShape: Boolean(currentConcept.technique),
    })
  }, [currentConcept, focusNoteName])

  // ─── Render ───
  return (
    <div className={`app ${state.theme}${state.colorTheme !== 'obsidian' ? ' ' + state.colorTheme : ''} mode-${state.appMode}`}>
      {!isFlow && (
        <div
          className="ambient-glow"
          style={{ '--glow-color': `hsla(${rootHue}, 50%, 35%, 0.05)` } as React.CSSProperties}
        />
      )}

      {/* ─── First run: what is this, and where do I start? ─── */}
      {!state.onboarded && (
        <div className="intro-veil">
          <div className="intro">
            <img className="intro-logo" src="/logo.png" alt="Modal Runs" />
            <h1 className="intro-title">
              It <em>listens while you play,</em> and answers on the neck.
            </h1>
            <p className="intro-sub">
              In 1959, Miles Davis walked into a studio bored of chasing chord changes and cut
              an album built on almost none. <em>Kind of Blue</em> — still the best-selling
              jazz record ever made — runs on scales instead of progressions. He called it
              modal jazz: hold one note underneath (a <b>drone</b>), improvise inside a single
              scale (a <b>mode</b>), and let the mode do the emotional work a wall of chords
              usually does.
            </p>
            <p className="intro-sub">
              That's this app, on a fretboard. Hold a drone in any key and the neck fills with
              the notes that work over it. Play, and Modal Runs hears you through the mic — it
              lights up what you just played and tells you the moment you land the note it's
              hunting for. Move the tonic and the same seven notes turn from A Aeolian into D
              Dorian — same frets, same notes, just a different one as home. Seven different
              moods out of one shape. You find them by ear, the way Miles did — not off a chart.
            </p>

            {/* The thesis, made concrete — the thing a textbook can't do. */}
            <div className="intro-how">
              <div className="intro-step">
                <span className="intro-step-n">1</span>
                <span className="intro-step-t">Set the key</span>
                <span className="intro-step-d">
                  The neck fills with the notes that belong to it. Each one is coloured by
                  its interval rather than its name, so you read what a note <em>does</em>{' '}
                  against the tonic, not merely what it's called. The root is amber.
                </span>
              </div>
              <div className="intro-step">
                <span className="intro-step-n">2</span>
                <span className="intro-step-t">Start the drone</span>
                <span className="intro-step-d">
                  It sustains the tonic underneath you, so every note you play finally has
                  something to lean against. The b6 aches against it; the natural 6 opens up.
                  Intervals stop being arithmetic and start being sounds.
                </span>
              </div>
              <div className="intro-step">
                <span className="intro-step-n">3</span>
                <span className="intro-step-t">Move the tonic</span>
                <span className="intro-step-d">
                  Tap <b>Dorian</b> in the same-notes strip. Same frets, same notes — the
                  drone simply moves home to D, and the app names the one note that
                  separates it from where you just were.
                </span>
              </div>
            </div>

            <div className="intro-modes">
              <button className="intro-mode" onClick={() => up({ onboarded: true, appMode: 'study' })}>
                <span className="intro-mode-name">Study the neck</span>
                <span className="intro-mode-desc">
                  Any key, any mode. Chords laid over scales, arpeggios, positions, the whole
                  fretboard at once — and the theory that accounts for what you're looking at,
                  written for someone who wants to understand it rather than recite it.
                </span>
              </button>
              <button className="intro-mode" onClick={() => { up({ onboarded: true }); startSession() }}>
                <span className="intro-mode-name">Just play</span>
                <span className="intro-mode-desc">
                  One idea, chosen for you, with the shape already sitting on the neck. Start
                  the drone and play over it; if you let it listen through your mic, it will
                  tell you when you land the note it asked for.
                </span>
              </button>
            </div>
            <button className="intro-skip" onClick={() => up({ onboarded: true })}>Skip</button>
          </div>
        </div>
      )}

      {/* ─── The shell: one switch between two first-class modes ─── */}
      <header className="shell-header">
        <div className="shell-brand">
          <img className="shell-logo" src="/mark.png" alt="" width={28} height={28} />
          <span className="shell-name">modalruns</span>
        </div>

        <div className="mode-switch">
          <button className={`mode-btn ${!isFlow ? 'active' : ''}`} onClick={goStudy}>
            Study
          </button>
          <button className={`mode-btn ${isFlow ? 'active' : ''}`} onClick={goFlow}>
            Flow
          </button>
        </div>

        <div className="shell-actions">
          <button className="icon-btn" onClick={() => setSettingsOpen(true)} title="Settings">
            &#9881;
          </button>
          <button
            className="icon-btn"
            onClick={() => up({ theme: state.theme === 'dark' ? 'light' : 'dark' })}
            title="Toggle theme"
          >
            {state.theme === 'dark' ? '\u2600' : '\u263E'}
          </button>
        </div>
      </header>

      {/* ═════════ FLOW — one idea, the shape, the drone, listening ═════════ */}
      {isFlow && currentConcept && (
        <main className={`flow-stage ${justLanded ? 'landed' : ''}`}>
          <div className="flow-aura" />

          {listening && isPortraitNarrow && !rotateDismissed && (
            <div className="rotate-prompt">
              <span>Turn your phone sideways — the neck reads a lot easier in landscape while you play.</span>
              <button onClick={() => setRotateDismissed(true)}>Got it</button>
            </div>
          )}

          <button
            className={`flow-owned ${justLanded ? 'gained' : ''}`}
            onClick={() => setCollectionOpen(true)}
            title="See every sound you've landed by ear"
          >
            <span className="flow-owned-n">{soundsOwned}</span>
            <span>sounds you own</span>
          </button>

          <header className="flow-idea">
            <p className="flow-key">
              <span>{soundName}</span>
              <button className="flow-help" onClick={() => setPrimerOpen(o => !o)}>
                {primerOpen ? 'close' : 'what is this?'}
              </button>
            </p>

            {isWalk && walkPos && walkProg ? (
              /* ═══ THE WALK — seven positions, seven modes, same seven notes ═══ */
              <>
                {/* The ladder: seven modes to claim. */}
                <div className="ladder">
                  {walkPositions.map((p, i) => {
                    const claimed = walkState.claimed.includes(p.tonic)
                    const here = i === walkIdx
                    return (
                      <button
                        key={p.tonic}
                        className={`rung ${here ? 'here' : ''} ${claimed ? 'claimed' : ''}`}
                        onClick={() => goToPosition(i)}
                        title={`Position ${p.index} — ${p.tonic} ${p.modeName}`}
                      >
                        <span className="rung-tonic">{p.tonic}</span>
                        <span className="rung-mode">{p.modeName}</span>
                        <span className="rung-mark">{claimed ? '✓' : here ? '●' : ''}</span>
                      </button>
                    )
                  })}
                </div>

                {walkComplete ? (
                  <div className="walk-done">
                    <span className="walk-done-tag">You walked the neck</span>
                    <p>
                      All seven. You just played <b>one scale</b> across the whole fretboard and
                      heard it become <b>seven different modes</b> — because the only thing that
                      ever changed was where home was. Most guitarists learn these shapes for
                      years and never once hear this.
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="walk-here">
                      <span className="walk-here-pos">Position {walkPos.index}</span>
                      home is <b>{walkPos.tonic}</b> — so this is{' '}
                      <b>{walkPos.tonic} {walkPos.modeName}</b>
                      {walkPos.plain && <span className="walk-plain">{walkPos.plain}</span>}
                    </p>

                    {walkStory && <p className="walk-story">{walkStory}</p>}

                    <div className={`walk-task ${walkProg.readyToResolve ? 'ready' : ''} ${walkProg.claimed ? 'claimed' : ''}`}>
                      <div className="walk-pips">
                        {Array.from({ length: walkProg.needed }).map((_, i) => (
                          <span key={i} className={`walk-pip ${i < walkProg.explored ? 'lit' : ''}`} />
                        ))}
                      </div>
                      <span className="walk-instruction">{walkProg.instruction}</span>
                    </div>
                  </>
                )}

                {walkState.combo > 1 && !walkComplete && (
                  <span className="walk-combo">{walkState.combo} modes in a row</span>
                )}
              </>
            ) : currentRun ? (
              /* ═══ A RUN: the app follows your hands, note by note ═══ */
              <>
                <p className="flow-objective">
                  {listening
                    ? <>Play the numbered notes <b>in order</b>. The app is listening — it lights up
                      the next note as you land each one. A drone is holding {currentConcept.root} underneath.</>
                    : <>This is an exercise: play the numbered notes in order.
                      <b> Hit play</b> and the app will follow your hands through it.</>}
                </p>
                <h2 className="flow-hook">{currentConcept.hook}</h2>
                <p className="flow-listen">{currentConcept.listenFor}</p>

                <div className="run-bar">
                  <span className="run-name">{currentRun.name}</span>
                  <div className="run-progress">
                    <div
                      className="run-progress-fill"
                      style={{ width: `${(runState.index / currentRun.steps.length) * 100}%` }}
                    />
                  </div>
                  <span className="run-count">
                    {Math.min(runState.index + (runState.done ? 1 : 0), currentRun.steps.length)}
                    /{currentRun.steps.length}
                  </span>
                  <button className="run-reset" onClick={() => setRunState(initRun())}>restart</button>
                </div>
                <p className="run-hint">{currentRun.hint}</p>
              </>
            ) : (
              /* ═══ A SOUND: hunt the note that defines the mode ═══ */
              <>
                <p className="flow-objective">{objective}</p>
                <h2 className="flow-hook">{currentConcept.hook}</h2>
                <p className="flow-listen">{currentConcept.listenFor}</p>
                <div className={`flow-target ${focusFound ? 'found' : ''}`}>
                  <b>{currentConcept.focus}</b>
                  <span>
                    {focusFound
                      ? `You found it — that's the sound of ${soundName}`
                      : `Find every ${focusNoteName ?? currentConcept.focus} — the glowing notes`}
                  </span>
                </div>
              </>
            )}
          </header>

          {/* ═══ You played it. Now the payoff. ═══ */}
          {runResult && (
            <div className="run-done">
              <div className="run-verdict">
                <span className="run-verdict-tag">Shape learned</span>
                {runResult.verdict}
                <span className="run-stats">
                  {runResult.seconds.toFixed(1)}s · {runResult.notesPerSecond.toFixed(1)} notes/sec
                </span>
              </div>

              {twist ? (
                <p className="run-twist">{twist.sentence}</p>
              ) : twistOptions.length > 0 && (
                <div className="run-twist-offer">
                  <span className="run-twist-lead">
                    Now don't move your hands — <b>move the drone</b> and play the exact same shape:
                  </span>
                  <div className="run-twist-btns">
                    {twistOptions.map(s => (
                      <button key={s.root} className="run-twist-btn" onClick={() => applyTwist(s)}>
                        Drone on {s.root}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* The whole game explained, for anyone who's never seen this before */}
          {primerOpen && (
            <div className="primer">
              {PRIMER.map(p => (
                <div className="primer-item" key={p.q}>
                  <div className="primer-q">{p.q}</div>
                  <div className="primer-a">{p.a}</div>
                </div>
              ))}
            </div>
          )}

          <div className="flow-neck">
            <Fretboard
              board={board}
              displayMode="intervals"
              inlayStyle={state.inlayStyle}
              intervalColors={state.intervalColors}
              highlightRoot={state.highlightRoot}
              showLeftHanded={state.showLeftHanded}
              /* In the walk, the neck highlights the position you're standing in
                 — the notes themselves never move. */
              posRange={isWalk && walkPos ? walkPos.range : activePosRange}
              numFrets={state.numFrets}
              fretRange={state.fretRange}
              tuningLabels={tuning.labels}
              highlightedPositions={state.activeTab === 'technique' ? highlightedPosSet : null}
              guitarModel={state.guitarModel}
              zoomToPosition={!isWalk && state.scalePosition !== null}
              heardMidi={listening ? heardMidi : null}
              /* A run takes over the neck (numbered steps). In the walk, the ROOT
                 glows — which IS the new tonic, so moving position visibly moves
                 home. Otherwise the concept's focus note glows. */
              runNotes={runMarks}
              focusInterval={runMarks ? null : isWalk ? 'R' : currentConcept.focus}
            />
          </div>

          <div className="flow-legend">
            {isWalk && walkPos ? (
              <>
                <span><i className="flow-sw target" style={{ background: state.intervalColors['R'] }} /> home — {walkPos.tonic}</span>
                <span><i className="flow-sw scale" /> the same seven notes, everywhere</span>
                <span><i className="flow-sw heard" /> what it hears you play</span>
              </>
            ) : currentRun ? (
              <>
                <span><i className="flow-sw target" /> play this one next</span>
                <span><i className="flow-sw done" /> already played</span>
                <span><i className="flow-sw todo" /> still to come</span>
                <span><i className="flow-sw roll" /> roll your finger, don't lift it</span>
                <span><i className="flow-sw heard" /> what it hears you play</span>
              </>
            ) : (
              <>
                <span><i className="flow-sw target" style={{ background: state.intervalColors[currentConcept.focus] }} /> find these ({focusNoteName})</span>
                <span><i className="flow-sw root" style={{ background: state.intervalColors['R'] }} /> home ({currentConcept.root})</span>
                <span><i className="flow-sw scale" /> safe to play</span>
                <span><i className="flow-sw heard" /> what it hears you play</span>
              </>
            )}
          </div>

          <footer className="flow-controls">
            {isWalk ? (
              <>
                <button
                  className="flow-ctl"
                  onClick={() => goToPosition((walkIdx - 1 + walkPositions.length) % walkPositions.length)}
                >
                  {'←'} Down the neck
                </button>
                <button
                  className={`flow-ctl primary ${walkProg?.claimed ? 'beckon' : ''}`}
                  onClick={() => goToPosition((walkIdx + 1) % walkPositions.length)}
                >
                  Up the neck {'→'}
                </button>
              </>
            ) : (
              <>
                <button className={`flow-ctl primary ${focusFound ? 'beckon' : ''}`} onClick={nextConcept}>
                  {focusFound ? 'Next sound' : 'Next idea'} {'→'}
                </button>
                {/* The centrepiece must always be one press away. */}
                <button className="flow-ctl walk-entry" onClick={startWalk}>
                  Walk the neck
                </button>
                <button className="flow-ctl" onClick={shiftPosition}>Shift position</button>
              </>
            )}
            <button
              key={justTapped}
              className={`play-btn ${isPlaying ? 'on' : ''}`}
              onClick={togglePlay}
              title={isPlaying ? 'Stop the drone and the mic' : 'Start the drone and let it hear you'}
              aria-label={isPlaying ? 'Stop' : 'Play'}
            >
              <span className="play-icon">{isPlaying ? '⏸' : '▶'}</span>
            </button>
            {listening && (
              <span className={`flow-readout ${hearingFocus ? 'hit' : ''}`}>
                {heardMidi !== null
                  ? <>{noteName(heardMidi % 12, flats)}<sub>{Math.floor(heardMidi / 12) - 1}</sub></>
                  : '···'}
              </span>
            )}
          </footer>

          {micError && (
            <p className="flow-coach mic-error">
              <span className="flow-pip" />
              {micError}
            </p>
          )}

          {!isPlaying && !micError && (
            <p className="flow-coach">
              <span className="flow-pip" />
              Hit <b>&nbsp;play&nbsp;</b> and play anything — a note, a whistle, a hum.
              The neck shows you what it heard.
            </p>
          )}

          {collectionOpen && (
            <div className="collection-overlay" onClick={() => setCollectionOpen(false)}>
              <div className="collection-panel" onClick={e => e.stopPropagation()}>
                <div className="drawer-header">
                  <span className="drawer-title">{soundsOwned} / {CONCEPTS.length} sounds you own</span>
                  <button className="drawer-close" onClick={() => setCollectionOpen(false)}>&times;</button>
                </div>
                <p className="collection-sub">
                  Owned means the app actually heard you land it — not just that you looked at it.
                </p>
                <div className="collection-grid">
                  {CONCEPTS.map(c => {
                    const owned = ownedIds.includes(c.id)
                    return (
                      <button
                        key={c.id}
                        className={`collection-item ${owned ? 'owned' : 'locked'}`}
                        onClick={() => { applyConcept(c); setCollectionOpen(false) }}
                        title={owned ? c.hook : `Not yet — ${c.hook}`}
                      >
                        <span className="collection-item-mark">{owned ? '✓' : '·'}</span>
                        <span className="collection-item-title">{c.title}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </main>
      )}

      {/* ═════════ STUDY — the full mapper. Nothing hidden. ═════════ */}
      {!isFlow && (
      <main className="study-stage">
        {/* One toolbar instead of four stacked strips */}
        <div className="study-bar">
          <span className="study-bar-label">Key</span>
          <select className="key-select" value={state.keyRoot}
            onChange={e => up({ keyRoot: e.target.value, selectedScaleRoot: e.target.value, selectedScaleKey: state.keyQuality })}>
            {NOTE_NAMES.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <select className="key-select" value={state.keyQuality}
            onChange={e => up({ keyQuality: e.target.value, selectedScaleKey: e.target.value })}>
            {KEY_QUALITIES.map(q => <option key={q.key} value={q.key}>{q.label}</option>)}
          </select>

          <span className="study-bar-sep" />

          <span className="study-bar-label">Scale</span>
          <select className="type-select" value={state.selectedScaleKey || state.keyQuality}
            onChange={e => up({ selectedScaleKey: e.target.value, selectedScaleRoot: state.keyRoot, viewMode: 'scales', selectedChordRoot: null, selectedChordKey: null })}>
            {Object.entries(scalesByCategory).map(([cat, scales]) => (
              <optgroup key={cat} label={cat}>
                {scales.map(([key, s]) => <option key={key} value={key}>{s.name}</option>)}
              </optgroup>
            ))}
          </select>

          <span className="study-bar-sep" />

          <button
            key={justTapped}
            className={`play-btn small ${isPlaying ? 'on' : ''}`}
            onClick={togglePlay}
            title={isPlaying ? 'Stop the drone and the mic' : 'Start the drone and let it hear you'}
            aria-label={isPlaying ? 'Stop' : 'Play'}
          >
            <span className="play-icon">{isPlaying ? '⏸' : '▶'}</span>
          </button>
          {listening && (
            <span className="heard-readout">
              {heardMidi !== null
                ? <>{noteName(heardMidi % 12, flats)}<sub>{Math.floor(heardMidi / 12) - 1}</sub></>
                : '···'}
            </span>
          )}
        </div>

        {micError && <p className="mic-error study-mic-error">{micError}</p>}

        {/* ═══ Same notes, different home — the point of the whole thing ═══
            Every chip below uses the IDENTICAL notes now on the neck. Click one
            and the drone moves home; the fretboard does not move at all. */}
        {sameNoteModes.length > 1 && (
          <div className="modes-strip">
            <div className="modes-head">
              <span className="modes-label">Same notes · different home</span>
              <span className="modes-hint">
                All of these are the identical {sameNoteModes.length} notes already on your
                neck, at the same frets. Move the drone and a different one becomes home —
                the mode changes without a single new note.
              </span>
            </div>
            <div className="modes-row">
              {sameNoteModes.map(s => (
                <button
                  key={`${s.root}-${s.scaleKey}`}
                  className={`mode-chip ${s.isCurrent ? 'active' : ''}`}
                  onClick={() => selectSibling(s)}
                  title={`${s.root} ${s.name} — same notes, home moves to ${s.root}`}
                >
                  <span className="mode-chip-root">{s.root}</span>
                  <span className="mode-chip-name">{s.name}</span>
                </button>
              ))}
            </div>
            {lastShift && (
              <p className="modes-shift">
                {lastShift}
                <button className="modes-dismiss" onClick={() => setLastShift(null)}>×</button>
              </p>
            )}
          </div>
        )}

        {/* Chord tier selector + diatonic chord buttons */}
        <div className="chord-tier-bar">
          {HARMONY_ROWS.map((row, ri) => {
            const hasAny = harmonyGrid[ri]?.chords.some(c => c !== null)
            if (!hasAny) return null
            return (
              <button key={ri}
                className={`chord-tier-btn ${chordTier === ri ? 'active' : ''}`}
                onClick={() => {
                  setChordTier(ri)
                  // Auto-upgrade selected chord to new tier
                  if (state.selectedChordRoot) {
                    const curIdx = harmonyGrid[chordTier]?.chords.findIndex(
                      dc => dc && dc.root === state.selectedChordRoot && dc.chordKey === state.selectedChordKey
                    )
                    if (curIdx !== undefined && curIdx >= 0) {
                      const newDc = harmonyGrid[ri]?.chords[curIdx]
                      if (newDc) {
                        up({ selectedChordRoot: newDc.root, selectedChordKey: newDc.chordKey, viewMode: 'chords' })
                      }
                    }
                  }
                }}>
                {row.label}
              </button>
            )
          })}
        </div>
        <div className="chord-grid chord-grid-main">
          {(harmonyGrid[chordTier]?.chords || []).map((dc, i) => {
            if (!dc) return <div key={i} className="chord-btn empty" />
            const isActive = state.selectedChordKey === dc.chordKey && state.selectedChordRoot === dc.root
            return (
              <button key={i}
                className={`chord-btn ${isActive ? 'active' : ''}`}
                onClick={() => handleChordClick(dc)}
              >
                <span className="chord-roman">{dc.romanNumeral}</span>
                <span className="chord-name">{dc.fullName}</span>
                <button className="chord-play" onClick={e => { e.stopPropagation(); handlePlayChord(dc) }}>&#9654;</button>
              </button>
            )
          })}
        </div>

        {/* Title + formula */}
        <div className="study-head">
          <span className="study-title">{activeLabel}</span>
          <span className="study-formula">
            {state.activeTab === 'technique' ? (() => {
              if (state.techniqueMode === '3nps') return `3NPS Pattern ${state.selectedPattern + 1} · ${formulaStr}`
              const dc = diatonicChords[state.selectedPattern]?.[0]
              return dc ? `${dc.fullName} ${state.techniqueMode === 'tapping' ? 'Tapping' : 'Sweep'} Arpeggio` : formulaStr
            })() : chordFormula ? `${chordFormula}  ·  ${formulaStr}` : formulaStr}
          </span>
        </div>

        {/* Note legend */}
        <div className="note-legend">
          {activeIntervals.map(i => {
            const semis = i % 12
            const ivName = intervalName(semis)
            const degree = (rootIdx + semis) % 12
            const note = noteName(degree, flats)
            const color = state.intervalColors[ivName] || '#888'
            const isChordTone = chordToneNotes?.has(degree) || false
            return (
              <div key={`${semis}-${i}`} className={`legend-chip ${isChordTone ? 'chord-tone' : ''}`}>
                <span className="legend-circle" style={{ background: color }}>
                  <span className="legend-iv">{ivName}</span>
                </span>
                <span className="legend-note">{note}</span>
              </div>
            )
          })}
        </div>

        {/* Display mode toggle — note names / intervals / both */}
        <div className="display-mode-bar">
          <button
            className={`display-mode-btn ${state.showNoteNames && !state.showIntervals ? 'active' : ''}`}
            onClick={() => up({ showNoteNames: true, showIntervals: false })}
          >Notes</button>
          <button
            className={`display-mode-btn ${!state.showNoteNames && state.showIntervals ? 'active' : ''}`}
            onClick={() => up({ showNoteNames: false, showIntervals: true })}
          >Intervals</button>
          <button
            className={`display-mode-btn ${state.showNoteNames && state.showIntervals ? 'active' : ''}`}
            onClick={() => up({ showNoteNames: true, showIntervals: true })}
          >Both</button>
        </div>

        {/* Fret window — zoom into a fret range so high frets aren't cramped */}
        {(() => {
          const [lo, hi] = state.fretRange ?? [0, state.numFrets]
          const MAX_FRET = 24
          return (
            <div className="fret-range-bar">
              <span className="fret-range-label">Frets</span>
              <select className="fret-range-select" value={lo}
                onChange={e => {
                  const newLo = Number(e.target.value)
                  up({ fretRange: [newLo, Math.max(hi, newLo + 1)] })
                }}>
                {[...Array(MAX_FRET)].map((_, f) => <option key={f} value={f}>{f}</option>)}
              </select>
              <span className="fret-range-dash">–</span>
              <select className="fret-range-select" value={Math.min(hi, MAX_FRET)}
                onChange={e => {
                  const newHi = Number(e.target.value)
                  up({ fretRange: [Math.min(lo, newHi - 1), newHi], numFrets: Math.max(state.numFrets, newHi) })
                }}>
                {[...Array(MAX_FRET + 1)].map((_, f) => f).filter(f => f > lo).map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              {state.fretRange && (
                <button className="fret-range-reset" title="Show whole neck"
                  onClick={() => up({ fretRange: null })}>&#10005;</button>
              )}
            </div>
          )
        })()}

        {/* Fretboard */}
        <Fretboard
          board={board}
          displayMode={displayMode}
          inlayStyle={state.inlayStyle}
          intervalColors={state.intervalColors}
          highlightRoot={state.highlightRoot}
          showLeftHanded={state.showLeftHanded}
          posRange={activePosRange}
          numFrets={state.numFrets}
          fretRange={state.fretRange}
          tuningLabels={tuning.labels}
          chordToneNotes={state.viewMode === 'chords' && state.activeTab !== 'technique' ? chordToneNotes : null}
          chordRootIndex={state.viewMode === 'chords' && state.activeTab !== 'technique' ? chordRootIndex : null}
          highlightedPositions={state.activeTab === 'technique' ? highlightedPosSet : null}
          nextChordToneNotes={nextChordInfo?.notes || null}
          guitarModel={state.guitarModel}
          zoomToPosition={state.zoomToPosition && state.scalePosition !== null}
          heardMidi={listening ? heardMidi : null}
        />


        {/* Position bar + More toggle */}
        <div className="bottom-strip">
          <div className="position-bar">
            <button className={`pos-btn ${state.scalePosition === null ? 'active' : ''}`}
              onClick={() => up({ scalePosition: null })}>All</button>
            {scalePositions.map((_, i) => (
              <button key={i}
                className={`pos-btn ${state.scalePosition === i + 1 ? 'active' : ''}`}
                onClick={() => up({ scalePosition: i + 1 })}>{i + 1}</button>
            ))}
            {state.scalePosition !== null && (
              <button
                className={`pos-btn zoom-btn ${state.zoomToPosition ? 'active' : ''}`}
                onClick={() => up({ zoomToPosition: !state.zoomToPosition })}
                title="Zoom to position"
              >{state.zoomToPosition ? '\u2715' : '\u26F6'}</button>
            )}
          </div>
          <button className="advanced-toggle" onClick={() => up({ advancedMode: !state.advancedMode })}>
            <span className={`advanced-arrow ${state.advancedMode ? 'open' : ''}`}>&#9656;</span>
            More
          </button>
        </div>

        {/* ─── The theory layer: why what you're looking at actually works ───
            It sits BELOW the neck on purpose. The neck is what you look at while
            your hands are busy; this is what you read once. Above the neck it
            pushed the fretboard clean off a laptop screen. */}
        {state.showTheory && insight && (
          <div className="theory-card">
            <div className="theory-eyebrow">
              <span>{insight.eyebrow}</span>
              {insight.focus && <span>{'·'} the {insight.focus}</span>}
              <button className="theory-toggle" onClick={() => up({ showTheory: false })}>hide</button>
            </div>
            <div className="theory-title">{insight.title}</div>
            {/* In the context of the tonic you're actually on — not in the abstract */}
            {state.viewMode !== 'chords' && keyContrast && (
              <p className="theory-context">{keyContrast.sentence}</p>
            )}
            <p className="theory-body">
              {insight.body}
              {state.viewMode !== 'chords' && playableChords > 0 && (
                <>{' '}There are <b>{playableChords}</b> chords that fit entirely inside this scale.
                Every one of them is a place you can land.</>
              )}
            </p>
          </div>
        )}
        {!state.showTheory && (
          <button className="theory-toggle" style={{ margin: '0 auto' }}
            onClick={() => up({ showTheory: true })}>
            + show the theory
          </button>
        )}

        {/* Expanded sections */}
        {state.advancedMode && (
          <div className="advanced-panel">
            <CollapsibleSection title="PRACTICE" variant="panel">
              <div className="progression-header">
                <div className="progression-bpm">
                  <button className="progression-bpm-btn" onClick={() => up({ progressionBpm: Math.max(40, state.progressionBpm - 5) })}>-</button>
                  <span className="progression-bpm-val">{state.progressionBpm} BPM</span>
                  <button className="progression-bpm-btn" onClick={() => up({ progressionBpm: Math.min(200, state.progressionBpm + 5) })}>+</button>
                </div>
                <div className="progression-bars-row">
                  <span className="progression-bars-label">Bars/chord</span>
                  {[1, 2, 4].map(n => (
                    <button key={n} className={`progression-bars-btn ${state.progressionBarsPerChord === n ? 'active' : ''}`}
                      onClick={() => up({ progressionBarsPerChord: n })}>{n}</button>
                  ))}
                </div>
                <button className={`progression-metro-btn ${metronomeOn ? 'active' : ''}`}
                  onClick={toggleMetronome} title="Metronome">
                  {metronomeOn ? '\uD83D\uDD14' : '\uD83D\uDD15'}</button>
                <button className={`progression-play-btn ${state.progressionPlaying ? 'playing' : ''}`}
                  onClick={() => state.progressionPlaying ? stopProgression() : startProgression()}>
                  {state.progressionPlaying ? '\u25A0 Stop' : '\u25B6 Play'}</button>
              </div>
              <div className="progression-degrees">
                {primaryChords.map((dc, i) => {
                  const isCurrent = state.progressionPlaying && state.progression[state.progressionIndex] === i
                  return (
                    <button key={i}
                      className={`progression-deg ${isCurrent ? 'current' : ''} ${state.progression.includes(i) ? 'in-prog' : ''}`}
                      onClick={() => addDegreeToProgression(i)}
                      title={`${dc.fullName} \u2014 click to add`}>
                      <span className="progression-deg-roman">{dc.romanNumeral}</span>
                      <span className="progression-deg-name">{dc.fullName}</span>
                    </button>
                  )
                })}
              </div>
              {state.progression.length > 0 && (
                <div className="progression-sequence">
                  {state.progression.map((deg, i) => {
                    const dc = primaryChords[deg]
                    const isCurrent = state.progressionPlaying && state.progressionIndex === i
                    const isNext = state.progressionPlaying && ((state.progressionIndex + 1) % state.progression.length) === i
                    return (
                      <span key={i}
                        className={`progression-step ${isCurrent ? 'current' : ''} ${isNext ? 'next' : ''}`}
                        onClick={() => removeFromProgression(i)} title="Click to remove">
                        {dc?.fullName || '?'}
                        {i < state.progression.length - 1 && <span className="progression-arrow"> {'\u2192'} </span>}
                      </span>
                    )
                  })}
                  <button className="progression-clear-btn" onClick={() => up({ progression: [] })}>Clear</button>
                </div>
              )}
            </CollapsibleSection>

            <CollapsibleSection title="TECHNIQUE" variant="panel">
              <div className="technique-controls">
                <div className="technique-mode-toggle">
                  <button className={`technique-mode-btn ${state.techniqueMode === '3nps' && state.activeTab === 'technique' ? 'active' : ''}`}
                    onClick={() => up({ techniqueMode: '3nps', selectedPattern: 0, activeTab: 'technique' })}>3NPS</button>
                  <button className={`technique-mode-btn ${state.techniqueMode === 'arpeggios' && state.activeTab === 'technique' ? 'active' : ''}`}
                    onClick={() => up({ techniqueMode: 'arpeggios', selectedPattern: 0, activeTab: 'technique' })}>Sweep</button>
                  <button className={`technique-mode-btn ${state.techniqueMode === 'tapping' && state.activeTab === 'technique' ? 'active' : ''}`}
                    onClick={() => up({ techniqueMode: 'tapping', selectedPattern: 0, activeTab: 'technique' })}>Tapping</button>
                  {state.activeTab === 'technique' && (
                    <button className="technique-mode-btn deactivate" onClick={() => up({ activeTab: 'explore' })}>{'\u2715'} Off</button>
                  )}
                </div>
                {state.activeTab === 'technique' && (
                  <div className="technique-pattern-bar">
                    <span className="technique-pattern-label">{state.techniqueMode === '3nps' ? 'Pattern' : 'Degree'}</span>
                    {[...Array(numPatterns)].map((_, i) => {
                      const dc = diatonicChords[i]?.[0]
                      const label = state.techniqueMode === '3nps' ? `${i + 1}` : dc ? dc.romanNumeral : `${i + 1}`
                      return (
                        <button key={i} className={`technique-pat-btn ${state.selectedPattern === i ? 'active' : ''}`}
                          onClick={() => up({ selectedPattern: i })}
                          title={state.techniqueMode !== '3nps' && dc ? dc.fullName : `Pattern ${i + 1}`}>{label}</button>
                      )
                    })}
                  </div>
                )}
              </div>
            </CollapsibleSection>

            <CollapsibleSection title={`HARMONY MAP \u2014 ${state.keyRoot} ${keyScale?.name || ''}`} variant="panel">
              <div className="harmony-grid-wrap">
                <div className="harmony-grid" style={{ gridTemplateColumns: `52px repeat(${degreeHeaders.length}, 1fr)` }}>
                  <div className="harmony-corner" />
                  {degreeHeaders.map((dh, i) => (
                    <div key={i} className="harmony-deg-header">
                      <span className="harmony-deg-roman">{dh.roman}</span>
                      <span className="harmony-deg-note">{dh.note}</span>
                    </div>
                  ))}
                  {harmonyGrid.map((row, ri) => {
                    const hasAny = row.chords.some(c => c !== null)
                    if (!hasAny) return null
                    return (
                      <Fragment key={ri}>
                        <div className="harmony-row-label">{row.label}</div>
                        {row.chords.map((dc, ci) => {
                          const isActive = dc && state.selectedChordKey === dc.chordKey && state.selectedChordRoot === dc.root
                          return (
                            <div key={ci}
                              className={`harmony-cell ${dc ? 'has-chord' : 'empty'} ${isActive ? 'active' : ''}`}
                              onClick={() => dc && handleChordClick(dc)}
                              title={dc ? `${dc.fullName} \u2014 click to show` : ''}>
                              {dc ? (
                                <>
                                  <span className="harmony-cell-name">{dc.fullName}</span>
                                  <button className="harmony-cell-play"
                                    onClick={e => { e.stopPropagation(); handlePlayChord(dc) }}>&#9654;</button>
                                </>
                              ) : null}
                            </div>
                          )
                        })}
                      </Fragment>
                    )
                  })}
                </div>
              </div>
            </CollapsibleSection>
          </div>
        )}

      </main>
      )}

      {/* Settings Drawer */}
      <div className={`settings-drawer ${settingsOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <span className="drawer-title">Settings</span>
          <button className="drawer-close" onClick={() => setSettingsOpen(false)}>&times;</button>
        </div>
        <div className="drawer-body">
          <div className="drawer-section">
            <span className="drawer-label">THEME</span>
            <select className="type-select" value={state.colorTheme}
              onChange={e => up({ colorTheme: e.target.value as AppState['colorTheme'] })}>
              {THEME_OPTIONS.map(t => (
                <option key={t.key} value={t.key}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="drawer-section">
            <div className="drawer-row">
              <div className="drawer-half">
                <span className="drawer-label">GUITAR</span>
                <select className="type-select" value={state.guitarModel}
                  onChange={e => up({ guitarModel: e.target.value as AppState['guitarModel'] })}>
                  <option value="strat">Strat (25.5")</option>
                  <option value="lespaul">Les Paul (24.75")</option>
                </select>
              </div>
              <div className="drawer-half">
                <span className="drawer-label">TUNING</span>
                <select className="type-select" value={state.tuningKey}
                  onChange={e => up({ tuningKey: e.target.value })}>
                  {Object.entries(TUNINGS).map(([key, t]) => (
                    <option key={key} value={key}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="drawer-section">
            <div className="drawer-row">
              <div className="drawer-half">
                <span className="drawer-label">FRETS</span>
                <select className="type-select" value={state.numFrets}
                  onChange={e => up({ numFrets: Number(e.target.value) })}>
                  {[12, 15, 17, 19, 21, 24].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="drawer-half">
                <span className="drawer-label">INLAYS</span>
                <select className="type-select" value={state.inlayStyle}
                  onChange={e => up({ inlayStyle: e.target.value as any })}>
                  <option value="dots">Dots</option>
                  <option value="blocks">Blocks</option>
                  <option value="none">None</option>
                </select>
              </div>
            </div>
          </div>

          <div className="drawer-section">
            <span className="drawer-label">DISPLAY</span>
            <ToggleSwitch label="Note Names" on={state.showNoteNames} toggle={() => up({ showNoteNames: !state.showNoteNames })} />
            <ToggleSwitch label="Intervals" on={state.showIntervals} toggle={() => up({ showIntervals: !state.showIntervals })} />
            <ToggleSwitch label="Highlight Root" on={state.highlightRoot} toggle={() => up({ highlightRoot: !state.highlightRoot })} />
            <ToggleSwitch label="Left-Handed" on={state.showLeftHanded} toggle={() => up({ showLeftHanded: !state.showLeftHanded })} />
          </div>

          <div className="drawer-section">
            <span className="drawer-label">DRONE</span>
            <DrawerSlider
              label="Volume" value={state.droneVolume} max={1.5}
              onChange={v => up({ droneVolume: v })}
            />
            <DrawerSlider
              label="Spread" value={state.droneSpread} max={1.5}
              onChange={v => up({ droneSpread: v })}
            />
            <DrawerSlider
              label="Tone" value={state.droneTone} max={1}
              onChange={v => up({ droneTone: v })}
            />
          </div>

          <CollapsibleSection title="COLORS">
            <div className="drawer-section">
              <div className="color-header">
                <button className="reset-btn" onClick={() => up({ intervalColors: { ...DEFAULT_INTERVAL_COLORS } })}>&#8634; Reset</button>
              </div>
              <div className="color-grid">
                {ALL_INTERVALS.map(iv => (
                  <label key={iv} className="color-swatch" title={iv}>
                    <input type="color" value={state.intervalColors[iv] || '#888'}
                      onChange={e => up({ intervalColors: { ...state.intervalColors, [iv]: e.target.value } })} />
                    <span className="swatch-fill" style={{ background: state.intervalColors[iv] || '#888' }} />
                  </label>
                ))}
              </div>
            </div>
          </CollapsibleSection>
        </div>
      </div>
      <div
        className={`drawer-overlay ${settingsOpen ? 'open' : ''}`}
        onClick={() => setSettingsOpen(false)}
      />
    </div>
  )
}

function ToggleSwitch({ label, on, toggle }: { label: string; on: boolean; toggle: () => void }) {
  return (
    <div className="switch-row" onClick={toggle}>
      <span>{label}</span>
      <div className={`switch-track ${on ? 'on' : ''}`}>
        <div className="switch-thumb" />
      </div>
    </div>
  )
}

function DrawerSlider({ label, value, max, onChange }: {
  label: string; value: number; max: number; onChange: (v: number) => void
}) {
  return (
    <div className="slider-row">
      <span className="slider-row-label">{label}</span>
      <input
        className="slider"
        type="range"
        min={0}
        max={max}
        step={0.01}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
      />
      <span className="slider-row-value">{Math.round((value / max) * 100)}%</span>
    </div>
  )
}

function CollapsibleSection({ title, children, variant = 'default' }: {
  title: string; children: React.ReactNode; variant?: 'default' | 'panel'
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`collapsible ${open ? 'open' : ''} collapsible-${variant}`}>
      <button className="collapsible-header" onClick={() => setOpen(!open)}>
        <span className="collapsible-arrow">{open ? '\u25BE' : '\u25B8'}</span>
        <span className="collapsible-title">{title}</span>
      </button>
      <div className="collapsible-body">
        <div className="collapsible-inner">
          {children}
        </div>
      </div>
    </div>
  )
}
