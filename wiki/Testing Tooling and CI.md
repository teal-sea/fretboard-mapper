# Testing Tooling and CI

## The suite
Vitest 4 + jsdom, `globals: true`. **381 tests / 19 files**, ~2 s. Run
`npm test`; `npm run build` (`tsc -b && vite build`) IS the typecheck —
both before every push, because CI doesn't gate yet (below).

Well-covered: the entire theory layer (musicTheory, theory, arpeggios, walk,
runner, modes, concepts, pitchDetect, progress, favorites, streak, persist,
urlState, cloudSync, webmcp, i18n-adjacent) + `api/authHelper` +
`api/webhook/deriveSubscriptionUpdate`.

**Not covered** (know before you refactor there): `audioEngine.ts`,
`micInput.ts`, every component, `App.tsx`, `api/checkout|portal|sync` +
`webhook/polar.ts` handlers, all of `scripts/` (the SSG). The payment
webhook and the SSG surface are the two gaps that actually bite.

## The Node 25 localStorage trap
Node ≥25 ships an experimental built-in `localStorage` as a global getter.
Under vitest it's a broken instance (backing store never initializes —
that's the "`--localstorage-file` was provided without a valid path"
warning) and it SHADOWS jsdom's Storage, so `.clear` is undefined.
`src/testSetup.ts` (wired via `setupFiles` in `vite.config.ts`) installs a
real in-memory Storage with `Object.defineProperty`. Don't remove it, and
don't trust the ambient `localStorage` in new test files.

Also in `vite.config.ts` tests: `.claude/**` is excluded so parallel
worktrees' half-finished tests don't report as this tree's failures.

## CI — exists, not live
`.github/workflows/ci.yml` (build + test on PR/push to main) is written and
committed on `production-refactor` locally, but **GitHub rejects the push**:
both stored credentials are OAuth tokens without the `workflow` scope. Fix
is one interactive command by Thomas (`gh auth refresh -h github.com -s
workflow`), then plain `git push`. Tracked in [[hot]]. Until then nothing
enforces green — discipline is the gate.

## TypeScript / lint
`strict: true`; `noFallthroughCasesInSwitch`; `include: src, scripts, api`
(api added 2026-07-19 — it was never type-checked before). NOT set:
`noUncheckedIndexedAccess`, `noUnusedLocals`. No ESLint/Prettier/Biome —
the repo has a handful of `eslint-disable-next-line` comments purely as
documentation for deliberate dep-array elisions ([[The Practice Engines]]).
`any` discipline is good (~7 real uses in ~15k LOC).

## Dependencies
6 runtime deps total: react, react-dom, @clerk/clerk-react, @clerk/backend,
@neondatabase/serverless, @polar-sh/sdk. No UI kit, no lodash, no tone.js —
keep it that way. Watch: Polar SDK pre-1.0. i18n extra locales are
lazy-chunked so the main bundle (~460 kB) stays flat as languages grow.
