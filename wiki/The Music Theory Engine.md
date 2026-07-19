# The Music Theory Engine

`src/utils/musicTheory.ts` (~700 lines) + satellites. Pure, deterministic,
tested (`musicTheory.test.ts` is the biggest test file in the repo). No
React, no audio, no DOM — a library. This is [[The Golden Rules]] #2 made
flesh: every note anywhere in the product is computed here, never typed.

## Core tables
- `SCALES` — every scale/mode keyed by slug (`'dorian'`, `'harmonic_minor'`…),
  with intervals + display name.
- `CHORDS` — chord types with interval formulas.
- `TUNINGS` — keyed tunings with per-string labels.

## Core functions (the ones everything calls)
- `getScaleNotes(root, scale)` / `getChordNotes(root, chord)` → `Set<number>`
  of pitch classes.
- `computeFretboard(tuning, root, activeNotes, numFrets)` → `FretNote[][]`
  (per string, per fret: note name, midi, interval, isInScale). This is the
  `board` every view renders; the practice hooks build variant boards
  (blank/target) with the same call.
- `getScalePositions` / `getChordVoicings` / `getDiatonicChords` /
  `chordIntervalsForScale` — positions, grips, harmony.
- `compute3NPSPattern` / `computeSweepShape` / `computeTappingPattern` —
  technique patterns (Study's Technique tab).
- `noteIndex` / `noteName` / `useFlats` / `intervalName` / `formulaString` —
  naming and spelling (flats follow the key).

## Satellites (same purity rules)
- `utils/theory.ts` — "why it works" prose (`getScaleInsight`,
  `chordsInScale`, `getObjective`).
- `utils/arpeggios.ts` — sweep/tapping run shapes (`getSweepShape`,
  `getArpeggioShapes`, `buildRun`) feeding [[The Practice Engines|useRun]].
- `utils/modes.ts` — same-note sibling modes (`getSameNoteModes`,
  `recontextualise`) powering Flow drift and the Twist.
- `utils/walk.ts` — walk positions and the claim state machine.
- `utils/flowEngine.ts` — Flow's drift-destination picker + session prose.
- `utils/noteNames.ts` — letters vs solfège per language (display only —
  the engine speaks letters forever; `dn()` translates at render time).

## Consumers to remember
The React app, the practice hooks, AND the whole [[SSG and SEO Surface]] —
`scripts/*.ts` import these same functions at build time, which is why 1,700+
static pages can claim "computed, never hand-typed" in `public/llms.txt`.

## Rules
- Pitch classes 0–11 in and out. MIDI is [[The Audio Engine]]'s dialect only.
- New theory = new tested function here, not inline math in a component.
- Don't add React/audio imports. If you need sound, return data and let the
  caller drive the audio engine.
