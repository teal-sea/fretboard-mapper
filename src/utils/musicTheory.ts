import { NOTE_NAMES, NOTE_NAMES_FLAT, type ScaleDef, type ChordDef, type Tuning } from '../types/music'

// ─── Notes ───────────────────────────────────────────────────────────
export function noteIndex(name: string): number {
  let idx = NOTE_NAMES.indexOf(name as any)
  if (idx >= 0) return idx
  idx = NOTE_NAMES_FLAT.indexOf(name as any)
  if (idx >= 0) return idx
  // Handle enharmonics
  const map: Record<string, number> = { 'Cb': 11, 'B#': 0, 'E#': 5, 'Fb': 4 }
  return map[name] ?? 0
}

export function noteName(index: number, preferFlats = false): string {
  const i = ((index % 12) + 12) % 12
  return preferFlats ? NOTE_NAMES_FLAT[i] : NOTE_NAMES[i]
}

const FLAT_ROOTS = new Set(['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'D', 'G', 'C'])
export function useFlats(root: string): boolean {
  return FLAT_ROOTS.has(root)
}

// ─── Interval names ──────────────────────────────────────────────────
const INTERVAL_NAMES: Record<number, string> = {
  0: 'R', 1: 'b2', 2: '2', 3: 'b3', 4: '3', 5: '4',
  6: 'b5', 7: '5', 8: 'b6', 9: '6', 10: 'b7', 11: '7',
}

export function intervalName(semitones: number): string {
  return INTERVAL_NAMES[((semitones % 12) + 12) % 12] || '?'
}

const INTERVAL_SEMITONES: Record<string, number> = Object.fromEntries(
  Object.entries(INTERVAL_NAMES).map(([semis, name]) => [name, Number(semis)])
)

export function intervalSemitones(name: string): number | null {
  return INTERVAL_SEMITONES[name] ?? null
}

// ─── Scales ──────────────────────────────────────────────────────────
export const SCALES: Record<string, ScaleDef> = {
  // Major modes
  'ionian':          { name: 'Ionian (Major)',      intervals: [0,2,4,5,7,9,11],   category: 'Major Modes' },
  'dorian':          { name: 'Dorian',              intervals: [0,2,3,5,7,9,10],   category: 'Major Modes' },
  'phrygian':        { name: 'Phrygian',            intervals: [0,1,3,5,7,8,10],   category: 'Major Modes' },
  'lydian':          { name: 'Lydian',              intervals: [0,2,4,6,7,9,11],   category: 'Major Modes' },
  'mixolydian':      { name: 'Mixolydian',          intervals: [0,2,4,5,7,9,10],   category: 'Major Modes' },
  'aeolian':         { name: 'Aeolian (Natural Minor)', intervals: [0,2,3,5,7,8,10], category: 'Major Modes' },
  'locrian':         { name: 'Locrian',             intervals: [0,1,3,5,6,8,10],   category: 'Major Modes' },
  // Pentatonics & Blues
  'major_penta':     { name: 'Major Pentatonic',    intervals: [0,2,4,7,9],         category: 'Pentatonic & Blues' },
  'minor_penta':     { name: 'Minor Pentatonic',    intervals: [0,3,5,7,10],        category: 'Pentatonic & Blues' },
  'blues':           { name: 'Blues',                intervals: [0,3,5,6,7,10],      category: 'Pentatonic & Blues' },
  'major_blues':     { name: 'Major Blues',          intervals: [0,2,3,4,7,9],       category: 'Pentatonic & Blues' },
  // Harmonic & Melodic Minor
  'harmonic_minor':  { name: 'Harmonic Minor',      intervals: [0,2,3,5,7,8,11],   category: 'Minor Variants' },
  'melodic_minor':   { name: 'Melodic Minor',       intervals: [0,2,3,5,7,9,11],   category: 'Minor Variants' },
  'phrygian_dom':    { name: 'Phrygian Dominant',   intervals: [0,1,4,5,7,8,10],   category: 'Minor Variants' },
  'lydian_aug':      { name: 'Lydian Augmented',    intervals: [0,2,4,6,8,9,11],   category: 'Minor Variants' },
  'altered':         { name: 'Altered (Super Locrian)', intervals: [0,1,3,4,6,8,10], category: 'Minor Variants' },
  'hungarian_minor': { name: 'Hungarian Minor',     intervals: [0,2,3,6,7,8,11],   category: 'Minor Variants' },
  // Exotic
  'whole_tone':      { name: 'Whole Tone',          intervals: [0,2,4,6,8,10],      category: 'Exotic' },
  'diminished':      { name: 'Diminished (HW)',     intervals: [0,1,3,4,6,7,9,10],  category: 'Exotic' },
  'diminished_wh':   { name: 'Diminished (WH)',     intervals: [0,2,3,5,6,8,9,11],  category: 'Exotic' },
  'hirajoshi':       { name: 'Hirajoshi',           intervals: [0,2,3,7,8],          category: 'Exotic' },
  'in_sen':          { name: 'In Sen',              intervals: [0,1,5,7,10],         category: 'Exotic' },
  'iwato':           { name: 'Iwato',               intervals: [0,1,5,6,10],         category: 'Exotic' },
}

// ─── Chords ──────────────────────────────────────────────────────────
export const CHORDS: Record<string, ChordDef> = {
  // Triads
  'major':     { name: 'Major',        suffix: '',      intervals: [0,4,7],       category: 'Triads' },
  'minor':     { name: 'Minor',        suffix: 'm',     intervals: [0,3,7],       category: 'Triads' },
  'dim':       { name: 'Diminished',   suffix: 'dim',   intervals: [0,3,6],       category: 'Triads' },
  'aug':       { name: 'Augmented',    suffix: 'aug',   intervals: [0,4,8],       category: 'Triads' },
  'sus2':      { name: 'Sus2',         suffix: 'sus2',  intervals: [0,2,7],       category: 'Triads' },
  'sus4':      { name: 'Sus4',         suffix: 'sus4',  intervals: [0,5,7],       category: 'Triads' },
  'power':     { name: 'Power Chord',  suffix: '5',     intervals: [0,7],         category: 'Triads' },
  // Sevenths
  'maj7':      { name: 'Major 7th',    suffix: 'maj7',  intervals: [0,4,7,11],    category: 'Sevenths' },
  'min7':      { name: 'Minor 7th',    suffix: 'm7',    intervals: [0,3,7,10],    category: 'Sevenths' },
  'dom7':      { name: 'Dominant 7th', suffix: '7',     intervals: [0,4,7,10],    category: 'Sevenths' },
  'dim7':      { name: 'Diminished 7th', suffix: 'dim7', intervals: [0,3,6,9],    category: 'Sevenths' },
  'half_dim7': { name: 'Half-Dim 7th', suffix: 'm7b5',  intervals: [0,3,6,10],    category: 'Sevenths' },
  'min_maj7':  { name: 'Minor-Major 7th', suffix: 'mM7', intervals: [0,3,7,11],   category: 'Sevenths' },
  'aug7':      { name: 'Augmented 7th',suffix: 'aug7',  intervals: [0,4,8,10],    category: 'Sevenths' },
  'aug_maj7':  { name: 'Aug Major 7th',suffix: 'maj7#5',intervals: [0,4,8,11],    category: 'Sevenths' },
  // Extended
  'add9':      { name: 'Add 9',        suffix: 'add9',  intervals: [0,4,7,14],    category: 'Extended' },
  'maj9':      { name: 'Major 9th',    suffix: 'maj9',  intervals: [0,4,7,11,14], category: 'Extended' },
  'min9':      { name: 'Minor 9th',    suffix: 'm9',    intervals: [0,3,7,10,14], category: 'Extended' },
  'dom9':      { name: 'Dominant 9th', suffix: '9',     intervals: [0,4,7,10,14], category: 'Extended' },
  'dom11':     { name: 'Dominant 11th',suffix: '11',    intervals: [0,4,7,10,14,17], category: 'Extended' },
  'maj13':     { name: 'Major 13th',   suffix: 'maj13', intervals: [0,4,7,11,14,21], category: 'Extended' },
  'min11':     { name: 'Minor 11th',   suffix: 'm11',   intervals: [0,3,7,10,14,17], category: 'Extended' },
  'dom13':     { name: 'Dominant 13th',suffix: '13',    intervals: [0,4,7,10,14,21], category: 'Extended' },
  '6':         { name: 'Major 6th',    suffix: '6',     intervals: [0,4,7,9],     category: 'Extended' },
  'm6':        { name: 'Minor 6th',    suffix: 'm6',    intervals: [0,3,7,9],     category: 'Extended' },
}

// A few scales aren't built from regular steps, so stacking every other
// degree doesn't land on their real backing chord — these are well-known
// exceptions (same chords Flow's concepts.ts already hand-picks for them).
const SCALE_CHORD_OVERRIDE: Record<string, number[]> = {
  'major_penta': [0, 4, 7, 11],
  'minor_penta': [0, 3, 7, 10],
  'blues':       [0, 4, 7, 10],
  'major_blues': [0, 4, 7, 11],
}

// The chord a mode is idiomatically played against — root, 3rd, 5th, 7th
// degree of the scale itself (e.g. Dorian's 1-3-5-7 is a min7). This is the
// same tertian-stacking logic used to build diatonic chords, just anchored
// on the scale's own root instead of walking all seven degrees.
export function chordIntervalsForScale(scaleKey: string): number[] {
  const override = SCALE_CHORD_OVERRIDE[scaleKey]
  if (override) return override
  const intervals = SCALES[scaleKey]?.intervals ?? CHORDS.major.intervals
  const n = intervals.length
  if (n < 5) return [intervals[0] ?? 0, intervals[Math.floor(n / 2)] ?? 4, intervals[n - 1] ?? 7]
  return [0, 2, 4, 6].filter(d => d < n).map(d => intervals[d])
}

// ─── Tunings ─────────────────────────────────────────────────────────
// Values = semitone offset from C0 for each string (low to high)
export const TUNINGS: Record<string, Tuning> = {
  'standard':     { name: 'Standard',         notes: [40,45,50,55,59,64],   labels: ['E','A','D','G','B','E'] },
  'drop_d':       { name: 'Drop D',           notes: [38,45,50,55,59,64],   labels: ['D','A','D','G','B','E'] },
  'open_g':       { name: 'Open G',           notes: [38,43,50,55,59,62],   labels: ['D','G','D','G','B','D'] },
  'open_d':       { name: 'Open D',           notes: [38,45,50,54,57,62],   labels: ['D','A','D','F#','A','D'] },
  'open_e':       { name: 'Open E',           notes: [40,47,52,56,59,64],   labels: ['E','B','E','G#','B','E'] },
  'dadgad':       { name: 'DADGAD',           notes: [38,45,50,55,57,62],   labels: ['D','A','D','G','A','D'] },
  'half_step_dn': { name: 'Half Step Down',   notes: [39,44,49,54,58,63],   labels: ['Eb','Ab','Db','Gb','Bb','Eb'] },
  'full_step_dn': { name: 'Full Step Down',   notes: [38,43,48,53,57,62],   labels: ['D','G','C','F','A','D'] },
}

// ─── Scale note computation ──────────────────────────────────────────
export function getScaleNotes(root: string, scale: ScaleDef): Set<number> {
  const rootIdx = noteIndex(root)
  return new Set(scale.intervals.map(i => (rootIdx + i) % 12))
}

export function getChordNotes(root: string, chord: ChordDef): Set<number> {
  const rootIdx = noteIndex(root)
  return new Set(chord.intervals.map(i => (rootIdx + i) % 12))
}

// ─── Fretboard note computation ──────────────────────────────────────
export function computeFretboard(
  tuning: Tuning,
  root: string,
  activeNotes: Set<number>,
  numFrets: number = 15
): import('../types/music').FretNote[][] {
  const rootIdx = noteIndex(root)
  const flats = useFlats(root)
  const board: import('../types/music').FretNote[][] = []

  for (let s = 0; s < tuning.notes.length; s++) {
    const stringNotes: import('../types/music').FretNote[] = []
    for (let f = 0; f <= numFrets; f++) {
      const midi = tuning.notes[s] + f
      const degree = midi % 12
      const octave = Math.floor(midi / 12) - 1
      const note = noteName(degree, flats)
      const semisFromRoot = ((degree - rootIdx) % 12 + 12) % 12
      const isInScale = activeNotes.has(degree)
      stringNotes.push({
        note,
        octave,
        midi,
        interval: semisFromRoot,
        intervalName: intervalName(semisFromRoot),
        degree,
        isInScale,
        isRoot: semisFromRoot === 0,
        stringIndex: s,
        fret: f,
      })
    }
    board.push(stringNotes)
  }
  return board
}

// ─── Key Map: diatonic chords ────────────────────────────────────────
export interface DiatonicChord {
  root: string
  rootDegree: number // 0-based scale degree
  romanNumeral: string
  chordKey: string
  chordDef: ChordDef
  fullName: string
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']

// Priority: basic triads first, then 7ths, then extended
const CHORD_PRIORITY: Record<string, number> = {
  'major': 0, 'minor': 0, 'dim': 0, 'aug': 0,
  'sus2': 1, 'sus4': 1, 'power': 1,
  'maj7': 2, 'min7': 2, 'dom7': 2, 'dim7': 2, 'half_dim7': 2, 'min_maj7': 2, 'aug7': 2, 'aug_maj7': 2,
  '6': 3, 'm6': 3,
  'add9': 4, 'maj9': 4, 'min9': 4, 'dom9': 4,
  'dom11': 5, 'min11': 5, 'maj13': 5, 'dom13': 5,
}

export function getDiatonicChords(root: string, scale: ScaleDef): DiatonicChord[][] {
  const rootIdx = noteIndex(root)
  const flats = useFlats(root)
  const scaleNotes = scale.intervals.map(i => (rootIdx + i) % 12)
  const result: DiatonicChord[][] = []

  for (let deg = 0; deg < scale.intervals.length && deg < 7; deg++) {
    const chordRoot = scaleNotes[deg]
    const chordRootName = noteName(chordRoot, flats)
    const roman = ROMAN[deg] || (deg + 1).toString()
    const degreeChords: DiatonicChord[] = []

    for (const [key, chord] of Object.entries(CHORDS)) {
      const chordTones = chord.intervals.map(i => (chordRoot + (i % 12)) % 12)
      const allDiatonic = chordTones.every(t => scaleNotes.includes(t))
      if (allDiatonic) {
        // Determine roman numeral based on chord quality
        const has3 = chord.intervals.includes(3)   // minor 3rd
        const hasB5 = chord.intervals.includes(6)   // diminished 5th
        const hasAug5 = chord.intervals.includes(8) // augmented 5th
        const hasb7 = chord.intervals.includes(10)  // minor 7th
        let rn = roman
        if (has3 && hasB5 && hasb7) rn = roman.toLowerCase() + '\u00F8' // ø half-dim
        else if (has3 && hasB5) rn = roman.toLowerCase() + '\u00B0'     // ° dim
        else if (has3) rn = roman.toLowerCase()
        else if (hasAug5) rn = roman + '+'

        degreeChords.push({
          root: chordRootName,
          rootDegree: deg,
          romanNumeral: rn,
          chordKey: key,
          chordDef: chord,
          fullName: chordRootName + chord.suffix,
        })
      }
    }

    // Sort: basic triads first, then by priority tier
    degreeChords.sort((a, b) => {
      const pa = CHORD_PRIORITY[a.chordKey] ?? 9
      const pb = CHORD_PRIORITY[b.chordKey] ?? 9
      return pa - pb
    })

    result.push(degreeChords)
  }
  return result
}

// ─── Scale positions (root-based) ────────────────────────────────────
// Returns fret ranges for each scale position, where Position 1 starts at the root note.
// Positions ascend from root; those exceeding numFrets wrap to the lower octave.
export function getScalePositions(
  root: string,
  scale: ScaleDef,
  tuning: Tuning,
  numFrets: number = 15
): [number, number][] {
  const rootIdx = noteIndex(root)
  const lowString = tuning.notes[0]

  // Find root fret on lowest string (within first 12 frets)
  let rootFret = -1
  for (let f = 0; f <= 12; f++) {
    if ((lowString + f) % 12 === rootIdx) { rootFret = f; break }
  }
  if (rootFret < 0) return []

  // Each position starts at rootFret + interval (ascending from root)
  // Wrap at the octave — positions stay within frets 0-11 (fret 12 = fret 0)
  const starts = scale.intervals.map(iv => {
    let f = rootFret + iv
    if (f >= 12) f -= 12
    return f
  })

  // Build ranges: start 1 fret below center (inner strings often have notes there),
  // extend to the next position's center fret, minimum 4 frets wide (3 notes per string)
  const positions: [number, number][] = []
  for (let i = 0; i < starts.length; i++) {
    const start = Math.max(0, starts[i] - 1)
    const rawNext = starts[(i + 1) % starts.length]
    const nextFret = rawNext <= starts[i] ? rawNext + 12 : rawNext
    const end = Math.max(starts[i] + 3, nextFret) // at least 4 frets from center
    positions.push([start, Math.min(end, numFrets)])
  }

  return positions
}

// ─── Compatible scales for a chord ───────────────────────────────────
export function getCompatibleScales(chordRoot: string, chord: ChordDef): { key: string; name: string }[] {
  const chordNotes = getChordNotes(chordRoot, chord)
  const results: { key: string; name: string }[] = []

  for (const [key, scale] of Object.entries(SCALES)) {
    const scaleNotes = getScaleNotes(chordRoot, scale)
    const allPresent = [...chordNotes].every(n => scaleNotes.has(n))
    if (allPresent) {
      results.push({ key, name: scale.name })
    }
  }
  return results
}

// ─── Formula string ──────────────────────────────────────────────────
export function formulaString(intervals: number[]): string {
  return intervals.map(i => intervalName(i % 12)).join(' - ')
}

// ─── 3NPS (Three Notes Per String) Patterns ─────────────────────────
export interface FretPosition {
  stringIndex: number
  fret: number
  degree: number        // pitch class 0-11
  intervalIndex: number // index into scale.intervals
}

export function compute3NPSPattern(
  root: string,
  scale: ScaleDef,
  tuning: Tuning,
  patternIndex: number,
  numFrets: number = 24
): FretPosition[] {
  const rootIdx = noteIndex(root)
  const intervals = scale.intervals
  const n = intervals.length
  const numStrings = tuning.notes.length
  const totalNotes = 3 * numStrings

  // Starting pitch class for this pattern
  const startSemis = intervals[patternIndex % n]
  const startPC = (rootIdx + startSemis) % 12

  // Find lowest occurrence on string 0 (within first 12 frets)
  const lowestOpen = tuning.notes[0]
  let startFret = 0
  for (let f = 0; f <= Math.min(numFrets, 12); f++) {
    if ((lowestOpen + f) % 12 === startPC) { startFret = f; break }
  }

  // Generate ascending scale MIDI values
  const midiNotes: number[] = [lowestOpen + startFret]
  for (let i = 1; i < totalNotes; i++) {
    const prevDeg = (patternIndex + i - 1) % n
    const currDeg = (patternIndex + i) % n
    let gap = intervals[currDeg] - intervals[prevDeg]
    if (gap <= 0) gap += 12
    midiNotes.push(midiNotes[i - 1] + gap)
  }

  // Assign to strings — 3 per string
  const positions: FretPosition[] = []
  for (let s = 0; s < numStrings; s++) {
    for (let j = 0; j < 3; j++) {
      const idx = s * 3 + j
      if (idx >= midiNotes.length) break
      const midi = midiNotes[idx]
      const fret = midi - tuning.notes[s]
      if (fret < 0 || fret > numFrets) continue
      positions.push({
        stringIndex: s,
        fret,
        degree: midi % 12,
        intervalIndex: (patternIndex + idx) % n,
      })
    }
  }
  return positions
}

// ─── Sweep Arpeggio Shapes ──────────────────────────────────────────
// Finds compact, sweepable shapes where adjacent strings are close in fret position
export function computeSweepShape(
  root: string,
  chord: ChordDef,
  tuning: Tuning,
  inversion: number = 0,
  numFrets: number = 24
): FretPosition[] {
  const rootIdx = noteIndex(root)
  const chordTones = chord.intervals.map(i => (rootIdx + i) % 12)
  const numStrings = tuning.notes.length

  type Note = { stringIndex: number; fret: number; midi: number; pc: number; toneIdx: number }

  // Collect all valid shapes by trying each chord tone start on the lowest string
  const allShapes: FretPosition[][] = []

  for (let startFret = 0; startFret <= Math.min(14, numFrets); startFret++) {
    const startMidi = tuning.notes[0] + startFret
    if (!chordTones.includes(startMidi % 12)) continue

    const shape: Note[] = [{
      stringIndex: 0, fret: startFret, midi: startMidi,
      pc: startMidi % 12, toneIdx: chordTones.indexOf(startMidi % 12),
    }]

    for (let s = 1; s < numStrings; s++) {
      const prevFret = shape[shape.length - 1].fret
      const prevMidi = shape[shape.length - 1].midi

      // Find nearest chord tone within 3 frets that's higher in pitch
      let bestCand: Note | null = null
      let bestDist = Infinity

      for (let f = Math.max(0, prevFret - 3); f <= Math.min(numFrets, prevFret + 3); f++) {
        const midi = tuning.notes[s] + f
        const pc = midi % 12
        if (!chordTones.includes(pc) || midi <= prevMidi) continue
        const dist = Math.abs(f - prevFret)
        if (dist < bestDist) {
          bestDist = dist
          bestCand = { stringIndex: s, fret: f, midi, pc, toneIdx: chordTones.indexOf(pc) }
        }
      }

      if (bestCand) shape.push(bestCand)
    }

    // Keep shapes covering at least 5 strings
    if (shape.length >= 5) {
      const hasOpen = shape.some(n => n.fret === 0)
      const span = Math.max(...shape.map(n => n.fret)) - Math.min(...shape.map(n => n.fret))
      // Score: prefer more strings, smaller span, avoid open strings
      const score = shape.length * 100 - span * 10 - (hasOpen ? 50 : 0)
      allShapes.push(shape.map(p => ({
        stringIndex: p.stringIndex, fret: p.fret,
        degree: p.pc, intervalIndex: p.toneIdx,
      })))
      // Store score for sorting
      ;(allShapes[allShapes.length - 1] as any).__score = score
    }
  }

  // Sort by score (best first) and use inversion to cycle
  allShapes.sort((a, b) => ((b as any).__score || 0) - ((a as any).__score || 0))

  if (allShapes.length === 0) return []
  return allShapes[inversion % allShapes.length]
}

// ─── Tapping Arpeggio Shapes ────────────────────────────────────────
// Multiple chord tones per string — hammer/pull lower notes, tap higher ones
export function computeTappingPattern(
  root: string,
  chord: ChordDef,
  tuning: Tuning,
  inversion: number = 0,
  numFrets: number = 24
): FretPosition[] {
  const rootIdx = noteIndex(root)
  const chordTones = chord.intervals.map(i => (rootIdx + i) % 12)
  const positions: FretPosition[] = []

  for (let s = 0; s < tuning.notes.length; s++) {
    const openMidi = tuning.notes[s]
    // Find all chord tones on this string
    const available: { fret: number; pc: number; toneIdx: number }[] = []
    for (let f = 0; f <= numFrets; f++) {
      const midi = openMidi + f
      const pc = midi % 12
      const toneIdx = chordTones.indexOf(pc)
      if (toneIdx >= 0) {
        available.push({ fret: f, pc, toneIdx })
      }
    }

    // Find a group of 2-3 notes with good tapping spacing (>= 3 frets apart)
    for (let i = 0; i < available.length; i++) {
      if (available[i].fret > 9) break // don't start too high for fretting hand
      const group = [available[i]]
      for (let j = i + 1; j < available.length; j++) {
        if (available[j].fret - group[group.length - 1].fret >= 3) {
          group.push(available[j])
          if (group.length >= 3) break
        }
      }
      if (group.length >= 2) {
        for (const g of group) {
          positions.push({
            stringIndex: s,
            fret: g.fret,
            degree: g.pc,
            intervalIndex: g.toneIdx,
          })
        }
        break // one group per string
      }
    }
  }

  return positions
}

// ─── Related modes ──────────────────────────────────────────────────
// For a given root + scale, find all modes that share the same parent set of notes.
// E.g. A minor pentatonic => also shows C major pentatonic
export interface RelatedMode {
  root: string
  scaleKey: string
  romanNumeral: string
}

// Mode families: scales that are modes of each other
const MODE_FAMILIES: string[][] = [
  ['ionian', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'aeolian', 'locrian'],
  ['major_penta', 'minor_penta'],
]

export function getRelatedModes(root: string, scaleKey: string): RelatedMode[] {
  const family = MODE_FAMILIES.find(f => f.includes(scaleKey))
  if (!family) return []

  const rootIdx = noteIndex(root)
  const currentScale = SCALES[scaleKey]
  if (!currentScale) return []

  // Compute the absolute pitches of the current scale
  const absoluteNotes = currentScale.intervals.map(i => (rootIdx + i) % 12)

  const results: RelatedMode[] = []
  const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']

  // For each mode in the family, find which root would produce the same set of notes
  for (const modeKey of family) {
    const modeScale = SCALES[modeKey]
    if (!modeScale) continue

    // Try each note in our scale as a potential root for this mode
    for (let degIdx = 0; degIdx < absoluteNotes.length; degIdx++) {
      const candidateRoot = absoluteNotes[degIdx]
      const candidateNotes = modeScale.intervals.map(i => (candidateRoot + i) % 12)

      // Check if same set of notes
      const sameNotes = candidateNotes.length === absoluteNotes.length &&
        candidateNotes.every(n => absoluteNotes.includes(n))

      if (sameNotes) {
        const flats = useFlats(root)
        results.push({
          root: noteName(candidateRoot, flats),
          scaleKey: modeKey,
          romanNumeral: roman[degIdx] || (degIdx + 1).toString(),
        })
      }
    }
  }

  // Deduplicate
  const seen = new Set<string>()
  return results.filter(m => {
    const key = `${m.root}-${m.scaleKey}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
