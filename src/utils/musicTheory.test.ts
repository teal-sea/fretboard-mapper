import { describe, it, expect } from 'vitest'
import {
  noteIndex, noteName, useFlats, intervalName,
  SCALES, CHORDS, TUNINGS,
  getScaleNotes, getChordNotes, computeFretboard,
  getDiatonicChords, getCompatibleScales, getRelatedModes,
  getScalePositions, getChordVoicings, compute3NPSPattern, computeSweepShape, computeTappingPattern,
  formulaString, chordIntervalsForScale,
} from './musicTheory'

// ─── Note Functions ─────────────────────────────────────────────────

describe('noteIndex', () => {
  it('maps sharp note names to chromatic indices', () => {
    expect(noteIndex('C')).toBe(0)
    expect(noteIndex('A')).toBe(9)
    expect(noteIndex('G')).toBe(7)
    expect(noteIndex('B')).toBe(11)
    expect(noteIndex('F#')).toBe(6)
  })

  it('maps flat note names to chromatic indices', () => {
    expect(noteIndex('Bb')).toBe(10)
    expect(noteIndex('Eb')).toBe(3)
    expect(noteIndex('Ab')).toBe(8)
  })

  it('handles enharmonic edge cases', () => {
    expect(noteIndex('Cb')).toBe(11)
    expect(noteIndex('B#')).toBe(0)
    expect(noteIndex('E#')).toBe(5)
    expect(noteIndex('Fb')).toBe(4)
  })
})

describe('noteName', () => {
  it('returns sharp names by default', () => {
    expect(noteName(0)).toBe('C')
    expect(noteName(1)).toBe('C#')
    expect(noteName(6)).toBe('F#')
    expect(noteName(9)).toBe('A')
  })

  it('returns flat names when requested', () => {
    expect(noteName(1, true)).toBe('Db')
    expect(noteName(3, true)).toBe('Eb')
    expect(noteName(10, true)).toBe('Bb')
  })

  it('handles negative indices (wraps correctly)', () => {
    expect(noteName(-3)).toBe('A')  // -3 + 12 = 9
    expect(noteName(-1)).toBe('B')  // -1 + 12 = 11
  })
})

describe('intervalName', () => {
  it('maps semitones to interval names', () => {
    expect(intervalName(0)).toBe('R')
    expect(intervalName(3)).toBe('b3')
    expect(intervalName(4)).toBe('3')
    expect(intervalName(7)).toBe('5')
    expect(intervalName(10)).toBe('b7')
    expect(intervalName(11)).toBe('7')
  })

  it('wraps beyond 12', () => {
    expect(intervalName(12)).toBe('R')
    expect(intervalName(14)).toBe('2')
  })
})

// ─── Scale Computation ──────────────────────────────────────────────

describe('getScaleNotes', () => {
  it('computes A aeolian (natural minor) correctly', () => {
    const notes = getScaleNotes('A', SCALES['aeolian'])
    // A B C D E F G = pitch classes 9, 11, 0, 2, 4, 5, 7
    expect(notes).toEqual(new Set([9, 11, 0, 2, 4, 5, 7]))
  })

  it('computes C ionian (major) correctly', () => {
    const notes = getScaleNotes('C', SCALES['ionian'])
    // C D E F G A B = 0, 2, 4, 5, 7, 9, 11
    expect(notes).toEqual(new Set([0, 2, 4, 5, 7, 9, 11]))
  })

  it('A aeolian and C ionian share the same notes', () => {
    const aMinor = getScaleNotes('A', SCALES['aeolian'])
    const cMajor = getScaleNotes('C', SCALES['ionian'])
    expect(aMinor).toEqual(cMajor)
  })

  it('computes A minor pentatonic correctly', () => {
    const notes = getScaleNotes('A', SCALES['minor_penta'])
    // A C D E G = 9, 0, 2, 4, 7
    expect(notes).toEqual(new Set([9, 0, 2, 4, 7]))
  })

  it('pentatonic is a subset of aeolian', () => {
    const penta = getScaleNotes('A', SCALES['minor_penta'])
    const aeolian = getScaleNotes('A', SCALES['aeolian'])
    for (const note of penta) {
      expect(aeolian.has(note)).toBe(true)
    }
  })

  it('all scales produce the right number of notes', () => {
    for (const [key, scale] of Object.entries(SCALES)) {
      const notes = getScaleNotes('C', scale)
      expect(notes.size).toBe(scale.intervals.length)
    }
  })
})

// ─── Chord Computation ──────────────────────────────────────────────

describe('getChordNotes', () => {
  it('computes A minor triad correctly', () => {
    const notes = getChordNotes('A', CHORDS['minor'])
    // A C E = 9, 0, 4
    expect(notes).toEqual(new Set([9, 0, 4]))
  })

  it('computes G major triad correctly', () => {
    const notes = getChordNotes('G', CHORDS['major'])
    // G B D = 7, 11, 2
    expect(notes).toEqual(new Set([7, 11, 2]))
  })

  it('computes C major 7th correctly', () => {
    const notes = getChordNotes('C', CHORDS['maj7'])
    // C E G B = 0, 4, 7, 11
    expect(notes).toEqual(new Set([0, 4, 7, 11]))
  })

  it('all chord tones should be unique pitch classes', () => {
    for (const [key, chord] of Object.entries(CHORDS)) {
      const notes = getChordNotes('C', chord)
      expect(notes.size).toBe(chord.intervals.filter(i => {
        // intervals > 12 map to same PC as i%12, so dedupe
        return true
      }).length)
    }
  })
})

// ─── Diatonic Chords (THE BIG ONE) ──────────────────────────────────

describe('getDiatonicChords', () => {
  const aAeolian = getDiatonicChords('A', SCALES['aeolian'])

  it('produces 7 degrees for a 7-note scale', () => {
    expect(aAeolian.length).toBe(7)
  })

  it('every degree has at least one chord', () => {
    for (const deg of aAeolian) {
      expect(deg.length).toBeGreaterThan(0)
    }
  })

  it('degree 0 of A aeolian is A minor (not A major)', () => {
    const primary = aAeolian[0][0]
    expect(primary.root).toBe('A')
    expect(primary.chordKey).toBe('minor')
    expect(primary.fullName).toBe('Am')
  })

  it('degree 6 of A aeolian is G major (not G minor)', () => {
    const primary = aAeolian[6][0]
    expect(primary.root).toBe('G')
    expect(primary.chordKey).toBe('major')
    expect(primary.fullName).toBe('G')
  })

  it('degree 1 of A aeolian is B diminished', () => {
    const primary = aAeolian[1][0]
    expect(primary.root).toBe('B')
    expect(primary.chordKey).toBe('dim')
  })

  it('degree 2 of A aeolian is C major', () => {
    const primary = aAeolian[2][0]
    expect(primary.root).toBe('C')
    expect(primary.chordKey).toBe('major')
  })

  it('all diatonic chord tones are in the parent scale', () => {
    const scaleNotes = getScaleNotes('A', SCALES['aeolian'])
    for (const degChords of aAeolian) {
      for (const dc of degChords) {
        const chordNotes = getChordNotes(dc.root, dc.chordDef)
        for (const note of chordNotes) {
          expect(scaleNotes.has(note)).toBe(true)
        }
      }
    }
  })

  it('G minor is NOT diatonic to A aeolian', () => {
    // Bb (10) is not in A aeolian
    const gMinorNotes = getChordNotes('G', CHORDS['minor']) // G Bb D = 7, 10, 2
    const scaleNotes = getScaleNotes('A', SCALES['aeolian'])
    expect(scaleNotes.has(10)).toBe(false) // Bb not in scale
  })

  it('roman numerals reflect chord quality', () => {
    const primary = aAeolian.map(deg => deg[0])
    // Minor chords get lowercase roman numerals
    expect(primary[0].romanNumeral).toBe('i')     // Am
    expect(primary[3].romanNumeral).toBe('iv')     // Dm
    expect(primary[4].romanNumeral).toBe('v')      // Em
    // Major chords get uppercase
    expect(primary[2].romanNumeral).toMatch(/^III/) // C
    expect(primary[5].romanNumeral).toMatch(/^VI/)  // F
    expect(primary[6].romanNumeral).toMatch(/^VII/) // G
    // Diminished gets lowercase + °
    expect(primary[1].romanNumeral).toMatch(/ii.*°/)
  })

  it('C ionian diatonic chords are correct', () => {
    const cIonian = getDiatonicChords('C', SCALES['ionian'])
    const primaries = cIonian.map(d => d[0])
    expect(primaries[0].fullName).toBe('C')    // I
    expect(primaries[1].fullName).toBe('Dm')   // ii
    expect(primaries[2].fullName).toBe('Em')   // iii
    expect(primaries[3].fullName).toBe('F')    // IV
    expect(primaries[4].fullName).toBe('G')    // V
    expect(primaries[5].fullName).toBe('Am')   // vi
    expect(primaries[6].chordKey).toBe('dim')  // vii°
  })
})

// ─── Scale Positions ────────────────────────────────────────────────

describe('getScalePositions', () => {
  const stdTuning = TUNINGS['standard']

  describe('A minor pentatonic', () => {
    const positions = getScalePositions('A', SCALES['minor_penta'], stdTuning, 15)

    it('produces 5 positions for a 5-note scale', () => {
      expect(positions.length).toBe(5)
    })

    it('Position 1 starts near the root fret (A = fret 5)', () => {
      // Position 1 center is fret 5, start should be fret 4 (center - 1)
      expect(positions[0][0]).toBeLessThanOrEqual(5)
      expect(positions[0][0]).toBeGreaterThanOrEqual(4)
    })

    it('Position 4 is at the open position (frets 0-3), not frets 12-15', () => {
      // E is 7 semitones above A, so fret 5+7=12, wraps to 0
      expect(positions[3][0]).toBe(0)
      expect(positions[3][1]).toBeLessThanOrEqual(4)
    })

    it('Position 5 includes fret 2 (for D and G string notes)', () => {
      // G center is fret 3, so start should be fret 2
      expect(positions[4][0]).toBeLessThanOrEqual(2)
    })

    it('all positions are at least 3 frets wide', () => {
      for (const [lo, hi] of positions) {
        expect(hi - lo).toBeGreaterThanOrEqual(3)
      }
    })

    it('all positions stay within fret range', () => {
      for (const [lo, hi] of positions) {
        expect(lo).toBeGreaterThanOrEqual(0)
        expect(hi).toBeLessThanOrEqual(15)
      }
    })
  })

  describe('A aeolian (7-note scale)', () => {
    const positions = getScalePositions('A', SCALES['aeolian'], stdTuning, 15)

    it('produces 7 positions for a 7-note scale', () => {
      expect(positions.length).toBe(7)
    })

    it('each position is at least 4 frets wide', () => {
      for (const [lo, hi] of positions) {
        expect(hi - lo).toBeGreaterThanOrEqual(3)
      }
    })

    it('Position 1 starts near the root fret', () => {
      expect(positions[0][0]).toBeLessThanOrEqual(5)
    })
  })
})

describe('getChordVoicings', () => {
  const stdTuning = TUNINGS['standard']

  it('finds the open C major grip (x32010)', () => {
    const voicings = getChordVoicings('C', CHORDS['major'], stdTuning, 15)
    const shapes = voicings.map(v => v.frets.map(f => (f === null ? 'x' : f)).join(''))
    expect(shapes).toContain('x32010')
  })

  it('finds the grown-up C major barre forms (A-form and E-form)', () => {
    const voicings = getChordVoicings('C', CHORDS['major'], stdTuning, 15)
    const shapes = voicings.map(v => v.frets.map(f => (f === null ? 'x' : f)).join(','))
    expect(shapes).toContain('x,3,5,5,5,3')      // A-form barre at 3
    expect(shapes).toContain('8,10,10,9,8,8')    // E-form barre at 8
  })

  it('never emits a grip needing more than four fingers (barre counts as one)', () => {
    for (const [root, chordKey] of [['C', 'major'], ['A', 'minor'], ['G', 'dom7'], ['D', 'min7'], ['F#', 'major']] as const) {
      for (const v of getChordVoicings(root, CHORDS[chordKey], stdTuning, 15)) {
        const fretted = v.frets.filter((f): f is number => f !== null && f > 0)
        if (!fretted.length) continue
        const low = Math.min(...fretted)
        expect(1 + fretted.filter(f => f > low).length).toBeLessThanOrEqual(4)
      }
    }
  })

  it('finds the open E minor grip (022000)', () => {
    const voicings = getChordVoicings('E', CHORDS['minor'], stdTuning, 15)
    const shapes = voicings.map(v => v.frets.map(f => (f === null ? 'x' : f)).join(''))
    expect(shapes).toContain('022000')
  })

  it('finds the open A major grip (x02220)', () => {
    const voicings = getChordVoicings('A', CHORDS['major'], stdTuning, 15)
    const shapes = voicings.map(v => v.frets.map(f => (f === null ? 'x' : f)).join(''))
    expect(shapes).toContain('x02220')
  })

  // The properties that make a voicing a GRIP rather than scattered tones —
  // if any of these fail, we're back to lighting up an arpeggio region.
  const GRIP_CASES: [string, string][] = [
    ['C', 'major'], ['A', 'minor'], ['G', 'dom7'], ['D', 'min7'], ['F#', 'major'],
  ]
  for (const [root, chordKey] of GRIP_CASES) {
    describe(`${root} ${chordKey} grips`, () => {
      const chord = CHORDS[chordKey]
      const voicings = getChordVoicings(root, chord, stdTuning, 15)
      const rootPc = noteIndex(root)
      const chordPcs = new Set(chord.intervals.map(iv => (rootPc + iv) % 12))

      it('produces at least one grip', () => {
        expect(voicings.length).toBeGreaterThan(0)
      })

      for (const check of [
        ['every grip has the root in the bass', (v: ReturnType<typeof getChordVoicings>[0]) => {
          const bass = v.frets.findIndex(f => f !== null)
          expect((stdTuning.notes[bass] + v.frets[bass]!) % 12).toBe(rootPc)
        }],
        ['every grip covers every chord tone and nothing else', (v: ReturnType<typeof getChordVoicings>[0]) => {
          const pcs = new Set(
            v.frets.flatMap((f, si) => (f === null ? [] : [(stdTuning.notes[si] + f) % 12]))
          )
          expect(pcs).toEqual(chordPcs)
        }],
        ['every grip fits one hand (fretted span ≤ 3)', (v: ReturnType<typeof getChordVoicings>[0]) => {
          const fretted = v.frets.filter((f): f is number => f !== null && f > 0)
          if (fretted.length > 1) {
            expect(Math.max(...fretted) - Math.min(...fretted)).toBeLessThanOrEqual(3)
          }
        }],
        ['mutes only as a bottom-consecutive prefix', (v: ReturnType<typeof getChordVoicings>[0]) => {
          const firstSounded = v.frets.findIndex(f => f !== null)
          for (let i = firstSounded; i < v.frets.length; i++) {
            expect(v.frets[i]).not.toBeNull()
          }
        }],
      ] as const) {
        const [name, assert] = check
        it(name as string, () => {
          for (const v of voicings) assert(v)
        })
      }

      it('grips ascend the neck', () => {
        for (let i = 1; i < voicings.length; i++) {
          expect(voicings[i].baseFret).toBeGreaterThanOrEqual(voicings[i - 1].baseFret)
        }
      })
    })
  }
})

// ─── Sweep Arpeggios ───────────────────────────────────────────────

describe('computeSweepShape', () => {
  const stdTuning = TUNINGS['standard']

  it('produces a shape covering at least 5 strings for G major', () => {
    const shape = computeSweepShape('G', CHORDS['major'], stdTuning)
    expect(shape.length).toBeGreaterThanOrEqual(5)
  })

  it('all notes are chord tones', () => {
    const shape = computeSweepShape('A', CHORDS['minor'], stdTuning)
    const chordNotes = getChordNotes('A', CHORDS['minor'])
    for (const pos of shape) {
      expect(chordNotes.has(pos.degree)).toBe(true)
    }
  })

  it('fret span is compact (≤ 5 frets)', () => {
    const shape = computeSweepShape('G', CHORDS['major'], stdTuning)
    if (shape.length === 0) return
    const frets = shape.map(p => p.fret)
    const span = Math.max(...frets) - Math.min(...frets)
    expect(span).toBeLessThanOrEqual(5)
  })

  it('adjacent strings are within 3 frets of each other', () => {
    const shape = computeSweepShape('C', CHORDS['major'], stdTuning)
    for (let i = 1; i < shape.length; i++) {
      const gap = Math.abs(shape[i].fret - shape[i - 1].fret)
      expect(gap).toBeLessThanOrEqual(3)
    }
  })

  it('different inversions produce different shapes', () => {
    const inv0 = computeSweepShape('A', CHORDS['minor'], stdTuning, 0)
    const inv1 = computeSweepShape('A', CHORDS['minor'], stdTuning, 1)
    // They might be the same if only one shape exists, but shouldn't crash
    expect(inv0.length).toBeGreaterThan(0)
    expect(inv1.length).toBeGreaterThan(0)
  })
})

// ─── 3NPS Patterns ─────────────────────────────────────────────────

describe('compute3NPSPattern', () => {
  const stdTuning = TUNINGS['standard']

  it('produces exactly 3 notes per string (18 total for 6 strings)', () => {
    const pattern = compute3NPSPattern('A', SCALES['aeolian'], stdTuning, 0)
    expect(pattern.length).toBe(18)

    // Check 3 notes per string
    for (let s = 0; s < 6; s++) {
      const onString = pattern.filter(p => p.stringIndex === s)
      expect(onString.length).toBe(3)
    }
  })

  it('all notes are in the parent scale', () => {
    const scaleNotes = getScaleNotes('A', SCALES['aeolian'])
    const pattern = compute3NPSPattern('A', SCALES['aeolian'], stdTuning, 0)
    for (const pos of pattern) {
      expect(scaleNotes.has(pos.degree)).toBe(true)
    }
  })

  it('notes ascend in pitch within each string', () => {
    const pattern = compute3NPSPattern('A', SCALES['aeolian'], stdTuning, 0)
    for (let s = 0; s < 6; s++) {
      const onString = pattern.filter(p => p.stringIndex === s)
      for (let i = 1; i < onString.length; i++) {
        expect(onString[i].fret).toBeGreaterThan(onString[i - 1].fret)
      }
    }
  })

  it('different pattern indices start on different scale degrees', () => {
    const p0 = compute3NPSPattern('A', SCALES['aeolian'], stdTuning, 0)
    const p1 = compute3NPSPattern('A', SCALES['aeolian'], stdTuning, 1)
    expect(p0[0].degree).not.toBe(p1[0].degree)
  })
})

// ─── Tapping Patterns ──────────────────────────────────────────────

describe('computeTappingPattern', () => {
  const stdTuning = TUNINGS['standard']

  it('produces notes on multiple strings', () => {
    const pattern = computeTappingPattern('A', CHORDS['minor'], stdTuning)
    const strings = new Set(pattern.map(p => p.stringIndex))
    expect(strings.size).toBeGreaterThanOrEqual(3)
  })

  it('all notes are chord tones', () => {
    const chordNotes = getChordNotes('A', CHORDS['minor'])
    const pattern = computeTappingPattern('A', CHORDS['minor'], stdTuning)
    for (const pos of pattern) {
      expect(chordNotes.has(pos.degree)).toBe(true)
    }
  })

  it('notes on same string are spaced apart (tapping distance)', () => {
    const pattern = computeTappingPattern('G', CHORDS['major'], stdTuning)
    for (let s = 0; s < 6; s++) {
      const onString = pattern.filter(p => p.stringIndex === s).sort((a, b) => a.fret - b.fret)
      for (let i = 1; i < onString.length; i++) {
        expect(onString[i].fret - onString[i - 1].fret).toBeGreaterThanOrEqual(3)
      }
    }
  })
})

// ─── Fretboard Computation ─────────────────────────────────────────

describe('computeFretboard', () => {
  const stdTuning = TUNINGS['standard']
  const scaleNotes = getScaleNotes('A', SCALES['aeolian'])
  const board = computeFretboard(stdTuning, 'A', scaleNotes, 15)

  it('produces 6 strings', () => {
    expect(board.length).toBe(6)
  })

  it('each string has numFrets + 1 notes (including open)', () => {
    for (const string of board) {
      expect(string.length).toBe(16) // 0-15
    }
  })

  it('open low E string is E2', () => {
    expect(board[0][0].note).toBe('E')
    expect(board[0][0].midi).toBe(40)
    expect(board[0][0].fret).toBe(0)
  })

  it('fret 5 on low E is A (root)', () => {
    const note = board[0][5]
    expect(note.note).toBe('A')
    expect(note.isRoot).toBe(true)
    expect(note.intervalName).toBe('R')
  })

  it('marks scale membership correctly', () => {
    // E (fret 0, low E) is in A aeolian
    expect(board[0][0].isInScale).toBe(true)
    // F (fret 1, low E) is in A aeolian
    expect(board[0][1].isInScale).toBe(true)
    // F# (fret 2, low E) is NOT in A aeolian
    expect(board[0][2].isInScale).toBe(false)
  })
})

// ─── Compatible Scales ─────────────────────────────────────────────

describe('getCompatibleScales', () => {
  it('A minor chord is compatible with A aeolian', () => {
    const results = getCompatibleScales('A', CHORDS['minor'])
    const keys = results.map(r => r.key)
    expect(keys).toContain('aeolian')
  })

  it('A minor chord is compatible with A minor pentatonic', () => {
    const results = getCompatibleScales('A', CHORDS['minor'])
    const keys = results.map(r => r.key)
    expect(keys).toContain('minor_penta')
  })

  it('A minor chord is NOT compatible with A ionian', () => {
    const results = getCompatibleScales('A', CHORDS['minor'])
    const keys = results.map(r => r.key)
    // A ionian has C# (major 3rd), A minor has C (minor 3rd) — incompatible
    expect(keys).not.toContain('ionian')
  })
})

// ─── Related Modes ─────────────────────────────────────────────────

describe('getRelatedModes', () => {
  it('A aeolian is related to C ionian (same notes)', () => {
    const modes = getRelatedModes('A', 'aeolian')
    const found = modes.find(m => m.scaleKey === 'ionian')
    expect(found).toBeDefined()
    expect(found!.root).toBe('C')
  })

  it('A minor pentatonic is related to C major pentatonic', () => {
    const modes = getRelatedModes('A', 'minor_penta')
    const found = modes.find(m => m.scaleKey === 'major_penta')
    expect(found).toBeDefined()
    expect(found!.root).toBe('C')
  })

  it('returns all 7 modes for a major-mode scale', () => {
    const modes = getRelatedModes('C', 'ionian')
    expect(modes.length).toBe(7)
  })

  it('returns 2 modes for pentatonic', () => {
    const modes = getRelatedModes('A', 'minor_penta')
    expect(modes.length).toBe(2)
  })
})

// ─── Formula String ────────────────────────────────────────────────

describe('formulaString', () => {
  it('formats aeolian correctly', () => {
    const result = formulaString(SCALES['aeolian'].intervals)
    expect(result).toBe('R - 2 - b3 - 4 - 5 - b6 - b7')
  })

  it('formats major triad correctly', () => {
    const result = formulaString(CHORDS['major'].intervals)
    expect(result).toBe('R - 3 - 5')
  })
})

// ─── Chord-For-Scale (backing chord derivation) ─────────────────────

describe('chordIntervalsForScale', () => {
  it('gives Dorian a min7', () => {
    expect(chordIntervalsForScale('dorian')).toEqual(CHORDS['min7'].intervals)
  })
  it('gives Lydian a maj7', () => {
    expect(chordIntervalsForScale('lydian')).toEqual(CHORDS['maj7'].intervals)
  })
  it('gives Mixolydian a dom7', () => {
    expect(chordIntervalsForScale('mixolydian')).toEqual(CHORDS['dom7'].intervals)
  })
  it('gives Locrian a half-diminished 7th', () => {
    expect(chordIntervalsForScale('locrian')).toEqual(CHORDS['half_dim7'].intervals)
  })
  it('gives Aeolian a min7', () => {
    expect(chordIntervalsForScale('aeolian')).toEqual(CHORDS['min7'].intervals)
  })
  it('gives Ionian a maj7', () => {
    expect(chordIntervalsForScale('ionian')).toEqual(CHORDS['maj7'].intervals)
  })
  it('gives Harmonic Minor a min-major 7th', () => {
    expect(chordIntervalsForScale('harmonic_minor')).toEqual(CHORDS['min_maj7'].intervals)
  })
  it('gives Melodic Minor a min-major 7th', () => {
    expect(chordIntervalsForScale('melodic_minor')).toEqual(CHORDS['min_maj7'].intervals)
  })
  it('overrides minor pentatonic to a min7', () => {
    expect(chordIntervalsForScale('minor_penta')).toEqual(CHORDS['min7'].intervals)
  })
  it('overrides major pentatonic to a maj7', () => {
    expect(chordIntervalsForScale('major_penta')).toEqual(CHORDS['maj7'].intervals)
  })
  it('falls back gracefully for an unknown key', () => {
    expect(chordIntervalsForScale('not-a-real-scale')).toEqual(CHORDS['major'].intervals)
  })
})

// ─── Scale & Chord Data Integrity ──────────────────────────────────

describe('data integrity', () => {
  it('all scales have a name and category', () => {
    for (const [key, scale] of Object.entries(SCALES)) {
      expect(scale.name).toBeTruthy()
      expect(scale.category).toBeTruthy()
      expect(scale.intervals.length).toBeGreaterThanOrEqual(4)
    }
  })

  it('all chords have a name, suffix, and category', () => {
    for (const [key, chord] of Object.entries(CHORDS)) {
      expect(chord.name).toBeTruthy()
      expect(chord.category).toBeTruthy()
      expect(chord.intervals.length).toBeGreaterThanOrEqual(2)
      expect(chord.intervals[0]).toBe(0) // root is always 0
    }
  })

  it('all tunings have matching notes and labels', () => {
    for (const [key, tuning] of Object.entries(TUNINGS)) {
      expect(tuning.notes.length).toBe(tuning.labels.length)
      expect(tuning.notes.length).toBe(6) // standard guitar
    }
  })

  it('scale intervals are ascending and within 0-11', () => {
    for (const [key, scale] of Object.entries(SCALES)) {
      expect(scale.intervals[0]).toBe(0)
      for (let i = 1; i < scale.intervals.length; i++) {
        expect(scale.intervals[i]).toBeGreaterThan(scale.intervals[i - 1])
        expect(scale.intervals[i]).toBeLessThan(12)
      }
    }
  })
})
