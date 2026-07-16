import { describe, it, expect } from 'vitest'
import { canonicalRoot, parseUrlState, serializeUrlState } from './urlState'

describe('canonicalRoot', () => {
  it('accepts plain naturals in any case', () => {
    expect(canonicalRoot('A')).toBe('A')
    expect(canonicalRoot('e')).toBe('E')
  })

  it('accepts sharps and flats', () => {
    expect(canonicalRoot('F#')).toBe('F#')
    expect(canonicalRoot('f#')).toBe('F#')
    expect(canonicalRoot('Bb')).toBe('Bb')
    expect(canonicalRoot('bb')).toBe('Bb')
  })

  it('accepts word forms used by mode-page slugs', () => {
    expect(canonicalRoot('f-sharp')).toBe('F#')
    expect(canonicalRoot('d-flat')).toBe('Db')
    expect(canonicalRoot('F sharp')).toBe('F#')
    expect(canonicalRoot('e flat')).toBe('Eb')
  })

  it('rejects non-notes', () => {
    expect(canonicalRoot('H')).toBeNull()
    expect(canonicalRoot('dorian')).toBeNull()
    expect(canonicalRoot('')).toBeNull()
    expect(canonicalRoot('C##')).toBeNull()
  })
})

describe('parseUrlState', () => {
  it('parses key and mode into full key selection', () => {
    expect(parseUrlState('?key=A&mode=dorian')).toEqual({
      keyRoot: 'A',
      selectedScaleRoot: 'A',
      keyQuality: 'dorian',
      selectedScaleKey: 'dorian',
      viewMode: 'scales',
    })
  })

  it('handles encoded sharps', () => {
    expect(parseUrlState('?key=F%23&mode=lydian').keyRoot).toBe('F#')
  })

  it('drops invalid values instead of guessing', () => {
    expect(parseUrlState('?key=H&mode=notascale')).toEqual({})
    expect(parseUrlState('?key=A&mode=notascale')).toEqual({
      keyRoot: 'A',
      selectedScaleRoot: 'A',
    })
  })

  it('accepts any SCALES key as mode', () => {
    expect(parseUrlState('?key=E&mode=phrygian_dom').keyQuality).toBe('phrygian_dom')
  })

  it('parses a valid app mode and ignores junk', () => {
    expect(parseUrlState('?app=study').appMode).toBe('study')
    expect(parseUrlState('?app=nonsense').appMode).toBeUndefined()
  })

  it('parses lang with its note-style default, like the in-app switcher', () => {
    expect(parseUrlState('?lang=es')).toEqual({ language: 'es', noteStyle: 'solfege' })
    expect(parseUrlState('?lang=en')).toEqual({ language: 'en', noteStyle: 'letters' })
    expect(parseUrlState('?lang=de')).toEqual({})
  })

  it('returns empty partial for empty search', () => {
    expect(parseUrlState('')).toEqual({})
  })
})

describe('serializeUrlState', () => {
  it('round-trips through parseUrlState', () => {
    const search = serializeUrlState({ keyRoot: 'F#', keyQuality: 'mixolydian' })
    const parsed = parseUrlState(search)
    expect(parsed.keyRoot).toBe('F#')
    expect(parsed.keyQuality).toBe('mixolydian')
  })
})
