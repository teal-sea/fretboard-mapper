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
  latched: boolean
}

let currentPad: ActivePad | null = null

// 4 bars at 100 BPM = 9.6 seconds
const DEFAULT_DURATION = 9.6

export function playChordPad(midiNotes: number[], latched: boolean = false): void {
  stopChordPad()

  const audioCtx = getCtx()
  if (!masterGain) return
  const now = audioCtx.currentTime

  const nodes: AudioNode[] = []
  const oscillators: OscillatorNode[] = []

  // For latched mode, use a very long duration so oscillators keep running
  const duration = latched ? 300 : DEFAULT_DURATION

  // ─── Master envelope ───
  const envelope = audioCtx.createGain()
  envelope.gain.setValueAtTime(0, now)
  nodes.push(envelope)

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

  if (latched) {
    // Latch: open slowly, hold open
    filter.frequency.setValueAtTime(600, now)
    filter.frequency.linearRampToValueAtTime(3000, now + 3.0)
  } else {
    const attack = 2.0
    const peakTime = duration * 0.65
    const fadeEnd = duration
    filter.frequency.setValueAtTime(600, now)
    filter.frequency.linearRampToValueAtTime(2800, now + attack * 1.2)
    filter.frequency.linearRampToValueAtTime(3400, now + peakTime)
    filter.frequency.exponentialRampToValueAtTime(800, now + fadeEnd)
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
    const spread = midiNotes.length > 1
      ? -0.5 + (ni / (midiNotes.length - 1)) * 1.0
      : 0
    pan.pan.setValueAtTime(spread, now)
    nodes.push(pan)

    const noteGain = audioCtx.createGain()
    noteGain.gain.setValueAtTime(noteVol, now)
    nodes.push(noteGain)

    // Layer 1: Pure sine — clean foundation
    const sine1 = audioCtx.createOscillator()
    sine1.type = 'sine'
    sine1.frequency.setValueAtTime(freq, now)
    oscillators.push(sine1)

    // Layer 2: Detuned sine +6 cents
    const sine2 = audioCtx.createOscillator()
    sine2.type = 'sine'
    sine2.frequency.setValueAtTime(freq * 1.0035, now)
    oscillators.push(sine2)

    // Layer 3: Detuned sine -6 cents
    const sine3 = audioCtx.createOscillator()
    sine3.type = 'sine'
    sine3.frequency.setValueAtTime(freq * 0.9965, now)
    oscillators.push(sine3)

    // Layer 4: Triangle +12 cents — airy texture
    const tri1 = audioCtx.createOscillator()
    tri1.type = 'triangle'
    tri1.frequency.setValueAtTime(freq * 1.007, now)
    oscillators.push(tri1)

    // Layer 5: Triangle -12 cents
    const tri2 = audioCtx.createOscillator()
    tri2.type = 'triangle'
    tri2.frequency.setValueAtTime(freq * 0.993, now)
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

    // Mix levels
    const gains = [
      { osc: sine1,    level: 0.30 },
      { osc: sine2,    level: 0.22 },
      { osc: sine3,    level: 0.22 },
      { osc: tri1,     level: 0.10 },
      { osc: tri2,     level: 0.10 },
      { osc: sub,      level: 0.15 },
      { osc: shimmer5, level: 0.04 },
      { osc: shimmerHi,level: 0.03 },
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

  // Signal chain: hiPass → filter → shaper → envelope → master
  hiPass.connect(filter)
  filter.connect(shaper)
  shaper.connect(envelope)
  envelope.connect(masterGain)

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

  currentPad = { nodes, oscillators, envelope, latched }

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

interface DriftVoice {
  oscs: { osc: OscillatorNode; ratio: number }[]
  pool: number[]   // candidate MIDI notes this voice may occupy (scale tones in its register)
  baseMidi: number // current center note
}

interface ActiveDrone {
  nodes: AudioNode[]
  oscillators: OscillatorNode[]
  envelope: GainNode
  scheduler: ReturnType<typeof setInterval>
}

let currentDrone: ActiveDrone | null = null

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

  // ─── Master drone envelope — slow bloom, hold indefinitely ───
  const envelope = audioCtx.createGain()
  envelope.gain.setValueAtTime(0, now)
  envelope.gain.linearRampToValueAtTime(0.6, now + 5)
  nodes.push(envelope)

  // ─── Shared tone-shaping: hiPass → breathing lowpass → saturation → envelope → master ───
  const hiPass = audioCtx.createBiquadFilter()
  hiPass.type = 'highpass'
  hiPass.frequency.value = 60
  hiPass.Q.value = 0.5
  nodes.push(hiPass)

  const filter = audioCtx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.Q.value = 0.6
  filter.frequency.setValueAtTime(500, now)
  filter.frequency.linearRampToValueAtTime(2200, now + 8)
  nodes.push(filter)

  const shaper = audioCtx.createWaveShaper()
  shaper.curve = makeSaturationCurve(0.7)
  shaper.oversample = '2x'
  nodes.push(shaper)

  hiPass.connect(filter)
  filter.connect(shaper)
  shaper.connect(envelope)
  envelope.connect(masterGain)

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
    panner.pan.value = pan
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

  // ─── Drifting upper voices ───
  const driftLayers: Layer[] = [
    { ratio: 1,     type: 'sine',     gain: 0.4 },
    { ratio: 1.004, type: 'sine',     gain: 0.28 },
    { ratio: 0.996, type: 'sine',     gain: 0.28 },
    { ratio: 1.007, type: 'triangle', gain: 0.1 },
  ]
  const buildPool = (center: number, span: number): number[] => {
    const pool: number[] = []
    for (let m = center - span; m <= center + span; m++) {
      if (pcs.has(((m % 12) + 12) % 12)) pool.push(m)
    }
    return pool.length ? pool : [center]
  }
  const driftVoices: DriftVoice[] = []
  const registers = [
    { center: 55, pan: -0.4,  level: 0.13 }, // G3 area
    { center: 60, pan: 0.15,  level: 0.12 }, // C4 area
    { center: 64, pan: 0.45,  level: 0.1 },  // E4 area
  ]
  for (const r of registers) {
    const pool = buildPool(r.center, 4)
    const startMidi = pool[Math.floor(pool.length / 2)]
    const oscs = makeVoice(startMidi, r.level, r.pan, driftLayers)
    driftVoices.push({ oscs, pool, baseMidi: startMidi })
  }

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

  // ─── Drift scheduler: nudge one voice to a neighbouring scale tone ───
  const glide = (voice: DriftVoice) => {
    if (voice.pool.length < 2) return
    const curIdx = voice.pool.indexOf(voice.baseMidi)
    let step = Math.random() < 0.5 ? -1 : 1
    if (Math.random() < 0.3) step *= 2 // occasional wider leap
    let ni = curIdx + step
    if (ni < 0 || ni >= voice.pool.length) ni = curIdx - step // reflect at edges
    ni = Math.max(0, Math.min(voice.pool.length - 1, ni))
    const target = voice.pool[ni]
    if (target === voice.baseMidi) return
    voice.baseMidi = target

    const t = audioCtx.currentTime
    const glideTime = 3 + Math.random() * 2
    const targetFreq = midiToFreq(target)
    for (const { osc, ratio } of voice.oscs) {
      osc.frequency.cancelScheduledValues(t)
      osc.frequency.setValueAtTime(osc.frequency.value, t)
      osc.frequency.exponentialRampToValueAtTime(targetFreq * ratio, t + glideTime)
    }
  }

  const scheduler = setInterval(() => {
    const v = driftVoices[Math.floor(Math.random() * driftVoices.length)]
    glide(v)
  }, 7000)

  currentDrone = { nodes, oscillators, envelope, scheduler }
}

export function stopDrone(): void {
  if (!currentDrone || !ctx) return
  const now = ctx.currentTime
  const drone = currentDrone
  currentDrone = null

  clearInterval(drone.scheduler)
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
