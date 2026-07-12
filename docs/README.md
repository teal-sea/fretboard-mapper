# Fretboard Mapper — Developer Wiki

A dense, self-contained knowledge base for building on this codebase — written to
be read by both humans and LLM agents. If you're an agent starting a task, read
[`../CLAUDE.md`](../CLAUDE.md) first, then the page below that matches your work.

## Pages

| # | Page | Read it when… |
|---|------|---------------|
| 01 | [Overview & Vision](01-overview.md) | You want the *why* — product goal, the flow-state loop, what exists vs. what's next. |
| 02 | [Architecture](02-architecture.md) | You need the *shape* — stack, data flow, render pipeline, boundaries. |
| 03 | [State: the `AppState` contract](03-state.md) | You're changing behavior or **driving the app programmatically**. The most important page. |
| 04 | [Music theory engine](04-music-theory.md) | You're touching notes, scales, chords, positions, or technique patterns. |
| 05 | [Audio engine](05-audio-engine.md) | You're touching sound — pad, metronome, drone. |
| 06 | [Components](06-components.md) | You're rendering the neck or a subview. |
| 07 | [Conventions & workflow](07-conventions.md) | You're about to write code, tests, or open a PR. |
| 08 | [Roadmap](08-roadmap.md) | You're deciding *what to build next* and how it should slot in. |

## The 30-second mental model

```
        User picks Key + Mode/Chord  ─────────────┐
                                                   ▼
   ┌─────────────────────────────────────────────────────────┐
   │  App.tsx : one AppState object, one up(partial) updater  │
   └───────────────┬───────────────────────┬─────────────────┘
                   │ derives (useMemo)      │ calls
                   ▼                        ▼
        musicTheory.ts                 audioEngine.ts
   (pure, deterministic,           (Web Audio: pad,
    tested — notes/positions)       metronome, drone)
                   │                        │
                   ▼                        ▼
            <Fretboard/> renders      sound out
```

Everything the user sees on the neck is **derived** from `AppState` via pure
functions. Nothing is stored in the DOM or in component-local state (except
transient audio flags). Change `AppState`, and the whole view + audio follow.
