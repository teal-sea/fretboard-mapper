# 01 · Overview & Vision

## What the app is today

A polished, client-side **guitar fretboard visualizer** with a built-in synth.
A user picks a **key** and a **mode/scale or chord**, and the neck lights up with
the right notes — labeled by note name and/or interval, colored per interval,
croppable to a fret window or a single CAGED-style position. On top of the
visualizer sit several practice tools:

- **Harmony map** — the diatonic chords of the key, organized by tier (triads,
  7ths, 9ths, …), each playable through an ethereal chord-pad synth.
- **Progression stepper** — sequence diatonic chords at a BPM with a metronome;
  the board auto-follows the current chord and previews the *next* chord as
  outline rings so you can anticipate the change.
- **Technique patterns** — 3-notes-per-string scale shapes, sweep-picking
  arpeggios, and wide-interval tapping voicings, overlaid on the neck.
- **Evolving drone** *(newest)* — a self-generating ambient pad in the current
  key you improvise over. See [05-audio-engine](05-audio-engine.md).

## The vision it's growing toward

A **flow-state practice companion**: collapse the distance between *"I have 30
minutes"* and *"I'm in the zone improvising"* to under ten seconds. The design
premise is that guitar practice stalls not from lack of information but from
**friction** — deciding what to work on, finding the shape, setting up a backing
context. Remove that friction and the player drops into flow.

Three intrinsic-reward drivers the tool is built around:

| Driver | The hit | How the app serves it |
|--------|---------|-----------------------|
| **Understanding** | "oh, *that's* how it works" | The decode/display layer: scales, harmony, intervals made visible and immediate. |
| **Trance / repetition** | slow-evolving, hypnotic | The evolving drone + progression loop — a stable bed to noodle over indefinitely. |
| **Expression** | playing what you hear | Everything points the hands at the neck so you play, not search. |

### The north-star loop

```
   concept  →  drone/backing  →  shape on the neck  →  hands  →  flow
   (what)       (where/feel)      (how to grab it)     (do it)
```

The pieces of this loop mostly **already exist** as deterministic features. The
open frontier is the **"concept" step** — an intelligent layer that picks *what
to explore this session* and configures the rest of the loop automatically. See
[08-roadmap](08-roadmap.md) for how that should slot in (spoiler: it just calls
`up({...})`).

## Design principles

1. **Speed to flow over feature count.** The metric that matters is minutes
   played, not features shipped. A control that takes longer to operate than
   picking up the guitar has failed.
2. **No lecturing.** One concept, one shape, immediate application — not a theory
   course.
3. **Correct by construction.** Theory is computed, never guessed, so the player
   can trust every dot on the neck.
4. **Zero setup.** Client-only, instant load, no account, no backend.
