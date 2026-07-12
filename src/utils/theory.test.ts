import { describe, it, expect } from 'vitest'
import {
  getScaleInsight, getChordInsight, chordsInScale, chordCoverage,
  getObjective, plainScaleName, PRIMER,
} from './theory'
import { SCALES, getDiatonicChords, intervalName, noteIndex, getScaleNotes } from './musicTheory'
import { CONCEPTS } from './concepts'
import { intervalSemitones } from './musicTheory'

// ─── The contradiction bug ───
// The app told the user "find F#, the glowing ones" while rendering a neck
// with no glowing F# on it. That is worse than useless — it's a lie. These
// guarantee the instruction and the neck can never disagree.
describe('the neck can never contradict the instruction', () => {
  it('every concept\'s focus note is actually IN the scale being displayed', () => {
    for (const c of CONCEPTS) {
      const scale = SCALES[c.mode]
      const semis = intervalSemitones(c.focus)
      expect(semis, `${c.id}: focus "${c.focus}" is not a real interval`).not.toBeNull()

      const focusPc = (noteIndex(c.root) + semis!) % 12
      const scalePcs = getScaleNotes(c.root, scale)
      expect(
        scalePcs.has(focusPc),
        `${c.id}: told to find the ${c.focus}, but that note isn't in ${c.root} ${c.mode}`
      ).toBe(true)
    }
  })

  it('every concept has a plain-English explanation of its scale', () => {
    for (const c of CONCEPTS) {
      expect(
        plainScaleName(c.mode),
        `${c.id}: no plain-English description for "${c.mode}" — a newcomer would be lost`
      ).not.toBeNull()
    }
  })
})

describe('getObjective', () => {
  it('states the note to find, in plain words, without assuming jargon', () => {
    const o = getObjective({
      root: 'A', scaleKey: 'dorian', focusInterval: '6', focusNote: 'F#', hasShape: false,
    })
    expect(o).toContain('F#')          // the actual note
    expect(o).toContain('drone')       // why there's a sound
    expect(o).toContain('minor')       // what dorian IS, in plain words
    expect(o).not.toContain('undefined')
  })

  it('mentions the shape only when there is one', () => {
    const withShape = getObjective({
      root: 'A', scaleKey: 'dorian', focusInterval: '6', focusNote: 'F#', hasShape: true,
    })
    const without = getObjective({
      root: 'A', scaleKey: 'dorian', focusInterval: '6', focusNote: 'F#', hasShape: false,
    })
    expect(withShape).toContain('sweep')
    expect(without).not.toContain('sweep')
  })

  it('produces a usable objective for every concept in the curriculum', () => {
    for (const c of CONCEPTS) {
      const o = getObjective({
        root: c.root, scaleKey: c.mode, focusInterval: c.focus,
        focusNote: 'X', hasShape: Boolean(c.technique),
      })
      expect(o.length, `${c.id}: objective too thin`).toBeGreaterThan(80)
    }
  })
})

describe('PRIMER', () => {
  it('answers the questions a confused first-timer actually asks', () => {
    const qs = PRIMER.map(p => p.q.toLowerCase()).join(' ')
    expect(qs).toContain('what am i actually doing')
    expect(qs).toContain('listening for')
    expect(PRIMER.every(p => p.a.length > 60)).toBe(true)
  })
})

// The theory layer states musical FACTS. If a fact is wrong, it teaches a lie.
// These lock the facts down; the prose is free to change.

describe('getScaleInsight', () => {
  it('names the characteristic note of every mode it claims to know', () => {
    const modes = [
      'ionian', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'aeolian', 'locrian',
      'harmonic_minor', 'melodic_minor', 'minor_penta', 'major_penta', 'blues',
    ]
    for (const m of modes) {
      const ins = getScaleInsight('A', m)
      expect(ins, `no insight for ${m}`).not.toBeNull()
      // The focus interval must actually exist in the scale — you cannot ask
      // someone to hear a note that isn't there.
      const names = SCALES[m].intervals.map(i => intervalName(i % 12))
      expect(names, `${m}: focus ${ins!.focus} not in scale`).toContain(ins!.focus)
    }
  })

  it('resolves the characteristic interval to a real note name in the key', () => {
    // A Dorian's 6 is F#
    expect(getScaleInsight('A', 'dorian')!.body).toContain('F#')
    // G Mixolydian's b7 is F
    expect(getScaleInsight('G', 'mixolydian')!.body).toContain('F')
    // C Lydian's raised 4th is the pitch F#/Gb. The engine prefers flats for
    // C, so it spells it Gb — enharmonically correct, and either is acceptable
    // here. (Pre-existing spelling behaviour of useFlats(); not this layer's job.)
    const lydian = getScaleInsight('C', 'lydian')!.body
    expect(lydian.includes('F#') || lydian.includes('Gb')).toBe(true)
  })

  it('returns null for a scale it has no opinion about', () => {
    expect(getScaleInsight('A', 'not_a_scale')).toBeNull()
  })
})

describe('getChordInsight', () => {
  const scale = SCALES['aeolian']
  const degrees = getDiatonicChords('A', scale)
  const tonic = degrees[0][0] // Am

  it('names the chord and its roman numeral', () => {
    const six = degrees[5][0] // F major — the VI in A minor
    const ins = getChordInsight('A', 'aeolian', six, tonic)
    expect(ins).not.toBeNull()
    expect(ins!.title).toContain(six.fullName)
    expect(ins!.body).toContain(six.romanNumeral)
  })

  it('computes shared tones with home correctly (F major shares A and C with Am)', () => {
    const six = degrees[5][0]
    const ins = getChordInsight('A', 'aeolian', six, tonic)!
    // F major = F A C.  Am = A C E.  Shared: A and C.
    expect(ins.body).toContain('A')
    expect(ins.body).toContain('C')
  })

  it('works for every diatonic chord in the key without throwing', () => {
    for (const deg of degrees) {
      for (const dc of deg) {
        const ins = getChordInsight('A', 'aeolian', dc, tonic)
        expect(ins, `${dc.fullName} produced no insight`).not.toBeNull()
        expect(ins!.body.length).toBeGreaterThan(20)
      }
    }
  })
})

describe('chordCoverage', () => {
  it('counts how many chord tones live inside the scale', () => {
    const degrees = getDiatonicChords('A', SCALES['aeolian'])
    const am = degrees[0][0]
    // A diatonic chord is by definition entirely inside its scale.
    expect(chordCoverage(am, 'A', 'aeolian')).toBe(3)
  })
})

describe('chordsInScale', () => {
  it('finds many landable chords inside a 7-note scale', () => {
    expect(chordsInScale('A', 'aeolian')).toBeGreaterThan(10)
  })

  it('finds fewer inside a pentatonic (fewer notes, fewer chords fit)', () => {
    expect(chordsInScale('A', 'minor_penta'))
      .toBeLessThan(chordsInScale('A', 'aeolian'))
  })

  it('returns 0 for an unknown scale', () => {
    expect(chordsInScale('A', 'nope')).toBe(0)
  })
})
