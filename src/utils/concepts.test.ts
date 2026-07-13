import { describe, it, expect } from 'vitest'
import { CONCEPTS } from './concepts'
import { SCALES, CHORDS, intervalName } from './musicTheory'
import { NOTE_NAMES } from '../types/music'

// The curriculum is data, and data rots. These guard the pedagogy:
// a concept that tells you to "listen for the 6" is a lie if the mode has no 6.

describe('concept curriculum', () => {
  it('has unique ids', () => {
    const ids = CONCEPTS.map(c => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every concept names a real scale', () => {
    for (const c of CONCEPTS) {
      expect(SCALES[c.mode], `${c.id}: unknown mode "${c.mode}"`).toBeDefined()
    }
  })

  it('every concept names a real root note', () => {
    for (const c of CONCEPTS) {
      expect(NOTE_NAMES.includes(c.root as any), `${c.id}: bad root "${c.root}"`).toBe(true)
    }
  })

  it('every chordKey names a real chord', () => {
    for (const c of CONCEPTS) {
      if (!c.chordKey) continue
      expect(CHORDS[c.chordKey], `${c.id}: unknown chord "${c.chordKey}"`).toBeDefined()
    }
  })

  // The important one: you cannot ask someone to hear a note that isn't there.
  it('the focus interval actually exists in the concept\'s scale', () => {
    for (const c of CONCEPTS) {
      const scale = SCALES[c.mode]
      const names = scale.intervals.map(i => intervalName(i % 12))
      expect(
        names.includes(c.focus),
        `${c.id} (${c.title}): focus "${c.focus}" is not in ${c.mode} [${names.join(' ')}]`
      ).toBe(true)
    }
  })

  it('positions are 1-based and sane', () => {
    for (const c of CONCEPTS) {
      if (c.position === null) continue
      expect(c.position, `${c.id}: position must be >= 1`).toBeGreaterThanOrEqual(1)
      expect(c.position, `${c.id}: position unreasonably high`).toBeLessThanOrEqual(7)
    }
  })

  it('technique concepts carry a pattern index', () => {
    for (const c of CONCEPTS) {
      if (!c.technique) continue
      expect(c.patternIndex, `${c.id}: technique concept needs patternIndex`).toBeDefined()
    }
  })

  // A run concept that can't build a shape would render an empty neck — the
  // user would be told to "play the numbered notes" with no numbers on screen.
  it('every RUN concept resolves to a real, playable run', async () => {
    const { getSweepShape, getArpeggioShapes, buildRun } = await import('./arpeggios')
    const { TUNINGS } = await import('./musicTheory')
    const std = TUNINGS['standard']

    const runConcepts = CONCEPTS.filter(c => c.run)
    expect(runConcepts.length, 'no run concepts at all').toBeGreaterThan(0)

    for (const c of runConcepts) {
      const chord = CHORDS[c.run!.chordKey]
      expect(chord, `${c.id}: unknown chord "${c.run!.chordKey}"`).toBeDefined()

      const shape = c.run!.kind === 'sweep'
        ? getSweepShape(c.root, chord, std, c.run!.shapeIndex ?? 0, 15)
        : getArpeggioShapes(c.root, chord, std, 15)[c.run!.shapeIndex ?? 1]
          ?? getArpeggioShapes(c.root, chord, std, 15)[0]

      expect(shape, `${c.id}: produced no shape — the neck would be empty`).toBeTruthy()

      const run = buildRun(shape!, c.run!.kind)
      expect(run.steps.length, `${c.id}: run has no steps`).toBeGreaterThan(2)

      // Every step must be a real place on a real string.
      for (const s of run.steps) {
        expect(s.note.stringIndex).toBeGreaterThanOrEqual(0)
        expect(s.note.stringIndex).toBeLessThan(6)
        expect(s.note.fret).toBeGreaterThanOrEqual(0)
        expect(s.note.midi).toBe(std.notes[s.note.stringIndex] + s.note.fret)
      }
    }
  })

  it('every concept has copy that says something', () => {
    for (const c of CONCEPTS) {
      expect(c.hook.length, `${c.id}: empty hook`).toBeGreaterThan(8)
      expect(c.listenFor.length, `${c.id}: listenFor too thin`).toBeGreaterThan(30)
    }
  })
})
