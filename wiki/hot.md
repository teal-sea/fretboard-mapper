# Hot

> Live issues, open threads, and things the next agent should know before
> touching anything. Prune entries when resolved (move the story to [[log]]).

## Blocked / pending
- **CI commit unpushed (2026-07-19).** `.github/workflows/ci.yml` (build + test on PR/push) is committed locally on `production-refactor` but both stored GitHub credentials (git helper AND gh CLI) lack the `workflow` scope, so GitHub rejects the push. One-time fix: Thomas runs `gh auth refresh -h github.com -s workflow`, then plain `git push` publishes it. Until then **nothing enforces green on merge**.
- **Production not redeployed since the refactor merge.** PR #142 (the whole production-standard pass) is on main, but there's no Vercel Git integration — modalruns.com still serves the pre-refactor build, including the old `llms.txt`. Ship with `vercel --prod` (ask Thomas first; the preview at PR #142's comment was verified).

## Next seams / deliberate deferrals
- **The audio transport block stays in App.tsx on purpose** (progression stepper + backing effect + `togglePlay` + metronome/drone flags). It's one tightly-coupled unit with zero test coverage, and an audio regression is invisible to CI. Extract only if it grows — and only with a manual sound check.
- **`guitarModel` is vestigial**: pinned to `'strat'`, select removed, still an AppState field threaded into `Fretboard`. Remove the thread or revive the Les Paul — either ends the limbo.
- **`onboarded` persists but gates nothing** (intro opens on demand now). Harmless; noted so nobody "fixes" a bug that isn't one.

## Known gaps (from the 2026-07-19 audit, accepted for now)
- `prefers-reduced-motion` only covers CSS — `FlowCanvas`'s rAF particle loop ignores it.
- The `Fretboard` SVG has no text alternative (`role`/`<title>`) — screen readers get nothing.
- `noUncheckedIndexedAccess` is off; no ESLint/Prettier anywhere (TypeScript strict is the only static check).
- Coverage holes: audioEngine, all components, App.tsx, `api/checkout|portal|sync|webhook`, `scripts/` SSG generators. The payment webhook being untested is the riskiest.
- Polar SDK is pre-1.0 (`^0.48.1`) — watch minors; it's a payments dependency.
