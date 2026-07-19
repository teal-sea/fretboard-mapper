# The Audio Engine

`src/utils/audioEngine.ts` (~760 lines). Pure side-effect module: Web Audio,
no React, no theory tables. **Untested** — see [[Testing Tooling and CI]] —
which is why refactors avoid touching it and why audio changes need a human
ear before shipping ([[hot]]).

## Architecture
- `getCtx()` — the ONE shared `AudioContext` ([[The Golden Rules]] #5).
- `masterGain` — every source connects through it; dry + reverb send.
- **Cleanup rule**: every `stopX()` disconnects and frees its nodes. Copy
  `stopDrone`/`stopChordPad` when adding a source. Zombie oscillators are the
  failure mode.
- **MIDI numbers live only here.** The border crossings are `chordToMidi`
  (theory intervals → midi) and callers passing `midi` ints from `FretNote`.

## The sources
| Source | Start/stop | Notes |
|---|---|---|
| Chord pad | `playChordPad(midis, latch)` / `stopChordPad` | Also the practice hooks' note-player (Find It's target tone, Echo's phrase) |
| Drone | `startDrone(rootPc, intervals)` / `stopDrone` | Evolving modal pad; retunes by restart when key changes |
| Arpeggiator | `startArpeggio(midis, bpm)` / `stopArpeggio` / `setArpBpm` | `setArpBpm` reschedules live — no teardown on tempo change |
| Metronome | `startMetronome(bpm)` / `stopMetronome` | Re-calling start retimes a running click |

Sound-design knobs (`setDroneVolume/Spread/Tone`, `setPadVolume/Spread/Tone`)
apply live; App syncs them from AppState via six one-line effects.

## How the app drives it (the transport)
The wiring lives in App.tsx's transport block ([[App.tsx and Components]]):
- `backingMode: 'drone' | 'chord' | 'arp'` picks what Play runs underneath.
- The backing effect stops the other two sources before starting the chosen
  one — always `stopX(); stopY(); startZ(...)`, never overlap.
- The backing chord comes from the concept's `chordKey` (Flow/Learn) or
  `chordIntervalsForScale` (Study); root follows `droneTuning`, which follows
  whatever the neck shows — a concept retunes the drone just by writing state.
- Unmount cleanup stops timer + metronome + drone + mic.

## Rules for new sound
1. New source = start/stop pair in audioEngine.ts, nodes through
   `masterGain`, cleanup on stop.
2. Drive it from the transport block via AppState/local flags — don't invent
   a second is-playing truth ([[AppState and Persistence]]).
3. It stays untestable by vitest — so keep functions dumb and let the
   *decision* logic live in tested code.
