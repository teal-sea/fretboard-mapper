# The Golden Rules

The six invariants. They're in CLAUDE.md too; this page is the *why* and the
failure mode you get when you fight each one.

## 1. One source of truth for state
Everything the fretboard shows lives in a single `AppState` object in
App.tsx, mutated only through `up(partial)`. No Redux, no context, no second
store — ever. New engines (the [[The Practice Engines|practice hooks]] are
the template) receive `state` + `up` and write shared state only through
`up()`; their *transient* per-round state may be local.
**If you fight it:** two sources of truth for what's on the neck, and the
URL-sync/persistence/cloud-sync trio ([[AppState and Persistence]]) silently
stops covering half the app.

## 2. Theory is deterministic — never hardcode or hallucinate fret numbers
All notes/positions come from [[The Music Theory Engine]], which is tested.
Any LLM layer may only *choose* constrained inputs (a `SCALES` key, a note
name, a position index) and let the engine compute. LLMs hallucinate frets;
the engine does not. This same rule powers the whole [[SSG and SEO Surface]]
— 1,700+ public pages with zero hand-typed musical facts.

## 3. Notes are pitch classes 0–11 internally
0=C … 11=B everywhere except inside [[The Audio Engine]], where MIDI numbers
live. `chordToMidi`/`noteIndex` are the border crossings. Mixing the two is
the classic off-by-an-octave bug factory.

## 4. The theory/audio engine is client-only — not up for debate
Anything needing a secret (payments, auth, sync) goes through a Vercel
function in `api/` ([[Monetization and the API]]). Never ship a secret to the
browser; never let any client claim "I'm subscribed" — the Polar webhook is
the only writer of that flag.

## 5. Audio routes through one shared AudioContext
`getCtx()` → every source connects through `masterGain` (dry + reverb) and
**must clean up its nodes on stop** (see `stopDrone`/`stopChordPad`).
**If you fight it:** zombie oscillators that keep sounding after "stop", and
an AudioContext-per-click leak that eventually kills sound entirely.

## 6. Default chord/scale quality follows the key
A minor key implies a minor default chord. `MINOR_QUALITIES` in App.tsx
encodes it. Defaulting to major regardless of key reads as "the app ignores
me" to a musician — this was direct user feedback, treat it as load-bearing.
