import { describe, it, expect } from 'vitest'
import { getSameNoteModes, describeModalShift, contrastWithKey } from './modes'
import { SCALES, getScaleNotes, noteIndex } from './musicTheory'

// This is the app's central claim. If the maths is wrong here, the app teaches
// a lie about the thing it exists to teach.

describe('getSameNoteModes — the same notes, a different home', () => {
  it('finds all seven modes of a 7-note scale', () => {
    const sibs = getSameNoteModes('A', 'aeolian')
    expect(sibs).toHaveLength(7)
  })

  it('EVERY sibling uses the exact same pitch set — that is the whole point', () => {
    const target = getScaleNotes('A', SCALES['aeolian'])
    for (const s of getSameNoteModes('A', 'aeolian')) {
      const notes = getScaleNotes(s.root, SCALES[s.scaleKey])
      expect(notes.size, `${s.root} ${s.name} has a different number of notes`).toBe(target.size)
      notes.forEach(pc => {
        expect(
          target.has(pc),
          `${s.root} ${s.name} contains a note that isn't in A Aeolian`
        ).toBe(true)
      })
    }
  })

  it('A Aeolian and D Dorian and G Mixolydian really are the same notes', () => {
    const sibs = getSameNoteModes('A', 'aeolian')
    const byName = (n: string) => sibs.find(s => s.name.startsWith(n))

    expect(byName('Dorian')!.root).toBe('D')
    expect(byName('Mixolydian')!.root).toBe('G')
    expect(byName('Ionian')!.root).toBe('C')   // A minor's relative major
    expect(byName('Phrygian')!.root).toBe('E')
    expect(byName('Lydian')!.root).toBe('F')
    expect(byName('Locrian')!.root).toBe('B')
  })

  it('marks exactly one sibling as the one you are currently on', () => {
    const sibs = getSameNoteModes('A', 'aeolian')
    expect(sibs.filter(s => s.isCurrent)).toHaveLength(1)
    const cur = sibs.find(s => s.isCurrent)!
    expect(cur.root).toBe('A')
    expect(cur.scaleKey).toBe('aeolian')
  })

  it('works from any starting mode — the family is the same either way', () => {
    const fromDorian = getSameNoteModes('D', 'dorian').map(s => s.root).sort()
    const fromAeolian = getSameNoteModes('A', 'aeolian').map(s => s.root).sort()
    expect(fromDorian).toEqual(fromAeolian)
  })

  it('handles a pentatonic family without exploding', () => {
    const sibs = getSameNoteModes('A', 'minor_penta')
    expect(sibs.length).toBeGreaterThan(0)
    const target = getScaleNotes('A', SCALES['minor_penta'])
    for (const s of sibs) {
      getScaleNotes(s.root, SCALES[s.scaleKey]).forEach(pc => {
        expect(target.has(pc)).toBe(true)
      })
    }
  })
})

describe('describeModalShift', () => {
  it('says the hands did not move', () => {
    const s = describeModalShift('A', 'aeolian', 'D', 'dorian')
    expect(s).toContain('same seven notes')
    expect(s).toContain('A')
    expect(s).toContain('D')
    expect(s.toLowerCase()).toContain("hands don't change")
  })
})

describe('contrastWithKey — explain the mode INSIDE the selected key', () => {
  it('A Aeolian vs A Dorian differ by exactly one note: F becomes F#', () => {
    const c = contrastWithKey('A', 'aeolian', 'dorian')
    expect(c).not.toBeNull()
    expect(c!.changed).toHaveLength(1)
    expect(c!.changed[0].from).toBe('F')
    expect(c!.changed[0].to).toBe('F#')
    expect(c!.changed[0].interval).toBe('6')
    expect(c!.sentence).toContain("You're in A")
    expect(c!.sentence).toContain('One note')
  })

  it('A Ionian vs A Mixolydian differ by one note: G# becomes G', () => {
    const c = contrastWithKey('A', 'ionian', 'mixolydian')!
    expect(c.changed).toHaveLength(1)
    expect(c.changed[0].from).toBe('G#')
    expect(c.changed[0].to).toBe('G')
    expect(c.changed[0].interval).toBe('b7')
  })

  it('handles multi-note differences (Aeolian vs Lydian)', () => {
    const c = contrastWithKey('A', 'aeolian', 'lydian')!
    expect(c.changed.length).toBeGreaterThan(1)
    expect(c.sentence).toContain('Everything else stays')
  })

  it('returns null when there is nothing to contrast', () => {
    expect(contrastWithKey('A', 'aeolian', 'aeolian')).toBeNull()
  })

  it('every changed note is genuinely in the target scale and not in the key', () => {
    const c = contrastWithKey('A', 'aeolian', 'dorian')!
    const target = getScaleNotes('A', SCALES['dorian'])
    const key = getScaleNotes('A', SCALES['aeolian'])
    for (const ch of c.changed) {
      const pc = noteIndex(ch.to)
      expect(target.has(pc)).toBe(true)
      expect(key.has(pc)).toBe(false)
    }
  })
})
