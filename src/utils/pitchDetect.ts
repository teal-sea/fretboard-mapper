// ─── Pitch Detection (McLeod Pitch Method) ──────────────────────────
// Pure DSP — no Web Audio, no React — so it's unit-testable with
// synthesized waveforms. Detects MONOPHONIC pitch from ANY source: guitar,
// bass, whistling, humming, voice. It measures periodicity — it doesn't know
// what instrument it's hearing. (Percussive input like table drumming has no
// pitch; that's a future onset detector consuming the same mic stream.)
//
// Method: normalized square difference (NSDF) autocorrelation with parabolic
// peak interpolation. Chosen over raw autocorrelation because it resists the
// octave errors that plague guitar signals (strong 2nd harmonics).

export interface PitchResult {
  freq: number     // Hz
  clarity: number  // 0..1 — how periodic the signal is (guitar notes ≈ 0.9+)
  midi: number     // nearest MIDI note
  cents: number    // deviation from that note, -50..+50
}

// Wide enough for bass low E (41 Hz) through the top of a whistle (~4 kHz).
const MIN_FREQ = 40
const MAX_FREQ = 4500

// Below this RMS the buffer is silence/room noise, not a note.
const RMS_GATE = 0.008
// Below this clarity the signal isn't periodic enough to trust (strums,
// percussive transients, the neighbour's dog).
const CLARITY_GATE = 0.8

export function freqToMidi(freq: number): { midi: number; cents: number } {
  const midiFloat = 69 + 12 * Math.log2(freq / 440)
  const midi = Math.round(midiFloat)
  return { midi, cents: (midiFloat - midi) * 100 }
}

export function detectPitch(buf: Float32Array, sampleRate: number): PitchResult | null {
  const n = buf.length

  // ─── Gate on level ───
  let sumSq = 0
  for (let i = 0; i < n; i++) sumSq += buf[i] * buf[i]
  const rms = Math.sqrt(sumSq / n)
  if (rms < RMS_GATE) return null

  const tauMin = Math.max(2, Math.floor(sampleRate / MAX_FREQ))
  const tauMax = Math.min(n - 2, Math.ceil(sampleRate / MIN_FREQ))
  if (tauMax <= tauMin) return null

  // ─── NSDF: nsdf[tau] = 2·acf[tau] / (Σ x[i]² + x[i+tau]²) ───
  // Computed from tau=1 (not tauMin) because we need to find the end of the
  // zero-lag lobe below.
  const nsdf = new Float32Array(tauMax + 1)
  for (let tau = 1; tau <= tauMax; tau++) {
    let acf = 0
    let norm = 0
    const len = n - tau
    for (let i = 0; i < len; i++) {
      const a = buf[i]
      const b = buf[i + tau]
      acf += a * b
      norm += a * a + b * b
    }
    nsdf[tau] = norm > 0 ? (2 * acf) / norm : 0
  }

  // ─── Skip the zero-lag lobe ───
  // nsdf ≈ 1 near tau=0 for ANY signal (it correlates with itself at tiny
  // offsets). McLeod's rule: ignore everything before the first negative-going
  // zero crossing, otherwise the lobe out-competes the true pitch peak.
  let searchStart = 0
  for (let tau = 1; tau <= tauMax; tau++) {
    if (nsdf[tau] <= 0) {
      searchStart = tau
      break
    }
  }
  if (searchStart === 0) return null // never crossed zero — not a pitched signal

  // ─── Peak picking: the maximum of each positive-going region ───
  const peaks: { tau: number; val: number }[] = []
  let inPositive = false
  let bestTau = 0
  let bestVal = -Infinity
  for (let tau = searchStart; tau <= tauMax; tau++) {
    if (nsdf[tau] > 0) {
      if (!inPositive) {
        inPositive = true
        bestTau = tau
        bestVal = nsdf[tau]
      } else if (nsdf[tau] > bestVal) {
        bestTau = tau
        bestVal = nsdf[tau]
      }
    } else if (inPositive) {
      peaks.push({ tau: bestTau, val: bestVal })
      inPositive = false
    }
  }
  if (inPositive) peaks.push({ tau: bestTau, val: bestVal })
  if (peaks.length === 0) return null

  // ─── McLeod's rule: first peak within k of the global max ───
  // Taking the FIRST qualifying peak (not the tallest) is what prevents
  // picking a subharmonic an octave low.
  const highest = Math.max(...peaks.map(p => p.val))
  const k = 0.9
  const chosen = peaks.find(p => p.val >= highest * k)!
  if (chosen.val < CLARITY_GATE) return null

  // ─── Parabolic interpolation around the chosen lag ───
  let tau = chosen.tau
  if (tau > tauMin && tau < tauMax) {
    const y0 = nsdf[tau - 1]
    const y1 = nsdf[tau]
    const y2 = nsdf[tau + 1]
    const denom = y0 - 2 * y1 + y2
    if (Math.abs(denom) > 1e-9) {
      const shift = (0.5 * (y0 - y2)) / denom
      if (Math.abs(shift) < 1) tau += shift
    }
  }

  const freq = sampleRate / tau
  if (freq < MIN_FREQ || freq > MAX_FREQ) return null

  const { midi, cents } = freqToMidi(freq)
  return { freq, clarity: chosen.val, midi, cents }
}
