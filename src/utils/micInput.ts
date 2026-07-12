// ─── Microphone Input ───────────────────────────────────────────────
// The shared listening pipe. Captures the mic into an AnalyserNode on the
// app's single AudioContext and hands raw sample buffers to pure detectors
// (pitchDetect today; an onset/rhythm detector can consume the same stream
// later). Never routed to the speakers — no feedback loops.

import { getCtx } from './audioEngine'
import { detectPitch, type PitchResult } from './pitchDetect'

let stream: MediaStream | null = null
let source: MediaStreamAudioSourceNode | null = null
let analyser: AnalyserNode | null = null
let sampleBuf: Float32Array | null = null

export async function startMic(): Promise<boolean> {
  if (stream) return true
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
  } catch {
    stream = null
    return false // permission denied or no mic
  }

  const ctx = getCtx()
  source = ctx.createMediaStreamSource(stream)
  analyser = ctx.createAnalyser()
  analyser.fftSize = 4096 // ~93ms @ 44.1kHz — enough window for bass low E
  analyser.smoothingTimeConstant = 0
  source.connect(analyser)
  sampleBuf = new Float32Array(analyser.fftSize)
  return true
}

export function stopMic(): void {
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
}

export function isMicRunning(): boolean {
  return stream !== null
}

// Grab the current buffer and run pitch detection on it.
export function readPitch(): PitchResult | null {
  if (!analyser || !sampleBuf) return null
  analyser.getFloatTimeDomainData(sampleBuf)
  return detectPitch(sampleBuf, getCtx().sampleRate)
}
