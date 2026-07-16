import { describe, it, expect } from 'vitest'
import { recordPractice } from './streak'

describe('recordPractice', () => {
  it('starts a streak of 1 on first ever practice', () => {
    expect(recordPractice({ streak: 0, lastDate: null }, '2026-07-16')).toEqual({ streak: 1, lastDate: '2026-07-16' })
  })

  it('does not double-count the same day', () => {
    const state = { streak: 3, lastDate: '2026-07-16' }
    expect(recordPractice(state, '2026-07-16')).toBe(state)
  })

  it('increments on a consecutive day', () => {
    expect(recordPractice({ streak: 3, lastDate: '2026-07-16' }, '2026-07-17')).toEqual({ streak: 4, lastDate: '2026-07-17' })
  })

  it('resets to 1 after a gap of more than one day', () => {
    expect(recordPractice({ streak: 5, lastDate: '2026-07-10' }, '2026-07-16')).toEqual({ streak: 1, lastDate: '2026-07-16' })
  })

  it('resets to 1 if practice happens before the last recorded date (clock skew)', () => {
    expect(recordPractice({ streak: 5, lastDate: '2026-07-16' }, '2026-07-15')).toEqual({ streak: 1, lastDate: '2026-07-15' })
  })
})
