import { describe, it, expect } from 'vitest'
import { initRun, advanceRun, matchesStep, scoreRun, stepStates } from './runner'
import { getSweepShape, buildRun } from './arpeggios'
import { recontextualise } from './modes'
import { CHORDS, TUNINGS } from './musicTheory'

const std = TUNINGS['standard']
const shape = getSweepShape('A', CHORDS['min7'], std, 0, 15)!
const run = buildRun(shape, 'ascending')

// Play the run perfectly, note by note, exactly as a guitarist would.
function playPerfectly() {
  let s = initRun()
  let t = 0
  for (const step of run.steps) {
    t += 200
    s = advanceRun(run, s, step.note.midi, t)
  }
  return s
}

describe('matchesStep', () => {
  it('accepts the right note', () => {
    expect(matchesStep(69, 69)).toBe(true)
  })

  it('forgives a clean octave error — the one mistake pitch detectors really make', () => {
    expect(matchesStep(81, 69)).toBe(true)
    expect(matchesStep(57, 69)).toBe(true)
  })

  it('does NOT forgive a wrong note', () => {
    expect(matchesStep(70, 69)).toBe(false)
    expect(matchesStep(64, 69)).toBe(false)
  })
})

describe('advanceRun', () => {
  it('advances when you play the note it asked for', () => {
    const s = advanceRun(run, initRun(), run.steps[0].note.midi, 1)
    expect(s.index).toBe(1)
    expect(s.done).toBe(false)
  })

  it('does not advance on a wrong note — but does not punish you either', () => {
    const s = advanceRun(run, initRun(), run.steps[0].note.midi + 1, 1)
    expect(s.index).toBe(0)
    expect(s.done).toBe(false)
    expect(s.mistakes).toBe(1) // counted, never penalised
  })

  it('ignores silence', () => {
    const s = advanceRun(run, initRun(), null, 1)
    expect(s).toEqual(initRun())
  })

  it('completes when the last note lands', () => {
    const s = playPerfectly()
    expect(s.done).toBe(true)
    expect(s.mistakes).toBe(0)
    expect(s.finishedAt).not.toBeNull()
  })

  it('a completed run stays completed', () => {
    const done = playPerfectly()
    const after = advanceRun(run, done, 0, 999)
    expect(after).toEqual(done)
  })

  it('survives a player fumbling before getting it right', () => {
    let s = initRun()
    s = advanceRun(run, s, run.steps[0].note.midi + 2, 1)  // wrong
    s = advanceRun(run, s, run.steps[0].note.midi + 3, 2)  // wrong again
    expect(s.index).toBe(0)
    s = advanceRun(run, s, run.steps[0].note.midi, 3)      // finally right
    expect(s.index).toBe(1)
    expect(s.mistakes).toBe(2)
  })

  it('records when you started, not when the run was loaded', () => {
    let s = initRun()
    expect(s.startedAt).toBeNull()
    s = advanceRun(run, s, run.steps[0].note.midi, 5000)
    expect(s.startedAt).toBe(5000)
  })
})

describe('scoreRun — encouraging by construction, no fail state', () => {
  it('gives nothing until the run is finished', () => {
    expect(scoreRun(run, initRun())).toBeNull()
  })

  it('praises a clean run', () => {
    const r = scoreRun(run, playPerfectly())!
    expect(r.clean).toBe(true)
    expect(r.verdict.toLowerCase()).toContain('clean')
    expect(r.notesPerSecond).toBeGreaterThan(0)
  })

  it('never tells you that you failed, even when it was a mess', () => {
    let s = initRun()
    let t = 0
    for (const step of run.steps) {
      t += 100
      s = advanceRun(run, s, step.note.midi + 1, t) // a wrong note before each right one
      t += 100
      s = advanceRun(run, s, step.note.midi, t)
    }
    const r = scoreRun(run, s)!
    expect(r.clean).toBe(false)
    expect(r.verdict.toLowerCase()).not.toContain('fail')
    expect(r.verdict.toLowerCase()).not.toContain('wrong')
    expect(r.verdict).toContain('Landed it')
  })
})

describe('stepStates — what the neck should draw', () => {
  it('marks exactly one step as current at the start', () => {
    const states = stepStates(run, initRun())
    expect(states.filter(s => s.status === 'current')).toHaveLength(1)
    expect(states[0].status).toBe('current')
    expect(states[0].order).toBe(1)
  })

  it('everything behind you is done, everything ahead is todo', () => {
    let s = initRun()
    s = advanceRun(run, s, run.steps[0].note.midi, 1)
    s = advanceRun(run, s, run.steps[1].note.midi, 2)
    const states = stepStates(run, s)
    expect(states[0].status).toBe('done')
    expect(states[1].status).toBe('done')
    expect(states[2].status).toBe('current')
    expect(states[3].status).toBe('todo')
  })

  it('every step is done once the run is', () => {
    const states = stepStates(run, playPerfectly())
    expect(states.every(s => s.status === 'done')).toBe(true)
  })
})

describe('recontextualise — the payoff', () => {
  it('re-reads the same shape against a new home note', () => {
    // Am7 = A C E G. Against an F drone those become the 3, 5, 7 and 9 of F.
    const r = recontextualise('A', CHORDS['min7'].intervals, 'F')
    expect(r.newTonic).toBe('F')
    expect(r.intervals).toEqual(['3', '5', '7', '2'])
    expect(r.sentence).toContain("Don't move your hands")
    expect(r.sentence).toContain('F')
  })

  it('against its own root, the shape is just itself', () => {
    const r = recontextualise('A', CHORDS['min7'].intervals, 'A')
    expect(r.intervals).toEqual(['R', 'b3', '5', 'b7'])
  })
})
