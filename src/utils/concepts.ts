// ─── The Decode Engine ───────────────────────────────────────────────
// One idea per session. Never a lecture.
//
// A concept only ever CHOOSES constrained values — a SCALES key, a CHORDS key,
// a note name, a position index. The theory engine computes every actual note,
// so nothing here can put a wrong fret on the neck. (See CLAUDE.md, rule 2.)
//
// The copy never names fret numbers — it names INTERVALS, which the fretboard
// already colours. "Land on the 6" is findable at a glance; "fret 4" is a lie
// waiting to happen.

export interface Concept {
  id: string
  root: string                                  // note name
  mode: string                                  // key into SCALES
  title: string                                 // "A Dorian"
  hook: string                                  // what it IS, one line
  listenFor: string                             // what to HEAR, one line
  focus: string                                 // the interval that defines it, e.g. '6'
  position: number | null                       // 1-based playing position; null = whole neck
  chordKey?: string                             // key into CHORDS — the chord it lives against
  technique?: '3nps' | 'arpeggios' | 'tapping'  // optional shape to grab
  patternIndex?: number

  // A RUN: a real arpeggio shape and a way of moving through it. The app walks
  // you note by note and the mic follows your hands. This is the exercise.
  run?: {
    chordKey: string                            // key into CHORDS — the arpeggio
    kind: 'ascending' | 'descending' | 'updown' | 'sweep' | 'sequence3'
    shapeIndex?: number                         // which position on the neck
  }
}

// ─── The curriculum ───
// Weighted toward modal colour: over a static drone the characteristic note is
// naked and unmistakable. That's the "oh, THAT's it" hit.

export const CONCEPTS: Concept[] = [
  // ── The modal colour spine ──
  {
    id: 'dorian-6-A',
    root: 'A', mode: 'dorian', title: 'A Dorian',
    hook: 'Minor — but the 6th is raised.',
    listenFor: 'Find the 6 and sit on it against the drone. That single note is the entire mode: still minor, but hopeful instead of grieving. Aeolian flattens it and the light goes out.',
    focus: '6', position: 2, chordKey: 'min7',
  },
  {
    id: 'aeolian-b6-A',
    root: 'A', mode: 'aeolian', title: 'A Aeolian',
    hook: 'The natural minor. The sad one.',
    listenFor: 'Go straight to the b6. That half-step drop is the whole difference from Dorian — same key, same drone, one note darker. Play the b6, then bend your ear back to Dorian and feel it lift.',
    focus: 'b6', position: 2, chordKey: 'min7',
  },
  {
    id: 'lydian-#4-C',
    root: 'C', mode: 'lydian', title: 'C Lydian',
    hook: 'Major, with a raised 4th.',
    listenFor: 'Hang on the b5 (the #4). It hovers — it wants to resolve and never has to. This is the film-score note, the wide-eyed one. Major already sounds happy; Lydian sounds like wonder.',
    focus: 'b5', position: 2, chordKey: 'maj7',
  },
  {
    id: 'mixo-b7-G',
    root: 'G', mode: 'mixolydian', title: 'G Mixolydian',
    hook: 'Major with the 7th flattened.',
    listenFor: 'Hit the 7, then the b7. The b7 takes the leash off — it stops being polite and starts being rock. Same brightness as major, none of the manners.',
    focus: 'b7', position: 2, chordKey: 'dom7',
  },
  {
    id: 'phrygian-b2-E',
    root: 'E', mode: 'phrygian', title: 'E Phrygian',
    hook: 'Minor with a flattened 2nd.',
    listenFor: 'Root, then b2, then back. That half-step above the root is menace — Spanish, or metal, depending on how hard you hit it. Nothing else on the neck sounds like that interval.',
    focus: 'b2', position: 1, chordKey: 'minor',
  },
  {
    id: 'locrian-b5-B',
    root: 'B', mode: 'locrian', title: 'B Locrian',
    hook: 'Flat 2 AND flat 5. Home is unstable.',
    listenFor: 'The b5 is why this mode can never rest — the root chord itself is diminished. Play it and notice you keep wanting to leave. That restlessness IS the sound. Use it as a passing colour, not a home.',
    focus: 'b5', position: 2, chordKey: 'half_dim7',
  },

  // ── Same idea, other keys — the shape moves, the colour doesn't ──
  {
    id: 'dorian-6-D',
    root: 'D', mode: 'dorian', title: 'D Dorian',
    hook: 'The jam-session mode.',
    listenFor: 'Same raised 6 as A Dorian, new home. Prove the concept is portable: the shape moved, the colour is identical. If you can hear the 6 here without hunting, you own it.',
    focus: '6', position: 3, chordKey: 'min9',
  },
  {
    id: 'lydian-#4-F',
    root: 'F', mode: 'lydian', title: 'F Lydian',
    hook: 'Wonder, transposed.',
    listenFor: 'Chase the #4 (the b5) again in a new key. The interval is the idea — not the fingering. Land on it, let the drone hold, and stop resolving it.',
    focus: 'b5', position: 2, chordKey: 'maj9',
  },
  {
    id: 'mixo-b7-D',
    root: 'D', mode: 'mixolydian', title: 'D Mixolydian',
    hook: 'The b7, one more time.',
    listenFor: 'Bounce between the 3 and the b7 — a major third and a flat seventh in the same breath. That pair is the dominant sound; it is the whole reason blues and rock exist.',
    focus: 'b7', position: 3, chordKey: 'dom9',
  },

  // ── Minor variants — the exotic intervals ──
  {
    id: 'harm-minor-7-A',
    root: 'A', mode: 'harmonic_minor', title: 'A Harmonic Minor',
    hook: 'Aeolian with the 7th raised back up.',
    listenFor: 'Play the b6 straight into the 7. That leap is a step and a half — the widest thing in the scale, and the reason this mode sounds like a knife. Everything else is just natural minor.',
    focus: '7', position: 2, chordKey: 'min_maj7',
  },
  {
    id: 'mel-minor-A',
    root: 'A', mode: 'melodic_minor', title: 'A Melodic Minor',
    hook: 'Minor on the bottom, major on top.',
    listenFor: 'The 6 AND the 7 are both raised. Run up from the root and it turns bright halfway through — minor third, but a major climb home. Ambiguous and expensive-sounding.',
    focus: '7', position: 2, chordKey: 'min_maj7',
  },

  // ── Pentatonic & blues — take the safety net away ──
  {
    id: 'pent-minor-A',
    root: 'A', mode: 'minor_penta', title: 'A Minor Pentatonic',
    hook: 'Five notes. No wrong ones.',
    listenFor: 'Nothing to decode here — that\'s the point. The tension is gone, so the only thing left is phrasing. Play fewer notes than you want to. Let the drone hold and leave space.',
    focus: 'R', position: 1, chordKey: 'minor',
  },
  {
    id: 'blues-b5-A',
    root: 'A', mode: 'blues', title: 'A Blues',
    hook: 'Pentatonic, plus the one dirty note.',
    listenFor: 'The b5. Don\'t land on it — pass THROUGH it. It only works in motion; sit on it and it sounds wrong, slide off it and it sounds like the blues.',
    focus: 'b5', position: 1, chordKey: 'dom7',
  },
  {
    id: 'pent-major-C',
    root: 'C', mode: 'major_penta', title: 'C Major Pentatonic',
    hook: 'The sweet one.',
    listenFor: 'Same five shapes as minor pentatonic, different home. This is the Mayer sound — open, vocal, uncluttered. Bend into the 2 and the 6 and let them ring.',
    focus: '6', position: 2, chordKey: 'major',
  },

  // ── Shapes to grab: closing the concept → hands loop ──
  {
    id: 'arp-tonic-A-dorian',
    root: 'A', mode: 'dorian', title: 'A Dorian — tonic arpeggio',
    hook: 'The chord under the mode.',
    listenFor: 'Sweep the i chord, then step outside it to the 6. Hear how the arpeggio is the skeleton and the 6 is the flesh. Chord tones land; the 6 floats.',
    focus: '6', position: null, chordKey: 'min9',
    technique: 'arpeggios', patternIndex: 0,
  },
  {
    id: 'arp-tonic-C-lydian',
    root: 'C', mode: 'lydian', title: 'C Lydian — tonic arpeggio',
    hook: 'Land on the chord, float on the #4.',
    listenFor: 'Play the arpeggio to establish home, then reach for the #4 and hang there. The contrast between "safe" and "floating" is the whole exercise.',
    focus: 'b5', position: null, chordKey: 'maj7',
    technique: 'arpeggios', patternIndex: 0,
  },
  {
    id: '3nps-A-dorian',
    root: 'A', mode: 'dorian', title: 'A Dorian — three notes per string',
    hook: 'One shape, the whole neck.',
    listenFor: 'Stop thinking about position boxes. Run the pattern up and down and let the 6 fall where it falls — you\'re training the ear, not the hand. Speed is irrelevant here.',
    focus: '6', position: null,
    technique: '3nps', patternIndex: 0,
  },
  {
    id: '3nps-G-mixo',
    root: 'G', mode: 'mixolydian', title: 'G Mixolydian — three notes per string',
    hook: 'The b7, everywhere at once.',
    listenFor: 'Same pattern logic, dominant colour. Find every b7 in the shape as you run it. When you can hear them coming before you play them, you\'ve got the mode.',
    focus: 'b7', position: null,
    technique: '3nps', patternIndex: 0,
  },

  // ── Harmony: hearing the chord inside the scale ──
  {
    id: 'min9-float-A',
    root: 'A', mode: 'dorian', title: 'A Dorian — the 9th',
    hook: 'The note that makes a chord sound expensive.',
    listenFor: 'Against the drone, find the 2 — and now think of it as a 9. It\'s the same pitch; the name just tells you it\'s stacked on top. It floats above the chord instead of sitting in it.',
    focus: '2', position: 3, chordKey: 'min9',
  },
  // ── RUNS: the app follows your hands through a real arpeggio ──
  // These are exercises, not lectures. You play; it watches; it tells you when
  // the shape is yours.
  {
    id: 'run-am7-ascend',
    root: 'A', mode: 'dorian', title: 'Am7 — straight up',
    hook: 'Learn the shape before you learn the speed.',
    listenFor: 'Every note in order, up the neck. Don\'t rush it — play it slower than feels necessary and let each note actually ring. The app will follow you.',
    focus: 'b3', position: null, chordKey: 'min7',
    run: { chordKey: 'min7', kind: 'ascending' },
  },
  {
    id: 'run-am7-sweep',
    root: 'A', mode: 'dorian', title: 'Am7 — the sweep',
    hook: 'One stroke down, one stroke back.',
    listenFor: 'Let the pick fall through the strings — don\'t pick each note separately. Where two notes share a fret, roll the finger across instead of lifting it. That roll is the whole technique.',
    focus: 'b3', position: null, chordKey: 'min7',
    run: { chordKey: 'min7', kind: 'sweep' },
  },
  {
    id: 'run-am7-threes',
    root: 'A', mode: 'dorian', title: 'Am7 — in threes',
    hook: 'This is what turns an exercise into a phrase.',
    listenFor: 'Groups of three, shifting up one note each time. Suddenly it stops sounding like practice and starts sounding like music. Same notes — different order.',
    focus: 'b3', position: null, chordKey: 'min7',
    run: { chordKey: 'min7', kind: 'sequence3' },
  },
  {
    id: 'run-cmaj7-ascend',
    root: 'C', mode: 'ionian', title: 'Cmaj7 — straight up',
    hook: 'The bright one.',
    listenFor: 'Same idea, major flavour. Listen to how the 7 leans back into the root — that lean is what makes major sound settled.',
    focus: '7', position: null, chordKey: 'maj7',
    run: { chordKey: 'maj7', kind: 'ascending' },
  },
  {
    id: 'run-g7-updown',
    root: 'G', mode: 'mixolydian', title: 'G7 — up and back',
    hook: 'The turnaround is the hard part.',
    listenFor: 'Up, then straight back down without pausing at the top. Everyone can climb; almost nobody can turn around cleanly. Go slow at the peak.',
    focus: 'b7', position: null, chordKey: 'dom7',
    run: { chordKey: 'dom7', kind: 'updown' },
  },

  {
    id: 'maj7-vs-dom7-C',
    root: 'C', mode: 'ionian', title: 'C Ionian — the 7 that decides everything',
    hook: 'One note separates dreamy from restless.',
    listenFor: 'Play the natural 7 against the drone: lush, unresolved, floating. Then flatten it to a b7 in your head — instantly it wants to move somewhere. That single half-step is the engine of all Western harmony.',
    focus: '7', position: 2, chordKey: 'maj7',
  },
]

// ─── Session memory ───
// So it never repeats and never lectures you twice.

const STORAGE_KEY = 'fm.seenConcepts'

export function loadSeen(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export function markSeen(id: string): void {
  try {
    const seen = loadSeen()
    if (!seen.includes(id)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...seen, id]))
    }
  } catch {
    // storage unavailable — the session still works, it just won't remember
  }
}

export function resetSeen(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // no-op
  }
}

// Pick the next idea: prefer something unseen; when the well runs dry, start
// over rather than repeating the one just played.
export function getNextConcept(currentId?: string | null): Concept {
  const seen = loadSeen()
  let pool = CONCEPTS.filter(c => !seen.includes(c.id) && c.id !== currentId)

  if (pool.length === 0) {
    resetSeen()
    pool = CONCEPTS.filter(c => c.id !== currentId)
  }
  if (pool.length === 0) pool = CONCEPTS

  return pool[Math.floor(Math.random() * pool.length)]
}
