# 04 · Music theory engine (`src/utils/musicTheory.ts`)

A **pure, deterministic, tested** library. No React, no audio, no DOM. This is
the source of truth for every note and position on the neck. Its tests live in
`musicTheory.test.ts` (the app suite is ~305 tests across nine files) — treat
them as the contract and keep them green.

## Note representation (project-wide)

- **Pitch classes** — integers `0–11` (`C=0 … B=11`). Used for `degree`,
  `intervalName` inputs, and the `Set<number>` note collections.
- **MIDI numbers** — absolute pitch. `TUNINGS[*].notes` and `FretNote.midi` are
  MIDI (standard low E = 40). `octave = Math.floor(midi/12) - 1`.
- **Intervals** — semitone counts `0–11`, labeled via `intervalName`:
  `R, b2, 2, b3, 3, b5, 5, b6, 6, b7, 7` (`4` and `b5` at indices 5/6).
- **Spelling** — `NOTE_NAMES` (sharps) vs `NOTE_NAMES_FLAT` (flats) in
  `types/music.ts`; `useFlats(root)` picks the spelling per key.

## Data tables (keyed records)

```ts
SCALES:  Record<string, ScaleDef>   // 23 scales
CHORDS:  Record<string, ChordDef>   // 25 chords
TUNINGS: Record<string, Tuning>     // 8 tunings
```
```ts
interface ScaleDef { name: string; intervals: number[]; category: string }
interface ChordDef { name: string; suffix: string; intervals: number[]; category: string }
interface Tuning  { name: string; notes: number[]; labels: string[] } // notes = MIDI low→high

// examples:
SCALES['dorian']    = { name:'Dorian',     intervals:[0,2,3,5,7,9,10], category:'Major Modes' }
CHORDS['maj7']      = { name:'Major 7th',   suffix:'maj7', intervals:[0,4,7,11], category:'Sevenths' }
TUNINGS['standard'] = { name:'Standard', notes:[40,45,50,55,59,64], labels:['E','A','D','G','B','E'] }
```
- Scale categories: `Major Modes`, `Pentatonic & Blues`, `Minor Variants`, `Exotic`.
- Chord categories: `Triads`, `Sevenths`, `Extended`. Extended chords use
  intervals **>11** (`add9 = [0,4,7,14]`, `dom13 = [0,4,7,10,14,21]`); `%12`
  collapses them to pitch classes when needed.
- `suffix` builds display names: root + suffix → `"Cmaj7"`.

## Exported types

```ts
interface FretNote {          // one cell of the rendered board
  note: string; octave: number; midi: number
  interval: number            // semitones from selected root, 0–11
  intervalName: string        // "R", "b3", …
  degree: number              // pitch class 0–11
  isInScale: boolean; isRoot: boolean
  stringIndex: number; fret: number
}
interface DiatonicChord {
  root: string; rootDegree: number   // 0-based scale degree
  romanNumeral: string               // quality-adjusted: "I","ii","vii°","iiiø","V+"
  chordKey: string; chordDef: ChordDef
  fullName: string                   // root + suffix, e.g. "Dm7"
}
interface FretPosition {             // technique-pattern cell
  stringIndex: number; fret: number; degree: number
  intervalIndex: number              // scale-degree (3NPS) or chord-tone index
}
interface RelatedMode { root: string; scaleKey: string; romanNumeral: string }
```

## Functions

**Notes / labels**
```ts
noteIndex(name): number            // note name → pitch class 0–11 (handles enharmonics)
noteName(index, preferFlats?): string
useFlats(root): boolean
intervalName(semitones): string    // → "R".."7" (mod 12), else "?"
formulaString(intervals): string   // → "R - 3 - 5 - 7"
```

**Note sets**
```ts
getScaleNotes(root, scale): Set<number>   // pitch classes of the scale
getChordNotes(root, chord): Set<number>   // pitch classes of the chord (mod 12)
```

**The board**
```ts
computeFretboard(tuning, root, activeNotes: Set<number>, numFrets = 15): FretNote[][]
```
Builds the `[stringIndex][fret]` grid of annotated `FretNote`s: per cell computes
MIDI (`tuning.notes[s] + f`), pitch class, octave, interval-from-root, and
`isInScale` (membership in `activeNotes`). This is what `<Fretboard/>` renders.

**Harmony**
```ts
getDiatonicChords(root, scale): DiatonicChord[][]   // ← see structure note
getCompatibleScales(chordRoot, chord): { key:string; name:string }[]
getRelatedModes(root, scaleKey): RelatedMode[]      // modes with identical pitch-class set
```

**Backing harmony**
```ts
chordIntervalsForScale(scaleKey): number[]
  // The chord a mode is idiomatically played against — tertian stacking of the
  // scale's own 1-3-5-7 degrees (Dorian → min7, Lydian → maj7, Locrian →
  // half-dim7, Harmonic/Melodic Minor → min-maj7). Pentatonics/blues use a
  // small override table. Powers backing modes 'chord'/'arp' in Study; Flow
  // concepts override it with their hand-picked `chordKey`.
```

**Chord voicings (playable grips)**
```ts
interface ChordVoicing { frets: (number|null)[]; baseFret: number } // null = muted
getChordVoicings(root, chord, tuning, numFrets = 15): ChordVoicing[]
```
Deterministic search for **actual grips** — one fret per string, muted strings
only as a bottom-consecutive prefix, root in the bass (E/A/D strings only),
everything inside a 4-fret window, and **at most four fingers where a barre
across the lowest fretted fret counts as one**. That last constraint is what
makes the search converge on the **CAGED system by itself** — the test suite
asserts all five major forms and the E/A/D minor forms for **all twelve roots**,
derived from anchor-fret math, not a per-key table.

Hard-learned invariants, each guarding a real regression:
- Keep the best voicing **per bass string per window**, not per window — for
  some roots two CAGED forms share a fret window (B major's G-form and C-form).
- **Open strings only in the nut window.** Injected into higher windows they
  create barre+stray-open hybrids that outscore every real barre by one point.
- **No result cap** — a top-5 cut was silently dropping the D-form (~fret 10).

Drives `chordPosition` / the position bar's grip browsing in `App.tsx` (the
grip renders via `Fretboard`'s `highlightedPositions` technique overlay).

**Positions & technique**
```ts
getScalePositions(root, scale, tuning, numFrets = 15): [number, number][]
  // one CAGED-style [startFret,endFret] window per scale interval, ≥4 wide, clamped.
compute3NPSPattern(root, scale, tuning, patternIndex, numFrets = 24): FretPosition[]
  // 3-notes-per-string shape starting from the patternIndex-th scale degree.
computeSweepShape(root, chord, tuning, inversion = 0, numFrets = 24): FretPosition[]
  // compact sweep arpeggio (one tone/string), scored best-first, returns inversion-th shape.
computeTappingPattern(root, chord, tuning, inversion = 0, numFrets = 24): FretPosition[]
  // 2–3 wide-spaced (≥3 fret) chord tones per string. NOTE: `inversion` is currently unused.
```

## ⚠️ `getDiatonicChords` return structure (read before using)

Returns `DiatonicChord[][]` — **outer = scale degree, inner = chord variants on
that degree.**

- **Outer array:** one entry per scale degree (index = `rootDegree`). Length =
  `min(7, scale.intervals.length)` — a pentatonic yields **5**, not 7. `result[0]`
  is the tonic degree.
- **Inner array:** every chord in `CHORDS` whose tones are all diatonic to the
  scale, built on that degree. Can be empty; length varies.
- **`inner[0]` is the *primary* (simplest) chord** for the degree — sorted by a
  `CHORD_PRIORITY` tier (0 = basic triads → 5 = 11th/13th). Consumers (e.g.
  `App.tsx`'s `primaryChords`) take `deg[0]` as the degree's representative chord,
  and the Roman-numeral casing/symbols (`ii`, `vii°`, `iiiø`, `V+`) come from that
  primary chord's quality.

So `getDiatonicChords(root, scale).map(d => d[0])` = the classic one-chord-per-
degree diatonic set; the full inner arrays give every voicing option per degree.

## Gotchas

- **Extended chords exceed one octave** — always `% 12` before comparing to a
  pitch-class set.
- Technique generators default to `numFrets = 24` (not 15) — pass the app's
  `numFrets` explicitly, as `App.tsx` does.
- Adding a scale/chord = one entry in `SCALES`/`CHORDS`. It automatically flows
  into pickers, diatonic harmony, positions, and audio. Add a test.
