import { describe, it, expect } from 'vitest'
import { displayNote, LANGUAGES } from './noteNames'

describe('displayNote', () => {
  it('letters mode passes everything through untouched', () => {
    for (const n of ['C', 'C#', 'Eb', 'F#', 'Bb', 'B']) {
      expect(displayNote(n, 'letters', 'es')).toBe(n)
    }
  })

  it('maps the naturals to fixed-do solfège', () => {
    const es = ['C', 'D', 'E', 'F', 'G', 'A', 'B'].map(n => displayNote(n, 'solfege', 'es'))
    expect(es).toEqual(['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'])
  })

  it('keeps accidentals attached to the solfège name', () => {
    expect(displayNote('C#', 'solfege', 'es')).toBe('Do#')
    expect(displayNote('Eb', 'solfege', 'es')).toBe('Mib')
    expect(displayNote('F#', 'solfege', 'it')).toBe('Fa#')
  })

  it('respects per-language accents (Ré is not Re to a French reader)', () => {
    expect(displayNote('D', 'solfege', 'fr')).toBe('Ré')
    expect(displayNote('D', 'solfege', 'pt')).toBe('Ré')
    expect(displayNote('C', 'solfege', 'pt')).toBe('Dó')
    expect(displayNote('F', 'solfege', 'pt')).toBe('Fá')
    expect(displayNote('A', 'solfege', 'pt')).toBe('Lá')
  })

  it('uses Si, not Ti — all five languages here say Si', () => {
    for (const { key } of LANGUAGES) {
      expect(displayNote('B', 'solfege', key)).toBe('Si')
    }
  })

  it('passes unparseable labels through instead of crashing', () => {
    expect(displayNote('?', 'solfege', 'es')).toBe('?')
    expect(displayNote('', 'solfege', 'es')).toBe('')
  })

  it('every language declares a sensible default style', () => {
    expect(LANGUAGES.find(l => l.key === 'en')!.defaultStyle).toBe('letters')
    for (const l of LANGUAGES.filter(l => l.key !== 'en')) {
      expect(l.defaultStyle).toBe('solfege')
    }
  })
})
