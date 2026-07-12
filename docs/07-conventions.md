# 07 · Conventions & workflow

## Code style (match the existing code)

- **No semicolons.** 2-space indent. Single quotes.
- **Functional React** with hooks. Derived data via `useMemo`; stable callbacks
  via `useCallback`. No class components.
- **Section dividers** use box-drawing comments: `// ─── Section name ───`.
- TypeScript throughout; prefer explicit types on exported functions and props
  interfaces. Local inference is fine.
- Keep the **layer boundary**: theory logic in `musicTheory.ts` (pure), audio in
  `audioEngine.ts` (side-effects), orchestration in `App.tsx`. Don't import React
  into the utils or theory tables into the audio engine.
- CSS lives entirely in `styles/index.css`, driven by CSS variables and theme
  classes (`.dark`, `.light`, `.midnight`, …). Reuse existing variables
  (`--accent`, `--accent-glow`, `--bg-raised`, `--border`, `--text*`, `--radius`,
  `--font-sans`, `--transition`) rather than hardcoding colors.

## Testing

- `npm test` runs Vitest (67 tests today, almost all covering `musicTheory.ts`).
- **Any change to the theory engine must come with tests** — it's the trust
  anchor for the whole app. Add cases to `musicTheory.test.ts`.
- Audio and rendering aren't unit-tested (Web Audio / SVG are hard to assert
  headlessly). Verify those **by ear / by eye** in `npm run dev`. State that
  explicitly when you can't automate a check — don't imply audio was verified when
  only the build was.
- Before pushing: `npm run build` (this is also the typecheck via `tsc -b`) **and**
  `npm test`.

## Adding things (quick recipes)

- **New scale/chord:** one entry in `SCALES`/`CHORDS` in `musicTheory.ts` → it
  flows automatically into pickers, diatonic harmony, positions, and audio. Add a
  test.
- **New tuning:** one entry in `TUNINGS` (MIDI `notes` low→high + `labels`).
- **New state-driven feature:** add field(s) to `AppState` (`types/music.ts`) +
  `initialState` (`App.tsx`), mutate via `up()`, derive views via `useMemo`. See
  [03-state](03-state.md).
- **New sound:** follow the `audioEngine.ts` conventions in [05-audio-engine](05-audio-engine.md)
  — shared context, route through `masterGain`, clean up nodes on stop.

## Git & PR workflow

- Repo: `teal-sea/fretboard-mapper` (private), default branch `main`.
- **Isolate each change in a git worktree**; work on a feature branch.
- Open a **draft PR**; describe what was verified vs. what needs a human check
  (especially for audio/visual changes).
- **Never** push to `main`, force-push, or merge without being asked.
- Commit messages: imperative subject, body explaining the *why*. Co-author trailer
  for AI-assisted commits.

## Deploy

- Hosted on **Vercel** (`fretboard-mapper-zeta.vercel.app`). Build command is the
  default Vite `npm run build`; output `dist/`.
- If/when the repo is connected to Vercel's Git integration, pushes to `main`
  auto-deploy and PRs get preview URLs. If it isn't connected yet, that's a
  one-time setup (`vercel git connect` or the Vercel dashboard) — a good early
  task so PR previews become available.
- **Secrets never ship to the browser.** A live API integration needs a Vercel
  serverless function (`api/…`) holding the key server-side.
