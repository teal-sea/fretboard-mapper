// ─── Microphone Input ───────────────────────────────────────────────
// The shared listening pipe. Captures the mic into an AnalyserNode on the
// app's single AudioContext and hands raw sample buffers to pure detectors
// (pitchDetect today; an onset/rhythm detector can consume the same stream
// later). Never routed to the speakers — no feedback loops.

import { getCtx } from './audioEngine'
import { detectPitch, measureRms, BASE_RMS_GATE, type PitchResult } from './pitchDetect'

let stream: MediaStream | null = null
let source: MediaStreamAudioSourceNode | null = null
let analyser: AnalyserNode | null = null
let sampleBuf: Float32Array | null = null
let lastError: string | null = null

// The reason the last startMic() call failed, for the UI to show. null once
// a call has succeeded (or before any call has been made).
export function getMicError(): string | null {
  return lastError
}

// ─── Ambient calibration ───
// The mic hears everything — including the app's own drone bleeding back
// through the speakers. On start (and whenever the soundscape changes, e.g.
// the drone toggles) we sample the ambient level for ~0.5s and raise the
// detection gate above it. The drone becomes the noise floor; an instrument
// played near the mic punches through.
let rmsGate = BASE_RMS_GATE
let calibrateTimer: ReturnType<typeof setInterval> | null = null

// Bleed can be quasi-periodic (the drone is), so the gate matters more than
// clarity. 2.5× ambient keeps casual bleed out without eating soft playing.
const CALIBRATION_MARGIN = 2.5
// Never gate so high that normal playing can't get through — this was the
// other half of "only bass strings register": in a slightly noisy room,
// calibration could push the gate up to a level a quietly-picked high
// string couldn't clear even though the low strings still could.
const MAX_GATE = 0.07

export function recalibrateMic(): void {
  if (!analyser || !sampleBuf) return
  if (calibrateTimer) clearInterval(calibrateTimer)
  const samples: number[] = []
  calibrateTimer = setInterval(() => {
    if (!analyser || !sampleBuf) {
      if (calibrateTimer) clearInterval(calibrateTimer)
      calibrateTimer = null
      return
    }
    analyser.getFloatTimeDomainData(sampleBuf)
    samples.push(measureRms(sampleBuf))
    if (samples.length >= 8) {
      clearInterval(calibrateTimer!)
      calibrateTimer = null
      // Median, not mean — one cough shouldn't set the gate for the session
      const sorted = [...samples].sort((a, b) => a - b)
      const ambient = sorted[Math.floor(sorted.length / 2)]
      rmsGate = Math.min(Math.max(ambient * CALIBRATION_MARGIN, BASE_RMS_GATE), MAX_GATE)
    }
  }, 60)
}

export async function startMic(): Promise<boolean> {
  if (stream) return true
  lastError = null

  if (!navigator.mediaDevices?.getUserMedia) {
    lastError = 'This browser can\'t access the microphone. Try a recent Chrome, Firefox, or Safari.'
    return false
  }

  try {
    // Music-appropriate constraints: the browser's voice-call processing
    // (echo cancellation, noise suppression, auto gain) mangles instruments.
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    })
  } catch (err) {
    stream = null
    const name = err instanceof DOMException ? err.name : ''
    lastError =
      name === 'NotAllowedError' || name === 'PermissionDeniedError'
        ? 'Mic access is blocked. Allow it for this site in your browser settings, then try again.'
        : name === 'NotFoundError' || name === 'DevicesNotFoundError'
        ? 'No microphone found. Plug in an interface or mic and try again.'
        : name === 'NotReadableError' || name === 'TrackStartError'
        ? 'Another app has the microphone locked — close it and try again.'
        : 'Could not start the microphone.'
    return false
  }

  const ctx = getCtx()
  source = ctx.createMediaStreamSource(stream)
  analyser = ctx.createAnalyser()
  analyser.fftSize = 4096 // ~93ms @ 44.1kHz — enough window for bass low E
  analyser.smoothingTimeConstant = 0
  source.connect(analyser)
  sampleBuf = new Float32Array(analyser.fftSize)
  recalibrateMic() // learn the ambient floor (drone bleed included) before judging
  return true
}

export function stopMic(): void {
  if (calibrateTimer) {
    clearInterval(calibrateTimer)
    calibrateTimer = null
  }
  if (stream) {
    stream.getTracks().forEach(t => t.stop())
    stream = null
  }
  if (source) {
    try { source.disconnect() } catch {}
    source = null
  }
  analyser = null
  sampleBuf = null
  rmsGate = BASE_RMS_GATE
}

export function isMicRunning(): boolean {
  return stream !== null
}

// Raw level of the last read, regardless of whether it cleared the gate —
// a diagnostic window into why a real note isn't registering (level? or
// something past the level check).
let lastRms = 0
export function getLastRms(): number { return lastRms }
export function getRmsGate(): number { return rmsGate }

// Grab the current buffer and run pitch detection on it, gated above the
// calibrated ambient floor.
export function readPitch(): PitchResult | null {
  if (!analyser || !sampleBuf) return null
  analyser.getFloatTimeDomainData(sampleBuf)
  lastRms = measureRms(sampleBuf)
  return detectPitch(sampleBuf, getCtx().sampleRate, rmsGate)
}
