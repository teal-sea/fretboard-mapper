import { describe, it, expect } from 'vitest'
import { nextFlowHome, describeFlowShift, describeFlowSession } from './flowEngine'
import { getSameNoteModes } from './modes'

// Real siblings, straight from the theory engine — A aeolian's relatives.
const SIBS = getSameNoteModes('A', 'aeolian')

describe('nextFlowHome', () => {
  it('static never moves', () => {
    expect(nextFlowHome('static', 1, SIBS, [])).toBeNull()
    expect(nextFlowHome('static', 99, SIBS, [0, 3, 4])).toBeNull()
  })

  it('diatonic drift walks every other sibling and never lands on the current one', () => {
    const visited = new Set<string>()
    for (let step = 1; step <= SIBS.length - 1; step++) {
      const to = nextFlowHome('diatonic', step, SIBS, [])!
      expect(to).not.toBeNull()
      expect(to.isCurrent).toBe(false)
      visited.add(to.root)
    }
    expect(visited.size).toBe(SIBS.length - 1) // full tour before repeating
  })

  it('diatonic drift wraps around', () => {
    const first = nextFlowHome('diatonic', 1, SIBS, [])
    const wrapped = nextFlowHome('diatonic', SIBS.length, SIBS, [])
    expect(wrapped!.root).toBe(first!.root)
  })

  it('custom follows the chosen degree order, duplicates allowed', () => {
    // i — iv — v — iv in A aeolian: A, D, E, D
    const order = [0, 3, 4, 3]
    const roots = [1, 2, 3, 4].map(s => nextFlowHome('custom', s, SIBS, order)!.root)
    expect(roots).toEqual(['A', 'D', 'E', 'D'])
    expect(nextFlowHome('custom', 5, SIBS, order)!.root).toBe('A') // loops
  })

  it('custom with an empty order stays put', () => {
    expect(nextFlowHome('custom', 1, SIBS, [])).toBeNull()
  })

  it('stays put when the scale has no siblings to walk', () => {
    expect(nextFlowHome('diatonic', 1, [], [])).toBeNull()
    expect(nextFlowHome('diatonic', 1, SIBS.slice(0, 1), [])).toBeNull()
  })
})

describe('flow copy', () => {
  it('the shift line names the new home and promises no new notes', () => {
    const to = SIBS.find(s => !s.isCurrent)!
    const line = describeFlowShift(to)
    expect(line).toContain(to.root)
    expect(line).toContain('same notes')
  })

  it('the session summary is a mirror, not a grade', () => {
    expect(describeFlowSession({ minutes: 14, notesHeard: 312, homesVisited: 5 }))
      .toBe('14 min · 312 notes heard across 5 homes.')
    expect(describeFlowSession({ minutes: 0.4, notesHeard: 0, homesVisited: 1 }))
      .toBe('under a minute of sound.')
  })
})
