export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const
export const NOTE_NAMES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] as const

export type NoteName = string

export interface ScaleDef {
  name: string
  intervals: number[]
  category: string
}

export interface ChordDef {
  name: string
  suffix: string
  intervals: number[]
  category: string
}

export interface Tuning {
  name: string
  notes: number[]
  labels: string[]
}

export type DisplayMode = 'notes' | 'intervals' | 'both'
export type InlayStyle = 'dots' | 'blocks' | 'none'
export type ThemeMode = 'dark' | 'light'
export type ColorTheme = 'obsidian' | 'midnight' | 'ember' | 'vapor' | 'sage'
export type GuitarModel = 'strat' | 'lespaul'

export interface FretNote {
  note: string
  octave: number
  midi: number
  interval: number
  intervalName: string
  degree: number
  isInScale: boolean
  isRoot: boolean
  stringIndex: number
  fret: number
}

export type ViewMode = 'chords' | 'scales'
// 'study' — the full mapper. 'learn' — the guided concept drills (was called
// "flow" before there was a real Flow). 'flow' — the endless jam: hit Play,
// improvise, the backing evolves underneath you, nothing ever asks for a task.
export type AppMode = 'study' | 'learn' | 'flow'
export type FlowEvolve = 'static' | 'diatonic' | 'custom'

export interface AppState {
  // Key selection (top level)
  keyRoot: string
  keyQuality: string // 'ionian' for major, 'aeolian' for natural minor, etc.

  // What's shown on the fretboard
  viewMode: ViewMode // are we showing a chord or a scale?
  selectedChordRoot: string | null
  selectedChordKey: string | null
  selectedScaleRoot: string | null
  selectedScaleKey: string | null

  // Fretboard settings
  tuningKey: string
  inlayStyle: InlayStyle
  showNoteNames: boolean
  showIntervals: boolean
  highlightRoot: boolean
  showLeftHanded: boolean
  scalePosition: number | null
  chordPosition: number | null // which chord-tone-anchored shape window is showing
  numFrets: number
  fretRange: [number, number] | null // visible fret window [lo, hi]; null = whole neck
  intervalColors: Record<string, string>
  language: 'en' | 'es' | 'fr' | 'it' | 'pt' // sets the note-naming convention default
  noteStyle: 'letters' | 'solfege'           // C-D-E vs Do-Re-Mi, user-overridable
  theme: ThemeMode
  colorTheme: ColorTheme
  guitarModel: GuitarModel
  zoomToPosition: boolean

  // Audio
  padLatched: boolean
  droneVolume: number  // 0–3
  droneSpread: number  // 0–1.5, stereo width multiplier
  droneTone: number    // 0–1, dark → bright
  padVolume: number    // 0–3
  padSpread: number    // 0–1.5, stereo width multiplier
  padTone: number       // 0–1, dark → bright
  backingMode: 'drone' | 'chord' | 'arp' // what Play triggers underneath the mode

  // Flow (the endless jam) — the two ways to improvise:
  //   'modes'   — modal playing: harmony sits still (or drifts over minutes)
  //   'changes' — playing the changes: a progression loops at tempo, bars
  //               per chord, and your lines track each chord as it arrives
  flowJam: 'modes' | 'changes' | 'findit'
  flowEvolve: FlowEvolve   // modes: stay put, drift through the sibling modes, or follow your own chord order
  flowChords: number[]     // chord order: diatonic degree indices (0–6), duplicates allowed
  flowPaceSec: number      // modes: seconds between evolution steps

  // Two first-class modes sharing one shell:
  //   'study' — the full fretboard mapper: whole neck, any key, chords over
  //             scales, arpeggios, positions. Nothing hidden.
  //   'flow'  — the session engine: one idea, the shape, the drone, listening.
  appMode: AppMode
  conceptId: string | null
  showTheory: boolean
  onboarded: boolean

  // Practice streak — counted on real engagement (pressing Play), not
  // just opening the tab. See utils/streak.ts.
  practiceStreak: number
  lastPracticeDate: string | null // YYYY-MM-DD

  advancedMode: boolean
  activeTab: 'explore' | 'technique'
  techniqueMode: '3nps' | 'arpeggios' | 'tapping'
  selectedPattern: number // 0-based pattern index

  // Progression stepper
  progression: number[] // indices into diatonic chords (degrees 0-6), duplicates allowed
  progressionIndex: number // which chord we're on (-1 = off)
  progressionPlaying: boolean
  progressionBpm: number
  progressionBarsPerChord: number // how many bars each chord sustains (1, 2, 4)
}
