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
| **Evolving modal drone** | ✅ shipped (PR: `worktree-evolving-drone`) |
| Concept "brain" (what to explore this session) | ⬜ not started — the frontier |
| Session persistence (localStorage) | ✅ shipped (`utils/persist.ts`) — was stale here, fixed |
| One-tap "start session" entry | ⬜ not started |
| Vercel Git integration / PR previews | ⬜ nice-to-have |
| Resolve `KeyMapView` dead code (adopt or delete) | ⬜ small cleanup |
| Monetization infra (Clerk auth, Polar subscriptions, Neon cross-device sync) | 🟡 built, not live — code merged and tested, needs real Clerk/Polar/Neon accounts provisioned (see `.env.example`) before the login/upgrade UI activates |

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

- **Connect Vercel Git integration** → PR preview URLs (makes audio/visual review
  possible without local runs).
- **Resolve `KeyMapView`** — adopt it as a toggleable alternate view, or delete it.
- Consider extracting the big `App.tsx` (~900 lines) into a few feature sections
  if it keeps growing — but only when it genuinely hurts, not preemptively.
