# Log

> Dated history of significant changes. Newest first. One entry per shipped
> unit of work — what changed, why, and where the bodies are buried.

## 2026-07-19 — Wiki created
This knowledge graph was created (PR #143), seeded from a four-way
architecture audit (App.tsx internals, CSS/components, api/ security,
tooling/CI) run the same day. `public/llms.txt` (the user-facing LLM file)
was rewritten in the same PR with verified product facts.

## 2026-07-19 — The production-standard refactor (PR #142, merged)
One pass to bring the codebase to production standard. The audit's verdict:
the theory engine, auth, webhook verification, and the subscribed-flag
single-writer rule were already solid; the debt was concentrated elsewhere.

- **Test env fixed**: all 4 `persist.test.ts` tests were failing on main —
  Node 25 ships an experimental built-in `localStorage` whose broken instance
  shadows jsdom's (`.clear` undefined). `src/testSetup.ts` now installs a real
  in-memory Storage. 381/381 green.
- **Perf**: `Fretboard` wrapped in `React.memo` (it re-rendered its hundreds
  of SVG nodes on every 80 ms tuner tick and mic poll); `tuningLabels` memo
  added so a fresh `.map()` doesn't defeat the memo; `activeNotes` deps
  narrowed from the whole `state` object to the fields it reads (a volume
  drag used to recompute the entire board).
- **Sync hardening**: `api/sync.ts` whitelists stored keys to `SYNCED_KEYS`,
  rejects arrays, caps payloads at 32 KB, returns 503s (not raw 500s) when
  Clerk/Neon are down. Pull path re-whitelists via `pickSyncedPartial` before
  merging into AppState. Fixed the consumed-once `justPulled` boolean in
  `AccountMenu` that could swallow the first edit after a pull — replaced
  with a compare-to-server-state ref. `api/` added to tsconfig (it was never
  type-checked).
- **Dead code**: `KeyMapView.tsx` deleted (never mounted); 607 lines /
  71 orphaned selectors of pre-rewrite CSS pruned (grep-verified, including
  dynamic `mode-${appMode}` classes which were correctly KEPT).
- **App.tsx decomposition** 3,184 → 2,545 lines: `useFindIt`/`useEcho`/
  `useWalk`/`useRun` to `src/hooks/`; `SettingsDrawer`/`Veils`/`controls` to
  `components/`; triplicated Play button + heard-note readout + BPM clamp
  deduped into single helpers. Effect topology preserved verbatim. The audio
  transport block deliberately stayed (see [[hot]]).
- **Verified**: build + 381 tests green; browser smoke test on the production
  build (three modes, drawer round-trip, the Walk end-to-end through `up()`
  and URL sync, zero console errors); Vercel preview deployed and linked on
  the PR. Audio itself could NOT be verified from the agent environment —
  flagged for a human ear before the prod deploy.
- **Casualty**: the CI workflow couldn't be pushed (token scope) — see [[hot]].

## Pre-refactor context (for archaeology)
- Recent product work before the refactor: root-page prerendered fretboard
  hero + LCP preload, async web fonts, sign-up (not sign-in) as the main CTA
  (#140), monetization infra (Clerk/Polar/Neon) built but awaiting live
  accounts. The SSG surface (mode/chord/guide pages) and the 16-locale
  expansion predate this log — history lives in git.
