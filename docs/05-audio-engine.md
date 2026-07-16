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
  masterGain (2.2) ──┬─► dryGain (0.4) ──────────────────────┐
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

`masterGain` itself is `2.2`, not unity — it's **makeup gain** for the dry/wet
split above it, not a design choice to lean on for "loud". At `1.0` the dry
path alone cuts to 0.4× before the limiter even sees it, which — combined with
the **metronome bypassing this whole bus** (below) — made the metronome
noticeably louder than the drone/pad by construction, not by ear. If you
change the dry/wet ratio, re-check this value; it exists to compensate for
exactly that split.

**The metronome does not route through `masterGain`.** It connects straight to
`ctx.destination` — full raw gain, no dry/wet split, no limiter. That's
deliberate (a click doesn't need reverb), but it means the metronome and
everything else on the shared bus are on two different loudness budgets by
design. Keep that in mind before comparing perceived volume across sources.

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

Every layer on both pedal voices used to be a pure sine between the sub-octave
(~33 Hz) and the fifth voice's fundamental (~185 Hz) — entirely at or below
what a phone speaker can physically reproduce, independent of gain. Each
voice now also carries a **triangle layer one octave up** (real harmonics,
not a pure tone), landing at 131–370 Hz depending on root — inside
small-speaker range — without changing the drone's bass character on real
speakers/headphones. If you add more layers, check where their *energy*
actually lands, not just the level you set it at; a loud layer below ~150 Hz
is often inaudible on a phone regardless.

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

1. **Echo cancellation is ON by default**, toggleable via `AppState.micEchoCancellation`
   (Settings → Microphone), threaded into `startMic(echoCancellation)`. AEC
   subtracts audio the device knows it is outputting — exactly this bleed —
   for the laptop-speaker-to-laptop-mic case this section is about. It was
   originally unconditional, but that's wrong for a **real mic through an
   external interface**: there's no acoustic feedback path there for AEC to
   legitimately cancel, so its adaptive filter chews on the actual musical
   signal instead. Symptom: a note registers for an instant, then gets
   suppressed as the filter "learns" it away. `startMic()` and `openTuner()`
   both read this setting — they share one mic pipeline, so fixing one fixes
   the other. `noiseSuppression` and `autoGainControl` stay **off**
   unconditionally — they reshape dynamics with no upside here regardless of
   input source.
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
