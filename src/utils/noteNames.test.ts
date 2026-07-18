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

  it('uses Si, not Ti — every Latin-script fixed-do language says Si', () => {
    for (const key of ['en', 'es', 'fr', 'it', 'pt', 'tr', 'vi', 'zh', 'id', 'hi'] as const) {
      expect(displayNote('B', 'solfege', key)).toBe('Si')
    }
    // Non-Latin scripts say Si in their own alphabet.
    expect(displayNote('B', 'solfege', 'ru')).toBe('Си')
    expect(displayNote('B', 'solfege', 'uk')).toBe('Сі')
    expect(displayNote('B', 'solfege', 'ja')).toBe('シ')
    expect(displayNote('B', 'solfege', 'ko')).toBe('시')
  })

  it('German-convention languages write B as H and Bb as B', () => {
    for (const key of ['de', 'pl'] as const) {
      expect(displayNote('B', 'letters', key)).toBe('H')
      expect(displayNote('Bb', 'letters', key)).toBe('B')
      expect(displayNote('C', 'letters', key)).toBe('C')
    }
    expect(displayNote('B', 'letters', 'en')).toBe('B')
    expect(displayNote('B', 'letters', 'nl')).toBe('B')
  })

  it('passes unparseable labels through instead of crashing', () => {
    expect(displayNote('?', 'solfege', 'es')).toBe('?')
    expect(displayNote('', 'solfege', 'es')).toBe('')
  })

  it('every language declares a sensible default style', () => {
    const letters = new Set(['en', 'de', 'nl', 'pl', 'zh', 'id', 'hi'])
    for (const l of LANGUAGES) {
      expect(l.defaultStyle).toBe(letters.has(l.key) ? 'letters' : 'solfege')
    }
  })
})
