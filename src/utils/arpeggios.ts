// ─── Arpeggio Engine ────────────────────────────────────────────────
// Real shapes, and real ways to move through them.
//
// The old computeSweepShape was a greedy heuristic: always start on the low E,
// grab the nearest chord tone within 3 frets, one note per string. That can't
// produce an idiomatic shape and it produced no runs at all.
//
// This engine is built the way a guitarist actually thinks:
//
//   1. SHAPES are anchored at the ROOT. Every root on the neck opens a playing
//      position (this is what CAGED formalises). A shape is the chord tones
//      that fall inside that position's fret window.
//   2. RUNS are how you move through a shape: ascend it, descend it, sweep it,
//      sequence it. The shape is geography; the run is the exercise.
//
// Everything is COMPUTED from tuning + chord intervals. Nothing is a hardcoded
// fret. Shapes describe interval relationships; the engine turns them into
// positions for whatever root, chord and tuning you hand it.

import type { ChordDef, Tuning } from '../types/music'
import { noteIndex, intervalName } from './musicTheory'

export interface ArpNote {
  stringIndex: number    // 0 = lowest string
  fret: number
  midi: number
  degree: number         // pitch class 0–11
  interval: string       // 'R', 'b3', '5', 'b7' …
}

export interface ArpShape {
  id: string
  name: string           // "Position 3 · root on A string"
  rootFret: number       // the root this position is anchored to
  rootString: number
  notes: ArpNote[]       // strictly ascending in pitch
  span: [number, number] // lowest → highest fret used
  sweepable: boolean     // exactly one note per string → rakeable in one motion
}

export type RunKind = 'ascending' | 'descending' | 'updown' | 'sweep' | 'sequence3'

export interface RunStep {
  note: ArpNote
  pick: 'down' | 'up'
  roll: boolean          // same fret as the previous note, next string → roll the finger
}

export interface Run {
  kind: RunKind
  name: string
  hint: string           // what this run is actually training
  steps: RunStep[]
}

// A playing position is a hand span. Five frets is the honest width of a hand
// without shifting; the top string gets a little stretch, which is exactly what
// real sweep shapes do.
const WINDOW = 5
const TOP_STRETCH = 2

// ─── Shapes ───

export function getArpeggioShapes(
  root: string,
  chord: ChordDef,
  tuning: Tuning,
  numFrets = 15
): ArpShape[] {
  const rootPc = noteIndex(root)
  const tones = new Set(chord.intervals.map(i => (rootPc + i) % 12))
  const numStrings = tuning.notes.length

  const noteAt = (s: number, f: number): ArpNote | null => {
    const midi = tuning.notes[s] + f
    const pc = ((midi % 12) + 12) % 12
    if (!tones.has(pc)) return null
    return {
      stringIndex: s,
      fret: f,
      midi,
      degree: pc,
      interval: intervalName(((pc - rootPc) % 12 + 12) % 12),
    }
  }

  // Anchor a position at every root on the two lowest strings — that's how the
  // five CAGED positions actually arise.
  const anchors: { s: number; f: number }[] = []
  for (let s = 0; s < Math.min(2, numStrings); s++) {
    for (let f = 0; f <= numFrets; f++) {
      const midi = tuning.notes[s] + f
      if (((midi % 12) + 12) % 12 === rootPc) anchors.push({ s, f })
    }
  }

  const shapes: ArpShape[] = []
  const seen = new Set<string>()

  for (const a of anchors) {
    const lo = Math.max(0, a.f - 1)
    const hi = Math.min(numFrets, lo + WINDOW - 1)

    const notes: ArpNote[] = []
    for (let s = 0; s < numStrings; s++) {
      // The top string is allowed a stretch — this is the classic sweep reach.
      const stringHi = s === numStrings - 1 ? Math.min(numFrets, hi + TOP_STRETCH) : hi
      for (let f = lo; f <= stringHi; f++) {
        const n = noteAt(s, f)
        if (n) notes.push(n)
      }
    }

    // A shape has to actually cover the neck to be worth practising.
    const stringsCovered = new Set(notes.map(n => n.stringIndex)).size
    if (stringsCovered < numStrings - 1) continue

    notes.sort((x, y) => x.midi - y.midi || x.stringIndex - y.stringIndex)

    const frets = notes.map(n => n.fret)
    const span: [number, number] = [Math.min(...frets), Math.max(...frets)]

    const perString = new Map<number, number>()
    notes.forEach(n => perString.set(n.stringIndex, (perString.get(n.stringIndex) ?? 0) + 1))
    const sweepable = [...perString.values()].every(c => c === 1)

    const key = `${span[0]}-${span[1]}-${notes.length}`
    if (seen.has(key)) continue
    seen.add(key)

    shapes.push({
      id: `arp-${a.s}-${a.f}`,
      name: `Root on ${stringLabel(a.s, tuning)} · fret ${a.f}`,
      rootFret: a.f,
      rootString: a.s,
      notes,
      span,
      sweepable,
    })
  }

  return shapes.sort((x, y) => x.span[0] - y.span[0])
}

// One note per string, strictly ascending: the shape you can rake the pick
// across in a single motion. This is what "sweep" actually means.
export function getSweepShape(
  root: string,
  chord: ChordDef,
  tuning: Tuning,
  positionIndex = 0,
  numFrets = 15
): ArpShape | null {
  const all = getArpeggioShapes(root, chord, tuning, numFrets)
  if (all.length === 0) return null

  const sweeps: ArpShape[] = []
  for (const shape of all) {
    const byString = new Map<number, ArpNote[]>()
    for (const n of shape.notes) {
      if (!byString.has(n.stringIndex)) byString.set(n.stringIndex, [])
      byString.get(n.stringIndex)!.push(n)
    }

    // Walk up the strings, always taking the lowest chord tone that keeps the
    // line ascending. That's the sweep path.
    const picked: ArpNote[] = []
    let prevMidi = -Infinity
    let ok = true
    for (let s = 0; s < tuning.notes.length; s++) {
      const cands = (byString.get(s) ?? [])
        .filter(n => n.midi > prevMidi)
        .sort((a, b) => a.midi - b.midi)
      if (cands.length === 0) { ok = false; break }
      picked.push(cands[0])
      prevMidi = cands[0].midi
    }
    if (!ok || picked.length !== tuning.notes.length) continue

    const frets = picked.map(n => n.fret)
    sweeps.push({
      ...shape,
      id: `${shape.id}-sweep`,
      notes: picked,
      span: [Math.min(...frets), Math.max(...frets)],
      sweepable: true,
    })
  }

  if (sweeps.length === 0) return null
  return sweeps[positionIndex % sweeps.length]
}

function stringLabel(s: number, tuning: Tuning): string {
  return tuning.labels[s] ?? `string ${s + 1}`
}

// ─── Runs — how you actually move through a shape ───

export function buildRun(shape: ArpShape, kind: RunKind): Run {
  const asc = [...shape.notes].sort((a, b) => a.midi - b.midi)

  const withPicking = (notes: ArpNote[], sweepPicking: boolean): RunStep[] => {
    const steps: RunStep[] = []
    for (let i = 0; i < notes.length; i++) {
      const n = notes[i]
      const prev = notes[i - 1]

      // A roll is the same fret on the next string — you flatten one finger
      // across both rather than lifting. Getting this wrong is what makes
      // sweeps sound like mush.
      const roll = Boolean(
        prev && prev.fret === n.fret && Math.abs(prev.stringIndex - n.stringIndex) === 1
      )

      let pick: 'down' | 'up'
      if (sweepPicking) {
        // In a real sweep the pick keeps travelling in one direction.
        pick = !prev ? 'down' : n.stringIndex > prev.stringIndex ? 'down'
             : n.stringIndex < prev.stringIndex ? 'up'
             : (steps[i - 1]?.pick ?? 'down')
      } else {
        pick = i % 2 === 0 ? 'down' : 'up' // alternate picking
      }
      steps.push({ note: n, pick, roll })
    }
    return steps
  }

  switch (kind) {
    case 'ascending':
      return {
        kind, name: 'Ascending',
        hint: 'Straight up the shape. Alternate picking. Say the interval out loud as you hit it.',
        steps: withPicking(asc, false),
      }

    case 'descending':
      return {
        kind, name: 'Descending',
        hint: 'Straight down. Descending is where most people fall apart — go slower than feels necessary.',
        steps: withPicking([...asc].reverse(), false),
      }

    case 'updown':
      return {
        kind, name: 'Up and back',
        hint: 'Up, then straight back down without stopping at the top. The turnaround is the hard part.',
        steps: withPicking([...asc, ...[...asc].reverse().slice(1)], false),
      }

    case 'sweep':
      return {
        kind, name: 'Sweep',
        hint: 'One pick stroke across the strings — down on the way up, up on the way down. Let the hand fall; don\'t pick each note.',
        steps: withPicking([...asc, ...[...asc].reverse().slice(1)], true),
      }

    case 'sequence3': {
      // Groups of three: 1-2-3, 2-3-4, 3-4-5 … the classic way to stop an
      // arpeggio sounding like an exercise and start sounding like a line.
      const seq: ArpNote[] = []
      for (let i = 0; i + 2 < asc.length; i++) {
        seq.push(asc[i], asc[i + 1], asc[i + 2])
      }
      return {
        kind, name: 'In threes',
        hint: 'Groups of three, shifting up one note each time. This is what turns an arpeggio into a phrase.',
        steps: withPicking(seq.length ? seq : asc, false),
      }
    }
  }
}

export const RUN_KINDS: RunKind[] = ['ascending', 'descending', 'updown', 'sweep', 'sequence3']
