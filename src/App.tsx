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
import { playChordPad, stopChordPad, chordToMidi, startMetronome, stopMetronome, startDrone, stopDrone } from './utils/audioEngine'
import { CONCEPTS, getNextConcept, markSeen, type Concept } from './utils/concepts'
import { startMic, stopMic, readPitch, recalibrateMic } from './utils/micInput'
import { intervalSemitones } from './utils/musicTheory'
import { getScaleInsight, getChordInsight, chordsInScale, getObjective, PRIMER } from './utils/theory'
import { loadSeen } from './utils/concepts'

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
  const [state, setState] = useState<AppState>(initialState)
  const up = useCallback((p: Partial<AppState>) => setState(s => ({ ...s, ...p })), [])
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
  const [heardMidi, setHeardMidi] = useState<number | null>(null)
  const [focusFound, setFocusFound] = useState(false)
  const [justLanded, setJustLanded] = useState(false)
  const [soundsOwned, setSoundsOwned] = useState(() => loadSeen().length)

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

  const toggleDrone = useCallback(() => setDroneOn(d => !d), [])

  useEffect(() => {
    if (droneOn) {
      startDrone(noteIndex(droneTuning.root), SCALES[droneTuning.scaleKey]?.intervals || [])
    } else {
      stopDrone()
    }
  }, [droneOn, droneTuning])

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
    setDroneOn(true) // the effect above starts/retunes the drone in the new key
  }, [up])

  const startSession = useCallback(() => applyConcept(getNextConcept(null)), [applyConcept])
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

  // ─── Listening: live pitch feedback ───
  // The mic hears you (guitar, whistle, hum — anything pitched) and the neck
  // answers. Confirmation, not judgment: no scores, no misses.
  const toggleListen = useCallback(async () => {
    if (listening) {
      stopMic()
      setListening(false)
      setHeardMidi(null)
    } else {
      const ok = await startMic()
      setListening(ok) // permission denied → button simply stays off
    }
  }, [listening])

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
  useEffect(() => {
    if (!hearingFocus || focusFound) return
    setFocusFound(true)
    setJustLanded(true)
    setSoundsOwned(n => n + 1)
    const t = setTimeout(() => setJustLanded(false), 900)
    return () => clearTimeout(t)
  }, [hearingFocus, focusFound])

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
            <p className="intro-eyebrow">Fretboard Mapper</p>
            <h1 className="intro-title">See the neck. <em>Then hear it.</em></h1>
            <p className="intro-sub">
              Two ways in. Study the fretboard in as much depth as you want, or drop
              straight into a session and play. Switch between them any time.
            </p>
            <div className="intro-modes">
              <button className="intro-mode" onClick={() => up({ onboarded: true, appMode: 'study' })}>
                <span className="intro-mode-name">Study the neck</span>
                <span className="intro-mode-desc">
                  Any key, any scale, chords laid over scales, arpeggios and positions —
                  the whole fretboard at once, with the theory that explains it.
                </span>
              </button>
              <button className="intro-mode" onClick={() => { up({ onboarded: true }); startSession() }}>
                <span className="intro-mode-name">Start a session</span>
                <span className="intro-mode-desc">
                  One idea. The shape already on the neck, a drone already in key.
                  It listens while you play and tells you when you land it.
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
          <span className="shell-logo">FM</span>
          <span className="shell-name">Fretboard Mapper</span>
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

          <div className={`flow-owned ${justLanded ? 'gained' : ''}`}>
            <span className="flow-owned-n">{soundsOwned}</span>
            <span>sounds you own</span>
          </div>

          <header className="flow-idea">
            <p className="flow-key">
              <span>{soundName}</span>
              <button className="flow-help" onClick={() => setPrimerOpen(o => !o)}>
                {primerOpen ? 'close' : 'what is this?'}
              </button>
            </p>

            {/* THE OBJECTIVE — plain English, before any jargon. */}
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
          </header>

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
              posRange={activePosRange}
              numFrets={state.numFrets}
              fretRange={state.fretRange}
              tuningLabels={tuning.labels}
              highlightedPositions={state.activeTab === 'technique' ? highlightedPosSet : null}
              guitarModel={state.guitarModel}
              zoomToPosition={state.scalePosition !== null}
              heardMidi={listening ? heardMidi : null}
              /* ALWAYS pass the focus. If a concept also has a shape, the shape
                 is drawn as outlines on top — so the neck can never contradict
                 "find the glowing ones". */
              focusInterval={currentConcept.focus}
            />
          </div>

          <div className="flow-legend">
            <span><i className="flow-sw target" /> find these ({focusNoteName})</span>
            <span><i className="flow-sw root" /> home ({currentConcept.root})</span>
            <span><i className="flow-sw scale" /> safe to play</span>
            {currentConcept.technique && (
              <span><i className="flow-sw shape" /> the shape to sweep</span>
            )}
            <span><i className="flow-sw heard" /> what it hears you play</span>
          </div>

          <footer className="flow-controls">
            <button className={`flow-ctl primary ${focusFound ? 'beckon' : ''}`} onClick={nextConcept}>
              {focusFound ? 'Next sound' : 'Next idea'} {'→'}
            </button>
            <button className="flow-ctl" onClick={shiftPosition}>Shift position</button>
            <button className={`flow-ctl ${droneOn ? 'on' : ''}`} onClick={toggleDrone}>
              <span className="flow-pip" />{droneOn ? 'Drone on' : 'Drone'}
            </button>
            <button
              className={`flow-ctl ${listening ? 'on' : ''}`}
              onClick={toggleListen}
              title="Hear yourself on the neck — guitar, whistle, hum. Headphones recommended while the drone plays."
            >
              <span className="flow-pip" />{listening ? 'Listening' : 'Listen'}
            </button>
            {listening && (
              <span className={`flow-readout ${hearingFocus ? 'hit' : ''}`}>
                {heardMidi !== null
                  ? <>{noteName(heardMidi % 12, flats)}<sub>{Math.floor(heardMidi / 12) - 1}</sub></>
                  : '···'}
              </span>
            )}
          </footer>

          {!listening && (
            <p className="flow-coach">
              <span className="flow-pip" />
              Turn on <b>&nbsp;Listen&nbsp;</b> and play anything — a note, a whistle, a hum.
              The neck shows you what it heard.
            </p>
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
            className={`drone-btn ${droneOn ? 'active' : ''}`}
            onClick={toggleDrone}
            title="Evolving ambient drone in the current key — improvise over it"
          >
            <span className="drone-dot" />Drone
          </button>
          <button
            className={`drone-btn ${listening ? 'active' : ''}`}
            onClick={toggleListen}
            title="Hear yourself on the neck — guitar, whistle, hum"
          >
            <span className="drone-dot" />{listening ? 'Listening' : 'Listen'}
          </button>
          {listening && (
            <span className="heard-readout">
              {heardMidi !== null
                ? <>{noteName(heardMidi % 12, flats)}<sub>{Math.floor(heardMidi / 12) - 1}</sub></>
                : '···'}
            </span>
          )}
        </div>

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

        {/* ─── The theory layer: why what you're looking at actually works ─── */}
        {state.showTheory && insight && (
          <div className="theory-card">
            <div className="theory-eyebrow">
              <span>{insight.eyebrow}</span>
              {insight.focus && <span>{'·'} the {insight.focus}</span>}
              <button className="theory-toggle" onClick={() => up({ showTheory: false })}>hide</button>
            </div>
            <div className="theory-title">{insight.title}</div>
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
