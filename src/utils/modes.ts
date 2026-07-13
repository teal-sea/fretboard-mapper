// ─── Modal Relativity ───────────────────────────────────────────────
// The thesis of this whole app:
//
//   The same seven notes played from a different home note is a different mode.
//   On a guitar, that means the shapes under your hands do not move at all —
//   the DRONE decides which note is home, and that alone changes everything.
//
// A Aeolian and D Dorian and G Mixolydian are the SAME SEVEN NOTES. Play the
// identical fretboard shape; move the drone from A to D and it stops sounding
// sad and starts sounding hopeful. Nothing moved but the centre of gravity.
//
// Books state this. They cannot make you HEAR it. A drone can.

import { SCALES, noteIndex, noteName, useFlats, getScaleNotes, intervalName } from './musicTheory'
import { plainScaleName } from './theory'

export interface SiblingMode {
  root: string        // the tonic that makes this mode
  scaleKey: string    // key into SCALES
  name: string        // "Dorian"
  degree: number      // which degree of the CURRENT scale this tonic sits on (0-based)
  isCurrent: boolean
}

// Every mode built from the exact same pitch set as the one you're playing.
// For a 7-note scale that's seven of them — one per degree.
export function getSameNoteModes(root: string, scaleKey: string): SiblingMode[] {
  const scale = SCALES[scaleKey]
  if (!scale) return []

  const flats = useFlats(root)
  const current = getScaleNotes(root, scale)
  const rootIdx = noteIndex(root)

  const siblings: SiblingMode[] = []

  // Walk the degrees of the scale you're on. Each degree is a candidate tonic.
  scale.intervals.forEach((iv, degree) => {
    const candidateRoot = (rootIdx + iv) % 12

    // Which mode, rooted on that note, yields this exact set of pitches?
    for (const key of Object.keys(SCALES)) {
      const cand = SCALES[key]
      if (cand.intervals.length !== scale.intervals.length) continue

      const candNotes = getScaleNotes(noteName(candidateRoot, flats), cand)
      if (candNotes.size !== current.size) continue

      let same = true
      candNotes.forEach(pc => { if (!current.has(pc)) same = false })
      if (!same) continue

      siblings.push({
        root: noteName(candidateRoot, flats),
        scaleKey: key,
        name: cand.name.replace(/\s*\(.*\)/, ''),
        degree,
        isCurrent: candidateRoot === rootIdx && key === scaleKey,
      })
      break // one mode per degree is enough
    }
  })

  return siblings
}

// The line that makes the penny drop when you move the drone.
export function describeModalShift(
  fromRoot: string,
  fromKey: string,
  toRoot: string,
  toKey: string
): string {
  const from = SCALES[fromKey]
  const to = SCALES[toKey]
  if (!from || !to) return ''

  const fromName = from.name.replace(/\s*\(.*\)/, '')
  const toName = to.name.replace(/\s*\(.*\)/, '')
  const plain = plainScaleName(toKey)

  if (fromRoot === toRoot) {
    return `Same home note, different notes — this is a real key change.`
  }

  return (
    `Nothing on the neck moved. These are the exact same seven notes you were ` +
    `just playing — the drone simply moved home from ${fromRoot} to ${toRoot}. ` +
    `That is the only difference between ${fromRoot} ${fromName} and ${toRoot} ${toName}` +
    (plain ? `, which is ${plain}.` : '.') +
    ` Your hands don't change. The sound completely does.`
  )
}

// ─── The payoff: the same shape, a different home ───
// You just learned an Am7 arpeggio. Don't move your hands. Move the DRONE to F,
// and those identical four notes are now the 3rd, 5th, 7th and 9th of F — the
// shape didn't change, its meaning did. This is modal relativity felt in the
// hands instead of read in a table, and it is the whole point of the app.
export interface Recontext {
  newTonic: string
  intervals: string[]      // what the shape's notes become against the new home
  sentence: string
}

export function recontextualise(
  chordRoot: string,
  chordIntervals: number[],
  newTonic: string
): Recontext {
  const chordPc = noteIndex(chordRoot)
  const tonicPc = noteIndex(newTonic)
  const flats = useFlats(newTonic)

  const intervals = chordIntervals.map(i => {
    const pc = (chordPc + i) % 12
    return intervalName(((pc - tonicPc) % 12 + 12) % 12)
  })

  const notes = chordIntervals
    .map(i => noteName((chordPc + i) % 12, flats))
    .join(', ')

  const sentence =
    `Don't move your hands. The drone is now on ${newTonic}. Those same notes — ` +
    `${notes} — are no longer a ${chordRoot} chord sitting at home; against ${newTonic} ` +
    `they're the ${intervals.join(', ')}. Identical shape. Completely different meaning. ` +
    `That is what a mode actually is.`

  return { newTonic, intervals, sentence }
}

// ─── Explaining a mode INSIDE the key you selected ───
// "Dorian is minor with a raised 6th" is textbook garbage in the abstract.
// Against the tonic you're actually sitting on, it becomes concrete:
//   "You're in A. A Aeolian uses F. A Dorian is the same scale with F# instead."
export interface KeyContrast {
  changed: { from: string; to: string; interval: string }[]
  sentence: string
}

export function contrastWithKey(
  tonic: string,
  keyScaleKey: string,
  modeScaleKey: string
): KeyContrast | null {
  const keyScale = SCALES[keyScaleKey]
  const modeScale = SCALES[modeScaleKey]
  if (!keyScale || !modeScale) return null
  if (keyScaleKey === modeScaleKey) return null
  if (keyScale.intervals.length !== modeScale.intervals.length) return null

  const flats = useFlats(tonic)
  const tonicIdx = noteIndex(tonic)

  const keyIvs = new Set(keyScale.intervals.map(i => i % 12))
  const modeIvs = new Set(modeScale.intervals.map(i => i % 12))

  const removed = [...keyIvs].filter(i => !modeIvs.has(i))
  const added = [...modeIvs].filter(i => !keyIvs.has(i))
  if (added.length === 0) return null

  // Pair each new note with the note it replaced (nearest by semitone).
  const changed = added.map(a => {
    const nearest = removed.reduce(
      (best, r) => (Math.abs(r - a) < Math.abs(best - a) ? r : best),
      removed[0] ?? a
    )
    return {
      from: noteName((tonicIdx + nearest) % 12, flats),
      to: noteName((tonicIdx + a) % 12, flats),
      interval: intervalName(a),
    }
  })

  const keyName = keyScale.name.replace(/\s*\(.*\)/, '')
  const modeName = modeScale.name.replace(/\s*\(.*\)/, '')

  const swaps = changed
    .map(c => `${c.from} becomes ${c.to}`)
    .join(', and ')

  const sentence =
    changed.length === 1
      ? `You're in ${tonic}. ${tonic} ${keyName} uses ${changed[0].from}. ` +
        `${tonic} ${modeName} is the exact same scale — except ${changed[0].from} becomes ` +
        `${changed[0].to}. One note. That's the whole difference, and it's why they don't ` +
        `feel remotely alike.`
      : `You're in ${tonic}. Going from ${tonic} ${keyName} to ${tonic} ${modeName}, ` +
        `${swaps}. Everything else stays exactly where it was.`

  return { changed, sentence }
}
