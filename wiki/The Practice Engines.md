# The Practice Engines

`src/hooks/` — extracted from App.tsx 2026-07-19 (PR #142). Each hook owns
its **transient** per-round state (deliberately outside AppState — see
[[AppState and Persistence]]) and receives `board`/`tuning`/mic flags from
App. Anything shared (key, scale, chord on the neck) still moves only through
`up()`.

## useFindIt — name it, then find it
Flow jam. Plays a note (`playChordPad`), neck goes **blank** while you hunt;
lights up the pitch class only to confirm a hit — lighting up is the reward,
not the instruction. Hit = **exact MIDI match** (octave matters — "find it on
this string" is meaningless otherwise). Scoring decays with time-to-find.
Filters: string subset + fret-range section. Enters/leaves with
`flowJam === 'findit' && isPlaying` — same Play button as everything else.

## useEcho — call and response
Plays a phrase (550 ms/note), you repeat it by ear. Miss → the SAME phrase
repeats (no partial credit, no new notes). Land it → phrase grows by one
(cap 8). Neck stays dark the whole time — ear-only, unlike Find It.

## useWalk — the centrepiece lesson
Seven positions, seven modes, same notes. `goToPosition` moves ONLY home
(root/quality via `up()`) — the notes on the neck never move; a running
drone follows you. Claims persist immediately via `utils/progress.ts`, keyed
by scale **family** (A minor and C major are the same walk). The mic feeds
`feedWalk`; resolving to the position's tonic claims the mode.

## useRun — the app follows your hands
Builds a run from the concept's arpeggio shape (sweeps need one-note-per-
string rakeable shapes; others use position shapes). Mic advances it one
heard note at a time; `scoreRun` narrates the attempt. **The Twist**:
`applyTwist` moves only the drone's home over the same shape —
`recontextualise` names what the shape now means. `resetRun` is the restart
button's API.

## ⚠️ Effect-topology traps (do not "fix" these)
Two patterns look like bugs and are load-bearing; both are commented in the
source:
1. **Advance-after-hit is its own effect** (Find It + Echo). The detection
   effect lists `revealed`/`status` as a dep so it stops reacting once
   resolved; if the advance timer lived inside it, setting that flag would
   re-run the effect and its cleanup would cancel the timer before it fired —
   freezing the game on the first hit forever.
2. **Echo's detection reads progress through refs** and depends on ONLY
   `[heardMidi, echoOn]`. Adding `echoPlayedIdx`/`echoStatus` to the deps
   makes advancing mid-phrase re-run detection against the same stale
   `heardMidi`, mismatching the next expected note into a false miss.

Also: every "one heard note = one advance" contract rests on `heardMidi`
committing once per note — see [[Mic and Pitch Detection]].

## Adding engine #5
Copy the shape: hook in `src/hooks/`, transient state inside, inputs
`{ active, board, tuning, heardMidi, ... }`, shared-state writes via `up()`
only, HUD JSX stays in App (or its own component). Update this page, [[index]]
and [[log]].
