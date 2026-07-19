# SSG and SEO Surface

The SPA ships one URL with no crawlable text, so `scripts/modePages.ts` is a
**Vite plugin** (wired in `vite.config.ts`, runs at `closeBundle`) that
writes static HTML into `dist/` on every `npm run build`. There is no
separate command — build the app, get the site.

## What it generates (verified against dist/ 2026-07-19)
- **1,428 mode pages** — 84 (12 roots × 7 modes) in English + 16 locales.
  `/modes/{root}-{mode}/` (`/modes/d-dorian/`, `/modes/c-sharp-phrygian/`).
- **300 chord pages** — 25 types × 12 roots, `/chords/{root}-{type}/`
  (`/chords/a-minor-7th/`). English only.
- **9 guides** — `/guides/` (modes explained, which-first, hear-the-modes,
  what-is-modal-jazz, dorian-vs-aeolian, lydian-vs-major, blues, Spanish,
  famous guitarists). Prose in `scripts/guides.ts`.
- Indexes, sitemap, hreflang alternates.
- **Locale dir slugs are localized** — es `/modos/`, fr `/modes/`, it/de/nl
  `/modi/`, pt `/modos/`, pl `/skale/`, tr `/modlar/`, id `/modus/`, ru/uk
  `/lady/`, ja/ko/zh/hi/vi `/modes/`. Prose tables in `scripts/locales.ts`
  (+ lazy-chunked in-app translations via `utils/i18nExtra/`).

## The invariant
Every musical fact on every page is **imported from
[[The Music Theory Engine]]** at build time — `scripts/*.ts` call
`getScaleNotes`, `getDiatonicChords`, `computeFretboard` etc. Only prose is
hand-written (`shared.ts`, `guides.ts`, `locales.ts`, `chordCopy.ts`). Never
hand-type a note into a template.

## llms.txt
`public/llms.txt` — the **user-facing** LLM description of the site
(Karpathy llms.txt convention; NOT this wiki). Hand-written; rewritten
2026-07-19 with verified facts (landing = lesson list, all 9 guides, chord
library, 16 locale patterns, citation notes incl. the optional
subscription). When product surface changes, update it — and verify every
slug against `dist/` before writing.

## Gotchas
- **Zero test coverage** on the generators — the entire public SEO surface
  regresses silently ([[Testing Tooling and CI]]). Inspect `dist/` after
  touching `scripts/`.
- Changes only go LIVE on a production deploy — merging to main deploys
  nothing (no Vercel Git integration; [[hot]]).
- `guides.ts`/`locales.ts` are large hand-written prose files; keep musical
  claims out of them.
