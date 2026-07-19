# 01 · Overview & Vision

## What the app is today

**Modal Runs** (modalruns.com): a client-side guitar practice tool that
*listens*. Hold a drone in any key, improvise, and the app hears you through
the mic (McLeod pitch detection, in-browser) — lighting up what you played on
the neck and confirming when you land the note it asked for. Three faces, one
`appMode` switch:

- **Modes (Learn)** — the landing. Lesson 1 is **the Walk**: seven positions,
  seven modes, same notes — move up the neck, the drone moves home with you,
  claim each mode by ear (claims persist). Plus one-sound drills and
  mic-driven **arpeggio runs** with the Twist (same shape, new home).
- **Flow** — the endless jam. Drone/pad/arp backing, slow modal drift through
  same-note siblings, an ambient particle canvas that answers your notes, and
  two ear games: **Find It** (locate the note it plays — exact octave) and
  **Echo** (repeat a growing phrase by ear).
- **Explore (Study)** — the full mapper: any scale/chord in any key, positions
  and voicings up the neck, the **harmony map** (diatonic chords by tier, each
  playable), the **progression stepper** (board follows the chord, previews
  the next), and **technique patterns** (3NPS / sweep / tapping).

Around the core: a chromatic tuner, favorites + practice streak, interval
color theming, 16-language localization, a 1,700+-page computed SEO surface
(mode/chord/guide pages — see `scripts/`), and optional $5/mo cross-device
sync (Clerk + Polar + Neon; the tool is fully free without it).

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

This loop **exists end-to-end now**: the concept step shipped as a curated
concept catalog (`utils/concepts.ts` + Learn mode + `getNextConcept`) —
Path A from [08-roadmap](08-roadmap.md). The open frontier has moved one
level up: an *adaptive* concept brain (what to explore next, given what your
ear has already claimed) — which still just computes a partial and calls
`up({...})`.

## Design principles

1. **Speed to flow over feature count.** The metric that matters is minutes
   played, not features shipped. A control that takes longer to operate than
   picking up the guitar has failed.
2. **No lecturing.** One concept, one shape, immediate application — not a theory
   course.
3. **Correct by construction.** Theory is computed, never guessed, so the player
   can trust every dot on the neck.
4. **Zero setup.** Client-only, instant load, no account, no backend — still
   true for the core tool. An optional account exists only for subscribers
   who want their favorites/streak/prefs synced across devices; nothing
   about picking up the guitar and playing requires it. See
   [02-architecture](02-architecture.md).
