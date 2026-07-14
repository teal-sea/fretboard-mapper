import { describe, it, expect, beforeEach } from 'vitest'
import { loadPersistedState, savePersistedState } from './persist'
import type { AppState } from '../types/music'

const KEY = 'fm.appState'

describe('persisted-state palette migration', () => {
  beforeEach(() => localStorage.clear())

  it('drops a stored palette that predates the version stamp', () => {
    // What a pre-logo-palette visitor has in localStorage: no version field,
    // and the old teal-era colors snapshotted forever.
    localStorage.setItem(KEY, JSON.stringify({
      keyRoot: 'D',
      intervalColors: { R: '#f59e0b', b3: '#0ea5e9' },
    }))
    const loaded = loadPersistedState()!
    expect(loaded.keyRoot).toBe('D')                 // real prefs survive
    expect(loaded.intervalColors).toBeUndefined()    // stale palette does not
  })

  it('keeps the palette once it carries the current version', () => {
    savePersistedState({ keyRoot: 'A', intervalColors: { R: '#123456' } } as unknown as AppState)
    const loaded = loadPersistedState()!
    expect(loaded.intervalColors).toEqual({ R: '#123456' })
  })

  it('never leaks the version stamp into AppState', () => {
    savePersistedState({ keyRoot: 'A' } as unknown as AppState)
    expect('__paletteV' in loadPersistedState()!).toBe(false)
  })

  it('still resets transient playback fields', () => {
    savePersistedState({ progressionPlaying: true, progressionIndex: 3 } as unknown as AppState)
    const loaded = loadPersistedState()!
    expect(loaded.progressionPlaying).toBe(false)
    expect(loaded.progressionIndex).toBe(-1)
  })
})
