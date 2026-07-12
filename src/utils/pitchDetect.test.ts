import { describe, it, expect } from 'vitest'
import { detectPitch, freqToMidi } from './pitchDetect'
import { intervalSemitones, intervalName } from './musicTheory'

const SR = 44100
const N = 4096

function sine(freq: number, amp = 0.5, phase = 0): Float32Array {
  const buf = new Float32Array(N)
  for (let i = 0; i < N; i++) buf[i] = amp * Math.sin(2 * Math.PI * freq * (i / SR) + phase)
  return buf
}

// A plucked string is not a sine: strong 2nd/3rd/4th harmonics. This is the
// signal shape that gives naive autocorrelation octave errors.
function guitarish(freq: number, amp = 0.4): Float32Array {
  const buf = new Float32Array(N)
  for (let i = 0; i < N; i++) {
    const t = i / SR
    buf[i] = amp * (
      1.0 * Math.sin(2 * Math.PI * freq * t) +
      0.6 * Math.sin(2 * Math.PI * 2 * freq * t + 0.7) +
      0.35 * Math.sin(2 * Math.PI * 3 * freq * t + 1.3) +
      0.2 * Math.sin(2 * Math.PI * 4 * freq * t + 2.1)
    ) / 2.15
  }
  return buf
}

function noise(amp = 0.3): Float32Array {
  const buf = new Float32Array(N)
  let seed = 42
  for (let i = 0; i < N; i++) {
    // deterministic LCG so the test can't flake
    seed = (seed * 1664525 + 1013904223) >>> 0
    buf[i] = amp * ((seed / 0xffffffff) * 2 - 1)
  }
  return buf
}

const cents = (detected: number, target: number) => 1200 * Math.log2(detected / target)

describe('detectPitch', () => {
  // Standard tuning open strings
  const OPEN_STRINGS: [string, number, number][] = [
    ['E2', 82.41, 40],
    ['A2', 110.0, 45],
    ['D3', 146.83, 50],
    ['G3', 196.0, 55],
    ['B3', 246.94, 59],
    ['E4', 329.63, 64],
  ]

  for (const [name, freq, midi] of OPEN_STRINGS) {
    it(`detects a pure ${name} (${freq} Hz) within 5 cents`, () => {
      const r = detectPitch(sine(freq), SR)
      expect(r).not.toBeNull()
      expect(Math.abs(cents(r!.freq, freq))).toBeLessThan(5)
      expect(r!.midi).toBe(midi)
    })

    it(`detects a harmonic-rich ${name} without octave errors`, () => {
      const r = detectPitch(guitarish(freq), SR)
      expect(r).not.toBeNull()
      expect(r!.midi).toBe(midi) // the killer assertion: not ±12
    })
  }

  it('detects fretted notes across the neck (A440, high E 12th fret)', () => {
    expect(detectPitch(sine(440), SR)!.midi).toBe(69)
    expect(detectPitch(guitarish(659.25), SR)!.midi).toBe(76) // E5
  })

  it('detects whistle-register pitches', () => {
    expect(detectPitch(sine(1568), SR)!.midi).toBe(91) // G6
    expect(detectPitch(sine(2637), SR)!.midi).toBe(100) // E7
  })

  it('returns null on silence', () => {
    expect(detectPitch(new Float32Array(N), SR)).toBeNull()
  })

  it('returns null below the level gate', () => {
    expect(detectPitch(sine(220, 0.004), SR)).toBeNull()
  })

  it('returns null on noise (table drumming is not a pitch)', () => {
    expect(detectPitch(noise(), SR)).toBeNull()
  })

  it('reports clarity near 1 for a pure tone', () => {
    expect(detectPitch(sine(220), SR)!.clarity).toBeGreaterThan(0.95)
  })
})

describe('freqToMidi', () => {
  it('maps A440 to MIDI 69 with 0 cents', () => {
    const { midi, cents } = freqToMidi(440)
    expect(midi).toBe(69)
    expect(Math.abs(cents)).toBeLessThan(0.01)
  })

  it('reports sharp/flat deviation in cents', () => {
    expect(freqToMidi(446).cents).toBeGreaterThan(15) // sharp A
    expect(freqToMidi(434).cents).toBeLessThan(-15)   // flat A
  })
})

describe('intervalSemitones', () => {
  it('is the inverse of intervalName for all 12 intervals', () => {
    for (let s = 0; s < 12; s++) {
      expect(intervalSemitones(intervalName(s))).toBe(s)
    }
  })

  it('returns null for junk', () => {
    expect(intervalSemitones('9')).toBeNull()
    expect(intervalSemitones('')).toBeNull()
  })
})
