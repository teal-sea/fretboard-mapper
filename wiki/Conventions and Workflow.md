# Conventions and Workflow

## Code style
- No semicolons. 2-space indent. Functional React only.
- Derived state = `useMemo`; stable callbacks = `useCallback`. Memo deps
  name the specific fields read, never the whole `state` object (that
  regression is why the board used to recompute on volume drags).
- Box-drawing comment dividers: `// ─── Section ───`.
- Comments explain *why* and *what breaks* — the effect-topology notes in
  [[The Practice Engines]] are the house style at its best. No "what the
  next line does" comments.
- Repeated UI inside App.tsx becomes a `renderX()` helper (the
  `renderBackingControls` idiom), not a copy-paste — see
  [[App.tsx and Components]].
- Display naming goes through `dn()`/`noteMap`; the engine speaks letters
  forever ([[The Music Theory Engine]]).

## Workflow
1. Isolate in a git worktree. Open a **draft PR**. Never push to `main`,
   force-push, or merge without being asked.
2. `npm run build` && `npm test` before every push — CI can't enforce it
   yet ([[Testing Tooling and CI]]).
3. UI changes: verify in a real browser (preview build or a Vercel preview
   deploy — there's no Git integration, deploy previews manually with
   `vercel deploy`). Lead with the preview URL when showing Thomas anything.
4. Audio changes additionally need a human ear — CI is deaf ([[hot]]).
5. Ship = update the wiki: affected pages, [[index]] one-liners, a dated
   [[log]] entry, prune [[hot]]. CLAUDE.md's file map must match
   `find src -name '*.ts*'` — it has drifted badly before; fix it, don't
   work around it.

## Deploys
Vercel, personal account (`teal-sea` GitHub; NEVER the work accounts).
Production = modalruns.com (+ fretboard-mapper-zeta.vercel.app). Merging
deploys nothing — production ships only via explicit `vercel --prod`, and
only when asked.

## Design language (load-bearing user feedback)
- Note dots: flat saturated color, **no halos/glow rings ever**.
- Chrome/CTAs wear the brand gradient — a flat neon CTA reads as an
  interval color.
- Minor key ⇒ minor default chord ([[The Golden Rules]] #6).
