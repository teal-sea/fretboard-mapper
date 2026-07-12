# 02 · Architecture

## Stack & boundaries

- **React 18** function components + hooks. **Vite 6** dev/build. **TypeScript**.
  **Vitest** for tests. No other runtime deps.
- **No backend, no persistence, no network.** The app is a single-page bundle
  served statically (Vercel). State is in memory and resets on reload.
- Three clean layers, with a strict boundary between them:

```
  ┌────────────────────────── UI layer ──────────────────────────┐
  │  App.tsx  ·  components/Fretboard.tsx  ·  styles/index.css     │
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
theory testable (67 tests) and the audio swappable.

## Data flow (unidirectional)

1. **Source of truth:** one `AppState` object in `App.tsx`
   (`const [state, setState] = useState<AppState>(initialState)`).
2. **Mutation:** exactly one updater — `up(partial)` — merges a partial into
   state. Every control calls `up({...})`. (Two audio-only booleans, `metronomeOn`
   and `droneOn`, use their own local `useState` because they don't affect what's
   drawn.)
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

- **`KeyMapView.tsx` is currently dead code** — not imported anywhere. It's a
  functional alternate "key map" view wired to real APIs but unmounted. Either
  adopt it or delete it; don't assume it's live. See [06-components](06-components.md).
- **State does not persist.** Reload = back to `initialState` (A aeolian). Adding
  localStorage is a small, self-contained task ([08-roadmap](08-roadmap.md)).
- **No routing.** Single view; "pages" are conditional panels toggled by state
  (`advancedMode`, `activeTab`, `settingsOpen`).
