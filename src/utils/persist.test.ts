import { describe, it, expect, beforeEach } from 'vitest'
import { loadPersistedState, savePersistedState } from './persist'
import type { AppState } from '../types/music'

const KEY = 'fm.appState'

describe('persisted-state palette migration', () => {
  beforeEach(() => localStorage.clear())

  it('drops a stored palette AND stale key that predate the version stamps', () => {
    // What an early visitor has in localStorage: no version fields, the old
    // teal-era colors, and whatever exotic key Flow's drift last wandered
    // into (E Phrygian greeted a returning user like they had asked for it).
    localStorage.setItem(KEY, JSON.stringify({
      keyRoot: 'E',
      keyQuality: 'phrygian',
      selectedScaleRoot: 'E',
      selectedScaleKey: 'phrygian',
      numFrets: 12,
      intervalColors: { R: '#f59e0b', b3: '#0ea5e9' },
    }))
    const loaded = loadPersistedState()!
    expect(loaded.numFrets).toBe(12)                 // real prefs survive
    expect(loaded.intervalColors).toBeUndefined()    // stale palette does not
    expect(loaded.keyRoot).toBeUndefined()           // stale key does not
    expect(loaded.keyQuality).toBeUndefined()
    expect(loaded.selectedScaleRoot).toBeUndefined()
    expect(loaded.selectedScaleKey).toBeUndefined()
  })

  it('keeps the palette and key once they carry the current versions', () => {
    savePersistedState({ keyRoot: 'D', keyQuality: 'dorian', intervalColors: { R: '#123456' } } as unknown as AppState)
    const loaded = loadPersistedState()!
    expect(loaded.intervalColors).toEqual({ R: '#123456' })
    expect(loaded.keyRoot).toBe('D')
    expect(loaded.keyQuality).toBe('dorian')
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
