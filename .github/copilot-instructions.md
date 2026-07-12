# Fretboard Mapper - AI Coding Guidelines

## Project Overview
This is a React + TypeScript web app for visualizing guitar fretboards, scales, and chords. It uses Vite for building and Web Audio API for chord playback. The app allows users to explore music theory interactively with real-time fretboard rendering and audio feedback.

## Architecture
- **State Management**: Centralized in `App.tsx` using React `useState`. All app state is defined in `AppState` interface (`src/types/music.ts`).
- **Core Components**: 
  - `Fretboard.tsx`: Renders the guitar fretboard with notes/intervals, supports overlays for chords and techniques.
  - `KeyMapView.tsx`: Displays diatonic chords in the current key as an interactive grid.
- **Utilities**:
  - `musicTheory.ts`: Pure functions for scales, chords, note calculations (e.g., `getScaleNotes`, `getDiatonicChords`).
  - `audioEngine.ts`: Web Audio API wrapper for playing chords with reverb effects.
  - `defaultColors.ts`: Color schemes for intervals and UI themes.
- **Data Flow**: App computes fretboard data via `computeFretboard` (from `musicTheory.ts`), passes to `Fretboard` component for rendering.

## Key Patterns
- **Music Theory Integration**: Use `noteIndex()` and `noteName()` for note conversions. Prefer `useFlats()` for key-appropriate notation.
- **Component Props**: Components receive computed data (e.g., `FretNote[][]` for fretboard) rather than raw state.
- **Audio Playback**: Call `playChordPad(chordToMidi(rootIndex, intervals))` for chord audio. Supports latch mode for sustained playback.
- **Styling**: CSS custom properties for themes (dark/light). Use `--accent` for highlights, `--bg-surface` for panels.

## Development Workflow
- **Run Dev Server**: `npm run dev` (Vite on port 5173)
- **Build**: `npm run build` (TypeScript compilation + Vite build)
- **Preview**: `npm run preview` (serve built files)
- **No Tests/Linting**: Focus on manual testing in browser. Check console for Web Audio API errors.

## Common Tasks
- **Add New Scale/Chord**: Define in `SCALES`/`CHORDS` objects in `musicTheory.ts`, update categories.
- **Modify Fretboard Rendering**: Edit `Fretboard.tsx`, ensure `ResizeObserver` handles responsive sizing.
- **Audio Features**: Extend `audioEngine.ts` for new synth types, maintain reverb/delay chains.
- **UI Changes**: Update CSS variables in `index.css` for theme consistency.

## Examples
- To highlight chord tones: Pass `chordToneNotes` (Set of MIDI numbers) to `Fretboard` component.
- For technique patterns: Use `highlightedPositions` (Set of "string-fret" strings) for position overlays.
- Key selection: Update `state.keyRoot` and `state.keyQuality` to recompute diatonic chords via `getDiatonicChords()`.</content>
<parameter name="filePath">/Users/thomas/Fretboard Mapper/.github/copilot-instructions.md