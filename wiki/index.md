# Modal Runs Wiki Index

> This index is agent-maintained. Read this first to navigate the wiki without
> reading every file. When you add or materially change a page, update its line
> here and append to [[log]].

## The rules
- [[The Golden Rules]] - The six invariants: one AppState + `up()`, deterministic theory (never hardcode frets), pitch classes 0–11 internally, client-only engine (secrets → `api/`), one AudioContext with node cleanup, chord quality follows the key.

## State
- [[AppState and Persistence]] - 53-field `AppState` in App.tsx, mutated only via `up(partial)`. What's deliberately local instead (audio flags in App, per-round game state in `src/hooks/`). Three persistence paths: localStorage (`utils/persist.ts`, with TRANSIENT_RESET guard), shareable URLs (`utils/urlState.ts`, whitelist-validated), subscriber cloud sync (`utils/cloudSync.ts` + `api/sync.ts`, whitelisted both directions since 2026-07-19).

## Sound
- [[The Audio Engine]] - `utils/audioEngine.ts` (~760 lines): shared `getCtx()` AudioContext, masterGain → dry+reverb, chord pad, evolving drone, arpeggiator, metronome. Every source cleans up its nodes on stop. MIDI numbers exist ONLY here.
- [[Mic and Pitch Detection]] - `utils/micInput.ts` (capture + ambient RMS gate calibration) and `utils/pitchDetect.ts` (pure McLeod/NSDF, no Web Audio, tested). App polls ~20 Hz; a note must be heard twice to commit and lingers ~500 ms — `heardMidi` changes once per NOTE, not per poll frame. Echo cancellation is a user setting (on = laptop speakers, off = interface/amp).

## Theory
- [[The Music Theory Engine]] - `utils/musicTheory.ts` (~700 lines, heavily tested): SCALES, CHORDS, TUNINGS, `computeFretboard`, positions, voicings, diatonic harmony, 3NPS/sweep/tapping patterns. Pure, deterministic, no React/audio/DOM. LLMs may only ever *choose* its inputs, never emit fret numbers.

## Practice engines
- [[The Practice Engines]] - `src/hooks/` (extracted from App.tsx 2026-07-19): `useFindIt` (locate a played note, exact-MIDI match), `useEcho` (repeat a phrase by ear), `useWalk` (claim seven modes position by position; claims persist via `utils/progress.ts`), `useRun` (mic-driven arpeggio runs + the Twist). Effect topology is deliberate — two documented self-cancellation traps; read the page before "fixing" dependency arrays.

## UI
- [[App.tsx and Components]] - App.tsx (2,545 lines) holds AppState, all derived memos, the audio transport block (progression + backing + `togglePlay` — deliberately NOT extracted), and the three-stage render (Learn/Flow/Study). Components: memoized `Fretboard` (21 props, SVG), `FlowCanvas`, `SettingsDrawer`, `Veils`, `AccountMenu` (cloud sync with serverState-ref dedupe), shared `controls`.

## Money
- [[Monetization and the API]] - Additive-only: the tool is fully free/unauthenticated without it. Clerk (auth) + Polar (payments) + Neon (Postgres). `api/checkout|portal|sync` verify Clerk JWTs server-side; `api/webhook/polar.ts` verifies signatures on raw bytes and is the ONLY writer of the `subscribed` flag. Security-audited 2026-07-19: no forgeable IDs, no SQLi, no secret leakage; sync payloads whitelisted + capped.

## Public surface
- [[SSG and SEO Surface]] - `scripts/` Vite plugin runs at `closeBundle`: 1,428 mode pages (84 × en+16 locales), 300 chord pages, 9 guides, indexes, sitemap, hreflang — all computed from the real theory engine, prose hand-written. `public/llms.txt` is the LLM-facing site description (rewritten 2026-07-19). Zero test coverage on the generators.

## Infra
- [[Testing Tooling and CI]] - Vitest 4 + jsdom, 381 tests across 19 files. `src/testSetup.ts` stubs localStorage (Node 25's built-in one is broken under vitest). CI workflow exists but is BLOCKED from pushing (OAuth tokens lack `workflow` scope — see [[hot]]). Untested: audioEngine, all components, App.tsx, api/ endpoints (except authHelper + deriveSubscriptionUpdate), scripts/.
- [[Conventions and Workflow]] - No semicolons, 2-space indent, box-drawing dividers, `useMemo`/`useCallback` for derived state. Worktree + draft PR always; never push main or merge unasked. Run `npm run build` (the typecheck) + `npm test` before pushing.

## Meta
- [[log]] - Dated history of significant changes (seeded with the 2026-07-19 production refactor).
- [[hot]] - Live issues and open threads: unpushed CI commit, prod not yet redeployed post-refactor, next-seam candidates, known gaps.
