// ─── The Theory Layer ───────────────────────────────────────────────
// Music theory, delivered dopaminely: never a lecture, always "oh, THAT's
// why". One insight about whatever is currently on the neck.
//
// Every insight is COMPUTED from the theory engine — shared tones, scale
// degrees, characteristic intervals are all derived, never hardcoded. The
// prose templates are authored; the musical facts inside them are not.

import {
  SCALES, CHORDS, getChordNotes, getScaleNotes,
  noteIndex, noteName, intervalName, useFlats,
} from './musicTheory'
import type { DiatonicChord } from './musicTheory'

export interface Insight {
  eyebrow: string        // the kind of thing this is
  title: string          // the punchline
  body: string           // one or two sentences, no lecturing
  focus?: string         // interval label worth staring at
}

// ─── What makes each scale itself ───
// The one note that, if you changed it, would make it a different mode.
const CHARACTER: Record<string, { focus: string; title: string; body: string }> = {
  ionian: {
    focus: '7',
    title: 'The leading tone',
    body: 'The 7 sits a half-step under the root and leans on it. That lean is why major sounds resolved and sure of itself — remove it (flatten it to a b7) and the whole thing goes loose and bluesy.',
  },
  dorian: {
    focus: '6',
    title: 'The raised 6th',
    body: 'Minor, but the 6 is natural instead of flat. That single note is the whole mode: still dark, but hopeful rather than grieving. Aeolian flattens it and the light goes out.',
  },
  phrygian: {
    focus: 'b2',
    title: 'The flat 2nd',
    body: 'A half-step above the root — the tightest, most menacing interval you can put next to home. Spanish or metal depending on how hard you hit it. Nothing else sounds like it.',
  },
  lydian: {
    focus: 'b5',
    title: 'The raised 4th',
    body: 'Major, but the 4th is sharpened. It hovers — it wants to resolve and never has to. Major sounds happy; Lydian sounds like wonder. This is the film-score note.',
  },
  mixolydian: {
    focus: 'b7',
    title: 'The flat 7th',
    body: 'All of major’s brightness, with the leash off. The major 3rd and the flat 7th in the same scale is the dominant sound — the single reason blues and rock exist.',
  },
  aeolian: {
    focus: 'b6',
    title: 'The flat 6th',
    body: 'The natural minor. The b6 is what makes it grieve rather than brood — compare it to Dorian’s natural 6 and you can hear the light switch off.',
  },
  locrian: {
    focus: 'b5',
    title: 'No home to go to',
    body: 'Flat 2 AND flat 5. The tonic chord is diminished, so home itself is unstable — you keep wanting to leave. That restlessness IS the sound. Use it as colour, not as a key.',
  },
  harmonic_minor: {
    focus: '7',
    title: 'A step and a half',
    body: 'Natural minor with the 7th raised back up. Now the b6 leaps to the 7 — the widest gap in the scale, and the reason this sounds like a knife. Everything else here is just Aeolian.',
  },
  melodic_minor: {
    focus: '7',
    title: 'Minor below, major above',
    body: 'The 6 and the 7 are both raised, so it starts minor and turns bright halfway up. Ambiguous, expensive-sounding, and the backbone of most jazz reharmonisation.',
  },
  minor_penta: {
    focus: 'R',
    title: 'Nothing to get wrong',
    body: 'Five notes, no half-step clashes, no avoid notes. All the tension has been removed — which means the only thing left to work on is phrasing. Play fewer notes than you want to.',
  },
  major_penta: {
    focus: '6',
    title: 'The sweet one',
    body: 'Same five shapes as minor pentatonic, moved to a major home. Open, vocal, uncluttered — the country and Mayer sound. Bend into the 2 and the 6 and let them ring.',
  },
  blues: {
    focus: 'b5',
    title: 'The one dirty note',
    body: 'Minor pentatonic plus the b5. Don’t land on it — pass THROUGH it. Sit on it and it sounds like a mistake; slide off it and it sounds like the blues.',
  },
}

export function getScaleInsight(root: string, scaleKey: string): Insight | null {
  const scale = SCALES[scaleKey]
  const c = CHARACTER[scaleKey]
  if (!scale || !c) return null

  const flats = useFlats(root)
  const semis = scale.intervals.find(i => intervalName(i % 12) === c.focus)
  const focusNote =
    semis !== undefined ? noteName((noteIndex(root) + semis) % 12, flats) : null

  return {
    eyebrow: 'The sound',
    title: c.title,
    body: focusNote
      ? `${c.body} In ${root}, that note is ${focusNote}.`
      : c.body,
    focus: c.focus,
  }
}

// ─── Why a chord works over the key it lives in ───
// Everything factual here is computed: shared tones, degrees, extensions.
export function getChordInsight(
  keyRoot: string,
  keyQuality: string,
  dc: DiatonicChord,
  tonicChord: DiatonicChord | null
): Insight | null {
  const scale = SCALES[keyQuality]
  if (!scale) return null

  const flats = useFlats(keyRoot)
  const keyIdx = noteIndex(keyRoot)
  const chordTones = getChordNotes(dc.root, dc.chordDef)

  // Which scale degree does each chord tone occupy in the KEY?
  const degreeOf = (pc: number): string =>
    intervalName(((pc - keyIdx) % 12 + 12) % 12)

  // Shared tones with home — the reason it doesn't sound like it left the key.
  let sharedNames: string[] = []
  if (tonicChord && tonicChord.chordKey !== dc.chordKey) {
    const tonicTones = getChordNotes(tonicChord.root, tonicChord.chordDef)
    sharedNames = [...chordTones]
      .filter(pc => tonicTones.has(pc))
      .map(pc => noteName(pc, flats))
  }

  // The colour tone: the note beyond the plain triad that gives it its flavour.
  const triad = new Set(dc.chordDef.intervals.slice(0, 3).map(i => i % 12))
  const colourSemis = dc.chordDef.intervals.find(i => !triad.has(i % 12))
  const colourNote =
    colourSemis !== undefined
      ? noteName((noteIndex(dc.root) + colourSemis) % 12, flats)
      : null
  const colourIv = colourSemis !== undefined ? intervalName(colourSemis % 12) : null

  const parts: string[] = []

  parts.push(
    `${dc.fullName} is the ${dc.romanNumeral} of ${keyRoot} ${scale.name.replace(/\s*\(.*\)/, '')}.`
  )

  if (sharedNames.length >= 2) {
    parts.push(
      `It shares ${sharedNames.slice(0, 3).join(' and ')} with your home chord — that overlap is why it can wander this far and still sound like it belongs.`
    )
  } else if (sharedNames.length === 1) {
    parts.push(
      `Its only anchor to home is ${sharedNames[0]} — which is exactly why it feels like it's pulling away.`
    )
  }

  if (colourNote && colourIv) {
    parts.push(
      `The note doing the work is ${colourNote}, its ${colourIv} — that's the ${degreeOf(noteIndex(colourNote))} of the key.`
    )
  }

  parts.push(`Play the scale, but aim at the lit-up chord tones. They land; everything else is passing through.`)

  return {
    eyebrow: 'Why it works',
    title: `${dc.fullName} over ${keyRoot}`,
    body: parts.join(' '),
    focus: colourIv ?? undefined,
  }
}

// ─── How many of the scale's notes does this chord actually cover? ───
// A small, honest stat — the kind of thing that rewards a glance.
export function chordCoverage(dc: DiatonicChord, root: string, scaleKey: string): number {
  const scale = SCALES[scaleKey]
  if (!scale) return 0
  const scaleTones = getScaleNotes(root, scale)
  const chordTones = getChordNotes(dc.root, dc.chordDef)
  let hits = 0
  chordTones.forEach(pc => { if (scaleTones.has(pc)) hits++ })
  return hits
}

// Every chord in CHORDS that fits entirely inside the given scale, built on
// any of its degrees. Used for the "what else can I play here" nudge.
export function chordsInScale(root: string, scaleKey: string): number {
  const scale = SCALES[scaleKey]
  if (!scale) return 0
  const scaleTones = getScaleNotes(root, scale)
  let count = 0
  for (const iv of scale.intervals) {
    const degRoot = noteName((noteIndex(root) + iv) % 12)
    for (const key of Object.keys(CHORDS)) {
      const tones = getChordNotes(degRoot, CHORDS[key])
      let fits = true
      tones.forEach(pc => { if (!scaleTones.has(pc)) fits = false })
      if (fits) count++
    }
  }
  return count
}
