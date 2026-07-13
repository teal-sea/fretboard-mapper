import { describe, it, expect, beforeEach } from 'vitest'
import {
  familyId, loadProgress, claimMode, getClaims, markCompleted,
  isCompleted, totalClaimed, keysWalked, resetProgress,
} from './progress'

// A collection mechanic that forgets you is not a collection mechanic.
// These guarantee nothing you earn can ever be taken away.

describe('familyId — A minor and C major are the SAME walk', () => {
  it('collapses every mode of a scale to one family', () => {
    const a = familyId('A', 'aeolian')
    expect(familyId('C', 'ionian')).toBe(a)
    expect(familyId('D', 'dorian')).toBe(a)
    expect(familyId('G', 'mixolydian')).toBe(a)
    expect(familyId('E', 'phrygian')).toBe(a)
  })

  it('a genuinely different key is a different family', () => {
    expect(familyId('E', 'aeolian')).not.toBe(familyId('A', 'aeolian'))
  })
})

describe('progress persists', () => {
  beforeEach(() => resetProgress())

  const AM = familyId('A', 'aeolian')

  it('starts empty', () => {
    expect(totalClaimed()).toBe(0)
    expect(getClaims(AM)).toEqual([])
  })

  it('remembers a claimed mode', () => {
    claimMode(AM, 'D')
    expect(getClaims(AM)).toEqual(['D'])
    expect(totalClaimed()).toBe(1)
  })

  it('survives a reload — the whole point', () => {
    claimMode(AM, 'D')
    claimMode(AM, 'G')
    // simulate a fresh page load: nothing in memory, only storage
    const reloaded = loadProgress()
    expect(reloaded.claims[AM]).toEqual(['D', 'G'])
  })

  it('cannot claim the same mode twice', () => {
    claimMode(AM, 'D')
    claimMode(AM, 'D')
    expect(getClaims(AM)).toEqual(['D'])
    expect(totalClaimed()).toBe(1)
  })

  it('claiming D Dorian counts whether you came from A minor or C major', () => {
    claimMode(familyId('A', 'aeolian'), 'D')
    // arrive at the same scale from the other door
    expect(getClaims(familyId('C', 'ionian'))).toEqual(['D'])
  })

  it('keeps different keys separate', () => {
    const EM = familyId('E', 'aeolian')
    claimMode(AM, 'D')
    claimMode(EM, 'A')
    expect(getClaims(AM)).toEqual(['D'])
    expect(getClaims(EM)).toEqual(['A'])
    expect(totalClaimed()).toBe(2)
  })

  it('tracks whole keys walked end to end', () => {
    expect(isCompleted(AM)).toBe(false)
    markCompleted(AM)
    expect(isCompleted(AM)).toBe(true)
    expect(keysWalked()).toBe(1)
    markCompleted(AM) // idempotent
    expect(keysWalked()).toBe(1)
  })

  it('the number only ever goes up', () => {
    const before = totalClaimed()
    claimMode(AM, 'A')
    claimMode(AM, 'B')
    claimMode(AM, 'C')
    expect(totalClaimed()).toBeGreaterThan(before)
    // nothing in the API can decrement it
    claimMode(AM, 'A')
    expect(totalClaimed()).toBe(3)
  })
})
