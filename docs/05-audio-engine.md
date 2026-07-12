# 05 · Audio engine (`src/utils/audioEngine.ts`)

Pure Web Audio side-effects. No React, no theory tables. Notes here are **MIDI**.
Three instruments share one `AudioContext`: the **chord pad**, the **metronome**,
and the **evolving drone**.

## Shared context & routing

```ts
getCtx(): AudioContext   // lazy singleton; resumes if suspended
```
Created on first sound (a user gesture, satisfying autoplay policy). It builds a
fixed master bus once:

```
  masterGain ──┬─► dryGain (0.4) ─────────────► destination
               └─► reverb (convolver) ─► wetGain (0.6) ─► destination
```
`reverb` is a **procedurally generated 4.5s hall impulse** (`createReverb`) —
exponential-decay noise + early reflections. **Every new sound source must connect
into `masterGain`** to get the shared reverb, and **must disconnect its nodes on
stop** to avoid leaks.

Helpers: `midiToFreq(midi)`, `makeSaturationCurve(amount)` (a `tanh` waveshaper
for warmth).

## 1 · Chord pad — `playChordPad` / `stopChordPad`

```ts
playChordPad(midiNotes: number[], latched = false): void
stopChordPad(): void
chordToMidi(rootDegree: number, intervals: number[]): number[]  // root at C3=48 + intervals
```
An "ethereal" pad: **8 oscillator layers per note** (sine + two detuned sines +
two triangles + sub octave + fifth shimmer + octave shimmer), stereo-spread,
through a breathing lowpass (LFO-modulated), highpass, and saturation, with a
slow bloom→swell→fade envelope.

- `latched = false` → timed one-shot (~9.6s, self-cleans via `setTimeout`).
- `latched = true` → sustains indefinitely (300s cap) with a slow filter open +
  tremolo; ended by `stopChordPad` (0.3s fade + disconnect).

Only one pad plays at a time (`playChordPad` calls `stopChordPad` first). Used by
the harmony map, chord buttons, and the progression stepper.

## 2 · Metronome — `startMetronome` / `stopMetronome`

```ts
startMetronome(bpm: number, onBeat?: (beat:number)=>void): void
stopMetronome(): void
isMetronomeRunning(): boolean
```
`setInterval`-scheduled clicks (short sine blips); accented downbeat every 4th
beat (1200Hz/0.3 vs 800Hz/0.15). Optional `onBeat` callback per tick.

> Timing is `setInterval`-based, adequate for a practice tool. If you ever need
> sample-accurate timing, switch to look-ahead scheduling against
> `audioCtx.currentTime` — but don't do it speculatively.

## 3 · Evolving drone — `startDrone` / `stopDrone`  *(the flow bed)*

```ts
startDrone(rootPc: number, scaleIntervals: number[]): void  // rootPc = pitch class 0–11
stopDrone(): void
isDroneRunning(): boolean
```
A **self-evolving modal drone** to improvise over — the audio half of the
north-star loop. `App.tsx` calls it with `noteIndex(keyRoot)` and
`SCALES[keyQuality].intervals`, and **retunes it in place** when the key/mode
changes while it plays (a `useEffect` on `[keyRoot, keyQuality]`).

**How it evolves:**
- A fixed **pedal** — root + fifth + sub octave — anchors the tonal center and
  never moves.
- **Three upper voices** sit on scale tones in the G3/C4/E4 registers. A `~7s`
  scheduler picks one voice and **glides it** to a neighboring scale tone (3–5s
  exponential portamento). Because the pedal stays put, drift always resolves
  against a stable root, so it wanders without losing the key. This is the "never
  quite repeats" (Eno / Marconi Union) effect.
- Shared shaping: a very slow breathing lowpass LFO (0.05Hz), gentle saturation,
  and slow amplitude tremolo. 5s bloom on start.

**Lifecycle / cleanup contract:** `startDrone` calls `stopDrone` first (2.5s fade
of the previous drone + a `setTimeout` that stops & disconnects its oscillators
and nodes), then builds a fresh graph. All oscillators are started exactly once.
`stopDrone` clears the drift interval, fades the master envelope over 2.5s, then
disconnects. Retuning mid-play crossfades cleanly with no node leak (old and new
graphs are independent).

### Extending the drone (likely next steps)
- **Voice count / register** scales via the `registers` array in `startDrone`.
- **Drift character** is the `glide()` step logic + the `7000ms` scheduler
  interval — slower interval = calmer.
- **Chord-aware drone:** to lock voices to a specific chord's tones instead of the
  whole scale, pass a chord's pitch classes as the pool. Keep the pedal on the
  key root so it still grounds.

## 4 · Listening — `micInput.ts` + `pitchDetect.ts`  *(the feedback loop)*

The app can hear the player and answer on the neck. Two layers, deliberately split:

- **`micInput.ts`** — the shared input pipe. `startMic()` (music-appropriate
  constraints: echo cancellation / noise suppression / auto-gain all **off**),
  `stopMic()`, `readPitch()`. Captures into an `AnalyserNode` (fftSize 4096) on
  the shared context; never routed to the speakers. Future detectors (e.g. an
  onset detector for rhythm feedback) consume this same stream.
- **`pitchDetect.ts`** — pure DSP, no Web Audio, fully unit-tested with
  synthesized waveforms. McLeod Pitch Method (NSDF autocorrelation, first-peak
  rule, parabolic interpolation). Source-agnostic: guitar, bass, whistling,
  humming — anything **monophonic and pitched** (40 Hz–4.5 kHz). Percussive
  input has no pitch and correctly returns `null`.

`App.tsx` polls `readPitch()` ~20×/s while `listening`, debounces to note-level
changes, and passes `heardMidi` to `<Fretboard/>`, which rings every location
producing that pitch (white = in scale, red = off the map). In flow mode, landing
the concept's focus interval lights the badge — **confirmation, not judgment**:
no scores, no misses, no streaks.

Known physics: with the drone on speakers the mic hears the drone. The Listen
button recommends headphones; if this ever needs solving properly, the app knows
exactly which frequencies the drone emits and can notch them out.

## Conventions for new sounds

1. Get the context via `getCtx()`; never `new AudioContext()` elsewhere.
2. Route through `masterGain`.
3. Track every `OscillatorNode` and `AudioNode` you create and disconnect them on
   stop (copy the `stopDrone` pattern).
4. Keep MIDI↔pitch-class conversion at this boundary — callers pass pitch classes
   or `SCALES` intervals; the engine turns them into frequencies.
