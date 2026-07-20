import { describe, it, expect } from 'vitest'
import { pickSyncedState, pickSyncedPartial, SYNCED_KEYS } from './cloudSync'
import type { AppState } from '../types/music'

// Minimal fixture: every field pickSyncedState might read, plus a field it
// must NOT leak (audioEngine-facing droneVolume) to prove the picker is a
// real allowlist, not an accidental full-state passthrough.
function fixtureState(overrides: Partial<AppState> = {}): AppState {
  return {
    favorites: [{ viewMode: 'scales', root: 'D', key: 'dorian' }],
    practiceStreak: 5,
    lastPracticeDate: '2026-07-16',
    intervalColors: { R: '#fff' },
    tuningKey: 'standard',
    noteStyle: 'letters',
    theme: 'dark',
    colorTheme: 'obsidian',
    language: 'en',
    droneVolume: 2, // not in SYNCED_KEYS — must not appear in the output
    ...overrides,
  } as AppState
}

describe('pickSyncedState', () => {
  it('picks exactly the SYNCED_KEYS fields, nothing else', () => {
    const picked = pickSyncedState(fixtureState())
    expect(Object.keys(picked).sort()).toEqual([...SYNCED_KEYS].sort())
    expect(picked).not.toHaveProperty('droneVolume')
  })

  it('carries the real values through unchanged', () => {
    const picked = pickSyncedState(fixtureState({ practiceStreak: 12, theme: 'light' }))
    expect(picked.practiceStreak).toBe(12)
    expect(picked.theme).toBe('light')
  })

  it('preserves an empty favorites list rather than dropping the key', () => {
    const picked = pickSyncedState(fixtureState({ favorites: [] }))
    expect(picked.favorites).toEqual([])
  })
})

// The untrusted-input side: what the API stores and what the pull path
// merges both flow through this — it must survive hostile shapes.
describe('pickSyncedPartial', () => {
  it('keeps only whitelisted keys from a payload with extras', () => {
    const picked = pickSyncedPartial({ theme: 'light', droneVolume: 9, __proto__x: 1, evil: 'x' })
    expect(picked).toEqual({ theme: 'light' })
  })

  it('returns an empty partial for non-objects, null, and arrays', () => {
    expect(pickSyncedPartial(null)).toEqual({})
    expect(pickSyncedPartial(undefined)).toEqual({})
    expect(pickSyncedPartial('theme')).toEqual({})
    expect(pickSyncedPartial(42)).toEqual({})
    expect(pickSyncedPartial([{ theme: 'light' }])).toEqual({})
  })

  it('keeps a partial subset without inventing missing keys', () => {
    const picked = pickSyncedPartial({ practiceStreak: 3, language: 'fr' })
    expect(picked).toEqual({ practiceStreak: 3, language: 'fr' })
    expect(Object.keys(picked)).toHaveLength(2)
  })

  it('round-trips a full pickSyncedState output untouched', () => {
    const full = pickSyncedState(fixtureState())
    expect(pickSyncedPartial(full)).toEqual(full)
  })
})
