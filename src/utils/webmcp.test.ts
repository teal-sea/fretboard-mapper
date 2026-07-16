import { describe, it, expect, beforeEach, vi } from 'vitest'
import { registerWebMcpTools } from './webmcp'
import type { AppState } from '../types/music'

// Minimal AppState stub — only the fields the tools actually touch.
function baseState(overrides: Partial<AppState> = {}): AppState {
  return {
    keyRoot: 'C', keyQuality: 'ionian',
    viewMode: 'scales',
    selectedChordRoot: null, selectedChordKey: null,
    selectedScaleRoot: 'C', selectedScaleKey: 'ionian',
    progressionPlaying: false,
    ...overrides,
  } as AppState
}

describe('registerWebMcpTools', () => {
  it('is a no-op when document.modelContext is unsupported', () => {
    // jsdom's document has no modelContext by default — this is the real
    // "nearly every browser today" path.
    expect(() => registerWebMcpTools({
      getState: () => baseState(),
      up: vi.fn(),
      togglePlay: vi.fn(),
      signal: new AbortController().signal,
    })).not.toThrow()
  })

  describe('with document.modelContext present', () => {
    let registerTool: ReturnType<typeof vi.fn>
    let tools: Record<string, any>

    beforeEach(() => {
      tools = {}
      registerTool = vi.fn((def: any) => { tools[def.name] = def; return Promise.resolve() })
      ;(document as any).modelContext = { registerTool }
    })

    it('registers all four tools', () => {
      registerWebMcpTools({ getState: () => baseState(), up: vi.fn(), togglePlay: vi.fn(), signal: new AbortController().signal })
      expect(Object.keys(tools).sort()).toEqual(['get_current_view', 'set_chord', 'set_key_and_mode', 'toggle_play'])
    })

    it('set_key_and_mode updates state via up() on a valid root/mode', async () => {
      const up = vi.fn()
      registerWebMcpTools({ getState: () => baseState(), up, togglePlay: vi.fn(), signal: new AbortController().signal })
      const result = await tools.set_key_and_mode.execute({ root: 'D', mode: 'dorian' })
      expect(up).toHaveBeenCalledWith(expect.objectContaining({ keyRoot: 'D', keyQuality: 'dorian', viewMode: 'scales' }))
      expect(result).toContain('D Dorian')
    })

    it('set_key_and_mode rejects an unknown mode without calling up()', async () => {
      const up = vi.fn()
      registerWebMcpTools({ getState: () => baseState(), up, togglePlay: vi.fn(), signal: new AbortController().signal })
      const result = await tools.set_key_and_mode.execute({ root: 'D', mode: 'not_a_real_mode' })
      expect(up).not.toHaveBeenCalled()
      expect(result).toMatch(/unknown mode/i)
    })

    it('set_key_and_mode rejects an unknown root without calling up()', async () => {
      const up = vi.fn()
      registerWebMcpTools({ getState: () => baseState(), up, togglePlay: vi.fn(), signal: new AbortController().signal })
      const result = await tools.set_key_and_mode.execute({ root: 'H', mode: 'dorian' })
      expect(up).not.toHaveBeenCalled()
      expect(result).toMatch(/unknown root/i)
    })

    it('set_chord updates state via up() on a valid root/chord', async () => {
      const up = vi.fn()
      registerWebMcpTools({ getState: () => baseState(), up, togglePlay: vi.fn(), signal: new AbortController().signal })
      const result = await tools.set_chord.execute({ root: 'A', chord: 'min7' })
      expect(up).toHaveBeenCalledWith(expect.objectContaining({ viewMode: 'chords', selectedChordRoot: 'A', selectedChordKey: 'min7' }))
      expect(result).toContain('Am7')
    })

    it('get_current_view reads live state, not a stale snapshot from registration time', async () => {
      let current = baseState({ viewMode: 'scales', selectedScaleRoot: 'C', selectedScaleKey: 'ionian' })
      registerWebMcpTools({ getState: () => current, up: vi.fn(), togglePlay: vi.fn(), signal: new AbortController().signal })
      const before = JSON.parse(await tools.get_current_view.execute({}))
      expect(before.showing).toContain('C')

      current = baseState({ viewMode: 'chords', selectedChordRoot: 'G', selectedChordKey: 'dom7' })
      const after = JSON.parse(await tools.get_current_view.execute({}))
      expect(after.showing).toBe('G7')
      expect(after.viewMode).toBe('chords')
    })

    it('toggle_play calls the provided togglePlay callback', async () => {
      const togglePlay = vi.fn()
      registerWebMcpTools({ getState: () => baseState(), up: vi.fn(), togglePlay, signal: new AbortController().signal })
      await tools.toggle_play.execute({})
      expect(togglePlay).toHaveBeenCalledTimes(1)
    })

    it('marks get_current_view read-only', () => {
      registerWebMcpTools({ getState: () => baseState(), up: vi.fn(), togglePlay: vi.fn(), signal: new AbortController().signal })
      expect(tools.get_current_view.annotations?.readOnlyHint).toBe(true)
    })
  })
})
