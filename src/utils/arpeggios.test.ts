import { describe, it, expect } from 'vitest'
import { getArpeggioShapes, getSweepShape, buildRun, RUN_KINDS } from './arpeggios'
import { CHORDS, TUNINGS, noteIndex } from './musicTheory'

const std = TUNINGS['standard']

// The whole point of replacing the old heuristic: shapes must be REAL —
// every note a chord tone, every shape inside a hand span, sweeps genuinely
// rakeable. These tests are the contract.

describe('getArpeggioShapes', () => {
  const chords = ['minor', 'major', 'min7', 'maj7', 'dom7', 'dim7'] as const

  for (const key of chords) {
    describe(`A ${key}`, () => {
      const shapes = getArpeggioShapes('A', CHORDS[key], std, 15)

      it('produces multiple playing positions across the neck', () => {
        expect(shapes.length).toBeGreaterThanOrEqual(2)
      })

      it('every note is genuinely a chord tone', () => {
        const rootPc = noteIndex('A')
        const tones = new Set(CHORDS[key].intervals.map(i => (rootPc + i) % 12))
        for (const sh of shapes) {
          for (const n of sh.notes) {
            expect(tones.has(n.degree), `${sh.id}: ${n.interval} is not in the chord`).toBe(true)
          }
        }
      })

      it('every note is where it claims to be (midi matches string+fret)', () => {
        for (const sh of shapes) {
          for (const n of sh.notes) {
            expect(n.midi).toBe(std.notes[n.stringIndex] + n.fret)
            expect(n.degree).toBe(((n.midi % 12) + 12) % 12)
          }
        }
      })

      it('every shape fits under one hand (no impossible stretches)', () => {
        for (const sh of shapes) {
          const width = sh.span[1] - sh.span[0]
          expect(width, `${sh.id} spans ${width} frets — unplayable`).toBeLessThanOrEqual(7)
        }
      })

      it('every shape covers essentially the whole neck width', () => {
        for (const sh of shapes) {
          const strings = new Set(sh.notes.map(n => n.stringIndex))
          expect(strings.size).toBeGreaterThanOrEqual(5)
        }
      })

      it('every shape is anchored on an actual root', () => {
        const rootPc = noteIndex('A')
        for (const sh of shapes) {
          const midi = std.notes[sh.rootString] + sh.rootFret
          expect(((midi % 12) + 12) % 12).toBe(rootPc)
        }
      })

      it('notes are ordered ascending in pitch', () => {
        for (const sh of shapes) {
          for (let i = 1; i < sh.notes.length; i++) {
            expect(sh.notes[i].midi).toBeGreaterThanOrEqual(sh.notes[i - 1].midi)
          }
        }
      })
    })
  }

  it('contains the root, third and fifth of a minor chord somewhere', () => {
    const shapes = getArpeggioShapes('A', CHORDS['minor'], std, 15)
    const ivs = new Set(shapes.flatMap(s => s.notes.map(n => n.interval)))
    expect(ivs).toContain('R')
    expect(ivs).toContain('b3')
    expect(ivs).toContain('5')
  })
})

describe('getSweepShape', () => {
  it('is genuinely rakeable: exactly one note per string', () => {
    const sweep = getSweepShape('A', CHORDS['minor'], std, 0, 15)
    expect(sweep).not.toBeNull()
    const perString = new Map<number, number>()
    sweep!.notes.forEach(n => perString.set(n.stringIndex, (perString.get(n.stringIndex) ?? 0) + 1))
    expect([...perString.values()].every(c => c === 1)).toBe(true)
    expect(perString.size).toBe(6)
  })

  it('is strictly ascending — you can rake it in one motion', () => {
    const sweep = getSweepShape('A', CHORDS['minor'], std, 0, 15)!
    for (let i = 1; i < sweep.notes.length; i++) {
      expect(sweep.notes[i].midi).toBeGreaterThan(sweep.notes[i - 1].midi)
      expect(sweep.notes[i].stringIndex).toBeGreaterThan(sweep.notes[i - 1].stringIndex)
    }
  })

  it('works for the chords you actually sweep', () => {
    for (const key of ['minor', 'major', 'min7', 'dom7', 'dim7']) {
      const sweep = getSweepShape('A', CHORDS[key], std, 0, 15)
      expect(sweep, `no sweep shape for ${key}`).not.toBeNull()
    }
  })
})

describe('buildRun', () => {
  const shape = getSweepShape('A', CHORDS['minor'], std, 0, 15)!

  it('builds every run kind without dropping notes', () => {
    for (const kind of RUN_KINDS) {
      const run = buildRun(shape, kind)
      expect(run.steps.length, `${kind} produced no steps`).toBeGreaterThan(0)
      expect(run.hint.length).toBeGreaterThan(20)
    }
  })

  it('ascending goes up; descending goes down', () => {
    const up = buildRun(shape, 'ascending').steps.map(s => s.note.midi)
    const down = buildRun(shape, 'descending').steps.map(s => s.note.midi)
    expect(up).toEqual([...up].sort((a, b) => a - b))
    expect(down).toEqual([...down].sort((a, b) => b - a))
  })

  it('up-and-back returns to where it started', () => {
    const steps = buildRun(shape, 'updown').steps
    expect(steps[0].note.midi).toBe(steps[steps.length - 1].note.midi)
  })

  it('a sweep picks in ONE direction across the ascent, then reverses', () => {
    const steps = buildRun(shape, 'sweep').steps
    const half = Math.floor(steps.length / 2)
    // Going up: the pick keeps falling through the strings.
    expect(steps.slice(0, half).every(s => s.pick === 'down')).toBe(true)
    // Coming back down: it keeps rising.
    expect(steps.slice(half + 1).every(s => s.pick === 'up')).toBe(true)
  })

  it('alternate-picked runs actually alternate', () => {
    const steps = buildRun(shape, 'ascending').steps
    for (let i = 1; i < steps.length; i++) {
      expect(steps[i].pick).not.toBe(steps[i - 1].pick)
    }
  })

  it('flags a roll when the same fret repeats on the next string', () => {
    // Rolls are what make or break a sweep — if any shape has one, it must be marked.
    const anyRoll = RUN_KINDS.some(k => buildRun(shape, k).steps.some(s => s.roll))
    const hasSameFretNeighbours = shape.notes.some((n, i) =>
      i > 0 && shape.notes[i - 1].fret === n.fret &&
      Math.abs(shape.notes[i - 1].stringIndex - n.stringIndex) === 1
    )
    expect(anyRoll).toBe(hasSameFretNeighbours)
  })

  it('sequence-in-threes moves in overlapping groups', () => {
    const steps = buildRun(shape, 'sequence3').steps
    expect(steps.length).toBeGreaterThan(shape.notes.length)
  })
})
