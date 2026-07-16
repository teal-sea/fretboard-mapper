// ─── WebMCP: let an AI agent play too ─────────────────────────────────
// Experimental, Chrome-only, origin-trial-gated as of writing (Chrome
// 149+, API surface already renamed once — navigator.modelContext →
// document.modelContext in Chrome 150 — and explicitly "subject to
// change"). See https://developer.chrome.com/docs/ai/webmcp. Fully
// feature-detected: everywhere else this is a silent no-op, never a
// dependency the app relies on.
//
// The tools below register exactly the same constrained choices the
// project's own golden rule already limits an LLM layer to — a SCALES
// key, a CHORDS key, a note name — never a fret number. The engine
// computes the actual notes/frets either way, so a WebMCP agent can't
// hallucinate a fretboard any more than a human picking from the app's
// own dropdowns can.

import type { AppState } from '../types/music'
import { SCALES, CHORDS } from './musicTheory'
import { NOTE_NAMES } from '../types/music'

interface ModelContextTool {
  name: string
  description: string
  inputSchema: object
  execute: (args: any) => Promise<string> | string
  annotations?: { readOnlyHint?: boolean; untrustedContentHint?: boolean }
}

interface ModelContext {
  registerTool: (tool: ModelContextTool, opts?: { signal?: AbortSignal }) => Promise<void>
}

declare global {
  interface Document { modelContext?: ModelContext }
}

export function registerWebMcpTools(opts: {
  getState: () => AppState
  up: (p: Partial<AppState>) => void
  togglePlay: () => void
  signal: AbortSignal
}): void {
  const mc = typeof document !== 'undefined' ? document.modelContext : undefined
  if (!mc) return // unsupported browser (nearly everyone, right now) — silent no-op

  const { getState, up, togglePlay, signal } = opts
  const modeKeys = Object.keys(SCALES)
  const chordKeys = Object.keys(CHORDS)

  mc.registerTool({
    name: 'set_key_and_mode',
    description: 'Set the guitar fretboard to a root note and a mode/scale. The app computes every note and fret position from these two values — never guess or state a fret number yourself.',
    inputSchema: {
      type: 'object',
      properties: {
        root: { type: 'string', enum: [...NOTE_NAMES], description: 'Root note, e.g. "D" or "F#"' },
        mode: { type: 'string', enum: modeKeys, description: 'A key from the scale catalog, e.g. "dorian", "ionian", "minor_penta"' },
      },
      required: ['root', 'mode'],
    },
    execute: async ({ root, mode }: { root: string; mode: string }) => {
      if (!SCALES[mode]) return `Unknown mode "${mode}". Valid modes: ${modeKeys.join(', ')}`
      if (!(NOTE_NAMES as readonly string[]).includes(root)) return `Unknown root "${root}". Valid roots: ${NOTE_NAMES.join(', ')}`
      up({ keyRoot: root, keyQuality: mode, selectedScaleRoot: root, selectedScaleKey: mode, viewMode: 'scales', selectedChordRoot: null, selectedChordKey: null })
      return `Set to ${root} ${SCALES[mode].name}. Notes: ${SCALES[mode].intervals.length} in the scale.`
    },
  }, { signal })

  mc.registerTool({
    name: 'set_chord',
    description: 'Show a specific chord on the fretboard, with every playable voicing computed for it.',
    inputSchema: {
      type: 'object',
      properties: {
        root: { type: 'string', enum: [...NOTE_NAMES] },
        chord: { type: 'string', enum: chordKeys, description: 'A key from the chord catalog, e.g. "maj7", "dom7", "sus4"' },
      },
      required: ['root', 'chord'],
    },
    execute: async ({ root, chord }: { root: string; chord: string }) => {
      if (!CHORDS[chord]) return `Unknown chord "${chord}". Valid chords: ${chordKeys.join(', ')}`
      if (!(NOTE_NAMES as readonly string[]).includes(root)) return `Unknown root "${root}". Valid roots: ${NOTE_NAMES.join(', ')}`
      up({ viewMode: 'chords', selectedChordRoot: root, selectedChordKey: chord })
      return `Showing ${root}${CHORDS[chord].suffix} (${CHORDS[chord].name}).`
    },
  }, { signal })

  mc.registerTool({
    name: 'get_current_view',
    description: "Read what the fretboard is currently showing — the key, the selected mode or chord, and whether the drone/mic is active. Call this before set_key_and_mode/set_chord if you don't already know the current state.",
    inputSchema: { type: 'object', properties: {} },
    annotations: { readOnlyHint: true },
    execute: async () => {
      const s = getState()
      const showing = s.viewMode === 'chords'
        ? `${s.selectedChordRoot ?? s.keyRoot}${s.selectedChordKey ? CHORDS[s.selectedChordKey]?.suffix ?? '' : ''}`
        : `${s.selectedScaleRoot ?? s.keyRoot} ${SCALES[s.selectedScaleKey ?? s.keyQuality]?.name ?? s.keyQuality}`
      return JSON.stringify({ viewMode: s.viewMode, showing, playing: s.progressionPlaying })
    },
  }, { signal })

  mc.registerTool({
    name: 'toggle_play',
    description: "Start or stop the backing (drone/pad/arp) and the app's microphone listening. Starting audio in a browser normally requires a real user gesture — this may be blocked depending on how the agent invoking it is triggered.",
    inputSchema: { type: 'object', properties: {} },
    execute: async () => {
      togglePlay()
      return 'Toggled play.'
    },
  }, { signal })
}
