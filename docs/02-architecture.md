# 02 · Architecture

## Stack & boundaries

- **React 18** function components + hooks. **Vite 6** dev/build. **TypeScript**.
  **Vitest** for tests (375+ across nineteen files — check the current count,
  it moves). No other runtime deps for the app itself (Playwright is a
  dev-only dependency for real-WebKit mobile checks).
- **The theory/audio engine is client-only, no network** — that part is
  fixed. The app *as a whole* now also has a minimal backend for monetization
  (Clerk auth, Polar payments, Neon Postgres), which is a deliberate, additive
  exception: see [`../CLAUDE.md`](../CLAUDE.md) golden rule 4 and
  `components/AccountMenu.tsx`. Without `VITE_CLERK_PUBLISHABLE_KEY` set, the
  app is still exactly what this page describes — a single-page bundle served
  statically (Vercel; `main` auto-deploys to modalruns.com), zero network
  calls beyond loading the bundle. `AppState` persists to **localStorage** via
  `utils/persist.ts`; owned sounds (`concepts.ts`, key `fm.ownedSounds`) and
  Walk claims (`progress.ts`, key `mr.progress`) persist separately.
  Subscribers additionally sync a subset of `AppState` (favorites, streak,
  a few display prefs) to Postgres — `utils/cloudSync.ts` picks that subset,
  `api/sync.ts` is the only thing that reads/writes it server-side.
- Three clean layers, with a strict boundary between them:

```
  ┌────────────────────────── UI layer ──────────────────────────┐
  │  App.tsx  ·  components/*  ·  hooks/*  ·  styles/index.css    │
  │  Holds AppState, renders, wires events.                        │
  └───────────────┬───────────────────────────┬──────────────────┘
                  │ pure calls                 │ imperative calls
                  ▼                            ▼
   ┌──────────────────────────┐   ┌──────────────────────────────┐
   │ utils/musicTheory.ts     │   │ utils/audioEngine.ts         │
   │ Pure, deterministic,     │   │ Web Audio side-effects.       │
   │ tested. Notes = pitch    │   │ Owns the AudioContext.        │
   │ classes 0–11.            │   │ Notes = MIDI.                 │
   └──────────────────────────┘   └──────────────────────────────┘
```

**The boundary that matters:** `musicTheory.ts` is a pure library — no React, no
audio, no DOM. `audioEngine.ts` is pure side-effect — no React, no theory tables.
`App.tsx` is the only place they meet. Keep it that way; it's what makes the
theory testable and the audio swappable.

The pure-library side has grown beyond `musicTheory.ts` — same rules apply
(pure, deterministic, tested, no React/audio/DOM):
`concepts.ts` (Flow's concept catalog + owned-sounds persistence),
`walk.ts` (the walk-the-neck game state machine), `runner.ts` (the run player),
`modes.ts` (same-notes-different-home relationships), `theory.ts` (prose
insights), `arpeggios.ts` (run shapes), `progress.ts` (Walk-claim persistence),
`persist.ts` (AppState persistence), `pitchDetect.ts` (pitch DSP).
`micInput.ts` sits with `audioEngine.ts` on the side-effect side.

**The language layer** (pure, English-fallback by construction):
`noteNames.ts` converts letter spellings to fixed-do solfège for display
(`displayNote('C#','solfege','es') → 'Do#'`) — the engine itself speaks
letters forever; `i18n.ts` + `i18nContent.ts` are the UI/prose translation
dictionaries (`t(key, lang)` / `tf(key, lang, vars)`), keyed by the English
string so call sites stay readable and a missing translation renders English
instead of breaking. Engine functions that compose sentences
(`theory.ts`, `walk.ts`, `runner.ts`, `modes.ts`, `flowEngine.ts`) take a
`lang` parameter defaulting to `'en'`, which is why every test passes
without mentioning language.

## Data flow (unidirectional)

1. **Source of truth:** one `AppState` object in `App.tsx`, initialized as
   `{ ...initialState, ...loadPersistedState() }` and written back to
   localStorage on every change.
2. **Mutation:** exactly one updater — `up(partial)` — merges a partial into
   state. Every control calls `up({...})`. (Audio side-effect flags —
   `droneOn`, `listening`, `metronomeOn` — plus per-session game state like
   `walkState`/`runState` use local `useState` because they shouldn't persist
   or don't change what's drawn from `AppState`.)
3. **Derivation:** everything shown is computed from `state` with `useMemo` —
   `activeNotes`, `board` (via `computeFretboard`), `diatonicChords`,
   `scalePositions`, `techniquePositions`, labels, etc. No derived value is stored
   in state.
4. **Render:** `<Fretboard board={board} …/>` draws an SVG neck from the derived
   `FretNote[][]` grid. See [06-components](06-components.md).
5. **Audio:** event handlers call `audioEngine` functions imperatively
   (`playChordPad`, `startDrone`, `startMetronome`, …). Audio is *not* React state.

Because view = f(state), **driving the app is just writing state.** A future
concept engine, a URL-param loader, or a preset button all do the same thing:
compute a partial and call `up()`. See [03-state](03-state.md).

## Render pipeline (what happens each interaction)

```
 user event → up({...}) → setState → re-render
   → useMemo recompute activeNotes/fretboardRoot
   → useMemo computeFretboard(tuning, root, activeNotes, numFrets) → FretNote[][]
   → <Fretboard/> maps grid to SVG <g><circle/><text/></g> per note
```

`computeFretboard` is the hot path; it's memoized on
`[tuning, fretboardRoot, activeNotes, numFrets]`.

## What's decided in App.tsx vs. the engine

- **App decides *what* to show** — resolves whether the board reflects a scale, a
  chord-over-scale, or a technique pattern (the `activeNotes`/`fretboardRoot`
  `useMemo`), and which overlay props to pass `Fretboard`.
- **The theory engine decides *where the notes are*** — deterministically.
- **The audio engine decides *what it sounds like*** — independently of both.

## Non-obvious facts

- **`KeyMapView.tsx` was deleted** — it was never mounted. If a per-degree key
  map returns, rebuild it against the theory engine rather than restoring the
  file. See [06-components](06-components.md).
- **No routing.** The Study/Flow split is `AppState.appMode`, not a route;
  "pages" are conditional panels toggled by state (`appMode`, `advancedMode`,
  `activeTab`, `settingsOpen`).
- **Mobile is checked against real WebKit**, not a resized desktop window —
  Playwright + `devices['iPhone 13']` emulation (a resized Chrome missed real
  rendering bugs that shipped). Run scripts with
  `NODE_PATH=<project>/node_modules node <script>` from a scratch dir.
