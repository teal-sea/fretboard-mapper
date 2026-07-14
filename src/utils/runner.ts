// ─── The Run Player ─────────────────────────────────────────────────
// The app follows your hands through a run, one note at a time.
//
// Pure state machine — no audio, no React — so the whole thing is testable
// without a guitar. App.tsx feeds it whatever the mic heard; it decides
// whether you've advanced.

import type { Run, RunStep } from './arpeggios'
import type { Language } from './noteNames'
import { t } from './i18n'

export interface RunState {
  index: number        // which step you're on
  done: boolean
  mistakes: number     // notes played that weren't the one asked for
  startedAt: number | null
  finishedAt: number | null
}

export function initRun(): RunState {
  return { index: 0, done: false, mistakes: 0, startedAt: null, finishedAt: null }
}

// The mic hears PITCH, not position — two frets producing the same pitch are
// indistinguishable to it, and that's fine: matching on MIDI is exactly the
// granularity the microphone can honestly resolve.
//
// We forgive a clean octave error, because that's the one mistake pitch
// detectors genuinely make on a plucked string (a strong 2nd harmonic). We do
// NOT forgive a wrong note.
export function matchesStep(heardMidi: number, targetMidi: number): boolean {
  if (heardMidi === targetMidi) return true
  return Math.abs(heardMidi - targetMidi) === 12
}

// Feed it a heard note. Returns the next state.
// `now` is passed in rather than read from the clock, so timing is testable.
export function advanceRun(
  run: Run,
  state: RunState,
  heardMidi: number | null,
  now: number
): RunState {
  if (state.done || heardMidi === null) return state

  const step = run.steps[state.index]
  if (!step) return state

  if (matchesStep(heardMidi, step.note.midi)) {
    const index = state.index + 1
    const done = index >= run.steps.length
    return {
      ...state,
      index: done ? state.index : index,
      done,
      startedAt: state.startedAt ?? now,
      finishedAt: done ? now : null,
    }
  }

  // A wrong note doesn't punish you — it just doesn't advance you. We count it
  // so the app can quietly say "that was clean" or "worth slowing down", never
  // "you failed".
  return { ...state, mistakes: state.mistakes + 1 }
}

// How the run went. Encouraging by construction — there is no fail state.
export interface RunResult {
  seconds: number
  notesPerSecond: number
  clean: boolean
  verdict: string
}

export function scoreRun(run: Run, state: RunState, lang: Language = 'en'): RunResult | null {
  if (!state.done || state.startedAt === null || state.finishedAt === null) return null

  const seconds = Math.max((state.finishedAt - state.startedAt) / 1000, 0.001)
  const notesPerSecond = run.steps.length / seconds
  const clean = state.mistakes === 0

  const verdict = clean
    ? notesPerSecond > 4
      ? t('Clean, and fast. That shape is yours.', lang)
      : t('Clean. Every note where it should be — now do it faster.', lang)
    : state.mistakes <= 2
      ? t('You got it. A couple of stray notes — run it again and they’ll go.', lang)
      : t('Landed it. It was messy, so slow it right down and run it once more — speed is a by-product of accuracy, never the other way round.', lang)

  return { seconds, notesPerSecond, clean, verdict }
}

// The step the player should be aiming at right now, plus what's behind them.
export function stepStates(run: Run, state: RunState): {
  step: RunStep
  order: number
  status: 'done' | 'current' | 'todo'
}[] {
  return run.steps.map((step, i) => ({
    step,
    order: i + 1,
    status: state.done || i < state.index ? 'done' : i === state.index ? 'current' : 'todo',
  }))
}
