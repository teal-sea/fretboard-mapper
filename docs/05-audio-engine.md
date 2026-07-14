# 05 · Audio engine (`src/utils/audioEngine.ts`)

Pure Web Audio side-effects. No React, no theory tables. Notes here are **MIDI**.
Four sound sources share one `AudioContext`: the **chord pad**, the **drone**,
the **arpeggiator**, and the **metronome**. The first three are the selectable
**backing modes** (`AppState.backingMode: 'drone' | 'chord' | 'arp'`) — the
unified Play button starts whichever is selected, plus the mic.

## Shared context & routing

```ts
getCtx(): AudioContext   // lazy singleton; resumes if suspended
```
Created on first sound (a user gesture, satisfying autoplay policy). It builds a
fixed master bus once:

```
  masterGain ──┬─► dryGain (0.4) ──────────────────────┐
               └─► reverb (convolver) ─► wetGain (0.6) ─┤
                                                        ▼
                                        limiter (compressor) ─► destination
```
`reverb` is a **procedurally generated 4.5s hall impulse** (`createReverb`).
The **limiter** (a `DynamicsCompressorNode`, threshold −6 dB, ratio 16) exists
because the user Volume controls go up to **3×** — without it, cranking volume
was just hard digital clipping. **Every new sound source must connect into
`masterGain`** to get the shared reverb + limiter, and **must disconnect its
nodes on stop** to avoid leaks.

Helpers: `midiToFreq(midi)`, `makeSaturationCurve(amount)` (a `tanh` waveshaper).

## User sound-design controls (Settings → DRONE / PAD)

Both the drone and the pad expose live-adjustable module-level knobs, persisted
in `AppState` and synced via `useEffect`s in `App.tsx`:

```ts
setDroneVolume(v) / setDroneSpread(v) / setDroneTone(v)   // + getters
setPadVolume(v)   / setPadSpread(v)   / setPadTone(v)     // + getters
```
- **Volume** `0–3` — multiplies a dedicated `volumeGain` node (live via
  `setTargetAtTime`; the 3× headroom is why the limiter exists).
- **Spread** `0–1.5` — multiplies every voice's stereo pan (`basePan * spread`,
  clamped to ±1).
- **Tone** `0–1` — recentres the breathing lowpass (drone: 300–3500 Hz;
  pad: 500–4500 Hz).

They apply live if the sound is playing, and are picked up on the next start
otherwise. The arpeggiator reuses the **pad's** Volume/Spread/Tone — it's the
same "chord voice" family, plucked instead of held.

## 1 · Chord pad — `playChordPad` / `stopChordPad`

```ts
playChordPad(midiNotes: number[], latched = false): void
stopChordPad(): void
chordToMidi(rootDegree: number, intervals: number[]): number[]  // root at C3=48 + intervals
```
An "ethereal" pad: **8 oscillator layers per note** (sine + two detuned sines +
two triangles + sub octave + fifth shimmer + octave shimmer), stereo-spread,
through a breathing lowpass, highpass, and saturation, with a slow
bloom→swell→fade envelope.

The pad is deliberately **timbrally distinct from the drone**: much wider detune
(±14/±22 cents vs the drone's ±6) and audible fifth/octave shimmer the drone
doesn't have. They used to share detune amounts and were indistinguishable.

- `latched = false` → timed one-shot (~9.6s, self-cleans via `setTimeout`).
- `latched = true` → sustains indefinitely; ended by `stopChordPad` (0.3s fade).

Only one pad plays at a time. Used by the harmony map, chord buttons, the
progression stepper, and **backing mode `'chord'`** (latched, holding the mode's
parent chord — see `backingChordMidi` in `App.tsx`).

## 2 · Drone — `startDrone` / `stopDrone`  *(backing mode `'drone'`)*

```ts
startDrone(rootPc: number, scaleIntervals: number[]): void  // rootPc = pitch class 0–11
stopDrone(): void
isDroneRunning(): boolean
```
A sustained **pedal tone**: root + fifth (plus sub layers), with *timbral*
movement only — a very slow breathing lowpass LFO, gentle saturation, slow
tremolo, 5s bloom.

> **History, so nobody reintroduces it:** the drone originally had three upper
> "drift voices" gliding between scale tones every ~7s. That made it sound like
> a slowly shifting *chord*, which defeats the whole point — a drone is the one
> fixed thing you hear everything else against. The drift system was removed
> (PR #33). If you want moving harmony under the player, that's the chord pad
> or the arpeggiator, not the drone.

`App.tsx` retunes it in place when the key changes while playing (a `useEffect`
on `droneTuning`). Lifecycle: `startDrone` calls `stopDrone` first (2.5s fade +
deferred disconnect of the old graph), builds fresh. Copy this cleanup pattern
for any new sustained source.

## 3 · Arpeggiator — `startArpeggio` / `stopArpeggio`  *(backing mode `'arp'`)*

```ts
startArpeggio(midiNotes: number[], bpm: number): void  // up-then-down, 8th notes
setArpBpm(bpm: number): void                           // reschedules live
stopArpeggio(): void
isArpeggioRunning(): boolean
```
The same chord tones as backing mode `'chord'`, played one at a time
(up-then-down), locked to `AppState.progressionBpm`. Each pluck is a short
triangle+shimmer voice through the pad's Volume/Spread/Tone. Selecting `'arp'`
also brings the **metronome** in with Play (see `togglePlay` in `App.tsx`), and
a BPM stepper appears inline next to the backing switch.

## 4 · Metronome — `startMetronome` / `stopMetronome`

```ts
startMetronome(bpm: number, onBeat?: (beat:number)=>void): void
stopMetronome(): void
isMetronomeRunning(): boolean
```
`setInterval`-scheduled clicks; accented downbeat every 4th beat. Used by the
progression stepper and by the arpeggiator backing mode.

> Timing is `setInterval`-based, adequate for a practice tool. If you ever need
> sample-accurate timing (e.g. timing-scored exercises), switch to look-ahead
> scheduling against `audioCtx.currentTime` — but don't do it speculatively.

## 5 · Listening — `micInput.ts` + `pitchDetect.ts`  *(the feedback loop)*

Two layers, deliberately split:

- **`micInput.ts`** — the shared input pipe. `startMic()`, `stopMic()`,
  `readPitch()`, plus `getLastRms()` / `getRmsGate()` (the live level/gate pair
  behind the on-screen mic meter). Captures into an `AnalyserNode` (fftSize
  4096); never routed to the speakers.
- **`pitchDetect.ts`** — pure DSP, no Web Audio, unit-tested with synthesized
  waveforms. McLeod Pitch Method (NSDF autocorrelation, first-peak rule,
  parabolic interpolation). Monophonic, 40 Hz–4.5 kHz, source-agnostic.

`App.tsx` polls `readPitch()` ~20×/s while `listening`, debounces (a note must
be heard twice to commit; it lingers ~500ms after decay so fast-dying treble
strings get the same on-screen hang time as bass notes), and passes `heardMidi`
to `<Fretboard/>`.

### Backing-track bleed — the hard-won part

With the backing sound on speakers, the mic hears the app's own output, and a
drone/pad is quasi-periodic — the detector happily reports the backing sound's
root forever instead of the player. Two defenses, in order of importance:

1. **Echo cancellation is ON** (`echoCancellation: true` in `getUserMedia`).
   AEC subtracts audio the device knows it is outputting — exactly this bleed.
   It was originally off (voice-call DSP can dull instrument transients), but a
   level gate fundamentally cannot distinguish "loud bleed" from "loud playing",
   and every mic bug traced back to that. `noiseSuppression` and
   `autoGainControl` stay **off** — they reshape dynamics with no upside here.
2. **Ambient calibration** as a backstop: `recalibrateMic()` samples ambient RMS
   (median of 8 windows) and sets the gate to **1.6×** that floor, hard-capped
   at **0.02**. Both numbers were tuned against a real guitar + real speakers:
   the old 2.5×/0.07 let the gate calibrate above what treble strings (which
   move less air than bass strings at equal pick attack) ever reach.
   Recalibration re-fires ~3s after **anything that changes the bleed**:
   Play on/off, backing mode, drone/pad volume, or the backing chord itself
   (`useEffect` in `App.tsx`). Calibrating only on toggle was a real bug — turn
   the volume up and the mic starts hearing the drone again.

Headphones remain the zero-bleed path.

## Conventions for new sounds

1. Get the context via `getCtx()`; never `new AudioContext()` elsewhere.
2. Route through `masterGain` (reverb + limiter come free).
3. Track every node you create and disconnect on stop (copy `stopDrone`).
4. Keep MIDI↔pitch-class conversion at this boundary — callers pass pitch
   classes or `SCALES` intervals; the engine turns them into frequencies.
5. If the sound is user-audible for long stretches, give it Volume/Spread/Tone
   knobs following the drone/pad setter pattern (module-level value + live
   `setTargetAtTime` + `AppState` field + sync effect).
