import { useState, useMemo, useCallback, useEffect, useRef, Fragment } from 'react'
import type { AppState } from './types/music'
import {
  SCALES, CHORDS, TUNINGS,
  getScaleNotes, getChordNotes, computeFretboard,
  noteIndex, noteName, useFlats, intervalName,
  getDiatonicChords, getCompatibleScales, getRelatedModes,
  compute3NPSPattern, computeSweepShape, computeTappingPattern,
  getScalePositions, getChordVoicings, chordIntervalsForScale,
} from './utils/musicTheory'
import type { DiatonicChord, FretPosition } from './utils/musicTheory'
import { DEFAULT_INTERVAL_COLORS, ALL_INTERVALS } from './utils/defaultColors'
import Fretboard from './components/Fretboard'
import { playChordPad, stopChordPad, chordToMidi, startMetronome, stopMetronome, startDrone, stopDrone, startArpeggio, stopArpeggio, setArpBpm, setDroneVolume, setDroneSpread, setDroneTone, setPadVolume, setPadSpread, setPadTone } from './utils/audioEngine'
import { CONCEPTS, getNextConcept, markSeen, loadOwned, markOwned, type Concept } from './utils/concepts'
import { startMic, stopMic, readPitch, recalibrateMic, getMicError, getLastRms, getRmsGate, isMicRunning } from './utils/micInput'
import { intervalSemitones } from './utils/musicTheory'
import { getScaleInsight, getChordInsight, chordsInScale, getObjective, PRIMER } from './utils/theory'
import { getSameNoteModes, recontextualise, type SiblingMode } from './utils/modes'
import { loadPersistedState, savePersistedState } from './utils/persist'
import { nextFlowHome, describeFlowShift, describeFlowSession } from './utils/flowEngine'
import FlowCanvas, { type FlowPulse } from './components/FlowCanvas'
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

// Scale ceiling for the mic level meter — chosen so a loudly-picked bass
// string fills most of the bar without a quiet treble note being invisible.
const METER_MAX = 0.12

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

// The three things Play can trigger underneath a mode — a held pedal tone,
// the mode's own parent chord held together, or that chord arpeggiated in
// tempo. Kept as one list so a future 4th option is a one-line add.
const BACKING_MODES: { key: AppState['backingMode']; label: string; title: string }[] = [
  { key: 'drone', label: 'Drone', title: 'A single sustained pedal tone' },
  { key: 'chord', label: 'Chord', title: "The chord this mode actually lives against" },
  { key: 'arp',   label: 'Arp',   title: 'That chord, arpeggiated and locked to tempo' },
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
  keyRoot: 'C',
  keyQuality: 'ionian',
  viewMode: 'scales',
  selectedChordRoot: null,
  selectedChordKey: null,
  selectedScaleRoot: 'C',
  selectedScaleKey: 'ionian',
  tuningKey: 'standard',
  inlayStyle: 'dots',
  showNoteNames: true,
  showIntervals: true,
  highlightRoot: true,
  showLeftHanded: false,
  scalePosition: null,
  chordPosition: null,
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
  padVolume: 1,
  padSpread: 1,
  padTone: 0.5,
  backingMode: 'drone',
  flowJam: 'modes',
  flowEvolve: 'diatonic',
  flowChords: [0, 3, 4],
  flowPaceSec: 120,
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

  // Chord voicings: the SAME chord as a handful of real, playable grips up
  // the neck — one fret per string, root in the bass — NOT a fret window
  // with chord tones scattered inside it. "All" leaves the chord-over-scale
  // view exactly as it was; picking a number isolates one grip.
  const chordVoicings = useMemo(() => {
    if (state.viewMode !== 'chords' || !state.selectedChordRoot || !state.selectedChordKey) return []
    const chord = CHORDS[state.selectedChordKey]
    if (!chord) return []
    return getChordVoicings(state.selectedChordRoot, chord, tuning, state.numFrets)
  }, [state.viewMode, state.selectedChordRoot, state.selectedChordKey, tuning, state.numFrets])

  const isChordShapeMode = state.viewMode === 'chords' && chordVoicings.length > 0

  // The selected grip, as the "string-fret" keys the technique overlay
  // already knows how to render (bright grip, everything else recedes).
  const chordShapeSet = useMemo(() => {
    if (!isChordShapeMode || state.chordPosition === null) return null
    const v = chordVoicings[Math.min(state.chordPosition - 1, chordVoicings.length - 1)]
    if (!v) return null
    const set = new Set<string>()
    v.frets.forEach((f, si) => { if (f !== null) set.add(`${si}-${f}`) })
    return set
  }, [isChordShapeMode, state.chordPosition, chordVoicings])

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

  // Quick look — the glossary path: grab any scale or chord by root without
  // touching the key. The key path (middle of the bar) is the deep dive.
  const [quickType, setQuickType] = useState<'scale' | 'chord'>('scale')

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
      up({ selectedChordRoot: null, selectedChordKey: null, viewMode: 'scales', chordPosition: null })
      stopChordPad()
      return
    }
    // A new chord's shapes start at "all" — the old chordPosition index
    // means nothing for a chord with a different number of tones.
    up({ selectedChordRoot: dc.root, selectedChordKey: dc.chordKey, viewMode: 'chords', activeTab: 'explore', chordPosition: null })
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


  // Volume/spread/tone apply live — the drone doesn't need to restart for
  // these to take effect, and starting fresh also picks up the latest value.
  useEffect(() => { setDroneVolume(state.droneVolume) }, [state.droneVolume])
  useEffect(() => { setDroneSpread(state.droneSpread) }, [state.droneSpread])
  useEffect(() => { setDroneTone(state.droneTone) }, [state.droneTone])
  useEffect(() => { setPadVolume(state.padVolume) }, [state.padVolume])
  useEffect(() => { setPadSpread(state.padSpread) }, [state.padSpread])
  useEffect(() => { setPadTone(state.padTone) }, [state.padTone])

  // ─── Flow mode: the session engine ───
  // concept → shape on the neck → drone in key → hands. One click, zero config.
  const currentConcept = useMemo(
    () => CONCEPTS.find(c => c.id === state.conceptId) || null,
    [state.conceptId]
  )

  // The chord a mode is actually played against — a concept's own hand-picked
  // chordKey when there is one (Flow), otherwise the chord built from
  // whatever scale is currently on the neck (Study, or a concept without one).
  const backingChordIntervals = useMemo(() => {
    const fromConcept = currentConcept?.chordKey ? CHORDS[currentConcept.chordKey] : null
    return fromConcept ? fromConcept.intervals : chordIntervalsForScale(droneTuning.scaleKey)
  }, [currentConcept, droneTuning.scaleKey])
  const backingChordMidi = useMemo(
    () => chordToMidi(noteIndex(droneTuning.root), backingChordIntervals),
    [droneTuning.root, backingChordIntervals]
  )

  useEffect(() => {
    if (!droneOn) {
      stopDrone(); stopChordPad(); stopArpeggio()
      return
    }
    if (state.backingMode === 'chord') {
      stopDrone(); stopArpeggio()
      playChordPad(backingChordMidi, true)
    } else if (state.backingMode === 'arp') {
      stopDrone(); stopChordPad()
      startArpeggio(backingChordMidi, state.progressionBpm)
    } else {
      stopChordPad(); stopArpeggio()
      startDrone(noteIndex(droneTuning.root), SCALES[droneTuning.scaleKey]?.intervals || [])
    }
  }, [droneOn, droneTuning, state.backingMode, backingChordMidi])

  // Tempo changes while the arpeggiator is already running just reschedule
  // its ticks — no need to tear it down and replay from the root.
  useEffect(() => {
    if (droneOn && state.backingMode === 'arp') setArpBpm(state.progressionBpm)
  }, [state.progressionBpm, droneOn, state.backingMode])

  const applyConcept = useCallback((c: Concept) => {
    up({
      appMode: 'learn',
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
  // The walk itself is key-generic (walkPositions derive from state), so
  // Lesson 1 can open it in whatever parent scale the user picked — the
  // concept's hardcoded root is just the default door.
  const startWalk = useCallback((root?: string, quality?: string) => {
    const walk = CONCEPTS.find(c => c.walk)
    if (!walk) return
    applyConcept(walk)
    if (root && quality) {
      up({
        keyRoot: root, keyQuality: quality,
        selectedScaleRoot: root, selectedScaleKey: quality,
      })
    }
  }, [applyConcept, up])
  const nextConcept = useCallback(
    () => applyConcept(getNextConcept(state.conceptId)),
    [applyConcept, state.conceptId]
  )

  // Switching modes never destroys your work — Study keeps whatever's on the
  // neck; Flow picks up (or starts) a session.
  const goStudy = useCallback(() => up({ appMode: 'study' }), [up])
  // Learn opens on the lesson list (conceptId null = the landing), not
  // mid-drill — lessons are something you choose, not something that
  // resumes at you.
  const goLearn = useCallback(() => up({ appMode: 'learn' }), [up])
  // Flow wants a clean full-neck scale — no chord overlays, no position
  // crops, no technique patterns left over from Study.
  const goFlow = useCallback(() => up({
    appMode: 'flow',
    viewMode: 'scales',
    selectedChordRoot: null,
    selectedChordKey: null,
    scalePosition: null,
    chordPosition: null,
    fretRange: null,
    activeTab: 'explore',
  }), [up])

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
  const isPlaying = droneOn || listening || (state.appMode === 'flow' && state.progressionPlaying)
  const [justTapped, setJustTapped] = useState(0)
  const flowChanges = state.appMode === 'flow' && state.flowJam === 'changes'
  const togglePlay = useCallback(async () => {
    setJustTapped(n => n + 1)
    if (isPlaying) {
      if (droneOn) setDroneOn(false)
      if (state.progressionPlaying) stopProgression()
      if (listening) { stopMic(); setListening(false); setHeardMidi(null) }
      if (state.backingMode === 'arp' && metronomeOn) { stopMetronome(); setMetronomeOn(false) }
    } else {
      if (flowChanges) {
        // Playing the changes: the progression stepper IS the backing —
        // chords advance on a bar clock and the neck tracks each one.
        up({ progression: state.flowChords.length ? state.flowChords : [0, 3, 4] })
        startProgression()
      } else {
        setDroneOn(true)
        // Arp is tempo-locked, so Play brings the click in with it.
        if (state.backingMode === 'arp') { startMetronome(state.progressionBpm); setMetronomeOn(true) }
      }
      setMicError(null)
      const ok = await startMic()
      setListening(ok)
      if (!ok) setMicError(getMicError())
    }
  }, [isPlaying, droneOn, listening, state.backingMode, state.progressionBpm, metronomeOn, flowChanges, state.flowChords, state.progressionPlaying, stopProgression, startProgression, up])

  const backingNoun = state.backingMode === 'chord' ? 'the chord' : state.backingMode === 'arp' ? 'the arpeggiator' : 'the drone'

  // ─── Tuner ───
  // The pitch pipe already reports cents-off-nearest-note; the tuner is just
  // that number with a needle. It borrows the mic if Play already has it
  // running, and only stops the mic on close if it was the one that started it.
  const [tunerOpen, setTunerOpen] = useState(false)
  const [tunerPitch, setTunerPitch] = useState<{ midi: number; cents: number } | null>(null)
  const tunerCentsBuf = useRef<number[]>([])
  const tunerLastMidi = useRef<number | null>(null)
  const tunerOwnsMic = useRef(false)

  const openTuner = useCallback(async () => {
    setTunerOpen(true)
    if (!isMicRunning()) {
      setMicError(null)
      const ok = await startMic()
      tunerOwnsMic.current = ok
      if (!ok) setMicError(getMicError())
    }
  }, [])

  const closeTuner = useCallback(() => {
    setTunerOpen(false)
    setTunerPitch(null)
    tunerCentsBuf.current = []
    tunerLastMidi.current = null
    if (tunerOwnsMic.current && !listening) stopMic()
    tunerOwnsMic.current = false
  }, [listening])

  useEffect(() => {
    if (!tunerOpen) return
    const t = setInterval(() => {
      const p = readPitch()
      if (p) {
        // Smooth cents over the last few readings, but never across a note
        // change — averaging E's cents into A's would swing the needle wild.
        if (p.midi !== tunerLastMidi.current) tunerCentsBuf.current = []
        tunerLastMidi.current = p.midi
        const buf = tunerCentsBuf.current
        buf.push(p.cents)
        if (buf.length > 5) buf.shift()
        const cents = buf.reduce((a, b) => a + b, 0) / buf.length
        setTunerPitch({ midi: p.midi, cents })
      } else {
        tunerCentsBuf.current = []
        tunerLastMidi.current = null
        setTunerPitch(cur => (cur === null ? cur : null))
      }
    }, 80)
    return () => clearInterval(t)
  }, [tunerOpen])

  // Drone / Chord / Arp switch, shown right beside Play in both Flow and
  // Study — same markup either place so they can't drift apart.
  const renderBackingControls = (showSwitch = true) => (
    <div className="backing-controls">
      {showSwitch && <div className="backing-switch" role="group" aria-label="Backing sound">
        {BACKING_MODES.map(m => (
          <button
            key={m.key}
            type="button"
            className={`backing-switch-btn ${state.backingMode === m.key ? 'active' : ''}`}
            onClick={() => up({ backingMode: m.key })}
            title={m.title}
          >
            {m.label}
          </button>
        ))}
      </div>}
      <button
        type="button"
        className={`backing-metro-btn ${metronomeOn ? 'active' : ''}`}
        onClick={toggleMetronome}
        title={metronomeOn ? 'Stop the metronome' : 'Start the metronome'}
        aria-label="Metronome"
      >♩</button>
      <button
        type="button"
        className={`backing-metro-btn backing-tuner-btn ${tunerOpen ? 'active' : ''}`}
        onClick={() => (tunerOpen ? closeTuner() : openTuner())}
        title={tunerOpen ? 'Close the tuner' : 'Tune up'}
        aria-label="Tuner"
      >Tune</button>
      {(state.backingMode === 'arp' || metronomeOn) && (
        <div className="backing-bpm">
          <button type="button" className="backing-bpm-btn"
            onClick={() => up({ progressionBpm: Math.max(40, state.progressionBpm - 5) })}>&minus;</button>
          <span className="backing-bpm-val">{state.progressionBpm}</span>
          <button type="button" className="backing-bpm-btn"
            onClick={() => up({ progressionBpm: Math.min(200, state.progressionBpm + 5) })}>+</button>
        </div>
      )}
    </div>
  )

  // BPM changes retime a running click immediately — without this the stepper
  // only applied on the next metronome start.
  useEffect(() => {
    if (metronomeOn) startMetronome(state.progressionBpm)
  }, [state.progressionBpm, metronomeOn])

  // Poll the detector ~20×/s. A note must be heard twice in a row to commit
  // (kills flicker from transients); it lingers ~500ms after you stop (kills
  // strobing between notes, and gives a fast-decaying high string the same
  // satisfying on-screen hang time a sustained bass note gets for free).
  // State only changes when the NOTE changes.
  const lastRawRef = useRef<number | null>(null)
  const emptyCountRef = useRef(0)
  // Live level/gate readout — diagnostic surface for "why isn't it hearing
  // me", updated a lot slower than the poll itself so it doesn't hammer
  // re-renders 20x/sec.
  const [micLevel, setMicLevel] = useState({ rms: 0, gate: 0 })
  const levelTickRef = useRef(0)
  useEffect(() => {
    if (!listening) return
    const timer = setInterval(() => {
      const p = readPitch()
      levelTickRef.current++
      if (levelTickRef.current % 4 === 0) {
        setMicLevel({ rms: getLastRms(), gate: getRmsGate() })
      }
      if (p !== null) {
        emptyCountRef.current = 0
        if (p.midi === lastRawRef.current) {
          setHeardMidi(cur => (cur === p.midi ? cur : p.midi))
        }
        lastRawRef.current = p.midi
      } else {
        lastRawRef.current = null
        emptyCountRef.current++
        if (emptyCountRef.current >= 10) {
          setHeardMidi(cur => (cur === null ? cur : null))
        }
      }
    }, 50)
    return () => clearInterval(timer)
  }, [listening])

  // The soundscape changed — relearn the ambient floor. Delayed so the
  // drone's slow bloom (or fade) has mostly settled before we measure it.
  // This used to only fire on droneOn/listening, so turning the Volume
  // slider up (or switching Drone/Chord/Arp, which changes the bleed's
  // character entirely) left the gate calibrated against a quieter sound
  // than what's now actually coming out of the speakers — the backing
  // sound would win over real playing and "hear" itself instead of you.
  useEffect(() => {
    if (!listening) return
    const t = setTimeout(() => recalibrateMic(), 3000)
    return () => clearTimeout(t)
  }, [droneOn, listening, state.backingMode, state.droneVolume, state.padVolume, backingChordMidi])

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

  const selectSibling = useCallback((s: SiblingMode) => {
    if (s.isCurrent) return
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

  // ─── Flow: the endless jam ───
  // Play is the last decision. The backing evolves underneath the player via
  // selectSibling — every destination is a same-notes sibling mode, so hands
  // never have to move; only the gravity does. No tasks, no fail state.
  // Lesson 1's key picker — local until Start is pressed, so browsing the
  // lesson list never mutates what Study has on the neck.
  const [lessonKey, setLessonKey] = useState({ root: 'C', quality: 'ionian' })
  const lessonOwnedIds = useMemo(
    () => (state.appMode === 'learn' && !state.conceptId ? loadOwned() : []),
    [state.appMode, state.conceptId, soundsOwned]
  )

  const [flowWhisper, setFlowWhisper] = useState<string | null>(null)
  const [flowPulse, setFlowPulse] = useState<FlowPulse | null>(null)
  const [flowWave, setFlowWave] = useState(0)
  const [flowSummary, setFlowSummary] = useState<string | null>(null)
  const flowStepRef = useRef(0)
  const flowStartRef = useRef<number | null>(null)
  const flowNotesRef = useRef(0)
  const flowHomesRef = useRef<Set<string>>(new Set())
  const flowPulseIdRef = useRef(0)

  // The slow drift. Re-creating the interval after every shift (sameNoteModes
  // changes) conveniently restarts the countdown, keeping the pacing even.
  useEffect(() => {
    if (state.appMode !== 'flow' || state.flowJam !== 'modes' || !droneOn || state.flowEvolve === 'static') return
    const t = setInterval(() => {
      flowStepRef.current += 1
      const to = nextFlowHome(state.flowEvolve, flowStepRef.current, sameNoteModes, state.flowChords)
      if (!to) return
      selectSibling(to)
      setFlowWhisper(describeFlowShift(to))
      setFlowWave(w => w + 1)
      flowHomesRef.current.add(to.root)
    }, state.flowPaceSec * 1000)
    return () => clearInterval(t)
  }, [state.appMode, state.flowJam, droneOn, state.flowEvolve, state.flowPaceSec, state.flowChords, sameNoteModes, selectSibling])

  // Session bookkeeping: counters reset on Play, summary written on Stop.
  // The drift is ambience, not a decision — when the session stops, home
  // goes back to the key the player actually chose, so Study (and the next
  // load, via persistence) never inherits whatever mode the timer wandered
  // into mid-jam.
  const flowSoundOn = droneOn || state.progressionPlaying
  const flowStartKeyRef = useRef<{ root: string; quality: string } | null>(null)
  useEffect(() => {
    if (state.appMode !== 'flow') return
    if (flowSoundOn) {
      flowStartRef.current = Date.now()
      flowNotesRef.current = 0
      flowStepRef.current = 0
      flowHomesRef.current = new Set([state.keyRoot])
      flowStartKeyRef.current = { root: state.keyRoot, quality: state.keyQuality }
      setFlowSummary(null)
      setFlowWhisper(null)
    } else if (flowStartRef.current !== null) {
      const minutes = (Date.now() - flowStartRef.current) / 60000
      flowStartRef.current = null
      const startKey = flowStartKeyRef.current
      if (startKey && (startKey.root !== state.keyRoot || startKey.quality !== state.keyQuality)) {
        up({
          keyRoot: startKey.root, keyQuality: startKey.quality,
          selectedScaleRoot: startKey.root, selectedScaleKey: startKey.quality,
        })
      }
      setFlowSummary(describeFlowSession({
        minutes,
        notesHeard: flowNotesRef.current,
        homesVisited: flowHomesRef.current.size,
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flowSoundOn, state.appMode])

  // Every committed heard note feeds the canvas — its interval color, and
  // whether it landed home (the firework). heardMidi only changes when the
  // committed note changes, so this fires once per note, not per poll.
  useEffect(() => {
    if (state.appMode !== 'flow' || heardMidi === null) return
    flowNotesRef.current += 1
    const homePc = state.flowJam === 'changes' && state.selectedChordRoot
      ? noteIndex(state.selectedChordRoot)
      : noteIndex(state.selectedScaleRoot || state.keyRoot)
    const iv = intervalName(((heardMidi % 12) - homePc + 12) % 12)
    setFlowPulse({
      id: ++flowPulseIdRef.current,
      color: state.intervalColors[iv] || '#9846EA',
      home: iv === 'R',
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heardMidi])

  // Whisper lines dissolve on their own — nothing in Flow asks to be read.
  useEffect(() => {
    if (!flowWhisper) return
    const t = setTimeout(() => setFlowWhisper(null), 6000)
    return () => clearTimeout(t)
  }, [flowWhisper])

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

  const isLearn = state.appMode === 'learn'
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
      {!isLearn && !isFlow && (
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
                <span className="intro-mode-name">Modes</span>
                <span className="intro-mode-desc">
                  Any key, any mode. Chords laid over scales, arpeggios, positions, the whole
                  fretboard at once — and the theory that accounts for what you're looking at,
                  written for someone who wants to understand it rather than recite it.
                </span>
              </button>
              <button className="intro-mode" onClick={() => { up({ onboarded: true }); goFlow() }}>
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
          <img className="shell-logo" src="/mark.png" alt="Modal Runs" width={44} height={44} />
          <span className="shell-name">modalruns</span>
        </div>

        <div className="mode-switch">
          {/* The internal appMode values keep their old names (study/learn/
              flow) — these labels are product-facing and cheap to re-cut. */}
          <button className={`mode-btn tab-modes ${!isLearn && !isFlow ? 'active' : ''}`} onClick={goStudy}>
            Modes
          </button>
          <button className={`mode-btn tab-explore ${isLearn ? 'active' : ''}`} onClick={goLearn}>
            Explore
          </button>
          <button className={`mode-btn tab-flow ${isFlow ? 'active' : ''}`} onClick={goFlow}>
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
      {/* ═════════ LEARN — the lesson list ═════════ */}
      {isLearn && !currentConcept && (
        <main className="lessons-stage">
          <h2 className="lessons-title">Lessons</h2>

          <div className="lesson-card">
            <span className="lesson-num">Lesson 1</span>
            <h3 className="lesson-name">The seven modes of one scale</h3>
            <p className="lesson-desc">
              One parent scale contains seven modes — the same notes, a different home
              each time. Walk the neck position by position and claim each mode by ear.
            </p>
            <div className="lesson-actions">
              <select className="key-select" value={lessonKey.root}
                onChange={e => setLessonKey(k => ({ ...k, root: e.target.value }))}>
                {NOTE_NAMES.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <select className="key-select" value={lessonKey.quality}
                onChange={e => setLessonKey(k => ({ ...k, quality: e.target.value }))}>
                <option value="ionian">Major</option>
                <option value="aeolian">Minor</option>
              </select>
              <button className="flow-ctl primary" onClick={() => startWalk(lessonKey.root, lessonKey.quality)}>
                Start →
              </button>
            </div>
          </div>

          <div className="lesson-card">
            <span className="lesson-num">Drills</span>
            <h3 className="lesson-name">One sound at a time</h3>
            <p className="lesson-desc">
              Short ear-hunts: each one is a single characteristic note against the
              drone. Owned means the app actually heard you land it.
            </p>
            <div className="collection-grid">
              {CONCEPTS.filter(c => !c.walk).map(c => {
                const owned = lessonOwnedIds.includes(c.id)
                return (
                  <button key={c.id}
                    className={`collection-item ${owned ? 'owned' : 'locked'}`}
                    onClick={() => applyConcept(c)}
                    title={owned ? c.hook : `Not yet — ${c.hook}`}>
                    <span className="collection-item-mark">{owned ? '✓' : '·'}</span>
                    <span className="collection-item-title">{c.title}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </main>
      )}

      {isLearn && currentConcept && (
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
                      the next note as you land each one. {backingNoun[0].toUpperCase()}{backingNoun.slice(1)} is holding {currentConcept.root} underneath.</>
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
                <button className="flow-ctl walk-entry" onClick={() => startWalk()}>
                  Walk the neck
                </button>
                <button className="flow-ctl" onClick={shiftPosition}>Shift position</button>
              </>
            )}
            <button className="flow-ctl" onClick={() => up({ conceptId: null })}>‹ Lessons</button>
            {renderBackingControls()}
            <button
              key={justTapped}
              className={`play-btn ${isPlaying ? 'on' : ''}`}
              onClick={togglePlay}
              title={isPlaying ? `Stop ${backingNoun} and the mic` : `Start ${backingNoun} and let it hear you`}
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
            {listening && (
              <div className="mic-meter" title="Mic level — play louder if the bar isn't reaching the line">
                <div className="mic-meter-track">
                  <div
                    className={`mic-meter-fill ${micLevel.rms >= micLevel.gate ? 'clearing' : ''}`}
                    style={{ width: `${Math.min(100, (micLevel.rms / METER_MAX) * 100)}%` }}
                  />
                  <div className="mic-meter-gate" style={{ left: `${Math.min(100, (micLevel.gate / METER_MAX) * 100)}%` }} />
                </div>
              </div>
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

      {/* ═════════ FLOW — the endless jam. Play is the last decision. ═════════ */}
      {isFlow && (
        <main className="jam-stage">
          <FlowCanvas
            active={isFlow}
            pulse={flowPulse}
            wave={flowWave}
            homeColor={state.intervalColors['R'] || '#FFC233'}
          />

          {!isPlaying && (
            <div className="jam-setup">
              <div className="jam-setup-row">
                <span className="study-bar-label">Key</span>
                <select className="key-select" value={state.keyRoot}
                  onChange={e => up({ keyRoot: e.target.value, selectedScaleRoot: e.target.value, selectedScaleKey: state.keyQuality })}>
                  {NOTE_NAMES.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <select className="key-select" value={state.keyQuality}
                  onChange={e => up({ keyQuality: e.target.value, selectedScaleKey: e.target.value })}>
                  {KEY_QUALITIES.map(q => <option key={q.key} value={q.key}>{q.label}</option>)}
                </select>
              </div>

              <div className="jam-setup-row">
                <span className="study-bar-label">Jam</span>
                <div className="backing-switch" role="group" aria-label="How to improvise">
                  {([
                    ['modes', 'Modes', 'Modal playing — the harmony sits still (or drifts over minutes) and you color inside it'],
                    ['changes', 'Changes', 'Playing the changes — a progression loops at tempo and your lines track each chord'],
                  ] as const).map(([key, label, title]) => (
                    <button key={key} type="button" title={title}
                      className={`backing-switch-btn ${state.flowJam === key ? 'active' : ''}`}
                      onClick={() => up({ flowJam: key })}>{label}</button>
                  ))}
                </div>
              </div>

              {state.flowJam === 'modes' && (
              <div className="jam-setup-row">
                <span className="study-bar-label">Evolve</span>
                <div className="backing-switch" role="group" aria-label="How the backing evolves">
                  {([
                    ['static', 'Stay', 'One home, the whole session'],
                    ['diatonic', 'Drift', 'Home slowly wanders the sibling modes — same notes, new gravity'],
                    ['custom', 'My chords', 'Follow your own chord order'],
                  ] as const).map(([key, label, title]) => (
                    <button key={key} type="button" title={title}
                      className={`backing-switch-btn ${state.flowEvolve === key ? 'active' : ''}`}
                      onClick={() => up({ flowEvolve: key })}>{label}</button>
                  ))}
                </div>
              </div>
              )}

              {((state.flowJam === 'modes' && state.flowEvolve === 'custom') || state.flowJam === 'changes') && (
                <div className="jam-setup-row jam-chords">
                  <div className="jam-chord-pool">
                    {primaryChords.map((dc, deg) => dc && (
                      <button key={deg} type="button" className="jam-chord-btn"
                        title={`Add ${dc.fullName}`}
                        onClick={() => up({ flowChords: [...state.flowChords, deg] })}>
                        {dc.fullName}
                      </button>
                    ))}
                  </div>
                  <div className="jam-chord-seq">
                    {state.flowChords.length === 0 && <span className="jam-chord-hint">tap chords above to build the order</span>}
                    {state.flowChords.map((deg, i) => {
                      const dc = primaryChords[deg]
                      return (
                        <button key={i} type="button" className="jam-chord-btn seq"
                          title="Remove"
                          onClick={() => up({ flowChords: state.flowChords.filter((_, j) => j !== i) })}>
                          {dc ? dc.fullName : '?'} ✕
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {state.flowJam === 'modes' && state.flowEvolve !== 'static' && (
                <div className="jam-setup-row">
                  <span className="study-bar-label">Pace</span>
                  <div className="backing-switch" role="group" aria-label="Evolution pace">
                    {([[240, 'Slow'], [120, 'Medium'], [60, 'Fast']] as const).map(([sec, label]) => (
                      <button key={sec} type="button"
                        className={`backing-switch-btn ${state.flowPaceSec === sec ? 'active' : ''}`}
                        onClick={() => up({ flowPaceSec: sec })}>{label}</button>
                    ))}
                  </div>
                </div>
              )}

              {state.flowJam === 'changes' && (
                <div className="jam-setup-row">
                  <span className="study-bar-label">Tempo</span>
                  <div className="backing-bpm">
                    <button type="button" className="backing-bpm-btn"
                      onClick={() => up({ progressionBpm: Math.max(40, state.progressionBpm - 5) })}>&minus;</button>
                    <span className="backing-bpm-val">{state.progressionBpm}</span>
                    <button type="button" className="backing-bpm-btn"
                      onClick={() => up({ progressionBpm: Math.min(200, state.progressionBpm + 5) })}>+</button>
                  </div>
                  <span className="study-bar-label">Bars each</span>
                  <div className="backing-switch" role="group" aria-label="Bars per chord">
                    {([1, 2, 4] as const).map(n => (
                      <button key={n} type="button"
                        className={`backing-switch-btn ${state.progressionBarsPerChord === n ? 'active' : ''}`}
                        onClick={() => up({ progressionBarsPerChord: n })}>{n}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {isPlaying && (
            <p className="jam-home">
              {flowChanges && state.selectedChordRoot ? (
                <>now — <b>{chordLabel}</b>{nextChordInfo && <> · next — {nextChordInfo.name}</>}</>
              ) : (
                <>home — <b>{state.selectedScaleRoot || state.keyRoot}</b></>
              )}
              {flowWhisper && <span className="jam-whisper"> · {flowWhisper}</span>}
            </p>
          )}

          <div className="jam-neck">
            <Fretboard
              board={board}
              displayMode={displayMode}
              inlayStyle={state.inlayStyle}
              intervalColors={state.intervalColors}
              highlightRoot={state.highlightRoot}
              showLeftHanded={state.showLeftHanded}
              posRange={null}
              numFrets={state.numFrets}
              fretRange={null}
              tuningLabels={tuning.labels}
              guitarModel={state.guitarModel}
              chordToneNotes={flowChanges && state.progressionPlaying ? chordToneNotes : null}
              chordRootIndex={flowChanges && state.progressionPlaying ? chordRootIndex : null}
              nextChordToneNotes={flowChanges ? nextChordInfo?.notes || null : null}
              heardMidi={listening ? heardMidi : null}
            />
          </div>

          <footer className="flow-controls">
            {renderBackingControls(state.flowJam === 'modes')}
            <button
              key={justTapped}
              className={`play-btn ${isPlaying ? 'on' : ''}`}
              onClick={togglePlay}
              title={isPlaying ? `Stop ${backingNoun} and the mic` : `Start ${backingNoun} and let it hear you`}
              aria-label={isPlaying ? 'Stop' : 'Play'}
            >
              <span className="play-icon">{isPlaying ? '⏸' : '▶'}</span>
            </button>
            {listening && (
              <span className="flow-readout">
                {heardMidi !== null
                  ? <>{noteName(heardMidi % 12, flats)}<sub>{Math.floor(heardMidi / 12) - 1}</sub></>
                  : '···'}
              </span>
            )}
          </footer>

          {micError && <p className="flow-coach mic-error"><span className="flow-pip" />{micError}</p>}
          {!isPlaying && flowSummary && <p className="jam-summary">{flowSummary}</p>}
          {!isPlaying && !flowSummary && !micError && (
            <p className="flow-coach"><span className="flow-pip" />
              Hit <b>&nbsp;play&nbsp;</b> and just improvise. No tasks. The sound moves; your hands don't have to.
            </p>
          )}
        </main>
      )}

      {/* ═════════ STUDY — the full mapper. Nothing hidden. ═════════ */}
      {!isLearn && !isFlow && (
      <main className="study-stage">
        {/* One toolbar instead of four stacked strips */}
        <div className="study-bar">
          {/* LEFT — quick look: any scale or chord, by root, without touching
              the key. The glossary path. */}
          <span className="study-bar-label">Quick look</span>
          <select className="key-select"
            value={(quickType === 'scale' ? state.selectedScaleRoot : state.selectedChordRoot) || state.keyRoot}
            onChange={e => {
              const root = e.target.value
              if (quickType === 'scale') {
                up({ selectedScaleRoot: root, viewMode: 'scales', selectedChordRoot: null, selectedChordKey: null })
              } else {
                up({ selectedChordRoot: root, selectedChordKey: state.selectedChordKey || 'major', viewMode: 'chords', chordPosition: null })
              }
            }}>
            {NOTE_NAMES.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <div className="backing-switch" role="group" aria-label="Quick look type">
            <button type="button" className={`backing-switch-btn ${quickType === 'scale' ? 'active' : ''}`}
              onClick={() => setQuickType('scale')}>Scale</button>
            <button type="button" className={`backing-switch-btn ${quickType === 'chord' ? 'active' : ''}`}
              onClick={() => setQuickType('chord')}>Chord</button>
          </div>
          {quickType === 'scale' ? (
            <select className="type-select" value={state.selectedScaleKey || state.keyQuality}
              onChange={e => up({ selectedScaleKey: e.target.value, selectedScaleRoot: state.selectedScaleRoot || state.keyRoot, viewMode: 'scales', selectedChordRoot: null, selectedChordKey: null })}>
              {Object.entries(scalesByCategory).map(([cat, scales]) => (
                <optgroup key={cat} label={cat}>
                  {scales.map(([key, s]) => <option key={key} value={key}>{s.name}</option>)}
                </optgroup>
              ))}
            </select>
          ) : (
            <select className="type-select" value={state.selectedChordKey || 'major'}
              onChange={e => up({ selectedChordKey: e.target.value, selectedChordRoot: state.selectedChordRoot || state.keyRoot, viewMode: 'chords', chordPosition: null })}>
              {Object.entries(chordsByCategory).map(([cat, chords]) => (
                <optgroup key={cat} label={cat}>
                  {chords.map(([key, ch]) => <option key={key} value={key}>{ch.name}</option>)}
                </optgroup>
              ))}
            </select>
          )}

          <span className="study-bar-sep" />

          {/* MIDDLE — the key: pick one and go all the way (diatonic harmony,
              tiers, positions). The deep-dive path. */}
          <span className="study-bar-label">Key</span>
          <select className="key-select" value={state.keyRoot}
            onChange={e => up({ keyRoot: e.target.value, selectedScaleRoot: e.target.value, selectedScaleKey: state.keyQuality, viewMode: 'scales', selectedChordRoot: null, selectedChordKey: null })}>
            {NOTE_NAMES.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <select className="key-select" value={state.keyQuality}
            onChange={e => up({ keyQuality: e.target.value, selectedScaleKey: e.target.value, selectedScaleRoot: state.keyRoot, viewMode: 'scales', selectedChordRoot: null, selectedChordKey: null })}>
            {KEY_QUALITIES.map(q => <option key={q.key} value={q.key}>{q.label}</option>)}
          </select>

          <span className="study-bar-sep" />

          {renderBackingControls()}
          <button
            key={justTapped}
            className={`play-btn small ${isPlaying ? 'on' : ''}`}
            onClick={togglePlay}
            title={isPlaying ? `Stop ${backingNoun} and the mic` : `Start ${backingNoun} and let it hear you`}
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

        {/* The modal-relativity teaching (same notes · different home, the mode
            chips, the shift narration) lives in Learn and Flow now — Study is
            the reference: key in, diatonic harmony out, glossary below. */}

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
          chordToneNotes={state.viewMode === 'chords' && state.activeTab !== 'technique' && !chordShapeSet ? chordToneNotes : null}
          chordRootIndex={state.viewMode === 'chords' && state.activeTab !== 'technique' && !chordShapeSet ? chordRootIndex : null}
          highlightedPositions={state.activeTab === 'technique' ? highlightedPosSet : chordShapeSet}
          nextChordToneNotes={nextChordInfo?.notes || null}
          guitarModel={state.guitarModel}
          zoomToPosition={state.zoomToPosition && state.scalePosition !== null}
          heardMidi={listening ? heardMidi : null}
        />


        {/* Position bar + More toggle \u2014 browses scale positions normally,
            or the same chord's shapes up the neck when one's selected. */}
        <div className="bottom-strip">
          <div className="position-bar">
            {isChordShapeMode ? (
              <>
                <button className={`pos-btn ${state.chordPosition === null ? 'active' : ''}`}
                  onClick={() => up({ chordPosition: null })}
                  title="The chord over the key \u2014 every chord tone in context">All</button>
                {chordVoicings.map((v, i) => {
                  // Two different grips can legitimately share a base fret
                  // (their roots sit on different strings) \u2014 suffix the
                  // repeats so the bar never shows two identical buttons.
                  const dupIdx = chordVoicings.slice(0, i).filter(o => o.baseFret === v.baseFret).length
                  const base = v.baseFret === 0 ? 'Op' : `fr${v.baseFret}`
                  const label = dupIdx === 0 ? base : `${base}\u00b7${dupIdx + 1}`
                  return (
                    <button key={i}
                      className={`pos-btn ${state.chordPosition === i + 1 ? 'active' : ''}`}
                      onClick={() => up({ chordPosition: i + 1 })}
                      title={`One playable grip \u2014 ${v.baseFret === 0 ? 'open position' : `around fret ${v.baseFret}`}`}
                    >{label}</button>
                  )
                })}
              </>
            ) : (
              <>
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
              </>
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

      {/* Tuner */}
      {tunerOpen && (
        <div className="tuner-overlay" onClick={closeTuner}>
          <div className="tuner-panel" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <span className="drawer-title">Tuner</span>
              <button className="drawer-close" onClick={closeTuner}>&times;</button>
            </div>
            {micError && <p className="mic-error">{micError}</p>}
            <div className={`tuner-note ${tunerPitch && Math.abs(tunerPitch.cents) <= 5 ? 'in-tune' : ''}`}>
              {tunerPitch
                ? <>{noteName(tunerPitch.midi % 12, flats)}<sub>{Math.floor(tunerPitch.midi / 12) - 1}</sub></>
                : '···'}
            </div>
            <div className="tuner-meter-row">
              <span className="tuner-flat">&#9837;</span>
              <div className="tuner-track">
                <div className="tuner-center" />
                {tunerPitch && (
                  <div
                    className={`tuner-needle ${Math.abs(tunerPitch.cents) <= 5 ? 'in-tune' : Math.abs(tunerPitch.cents) > 25 ? 'far' : ''}`}
                    style={{ left: `${50 + Math.max(-50, Math.min(50, tunerPitch.cents))}%` }}
                  />
                )}
              </div>
              <span className="tuner-sharp">&#9839;</span>
            </div>
            <div className="tuner-cents">
              {tunerPitch ? `${tunerPitch.cents > 0 ? '+' : ''}${Math.round(tunerPitch.cents)}¢` : 'play a string'}
            </div>
            <div className="tuner-strings">
              {tuning.notes.map((midi, i) => {
                const heard = tunerPitch !== null && ((tunerPitch.midi - midi) % 12 + 12) % 12 === 0
                const inTune = heard && tunerPitch !== null && Math.abs(tunerPitch.cents) <= 5
                return (
                  <span key={i} className={`tuner-string ${heard ? 'heard' : ''} ${inTune ? 'in-tune' : ''}`}>
                    {tuning.labels[i]}<sub>{Math.floor(midi / 12) - 1}</sub>
                  </span>
                )
              })}
            </div>
          </div>
        </div>
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
              label="Volume" value={state.droneVolume} max={3}
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

          <div className="drawer-section">
            <span className="drawer-label">PAD</span>
            <DrawerSlider
              label="Volume" value={state.padVolume} max={3}
              onChange={v => up({ padVolume: v })}
            />
            <DrawerSlider
              label="Spread" value={state.padSpread} max={1.5}
              onChange={v => up({ padSpread: v })}
            />
            <DrawerSlider
              label="Tone" value={state.padTone} max={1}
              onChange={v => up({ padTone: v })}
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
