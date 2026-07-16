import { describe, it, expect } from 'vitest'
import { favoriteId, isFavorited, toggleFavorite } from './favorites'

const dorian = { viewMode: 'scales' as const, root: 'D', key: 'dorian' }
const maj7 = { viewMode: 'chords' as const, root: 'C', key: 'maj7' }

describe('favoriteId', () => {
  it('is stable and distinguishes view/root/key', () => {
    expect(favoriteId(dorian)).toBe('scales:D:dorian')
    expect(favoriteId(maj7)).toBe('chords:C:maj7')
  })
})

describe('isFavorited', () => {
  it('finds an exact match', () => {
    expect(isFavorited([dorian], dorian)).toBe(true)
  })

  it('does not match a different root or key', () => {
    expect(isFavorited([dorian], { ...dorian, root: 'E' })).toBe(false)
    expect(isFavorited([dorian], { ...dorian, key: 'aeolian' })).toBe(false)
  })

  it('is false on an empty list', () => {
    expect(isFavorited([], dorian)).toBe(false)
  })
})

describe('toggleFavorite', () => {
  it('adds when absent', () => {
    expect(toggleFavorite([], dorian)).toEqual([dorian])
  })

  it('removes when present', () => {
    expect(toggleFavorite([dorian, maj7], dorian)).toEqual([maj7])
  })

  it('leaves other favorites untouched', () => {
    expect(toggleFavorite([maj7], dorian)).toEqual([maj7, dorian])
  })
})
