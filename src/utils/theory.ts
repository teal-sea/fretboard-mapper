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
import type { Language } from './noteNames'
import { t, tf } from './i18n'

export interface Insight {
  eyebrow: string        // the kind of thing this is
  title: string          // the punchline
  body: string           // one or two sentences, no lecturing
  focus?: string         // interval label worth staring at
}

// ─── Plain English, for someone who has never heard the word "mode" ───
// The app must never assume you already know the jargon it's using.

// What a scale IS, said without jargon. Keyed by scale id.
const PLAIN: Record<string, string> = {
  ionian: 'the plain major scale — the happy, resolved one',
  dorian: 'a minor (sad) scale with ONE note lifted higher than normal',
  phrygian: 'a minor scale with the note right above home pushed down — dark, Spanish',
  lydian: 'a major (happy) scale with ONE note pushed higher — dreamy, floating',
  mixolydian: 'a major scale with ONE note lowered — bright, but bluesy',
  aeolian: 'the plain minor scale — the sad one',
  locrian: 'an unstable scale that never feels settled',
  harmonic_minor: 'a minor scale with one note raised, making a big exotic leap',
  melodic_minor: 'a scale that starts sad and turns bright on the way up',
  minor_penta: 'the 5-note scale everyone solos with — nothing in it can sound wrong',
  major_penta: 'the sweet 5-note scale — open and vocal',
  blues: 'the 5-note solo scale plus one deliberately "wrong" note',
}

export function plainScaleName(scaleKey: string, lang: Language = 'en'): string | null {
  const plain = PLAIN[scaleKey]
  return plain ? t(plain, lang) : null
}

// The objective, in words a beginner can act on. Every value is passed in,
// so this can't drift out of sync with what's on the neck. Note labels
// (root/focusNote) arrive already display-converted by the caller.
export function getObjective(opts: {
  root: string
  scaleKey: string
  focusInterval: string
  focusNote: string
  hasShape: boolean
}, lang: Language = 'en'): string {
  const { root, scaleKey, focusInterval, focusNote, hasShape } = opts
  const plain = PLAIN[scaleKey]
  const scaleName = t(SCALES[scaleKey]?.name ?? scaleKey, lang)

  const what = plain
    ? tf('{root} {scale} is {plain}.', lang, { root, scale: scaleName, plain: t(plain, lang) })
    : tf('You’re playing {root} {scale}.', lang, { root, scale: scaleName })

  const shape = hasShape
    ? t(' The white-outlined notes are a shape you can sweep through.', lang)
    : ''

  return tf(
    '{what} A drone is holding {root} underneath you, so every note you play is heard against it.{shape} Your job: play around and land on {note} — the glowing notes. That’s the {interval}, the one note that gives this scale its character. When the app hears you hit it, it’ll tell you.',
    lang,
    { what, root, shape, note: focusNote, interval: focusInterval }
  )
}

// The whole game, for a first-timer. Shown behind a "what is this?" toggle so
// it never nags anyone who already knows.
export const PRIMER: { q: string; a: string }[] = [
  {
    q: 'What am I actually doing?',
    a: 'Playing over a drone (a held note) and hunting for one specific note on the neck. That note is what makes each scale sound the way it does. Find it, hear it, and the theory stops being abstract.',
  },
  {
    q: 'What’s a "mode" or "scale"?',
    a: 'A scale is just a set of notes that sound good together. A mode is one of those sets with its own flavour. Two scales can share almost every note and differ by one — and that one note changes everything. That’s the note we make you find.',
  },
  {
    q: 'What do R, b3, 5, 6 mean?',
    a: 'They’re positions, not note names. R is "home" (the root). The numbers count steps up from home. So the 6 is the sixth note of the scale. We use numbers because the shape stays the same in every key — learn it once, play it anywhere.',
  },
  {
    q: 'Why is there a drone?',
    a: 'A single held note gives your ear a reference. Against silence, no note sounds like anything. Against a drone, each note has a clear personality — and the note you’re hunting will jump out.',
  },
  {
    q: 'What is it listening for?',
    a: 'Your microphone. Play, whistle, or hum. It works out which note you produced and lights it up on the neck. When you land the glowing note, you own that sound.',
  },
]

export function getPrimer(lang: Language = 'en'): { q: string; a: string }[] {
  return PRIMER.map(p => ({ q: t(p.q, lang), a: t(p.a, lang) }))
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

export function getScaleInsight(
  root: string,
  scaleKey: string,
  lang: Language = 'en',
  noteLabel?: (n: string) => string  // display conversion (solfège); identity if absent
): Insight | null {
  const scale = SCALES[scaleKey]
  const c = CHARACTER[scaleKey]
  if (!scale || !c) return null

  const dn = noteLabel ?? ((n: string) => n)
  const flats = useFlats(root)
  const semis = scale.intervals.find(i => intervalName(i % 12) === c.focus)
  const focusNote =
    semis !== undefined ? noteName((noteIndex(root) + semis) % 12, flats) : null

  return {
    eyebrow: t('The sound', lang),
    title: t(c.title, lang),
    body: focusNote
      ? t(c.body, lang) + tf(' In {root}, that note is {note}.', lang, { root: dn(root), note: dn(focusNote) })
      : t(c.body, lang),
    focus: c.focus,
  }
}

// ─── Why a chord works over the key it lives in ───
// Everything factual here is computed: shared tones, degrees, extensions.
export function getChordInsight(
  keyRoot: string,
  keyQuality: string,
  dc: DiatonicChord,
  tonicChord: DiatonicChord | null,
  lang: Language = 'en',
  noteLabel?: (n: string) => string
): Insight | null {
  const scale = SCALES[keyQuality]
  if (!scale) return null

  const dn = noteLabel ?? ((n: string) => n)
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

  const chordName = dn(dc.root) + dc.chordDef.suffix
  const parts: string[] = []

  parts.push(tf('{chord} is the {roman} of {key} {scale}.', lang, {
    chord: chordName,
    roman: dc.romanNumeral,
    key: dn(keyRoot),
    scale: t(scale.name, lang).replace(/\s*\(.*\)/, ''),
  }))

  if (sharedNames.length >= 2) {
    parts.push(tf('It shares {notes} with your home chord — that overlap is why it can wander this far and still sound like it belongs.', lang, {
      notes: sharedNames.slice(0, 3).map(dn).join(t(' and ', lang)),
    }))
  } else if (sharedNames.length === 1) {
    parts.push(tf('Its only anchor to home is {note} — which is exactly why it feels like it’s pulling away.', lang, {
      note: dn(sharedNames[0]),
    }))
  }

  if (colourNote && colourIv) {
    parts.push(tf('The note doing the work is {note}, its {iv} — that’s the {deg} of the key.', lang, {
      note: dn(colourNote), iv: colourIv, deg: degreeOf(noteIndex(colourNote)),
    }))
  }

  parts.push(t('Play the scale, but aim at the lit-up chord tones. They land; everything else is passing through.', lang))

  return {
    eyebrow: t('Why it works', lang),
    title: tf('{chord} over {key}', lang, { chord: chordName, key: dn(keyRoot) }),
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
