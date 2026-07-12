import { describe, it, expect } from 'vitest'
import { getScaleInsight, getChordInsight, chordsInScale, chordCoverage } from './theory'
import { SCALES, getDiatonicChords, intervalName } from './musicTheory'

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
