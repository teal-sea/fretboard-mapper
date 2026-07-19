# Mic and Pitch Detection

The ear of the product. Two modules with a deliberate split:

- `src/utils/pitchDetect.ts` — **pure DSP**, McLeod/NSDF pitch detection on
  a Float32Array. No Web Audio, fully tested.
- `src/utils/micInput.ts` — capture: `startMic(echoCancellation)` /
  `stopMic` / `readPitch` / `recalibrateMic` / `getLastRms` / `getRmsGate`.
  Owns the analyser and the **ambient RMS gate**: calibrated on start so room
  noise doesn't register as notes; `recalibrateMic` re-samples it.

## The poll (in App.tsx)
- ~20 Hz `setInterval` while `listening`.
- **Commit rules** (the reason detection feels stable):
  - A note must be heard **twice in a row** to commit (kills transients).
  - It **lingers ~500 ms** after you stop (kills strobing between notes and
    gives a fast-decaying high string the same lifetime as a bass note).
  - `heardMidi` therefore changes **once per NOTE, not per poll frame** —
    every consumer (games, walk, run, flow pulse) leans on this. If you break
    it, every "one heard note = one advance" contract downstream breaks too.
  - `micLevel` updates every 4th tick only (render-cost control).
- The tuner has its own 80 ms poll with cents smoothing, sharing `startMic`.

## Echo cancellation (user setting)
`micEchoCancellation` passes straight to `getUserMedia`. ON is right for
laptop-mic + laptop-speakers (cancels the app's own backing bleeding back
in). OFF is right for an audio interface or mic'd amp — with no acoustic
feedback path, AEC's adaptive filter chews the actual guitar signal and
notes cut in and out. Restart Listen/Play after changing it. Affects both
Play and the Tuner.

## Consumers
`heardMidi` feeds: [[The Practice Engines]] (all four), Flow's pulse/canvas
(`FlowCanvas` bursts, once per note), the focus-note reward in Learn, and
the heard-note readout ([[App.tsx and Components]]).

## Gotcha
Mic permission is requested **only when the user presses Play** — never on
load. This is a public promise (it's in `llms.txt`'s citation notes). Don't
add an eager `getUserMedia`.
