import { describe, it, expect } from 'vitest'
import {
  getWalkPositions, currentWalkIndex, describeStep,
  initWalk, feedWalk, enterPosition, walkProgress,
} from './walk'
import { SCALES, TUNINGS, getScaleNotes, noteIndex } from './musicTheory'

const std = TUNINGS['standard']

// The central claim of the app, as an exercise: A minor and C major are the same
// seven notes, and each position on the neck starts on a different degree — so
// each position IS a different mode. If this maths is wrong, the game teaches a lie.

describe('getWalkPositions — every position is a different mode', () => {
  const positions = getWalkPositions('A', 'aeolian', std, 15)

  it('gives one position per degree of the scale', () => {
    expect(positions).toHaveLength(7)
  })

  it('walks UP the neck in order', () => {
    for (let i = 1; i < positions.length; i++) {
      expect(positions[i].startFret).toBeGreaterThan(positions[i - 1].startFret)
    }
  })

  it('every position has a DIFFERENT home note and a different mode', () => {
    const tonics = positions.map(p => p.tonic)
    const modes = positions.map(p => p.modeName)
    expect(new Set(tonics).size).toBe(7)
    expect(new Set(modes).size).toBe(7)
  })

  it('the seven modes are exactly the modes of the parent scale', () => {
    const names = positions.map(p => p.modeName).sort()
    expect(names).toEqual([
      'Aeolian', 'Dorian', 'Ionian', 'Locrian', 'Lydian', 'Mixolydian', 'Phrygian',
    ])
  })

  it('every position uses the SAME seven notes — that is the whole point', () => {
    const parent = getScaleNotes('A', SCALES['aeolian'])
    for (const p of positions) {
      const notes = getScaleNotes(p.tonic, SCALES[p.modeKey])
      expect(notes.size).toBe(parent.size)
      notes.forEach(pc => expect(parent.has(pc)).toBe(true))
    }
  })

  it('A minor and C major produce the identical walk', () => {
    const fromA = getWalkPositions('A', 'aeolian', std, 15)
    const fromC = getWalkPositions('C', 'ionian', std, 15)
    expect(fromC.map(p => p.tonic)).toEqual(fromA.map(p => p.tonic))
    expect(fromC.map(p => p.startFret)).toEqual(fromA.map(p => p.startFret))
  })

  it('every position fits under one hand', () => {
    for (const p of positions) {
      expect(p.range[1] - p.range[0]).toBeLessThanOrEqual(6)
    }
  })

  it('gives each mode a plain-English gloss', () => {
    for (const p of positions) {
      expect(p.plain, `${p.modeName} has no plain description`).not.toBeNull()
    }
  })
})

describe('currentWalkIndex', () => {
  const positions = getWalkPositions('A', 'aeolian', std, 15)

  it('finds which position you are standing in from where home is', () => {
    const dorian = positions.find(p => p.modeName === 'Dorian')!
    expect(positions[currentWalkIndex(positions, dorian.tonic)].tonic).toBe('D')
  })
})

describe('describeStep', () => {
  const positions = getWalkPositions('A', 'aeolian', std, 15)

  it('says the notes did not change but home did', () => {
    const from = positions.find(p => p.tonic === 'A')!
    const to = positions.find(p => p.tonic === 'D')!
    const s = describeStep(from, to)
    expect(s).toContain('nothing about the notes changed')
    expect(s).toContain('A')
    expect(s).toContain('D')
    expect(s).toContain('Dorian')
  })
})

// ─── The game ───

describe('the claim: improvise, then come home', () => {
  const positions = getWalkPositions('A', 'aeolian', std, 15)
  const pos = positions[0]
  const scalePcs = getScaleNotes('A', SCALES['aeolian'])

  const play = (state: any, pcs: number[]) => {
    let s = state
    for (const pc of pcs) {
      s = feedWalk(s, { position: pos, scalePcs, heardMidi: 60 + pc })
    }
    return s
  }

  // Scale tones of A minor: A C D E F G B (pcs 9,0,2,4,5,7,11)
  const OTHERS = [0, 2, 4, 5] // C D E F — four notes that aren't the tonic
  const TONIC = noteIndex(pos.tonic)

  it('does not claim on the tonic alone — you have to actually play in it first', () => {
    const s = play(initWalk(), [TONIC])
    expect(s.claimed).toHaveLength(0)
    expect(s.justClaimed).toBeNull()
  })

  it('claims when you explore the position and then resolve home', () => {
    const s = play(initWalk(), [...OTHERS, TONIC])
    expect(s.claimed).toEqual([pos.tonic])
    expect(s.justClaimed).toBe(pos.tonic)
    expect(s.combo).toBe(1)
  })

  it('a note outside the scale costs you nothing — there is no fail state', () => {
    let s = play(initWalk(), OTHERS)
    const before = s.explored.length
    s = feedWalk(s, { position: pos, scalePcs, heardMidi: 60 + 1 }) // C#, not in A minor
    expect(s.explored.length).toBe(before)
    expect(s.claimed).toHaveLength(0)
    // and it definitely doesn't take a claim away
    s = play(s, [TONIC])
    expect(s.claimed).toEqual([pos.tonic])
  })

  it('repeating the same note does not count as exploring', () => {
    const s = play(initWalk(), [0, 0, 0, 0, 0])
    expect(s.explored).toEqual([0])
  })

  it('cannot claim the same position twice', () => {
    let s = play(initWalk(), [...OTHERS, TONIC])
    s = play(s, [...OTHERS, TONIC])
    expect(s.claimed).toEqual([pos.tonic]) // still once
  })

  it('justClaimed fires exactly once, then clears', () => {
    let s = play(initWalk(), [...OTHERS, TONIC])
    expect(s.justClaimed).toBe(pos.tonic)
    s = feedWalk(s, { position: pos, scalePcs, heardMidi: null })
    expect(s.justClaimed).toBeNull()
  })

  it('moving position resets exploration but never takes a claim away', () => {
    let s = play(initWalk(), [...OTHERS, TONIC])
    s = enterPosition(s)
    expect(s.explored).toEqual([])
    expect(s.claimed).toEqual([pos.tonic])
  })

  it('you can claim all seven and walk the whole neck', () => {
    let s = initWalk()
    for (const p of positions) {
      s = enterPosition(s)
      const others = [...scalePcs].filter(pc => pc !== noteIndex(p.tonic)).slice(0, 4)
      for (const pc of others) {
        s = feedWalk(s, { position: p, scalePcs, heardMidi: 60 + pc })
      }
      s = feedWalk(s, { position: p, scalePcs, heardMidi: 60 + noteIndex(p.tonic) })
    }
    expect(s.claimed).toHaveLength(7)
    expect(s.combo).toBe(7)
  })
})

describe('walkProgress — always tells you the next thing to do', () => {
  const positions = getWalkPositions('A', 'aeolian', std, 15)
  const pos = positions[0]

  it('tells you to improvise first', () => {
    const p = walkProgress(initWalk(), pos)
    expect(p.instruction).toContain('Improvise')
    expect(p.readyToResolve).toBe(false)
  })

  it('tells you to come home once you have explored enough', () => {
    const state = { claimed: [], explored: [0, 2, 4, 5], justClaimed: null, combo: 0 }
    const p = walkProgress(state, pos)
    expect(p.readyToResolve).toBe(true)
    expect(p.instruction).toContain('come home')
    expect(p.instruction).toContain(pos.tonic)
  })

  it('celebrates instead of nagging once claimed', () => {
    const state = { claimed: [pos.tonic], explored: [], justClaimed: null, combo: 1 }
    const p = walkProgress(state, pos)
    expect(p.claimed).toBe(true)
    expect(p.instruction).toContain('yours')
  })
})
