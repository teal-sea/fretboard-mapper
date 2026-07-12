# CLAUDE.md — Fretboard Mapper

Orientation for any AI agent or developer working in this repo. Read this first,
then the deeper docs under [`docs/`](docs/README.md).

## What this is

An interactive guitar **fretboard visualizer and practice tool**. It renders
scales, chords, diatonic harmony, and technique patterns (3-notes-per-string,
sweep arpeggios, tapping) across the neck with note names and intervals, plus an
ambient **synth engine** (chord pad, metronome, progression stepper, and an
evolving modal **drone**).

The larger goal it is growing toward: a **flow-state practice companion** — get a
guitarist from "I have 30 minutes" to "I'm improvising in the zone" in under ten
seconds. See [`docs/01-overview.md`](docs/01-overview.md) for the vision.

Live: https://fretboard-mapper-zeta.vercel.app · Repo: `teal-sea/fretboard-mapper` (private)

## Stack

- **React 18** + **Vite 6** + **TypeScript** (~5.6). Vitest 4 for tests.
- **Zero runtime dependencies** beyond `react`/`react-dom`. No state library, no
  music-theory library (`tonal` etc.), **no backend, no database, no persistence.**
  Everything is client-side and deterministic.
- Deployed on **Vercel**.

## Commands

```bash
npm run dev        # Vite dev server → http://localhost:5173
npm run build      # tsc -b && vite build  (this is also the typecheck)
npm test           # vitest run  (67 tests, mostly the theory engine)
npm run preview    # preview a production build
```

Always run `npm run build` (typecheck) and `npm test` before pushing.

## File map

```
src/
  main.tsx                  # React entry
  App.tsx                   # ALL app state + UI orchestration (see docs/03-state.md)
  types/music.ts            # AppState + domain types
  components/
    Fretboard.tsx           # the neck renderer
    KeyMapView.tsx          # (see docs/06-components.md)
  utils/
    musicTheory.ts          # deterministic theory engine (docs/04-music-theory.md)
    musicTheory.test.ts     # 67 tests — the safety net for theory
    audioEngine.ts          # Web Audio: pad, metronome, drone (docs/05-audio-engine.md)
    defaultColors.ts        # interval → color map
  styles/index.css          # all styling (CSS variables + theme classes)
```

## The golden rules (don't fight these)

1. **One source of truth for state.** Everything the fretboard shows lives in a
   single `AppState` object in `App.tsx`, mutated only through the `up(partial)`
   updater. To drive the app from new code (e.g. a future concept engine), call
   `up({ keyRoot:'A', keyQuality:'dorian', ... })` — do **not** add a parallel
   store, context, or reducer. Audio-only UI flags (`metronomeOn`, `droneOn`) are
   the sole exception and use local `useState`. See [`docs/03-state.md`](docs/03-state.md).

2. **Theory is deterministic — never hardcode or hallucinate fret numbers.**
   All notes/positions come from `musicTheory.ts`, which is tested. If an LLM
   layer is ever added, it must only *choose* constrained values (a `SCALES` key,
   a `CHORDS` key, a note name, a position index) and let the engine compute the
   actual notes. LLMs hallucinate frets; the engine does not.

3. **Notes are pitch classes 0–11 internally** (0=C … 11=B). MIDI numbers exist
   only inside `audioEngine.ts`. Keep that boundary.

4. **Client-only, for now.** There is no server. If a feature needs a secret
   (e.g. a live Claude API call), the path is a Vercel serverless function in an
   `api/` folder with the key server-side — never ship a key to the browser.

5. **Audio routes through one shared `AudioContext`** (`getCtx()`). Every new
   sound source connects through `masterGain` (dry + reverb) and **must clean up
   its nodes on stop** (see how `stopDrone`/`stopChordPad` do it).

6. **Default chord/scale quality follows the key.** A minor key implies a minor
   default chord, etc. Don't default to major regardless of key.

## Working conventions

- Isolate changes in a git worktree; open a **draft PR**. Never push to `main`,
  force-push, or merge without being asked.
- Match the surrounding code: no semicolons, 2-space indent, functional React,
  `useMemo`/`useCallback` for derived state, box-drawing comment dividers
  (`// ─── Section ───`).
- More detail in [`docs/07-conventions.md`](docs/07-conventions.md).
