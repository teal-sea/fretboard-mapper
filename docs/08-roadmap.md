# 08 · Roadmap

Where the app is headed, and — more usefully — **how each next piece slots into
the existing architecture**. The recurring theme: new intelligence doesn't need
new plumbing, it just computes a partial and calls `up({...})`.

## The north-star loop (recap)

```
   concept  →  drone/backing  →  shape on the neck  →  hands  →  flow
```
Most of this exists. The frontier is the **concept** step.

## Status

| Piece | State |
|---|---|
| Decode/display layer (scales, harmony, intervals, positions) | ✅ shipped, tested |
| Technique shapes (3NPS / sweep / tapping) | ✅ shipped |
| Chord pad + metronome + progression stepper | ✅ shipped |
| Evolving modal drone (+ pad/arp backing modes) | ✅ shipped |
| Mic pitch detection (McLeod/NSDF) + note-commit pipeline | ✅ shipped, DSP tested |
| Concept "brain" — Path A curated catalog (`utils/concepts.ts`, Learn mode, `getNextConcept`) | ✅ shipped; adaptive Path B is the new frontier |
| One-tap "start session" entry | ✅ shipped (`startSession`, Lesson 1 Start) |
| The Walk / Find It / Echo / run player | ✅ shipped, engines extracted to `src/hooks/` (2026-07-19) |
| SSG/SEO surface (1,428 mode + 300 chord + 17 fretboard pages, 9 guides, 16 locales, llms.txt) | ✅ shipped — untested generators, inspect `dist/` after touching `scripts/`. `/fretboard/` (scripts/fretboardPage.ts) SSRs the real `Fretboard.tsx` via `renderToStaticMarkup`; titles across the cluster are aligned to GSC query intent (mode/scale/chords/formula) |
| Session persistence (localStorage) | ✅ shipped (`utils/persist.ts`) |
| Vercel Git integration / PR previews | ✅ connected — main auto-deploys to production on merge, pushes get preview URLs |
| Resolve `KeyMapView` dead code (adopt or delete) | ✅ deleted |
| Monetization infra (Clerk auth, Polar subscriptions, Neon cross-device sync) | ✅ live — production env fully provisioned (Clerk keys landed 2026-07-19) |
| CI (build + test gating PRs) | 🟡 workflow written, push blocked — git/gh OAuth tokens lack the `workflow` scope; one-time `gh auth refresh -h github.com -s workflow`, then push from the `production-refactor` worktree |

## Next: the concept engine

A layer that, per session, picks **one idea** — e.g. *"A Dorian, feel the natural
6th, here's the m9 arpeggio at position 5"* — and configures the whole loop by
writing state. The integration is trivial by design:

```ts
function applyConcept(c: Concept) {
  up({ keyRoot:c.root, keyQuality:c.mode, selectedScaleRoot:c.root,
       selectedScaleKey:c.mode, scalePosition:c.position,
       activeTab: c.shape ? 'technique' : 'explore',
       techniqueMode: c.shape, selectedPattern: c.patternIndex })
  startDrone(noteIndex(c.root), SCALES[c.mode].intervals)
}
```

The only real decision is **where concepts come from**. Two paths behind the same
`getNextConcept(covered): Concept` seam:

### Path A — precomputed curriculum JSON (recommended first)
Ship a static, ordered set of ~50–200 concept cards as a JSON asset.
- ✅ Instant, offline, keyless, deterministic, hand-curatable.
- ✅ Best fit for "10 seconds to flow / no lecture."
- ➖ Finite; repeats once exhausted.
- Can be generated once by an LLM (offline) and committed.

### Path B — live Claude call
A Vercel serverless function (`api/concept.ts`) where Claude picks each session's
concept from a **constrained schema** (a `SCALES` key, a `CHORDS` key, a note
name, a position index — never raw fret numbers).
- ✅ Infinite variety, adaptive to what's been covered / a mood request.
- ➖ Adds a server-side key and ~1–3s latency per session. (Used to also mean
  "adds a backend" — as of the monetization infra, `api/` already exists for
  Clerk/Polar/Neon, so this would just be one more endpoint in it, not the
  first thing to introduce server-side code to the project.)
- ⚠️ **Constrain the output to enums the engine knows** — the app renders the
  actual notes, so the model can't hallucinate frets (see golden rule #2).

**Recommendation:** build Path A first behind `getNextConcept()`, so Path B can
slot in later without touching the UI. Same `Concept` type, swappable brain.

### `Concept` type (proposed)
```ts
interface Concept {
  root: string            // note name
  mode: string            // SCALES key
  shape?: '3nps'|'arpeggios'|'tapping'
  patternIndex?: number
  position?: number       // 1-based CAGED window
  focus?: string          // e.g. "natural 6th" — one line, for a caption
  blurb?: string          // one sentence, no lecturing
}
```

## Session persistence

Currently state resets on reload. Add localStorage (persist `AppState`, or a
curated subset) so the concept engine can track "what I've covered" and not
repeat. Small, self-contained. Decide deliberately whether the audio-only flags
(`droneOn`, `metronomeOn`) persist — probably not.

## One-tap entry

The "<10 seconds to flow" affordance: a single Start control that picks a concept,
sets state, and starts the drone in one gesture. All the pieces exist; this is
mostly UX assembly.

## Housekeeping worth doing early

- ~~**Connect Vercel Git integration**~~ — done; merges to main auto-deploy
  production, every push gets a preview URL. Consequence: **merging IS
  shipping** — audio changes need a human ear on the preview BEFORE merge.
- ~~**Resolve `KeyMapView`**~~ — deleted.
- ~~Consider extracting the big `App.tsx`~~ — done: the four practice engines
  live in `src/hooks/`, the settings drawer and veils in `src/components/`.
  The remaining audio/transport block (progression + backing + togglePlay)
  stays in `App.tsx` deliberately — it's one coupled unit and the next
  candidate only if it grows.
