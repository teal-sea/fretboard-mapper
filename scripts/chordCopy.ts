// ─── Authored copy for the 26 chord types ─────────────────────────────
// One entry per key in musicTheory.ts's CHORDS object. Intervals, formulas,
// voicings and compatible scales are all computed at generation time — this
// file only supplies the character/usage prose, same split as MODE_COPY.

export interface ChordCopy {
  hook: string     // one sentence: what it IS, structurally
  sound: string     // 1-2 sentences: character, where you've heard it
  practice: string  // one sentence: what to listen/reach for
}

export const CHORD_COPY: Record<string, ChordCopy> = {
  // ─── Triads ──────────────────────────────────────────────────────
  major: {
    hook: 'The major triad — root, major 3rd, perfect 5th — is the most basic resolved chord in Western music.',
    sound: 'It is the DNA of pop choruses, campfire songs, and the first chord almost anyone learns. Bright, stable, unambiguous.',
    practice: 'Play it right after its minor twin on the same root and listen to exactly what one semitone in the 3rd changes.',
  },
  minor: {
    hook: 'The minor triad flips one note from major — the 3rd drops a semitone — and the whole mood turns.',
    sound: 'It is the default "sad" or "serious" chord: minor-key ballads, moody verses, most of the emotional weight in rock and pop.',
    practice: 'Compare it directly against the major triad on the same root; that single semitone is the entire difference between the two moods.',
  },
  dim: {
    hook: 'The diminished triad stacks two minor 3rds — root, minor 3rd, flat 5th — with no perfect 5th to stand on.',
    sound: 'It never sits still. Horror-movie stings, the vii° chord that pulls hard back to the tonic, tension that demands somewhere to go.',
    practice: 'Resolve it upward by a semitone into a major or minor triad and feel how much relief that tiny move creates.',
  },
  aug: {
    hook: 'The augmented triad raises the 5th a semitone — root, major 3rd, sharp 5th — erasing the interval that normally anchors a chord.',
    sound: 'With no perfect 5th, it never resolves anywhere in particular; it just hangs, dreamlike or unsettling depending on context.',
    practice: 'Try sliding it up or down by whole steps — its symmetric shape (every interval a major 3rd) makes it move in ways major/minor triads can’t.',
  },
  sus2: {
    hook: 'Sus2 replaces the 3rd with the 2nd — root, 2nd, perfect 5th — so the chord is neither major nor minor.',
    sound: 'Open, airy, and harmonically ambiguous — a favourite for intros and folk/pop textures that want space instead of a clear emotional colour.',
    practice: 'Resolve it into the major or minor triad on the same root and notice how the 2nd wants to fall or rise into the 3rd.',
  },
  sus4: {
    hook: 'Sus4 replaces the 3rd with the 4th — root, 4th, perfect 5th — building in a note that wants to fall.',
    sound: 'The classic "suspended" sound: a held breath before the 4th drops a semitone into the 3rd and the chord finally resolves.',
    practice: 'Never let it just sit — play sus4 immediately followed by the major triad and you’ve got the entire sus4-to-major cadence in two chords.',
  },
  power: {
    hook: 'The power chord is just the root and the 5th — no 3rd at all, so it’s neither major nor minor.',
    sound: 'The workhorse of rock and metal: because it has no 3rd, it stays clean and unambiguous even through heavy distortion, where a full triad would turn to mud.',
    practice: 'Add the octave above the root for the classic fifth-power-chord shape, then try inserting a major or minor 3rd to hear what the power chord was deliberately leaving out.',
  },

  // ─── Sevenths ────────────────────────────────────────────────────
  maj7: {
    hook: 'Major 7th stacks a major triad with a major 7th on top — root, 3rd, 5th, major 7th.',
    sound: 'Lush, dreamy, unresolved-but-comfortable — the chord of bossa nova, soul ballads, and jazz voicings that want to float rather than land.',
    practice: 'Compare it against plain major on the same root: the major 7th adds shimmer without adding tension the way a dominant 7th would.',
  },
  min7: {
    hook: 'Minor 7th adds a flat 7th to the minor triad — root, minor 3rd, 5th, flat 7th — softening the minor triad’s edges.',
    sound: 'Smoother and more relaxed than plain minor: the backbone of neo-soul, funk vamps, and jazz ii chords in a ii-V-I.',
    practice: 'Vamp on it for thirty seconds before switching to plain minor — the flat 7th is doing more relaxing than you’d expect from one note.',
  },
  dom7: {
    hook: 'The dominant 7th — root, major 3rd, 5th, flat 7th — is the chord built to resolve somewhere else.',
    sound: 'The engine of the blues and the V chord of every classical cadence: that flat 7th creates a pull toward home that almost nothing else in tonal harmony matches.',
    practice: 'Play it a 5th above any major chord and resolve into it — that V7-to-I motion is the single most common cadence in Western music.',
  },
  dim7: {
    hook: 'Fully diminished 7th stacks minor 3rds all the way up — root, flat 3rd, flat 5th, double-flat 7th — a perfectly symmetric chord.',
    sound: 'Maximum tension with nowhere obvious to land: horror-film harmony, ragtime passing chords, and the chord jazz players use to slide chromatically between two others.',
    practice: 'Because every interval is identical, the same shape moved up three frets is still a dim7 — try sliding it and hear how little actually changes.',
  },
  half_dim7: {
    hook: 'Half-diminished 7th (m7♭5) is a diminished triad with a flat 7th instead of a double-flat 7th — root, flat 3rd, flat 5th, flat 7th.',
    sound: 'Moodier than min7, less violent than dim7 — it’s the ii chord in a minor-key ii-V-i, the sound of jazz standards leaning toward a minor resolution.',
    practice: 'Follow it with a dominant 7th a 4th up, then a minor chord — that’s the minor ii-V-i, and half-dim7 is doing the setup work.',
  },
  min_maj7: {
    hook: 'Minor-major 7th keeps the minor 3rd but raises the 7th to major — root, flat 3rd, 5th, major 7th — combining dark and bright in one chord.',
    sound: 'The classic "spy movie" or Bond-theme chord: minor’s gravity with major 7’s shimmer clashing on purpose.',
    practice: 'Hold it and listen for both halves at once — the flat 3rd pulling down, the natural 7th pulling up — rather than resolving the tension away.',
  },
  aug7: {
    hook: 'Augmented 7th raises the 5th of a dominant 7th — root, major 3rd, sharp 5th, flat 7th — an altered dominant with extra bite.',
    sound: 'A dominant chord dressed for more tension before resolving: common in jazz and blues turnarounds that want an extra push toward home.',
    practice: 'Use it in place of a plain dominant 7th right before resolving to the I chord and notice how much harder it pulls.',
  },
  aug_maj7: {
    hook: 'Augmented major 7th combines a sharp 5th with a major 7th — root, major 3rd, sharp 5th, major 7th — a rare, deliberately unstable colour.',
    sound: 'Impressionistic and suspended, closer to Debussy or film-score harmony than anything with a clear pop or rock home.',
    practice: 'Let it hang without resolving — this chord is more interesting sustained than moved through quickly.',
  },

  // ─── Extended ────────────────────────────────────────────────────
  add9: {
    hook: 'Add9 stacks a 9th on top of a plain major triad, with no 7th in between — root, 3rd, 5th, 9th.',
    sound: 'Brighter and more shimmering than a plain major triad, without the jazziness a 7th would introduce — a pop and rock colour chord.',
    practice: 'Compare it directly to plain major on the same root: the 9th adds sparkle while the chord still resolves just as simply.',
  },
  maj9: {
    hook: 'Major 9th extends major 7th with a 9th on top — root, 3rd, 5th, major 7th, 9th — the lushest plain-major colour available.',
    sound: 'A step beyond maj7 in sophistication: neo-soul, city pop, and jazz voicings that want maximum warmth with zero tension.',
    practice: 'Voice just the 3rd, 7th, and 9th (skip the root and 5th) for the classic thin, floating jazz-piano version of this chord.',
  },
  min9: {
    hook: 'Minor 9th extends min7 with a 9th — root, flat 3rd, 5th, flat 7th, 9th — a smoother, more spacious minor colour.',
    sound: 'A neo-soul and modal-jazz staple; the added 9th keeps a minor chord from feeling heavy even when it’s held for a long time.',
    practice: 'Hold it under a Dorian melody line — the natural 6th of Dorian and the 9th of this chord share the same open, unresolved character.',
  },
  dom9: {
    hook: 'Dominant 9th extends dom7 with a 9th — root, 3rd, 5th, flat 7th, 9th — a dominant chord with extra colour instead of extra tension.',
    sound: 'Funk and soul horn-section harmony lives here: it still pulls like a dominant chord but sits richer and rounder than plain dom7.',
    practice: 'Stab it rhythmically on the "and" of a beat, funk-style, rather than holding it — this chord wants to be played, not sustained.',
  },
  dom11: {
    hook: 'Dominant 11th stacks the 11th on top of dom9 — root through the flat 7th, 9th, and 11th — a dense, often-thinned-out extended chord.',
    sound: 'Rarely played with every note at once in practice (the 3rd and 11th clash a semitone apart); guitarists usually voice a partial version, root/7th/9th/11th, for a modern funk or jazz-fusion colour.',
    practice: 'Try dropping the 3rd entirely — the resulting voicing (root, 7th, 9th, 11th) is the version that actually gets played.',
  },
  maj13: {
    hook: 'Major 13th is the "whole cake" major chord — root through the 7th, 9th, and 13th, every extension a major triad can carry.',
    sound: 'About as lush as tonal harmony gets: big-band endings, sophisticated jazz ballads, the chord that closes a tune on maximum warmth.',
    practice: 'In practice, guitarists voice only 4-5 of these six notes at once — try root, 3rd, 7th, 13th as a compact version that still carries the full colour.',
  },
  min11: {
    hook: 'Minor 11th stacks the 11th on min9 — root, flat 3rd, 5th, flat 7th, 9th, 11th — spacious modal-jazz harmony.',
    sound: 'This is close to Dorian itself stacked as a chord — modal jazz (think "So What"-style harmony) leans on exactly this kind of open, unresolved minor colour.',
    practice: 'Play it under a slow Dorian improvisation and notice how little it asks to resolve — that patience is the whole modal-jazz aesthetic.',
  },
  dom13: {
    hook: 'Dominant 13th is the full dominant stack — root through the flat 7th, 9th, 11th (often omitted), and 13th.',
    sound: 'Big-band and jazz-blues voicing at its richest — the chord under a horn-section hit right before a cadence.',
    practice: 'Drop the 11th (the note that clashes with the 3rd) and voice root, 3rd, 7th, 13th for the version that actually gets played on guitar.',
  },
  '6': {
    hook: 'The major 6th chord adds a 6th to a plain major triad — root, 3rd, 5th, 6th — an alternative colour to maj7 with a different feel.',
    sound: 'A retro, doo-wop and vintage-pop sound: it resolves as cleanly as a major triad but carries a rounder, less tense flavour than maj7.',
    practice: 'Swap it in wherever you’d use maj7 as an ending chord — the 6th resolves a tune with less "still floating" ambiguity than a major 7th does.',
  },
  m6: {
    hook: 'The minor 6th chord adds a natural 6th to a minor triad — root, flat 3rd, 5th, natural 6th — a distinctly different colour from min7.',
    sound: 'Noir and jazz-minor territory: it’s the chord under a moody vamp that wants darkness without the softness min7 would add.',
    practice: 'Compare it directly against min7 on the same root — the natural 6th here is brighter and more anxious than min7’s flat 7th.',
  },
}
