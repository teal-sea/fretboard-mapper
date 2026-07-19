# Modal Runs Wiki

The knowledge graph for the Fretboard Mapper / Modal Runs codebase. Every
subsystem — state, theory engine, audio, mic games, API, SSG surface — as
interlinked markdown pages. Agents: read [[index]] first, keep [[log]] and
[[hot]] current, and update the affected page whenever you ship a change.

## Setup (takes 2 minutes)

1. Download Obsidian: https://obsidian.md
2. Open Obsidian → "Open folder as vault"
3. Select this `/wiki` folder
4. Press **Cmd+G** to see the graph

## Graph Color Legend

| Color | Domain | Pages |
|-------|--------|-------|
| Amber | The rules | The Golden Rules |
| Blue | State | AppState and Persistence |
| Green | Sound | The Audio Engine, Mic and Pitch Detection |
| Purple | Theory | The Music Theory Engine |
| Orange | Practice | The Practice Engines |
| Teal | UI | App.tsx and Components |
| Red | Money | Monetization and the API |
| Cyan | Public surface | SSG and SEO Surface |
| Indigo | Infra | Testing Tooling and CI, Conventions and Workflow |
| Gray | Meta | index, log, hot |

## What's In Here

| Page | What It Covers |
|------|---------------|
| [[The Golden Rules]] | The six invariants that make this codebase work — and what breaks if you fight them |
| [[AppState and Persistence]] | The one state object, `up()`, what's deliberately NOT in it, and the three persistence paths |
| [[The Music Theory Engine]] | `musicTheory.ts` — pure, deterministic, tested; pitch classes 0–11 |
| [[The Audio Engine]] | One AudioContext, pad/drone/arp/metronome, the cleanup rule, the MIDI boundary |
| [[Mic and Pitch Detection]] | McLeod/NSDF pitch detection, the 20 Hz poll, note-commit rules, echo cancellation |
| [[The Practice Engines]] | `src/hooks/` — Find It, Echo, the Walk, the Run player, and their effect-topology gotchas |
| [[App.tsx and Components]] | Anatomy of the shell (2,545 lines), the transport block, and every component |
| [[Monetization and the API]] | Clerk + Polar + Neon, the four endpoints, the security posture (audited 2026-07-19) |
| [[SSG and SEO Surface]] | 1,428 mode pages, 300 chord pages, 9 guides, llms.txt, 16 locales — all from the theory engine |
| [[Testing Tooling and CI]] | 381 tests, the Node 25 localStorage trap, coverage gaps, CI status |
| [[Conventions and Workflow]] | Code style, worktree/draft-PR flow, how to not fight the repo |

Relationship to `docs/`: docs/ is the older deep-reference layer (state field
tables, API signatures). The wiki is the navigable map; pages link into docs/
where line-level detail lives. If they disagree, fix whichever is wrong and
note it in [[log]].
