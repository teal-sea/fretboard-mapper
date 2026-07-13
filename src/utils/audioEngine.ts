// ─── Ethereal Chord Pad Synth ───────────────────────────────────────
// Celestial, shimmering pad: layered sines & triangles with wide detuning,
// long hall reverb, gentle filter breathing, slow swell envelope with peak.
// Supports latch mode for indefinite sustain.

let ctx: AudioContext | null = null
let reverbNode: ConvolverNode | null = null
let masterGain: GainNode | null = null

export function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext()
    masterGain = ctx.createGain()
    masterGain.gain.value = 1.0

    // Dry path
    const dryGain = ctx.createGain()
    dryGain.gain.value = 0.4

    // Wet path (reverb) — spacious
    const wetGain = ctx.createGain()
    wetGain.gain.value = 0.6

    reverbNode = createReverb(ctx)

    masterGain.connect(dryGain)
    masterGain.connect(reverbNode)
    reverbNode.connect(wetGain)
    dryGain.connect(ctx.destination)
    wetGain.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

// Long, diffuse hall reverb impulse
function createReverb(audioCtx: AudioContext): ConvolverNode {
  const convolver = audioCtx.createConvolver()
  const rate = audioCtx.sampleRate
  const length = rate * 4.5
  const impulse = audioCtx.createBuffer(2, length, rate)

  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch)
    for (let i = 0; i < length; i++) {
      const t = i / rate
      const decay = Math.exp(-t * 1.4)
      const predelay = t < 0.03 ? 0 : 1
      const noise = (Math.random() * 2 - 1)
      const early = (t > 0.03 && t < 0.15)
        ? Math.sin(t * 120 + ch * 1.5) * 0.2 * Math.exp(-(t - 0.03) * 15)
        : 0
      data[i] = (noise * decay * predelay + early) * 0.3
    }
  }
  convolver.buffer = impulse
  return convolver
}

function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12)
}

interface ActivePad {
  nodes: AudioNode[]
  oscillators: OscillatorNode[]
  envelope: GainNode
  volumeGain: GainNode
  panners: { node: StereoPannerNode; basePan: number }[]
  filter: BiquadFilterNode
  latched: boolean
}

let currentPad: ActivePad | null = null

// Same shape as the drone's controls (Settings → PAD), independent values —
// this used to share the drone's exact detune amounts and filter range,
// which is why the two were indistinguishable by ear. See the layer gains
// and detune ratios below for the actual timbral split.
let padVolume = 1
let padSpread = 1
let padTone = 0.5

const clampPad = (v: number, max = 1.5) => Math.max(0, Math.min(max, v))

export function setPadVolume(v: number): void {
  padVolume = clampPad(v)
  if (currentPad && ctx) currentPad.volumeGain.gain.setTargetAtTime(padVolume, ctx.currentTime, 0.1)
}
export function setPadSpread(v: number): void {
  padSpread = clampPad(v)
  if (currentPad && ctx) {
    const now = ctx.currentTime
    for (const { node, basePan } of currentPad.panners) {
      node.pan.setTargetAtTime(Math.max(-1, Math.min(1, basePan * padSpread)), now, 0.15)
    }
  }
}
export function setPadTone(v: number): void {
  padTone = Math.max(0, Math.min(1, v))
  if (currentPad && ctx) {
    const target = 500 + padTone * 4000
    currentPad.filter.frequency.setTargetAtTime(target, ctx.currentTime, 0.2)
  }
}
export function getPadVolume(): number { return padVolume }
export function getPadSpread(): number { return padSpread }
export function getPadTone(): number { return padTone }

// 4 bars at 100 BPM = 9.6 seconds
const DEFAULT_DURATION = 9.6

export function playChordPad(midiNotes: number[], latched: boolean = false): void {
  stopChordPad()

  const audioCtx = getCtx()
  if (!masterGain) return
  const now = audioCtx.currentTime

  const nodes: AudioNode[] = []
  const oscillators: OscillatorNode[] = []
  const panners: { node: StereoPannerNode; basePan: number }[] = []

  // For latched mode, use a very long duration so oscillators keep running
  const duration = latched ? 300 : DEFAULT_DURATION

  // ─── Master envelope ───
  const envelope = audioCtx.createGain()
  envelope.gain.setValueAtTime(0, now)
  nodes.push(envelope)

  const volumeGain = audioCtx.createGain()
  volumeGain.gain.value = padVolume
  nodes.push(volumeGain)

  if (latched) {
    // Latch: smooth bloom to sustain, hold indefinitely
    const attack = 1.8
    envelope.gain.setValueAtTime(0, now)
    envelope.gain.linearRampToValueAtTime(0.75, now + attack)
    // Gentle slow swell for life — oscillates between 0.7 and 0.85
    // (handled by tremolo LFO below)
  } else {
    // Timed mode: bloom → swell peak at ~65% → quick fade
    const attack = 2.0
    const peakTime = duration * 0.65
    const peakLevel = 1.0
    const sustainLevel = 0.7
    const fadeStart = duration - 0.8
    const fadeEnd = duration

    envelope.gain.setValueAtTime(0, now)
    envelope.gain.linearRampToValueAtTime(sustainLevel, now + attack)
    envelope.gain.linearRampToValueAtTime(peakLevel, now + peakTime)
    envelope.gain.linearRampToValueAtTime(sustainLevel * 0.85, now + fadeStart)
    envelope.gain.exponentialRampToValueAtTime(0.001, now + fadeEnd)
  }

  // Per-note gain — LOUDER
  const noteVol = 0.35 / Math.max(midiNotes.length, 1)

  // ─── Filter: gentle breathing lowpass ───
  const filter = audioCtx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.Q.setValueAtTime(0.5, now)
  nodes.push(filter)

  // padTone recentres this whole breathing range, same idea as the drone's
  // Tone control but on its own independent value.
  const padToneTarget = 500 + padTone * 4000
  if (latched) {
    // Latch: open slowly, hold open
    filter.frequency.setValueAtTime(padToneTarget * 0.2, now)
    filter.frequency.linearRampToValueAtTime(padToneTarget, now + 3.0)
  } else {
    const attack = 2.0
    const peakTime = duration * 0.65
    const fadeEnd = duration
    filter.frequency.setValueAtTime(padToneTarget * 0.2, now)
    filter.frequency.linearRampToValueAtTime(padToneTarget * 0.93, now + attack * 1.2)
    filter.frequency.linearRampToValueAtTime(padToneTarget * 1.13, now + peakTime)
    filter.frequency.exponentialRampToValueAtTime(padToneTarget * 0.27, now + fadeEnd)
  }

  // High-pass to remove mud
  const hiPass = audioCtx.createBiquadFilter()
  hiPass.type = 'highpass'
  hiPass.frequency.setValueAtTime(80, now)
  hiPass.Q.setValueAtTime(0.5, now)
  nodes.push(hiPass)

  // Gentle saturation for warmth
  const shaper = audioCtx.createWaveShaper()
  shaper.curve = makeSaturationCurve(0.8)
  shaper.oversample = '2x'
  nodes.push(shaper)

  // ─── Per-note oscillator stacks ───
  for (let ni = 0; ni < midiNotes.length; ni++) {
    const midi = midiNotes[ni]
    const freq = midiToFreq(midi)

    // Stereo spread
    const pan = audioCtx.createStereoPanner()
    const basePan = midiNotes.length > 1
      ? -0.5 + (ni / (midiNotes.length - 1)) * 1.0
      : 0
    pan.pan.setValueAtTime(Math.max(-1, Math.min(1, basePan * padSpread)), now)
    panners.push({ node: pan, basePan })
    nodes.push(pan)

    const noteGain = audioCtx.createGain()
    noteGain.gain.setValueAtTime(noteVol, now)
    nodes.push(noteGain)

    // Layer 1: Pure sine — clean foundation
    const sine1 = audioCtx.createOscillator()
    sine1.type = 'sine'
    sine1.frequency.setValueAtTime(freq, now)
    oscillators.push(sine1)

    // Layer 2: Detuned sine +14 cents — noticeably wider than the drone's
    // ±6 cents. This used to share the drone's exact detune amount, which
    // is a big part of why the two were indistinguishable by ear.
    const sine2 = audioCtx.createOscillator()
    sine2.type = 'sine'
    sine2.frequency.setValueAtTime(freq * 1.008, now)
    oscillators.push(sine2)

    // Layer 3: Detuned sine -14 cents
    const sine3 = audioCtx.createOscillator()
    sine3.type = 'sine'
    sine3.frequency.setValueAtTime(freq * 0.992, now)
    oscillators.push(sine3)

    // Layer 4: Triangle +22 cents — airy texture, wider chorus than the drone
    const tri1 = audioCtx.createOscillator()
    tri1.type = 'triangle'
    tri1.frequency.setValueAtTime(freq * 1.013, now)
    oscillators.push(tri1)

    // Layer 5: Triangle -22 cents
    const tri2 = audioCtx.createOscillator()
    tri2.type = 'triangle'
    tri2.frequency.setValueAtTime(freq * 0.987, now)
    oscillators.push(tri2)

    // Layer 6: Sub sine — one octave down
    const sub = audioCtx.createOscillator()
    sub.type = 'sine'
    sub.frequency.setValueAtTime(freq / 2, now)
    oscillators.push(sub)

    // Layer 7: Shimmer — fifth above, very quiet
    const shimmer5 = audioCtx.createOscillator()
    shimmer5.type = 'sine'
    shimmer5.frequency.setValueAtTime(freq * 1.498, now)
    oscillators.push(shimmer5)

    // Layer 8: High octave shimmer — triangle, barely there
    const shimmerHi = audioCtx.createOscillator()
    shimmerHi.type = 'triangle'
    shimmerHi.frequency.setValueAtTime(freq * 2.002, now)
    oscillators.push(shimmerHi)

    // Mix levels — shimmer boosted from the original 0.04/0.03: the drone
    // has no fifth/octave-above shimmer at all, so leaning into it here is
    // one more real point of difference, not just a wider detune.
    const gains = [
      { osc: sine1,    level: 0.30 },
      { osc: sine2,    level: 0.22 },
      { osc: sine3,    level: 0.22 },
      { osc: tri1,     level: 0.10 },
      { osc: tri2,     level: 0.10 },
      { osc: sub,      level: 0.15 },
      { osc: shimmer5, level: 0.07 },
      { osc: shimmerHi,level: 0.06 },
    ]

    for (const { osc, level } of gains) {
      const g = audioCtx.createGain()
      g.gain.setValueAtTime(level, now)
      nodes.push(g)
      osc.connect(g)
      g.connect(noteGain)
    }

    noteGain.connect(pan)
    pan.connect(hiPass)
  }

  // Signal chain: hiPass → filter → shaper → envelope → volumeGain → master
  hiPass.connect(filter)
  filter.connect(shaper)
  shaper.connect(envelope)
  envelope.connect(volumeGain)
  volumeGain.connect(masterGain)

  // LFO on filter for breathing
  const lfo = audioCtx.createOscillator()
  lfo.type = 'sine'
  lfo.frequency.setValueAtTime(latched ? 0.1 : 0.15, now)
  const lfoGain = audioCtx.createGain()
  lfoGain.gain.setValueAtTime(latched ? 400 : 300, now)
  lfo.connect(lfoGain)
  lfoGain.connect(filter.frequency)
  lfo.start(now)
  if (!latched) lfo.stop(now + duration + 0.5)
  nodes.push(lfoGain)

  // Subtle amplitude tremolo
  const tremolo = audioCtx.createOscillator()
  tremolo.type = 'sine'
  tremolo.frequency.setValueAtTime(latched ? 0.12 : 0.25, now)
  const tremoloGain = audioCtx.createGain()
  tremoloGain.gain.setValueAtTime(latched ? 0.08 : 0.06, now)
  tremolo.connect(tremoloGain)
  tremoloGain.connect(envelope.gain)
  tremolo.start(now)
  if (!latched) tremolo.stop(now + duration + 0.5)
  nodes.push(tremoloGain)

  // Start all oscillators
  oscillators.forEach(o => {
    o.start(now)
    if (!latched) o.stop(now + duration + 0.5)
  })

  currentPad = { nodes, oscillators, envelope, volumeGain, panners, filter, latched }

  // Cleanup after duration (only for timed mode)
  if (!latched) {
    setTimeout(() => {
      oscillators.forEach(o => { try { o.disconnect() } catch {} })
      nodes.forEach(n => { try { n.disconnect() } catch {} })
      if (currentPad?.envelope === envelope) currentPad = null
    }, (duration + 1.0) * 1000)
  }
}

export function stopChordPad(): void {
  if (!currentPad || !ctx) return
  const now = ctx.currentTime

  // Quick but smooth fade — 0.3s
  currentPad.envelope.gain.cancelScheduledValues(now)
  currentPad.envelope.gain.setValueAtTime(currentPad.envelope.gain.value, now)
  currentPad.envelope.gain.exponentialRampToValueAtTime(0.001, now + 0.3)

  const pad = currentPad
  currentPad = null

  setTimeout(() => {
    pad.oscillators.forEach(o => { try { o.stop() } catch {} })
    pad.oscillators.forEach(o => { try { o.disconnect() } catch {} })
    pad.nodes.forEach(n => { try { n.disconnect() } catch {} })
  }, 400)
}

// Very gentle saturation
function makeSaturationCurve(amount: number): Float32Array {
  const samples = 512
  const curve = new Float32Array(samples)
  for (let i = 0; i < samples; i++) {
    const x = (i * 2) / samples - 1
    curve[i] = Math.tanh(x * amount)
  }
  return curve
}

// Build MIDI notes for a chord: root in octave 3 + intervals
export function chordToMidi(rootDegree: number, intervals: number[]): number[] {
  const baseMidi = 48 + rootDegree // C3 = 48
  return intervals.map(i => baseMidi + i)
}

// ─── Arpeggiator ──────────────────────────────────────────────────────
// The third backing option alongside the drone (one held note) and the pad
// (all notes held together): the same chord tones, played one at a time,
// up then down, locked to bpm. Shares the pad's Volume/Tone controls —
// it's the same "chord voice" family, just plucked instead of sustained.

let arpTimer: ReturnType<typeof setInterval> | null = null
let arpSequence: number[] = []
let arpStep = 0
let arpBpmVal = 100

function pluckArpNote(midi: number, panPos: number, now: number): void {
  if (!ctx || !masterGain) return
  const audioCtx = ctx
  const freq = midiToFreq(midi)

  const pan = audioCtx.createStereoPanner()
  pan.pan.setValueAtTime(Math.max(-1, Math.min(1, panPos * padSpread)), now)

  const filter = audioCtx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.Q.setValueAtTime(0.7, now)
  filter.frequency.setValueAtTime(500 + padTone * 5000, now)

  const gain = audioCtx.createGain()
  const peak = 0.32 * padVolume
  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(peak, now + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55)

  const body = audioCtx.createOscillator()
  body.type = 'triangle'
  body.frequency.setValueAtTime(freq, now)

  const shimmer = audioCtx.createOscillator()
  shimmer.type = 'sine'
  shimmer.frequency.setValueAtTime(freq * 2.002, now)
  const shimmerGain = audioCtx.createGain()
  shimmerGain.gain.setValueAtTime(0.15, now)

  body.connect(gain)
  shimmer.connect(shimmerGain)
  shimmerGain.connect(gain)
  gain.connect(filter)
  filter.connect(pan)
  pan.connect(masterGain)

  body.start(now); body.stop(now + 0.6)
  shimmer.start(now); shimmer.stop(now + 0.6)
  setTimeout(() => {
    for (const n of [body, shimmer, gain, filter, pan, shimmerGain]) {
      try { n.disconnect() } catch { /* already disconnected */ }
    }
  }, 700)
}

function arpTick(): void {
  if (!ctx || arpSequence.length === 0) return
  const now = ctx.currentTime
  const i = arpStep % arpSequence.length
  const panPos = arpSequence.length > 1 ? -0.6 + (i / (arpSequence.length - 1)) * 1.2 : 0
  pluckArpNote(arpSequence[i], panPos, now)
  arpStep++
}

function scheduleArpTimer(): void {
  if (arpTimer) clearInterval(arpTimer)
  const interval = 60000 / arpBpmVal / 2 // 8th notes
  arpTimer = setInterval(arpTick, interval)
}

export function startArpeggio(midiNotes: number[], bpm: number): void {
  if (midiNotes.length === 0) return
  getCtx()
  const down = midiNotes.slice(1, -1).reverse()
  arpSequence = midiNotes.length > 1 ? [...midiNotes, ...down] : midiNotes
  arpBpmVal = bpm
  arpStep = 0
  arpTick()
  scheduleArpTimer()
}

export function setArpBpm(bpm: number): void {
  arpBpmVal = bpm
  if (arpTimer) scheduleArpTimer()
}

export function stopArpeggio(): void {
  if (arpTimer) {
    clearInterval(arpTimer)
    arpTimer = null
  }
  arpStep = 0
  arpSequence = []
}

export function isArpeggioRunning(): boolean {
  return arpTimer !== null
}

// ─── Metronome ──────────────────────────────────────────────────────
let metronomeTimer: ReturnType<typeof setInterval> | null = null
let metronomeBeat = 0

export function startMetronome(bpm: number, onBeat?: (beat: number) => void): void {
  stopMetronome()
  const audioCtx = getCtx()
  metronomeBeat = 0
  const interval = 60000 / bpm

  const tick = () => {
    const now = audioCtx.currentTime
    const isDownbeat = metronomeBeat % 4 === 0
    const freq = isDownbeat ? 1200 : 800
    const vol = isDownbeat ? 0.3 : 0.15

    const osc = audioCtx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, now)

    const gain = audioCtx.createGain()
    gain.gain.setValueAtTime(vol, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06)

    osc.connect(gain)
    gain.connect(audioCtx.destination)
    osc.start(now)
    osc.stop(now + 0.07)

    if (onBeat) onBeat(metronomeBeat)
    metronomeBeat++
  }

  tick() // first beat immediately
  metronomeTimer = setInterval(tick, interval)
}

export function stopMetronome(): void {
  if (metronomeTimer) {
    clearInterval(metronomeTimer)
    metronomeTimer = null
  }
  metronomeBeat = 0
}

export function isMetronomeRunning(): boolean {
  return metronomeTimer !== null
}

// ─── Generative Evolving Drone ──────────────────────────────────────
// A self-evolving modal drone. A fixed root+fifth+sub pedal anchors the
// tonal center while a few upper voices slowly glide between scale tones,
// so the texture drifts and never quite repeats (Eno / Marconi Union feel).
// Infinite until stopped. Reuses the pad's reverb + master routing.

type Layer = { ratio: number; type: OscillatorType; gain: number }

interface ActiveDrone {
  nodes: AudioNode[]
  oscillators: OscillatorNode[]
  envelope: GainNode
  volumeGain: GainNode
  panners: { node: StereoPannerNode; basePan: number }[]
  filter: BiquadFilterNode
}

let currentDrone: ActiveDrone | null = null

// User-controlled drone sound-design knobs. Module-level so they persist
// across drone restarts (key changes, mode switches) without the caller
// having to thread them through every startDrone() call.
let droneVolume = 1    // 0–1.5, multiplies the envelope's peak level
let droneSpread = 1    // 0–1.5, multiplies every voice's stereo pan
let droneTone = 0.5    // 0–1, where the breathing lowpass sits (dark → bright)

const clamp01 = (v: number, max = 1.5) => Math.max(0, Math.min(max, v))

export function setDroneVolume(v: number): void {
  droneVolume = clamp01(v)
  if (currentDrone && ctx) {
    currentDrone.volumeGain.gain.setTargetAtTime(droneVolume, ctx.currentTime, 0.1)
  }
}

export function setDroneSpread(v: number): void {
  droneSpread = clamp01(v)
  if (currentDrone && ctx) {
    const now = ctx.currentTime
    for (const { node, basePan } of currentDrone.panners) {
      node.pan.setTargetAtTime(Math.max(-1, Math.min(1, basePan * droneSpread)), now, 0.15)
    }
  }
}

export function setDroneTone(v: number): void {
  droneTone = Math.max(0, Math.min(1, v))
  if (currentDrone && ctx) {
    // Same 500–2200Hz breathing range the drone already animates within —
    // tone just re-centres where that range sits.
    const target = 300 + droneTone * 3200
    currentDrone.filter.frequency.setTargetAtTime(target, ctx.currentTime, 0.2)
  }
}

export function getDroneVolume(): number { return droneVolume }
export function getDroneSpread(): number { return droneSpread }
export function getDroneTone(): number { return droneTone }

// Start a modal drone rooted at pitch-class `rootPc` (0=C..11=B) using the
// given scale intervals (semitone offsets from the root, e.g. [0,2,3,5,7,9,10]).
export function startDrone(rootPc: number, scaleIntervals: number[]): void {
  stopDrone()

  const audioCtx = getCtx()
  if (!masterGain || scaleIntervals.length === 0) return
  const now = audioCtx.currentTime

  const pc = ((rootPc % 12) + 12) % 12
  const pcs = new Set(scaleIntervals.map(i => (((pc + i) % 12) + 12) % 12))

  const nodes: AudioNode[] = []
  const oscillators: OscillatorNode[] = []
  const panners: { node: StereoPannerNode; basePan: number }[] = []

  // ─── Master drone envelope — slow bloom, hold indefinitely ───
  // The bloom shape (attack) is fixed; overall level is the separate,
  // live-adjustable volumeGain below it, so the Volume control can be
  // turned while the drone is already sustaining without re-triggering
  // the swell.
  const envelope = audioCtx.createGain()
  envelope.gain.setValueAtTime(0, now)
  envelope.gain.linearRampToValueAtTime(0.85, now + 5)
  nodes.push(envelope)

  const volumeGain = audioCtx.createGain()
  volumeGain.gain.value = droneVolume
  nodes.push(volumeGain)

  // ─── Shared tone-shaping: hiPass → breathing lowpass → saturation → envelope → master ───
  const hiPass = audioCtx.createBiquadFilter()
  hiPass.type = 'highpass'
  hiPass.frequency.value = 60
  hiPass.Q.value = 0.5
  nodes.push(hiPass)

  const filter = audioCtx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.Q.value = 0.6
  const toneTarget = 300 + droneTone * 3200
  filter.frequency.setValueAtTime(toneTarget * 0.3, now)
  filter.frequency.linearRampToValueAtTime(toneTarget, now + 8)
  nodes.push(filter)

  const shaper = audioCtx.createWaveShaper()
  shaper.curve = makeSaturationCurve(0.7)
  shaper.oversample = '2x'
  nodes.push(shaper)

  hiPass.connect(filter)
  filter.connect(shaper)
  shaper.connect(envelope)
  envelope.connect(volumeGain)
  volumeGain.connect(masterGain)

  // Very slow breathing LFO on the cutoff
  const lfo = audioCtx.createOscillator()
  lfo.type = 'sine'
  lfo.frequency.value = 0.05
  const lfoGain = audioCtx.createGain()
  lfoGain.gain.value = 500
  lfo.connect(lfoGain)
  lfoGain.connect(filter.frequency)
  oscillators.push(lfo)
  nodes.push(lfoGain)

  // Build a small oscillator stack on a base note; returns glide handles.
  const makeVoice = (baseMidi: number, level: number, pan: number, layers: Layer[]) => {
    const panner = audioCtx.createStereoPanner()
    panner.pan.value = Math.max(-1, Math.min(1, pan * droneSpread))
    panners.push({ node: panner, basePan: pan })
    nodes.push(panner)

    const voiceGain = audioCtx.createGain()
    voiceGain.gain.value = level
    nodes.push(voiceGain)

    const baseFreq = midiToFreq(baseMidi)
    const handles: { osc: OscillatorNode; ratio: number }[] = []
    for (const L of layers) {
      const osc = audioCtx.createOscillator()
      osc.type = L.type
      osc.frequency.setValueAtTime(baseFreq * L.ratio, now)
      const g = audioCtx.createGain()
      g.gain.value = L.gain
      osc.connect(g)
      g.connect(voiceGain)
      nodes.push(g)
      oscillators.push(osc)
      handles.push({ osc, ratio: L.ratio })
    }
    voiceGain.connect(panner)
    panner.connect(hiPass)
    return handles
  }

  // ─── Pedal (anchor): root + fifth + sub, never moves ───
  const pedalRoot = 36 + pc // C2..B2
  makeVoice(pedalRoot, 0.28, 0, [
    { ratio: 1,      type: 'sine', gain: 0.5 },
    { ratio: 1.0035, type: 'sine', gain: 0.35 },
    { ratio: 0.9965, type: 'sine', gain: 0.35 },
    { ratio: 0.5,    type: 'sine', gain: 0.4 }, // sub octave
  ])
  makeVoice(pedalRoot + 7, 0.14, -0.15, [
    { ratio: 1,     type: 'sine', gain: 0.5 },
    { ratio: 1.004, type: 'sine', gain: 0.3 },
  ])

  // Slow amplitude tremolo for life
  const trem = audioCtx.createOscillator()
  trem.type = 'sine'
  trem.frequency.value = 0.08
  const tremGain = audioCtx.createGain()
  tremGain.gain.value = 0.06
  trem.connect(tremGain)
  tremGain.connect(envelope.gain)
  oscillators.push(trem)
  nodes.push(tremGain)

  // Start everything exactly once
  oscillators.forEach(o => { try { o.start(now) } catch {} })

  currentDrone = { nodes, oscillators, envelope, volumeGain, panners, filter }
}

export function stopDrone(): void {
  if (!currentDrone || !ctx) return
  const now = ctx.currentTime
  const drone = currentDrone
  currentDrone = null

  drone.envelope.gain.cancelScheduledValues(now)
  drone.envelope.gain.setValueAtTime(drone.envelope.gain.value, now)
  drone.envelope.gain.linearRampToValueAtTime(0, now + 2.5)

  setTimeout(() => {
    drone.oscillators.forEach(o => { try { o.stop() } catch {}; try { o.disconnect() } catch {} })
    drone.nodes.forEach(n => { try { n.disconnect() } catch {} })
  }, 2700)
}

export function isDroneRunning(): boolean {
  return currentDrone !== null
}
