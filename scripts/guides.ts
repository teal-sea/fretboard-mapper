// ─── Guide articles ──────────────────────────────────────────────────
// The hand-written layer of the static cluster: comparison and decision
// pieces ("Dorian vs Aeolian", "which mode first?") that answer the
// questions people actually type into a search box or ask an AI. The 84
// programmatic mode pages answer "what is X"; these answer "which", "why",
// and "what's the difference".
//
// Prose is authored; every note list, formula, and comparison table is
// still computed from musicTheory.ts. No fret numbers, no hardcoded notes.

import { noteIndex, noteName, formulaString, SCALES } from '../src/utils/musicTheory'
import {
  MODES, MODE_COPY, type ModeKey,
  notesOf, pagePath, appLink,
  head, SITE_HEADER, footer,
} from './shared'

export interface Guide {
  slug: string
  title: string        // <title> / og:title
  description: string  // meta description
  h1: string
  blurb: string        // one line for the /guides/ index
  render: () => string // full HTML document
}

// ─── Little helpers ──────────────────────────────────────────────────
const pc = (name: string) => noteIndex(name)

// Link to a mode page: mlink('D', 'dorian') → <a href="/modes/d-dorian/">D Dorian</a>
function mlink(rootName: string, mode: ModeKey, label?: string): string {
  return `<a href="${pagePath(pc(rootName), mode)}">${label ?? `${rootName} ${MODE_COPY[mode].title}`}</a>`
}

function cta(rootName: string, mode: string, text: string): string {
  return `<a class="cta" href="${appLink(rootName, mode)}">${text} →<small>Free, in your browser. It listens through your mic and lights up what you play.</small></a>`
}

function notesLine(rootName: string, mode: ModeKey): string {
  return notesOf(pc(rootName), mode).join(', ')
}

// Two same-root scales, one row per degree, differences bolded — the
// entire point of a "X vs Y" page in one extractable table.
function compareTable(rootName: string, a: ModeKey, b: ModeKey): string {
  const na = notesOf(pc(rootName), a)
  const nb = notesOf(pc(rootName), b)
  return `<div class="tablewrap"><table>
      <tr><th></th><th>Notes</th><th>Formula</th></tr>
      <tr><td><strong>${rootName} ${MODE_COPY[a].title}</strong></td>${`<td>${na.map((n, i) => n === nb[i] ? n : `<strong>${n}</strong>`).join(', ')}</td>`}<td>${formulaString(SCALES[a].intervals)}</td></tr>
      <tr><td><strong>${rootName} ${MODE_COPY[b].title}</strong></td>${`<td>${nb.map((n, i) => n === na[i] ? n : `<strong>${n}</strong>`).join(', ')}</td>`}<td>${formulaString(SCALES[b].intervals)}</td></tr>
    </table></div>`
}

function page(g: Guide, body: string, readNext: Guide[]): string {
  const next = readNext.length
    ? `<h2>Keep reading</h2>
    <ul class="links">
      ${readNext.map(n => `<li><a href="/guides/${n.slug}/">${n.h1}</a></li>`).join('\n      ')}
    </ul>`
    : ''
  return `<!DOCTYPE html>
<html lang="en">
<head>
    ${head({ title: g.title, description: g.description, canonicalPath: `/guides/${g.slug}/` })}
</head>
<body>
  ${SITE_HEADER}
  <main>
    <h1>${g.h1}</h1>
    ${body}
    ${next}
  </main>
  ${footer()}
</body>
</html>
`
}

// ─── The articles ────────────────────────────────────────────────────
// Declared with lazy bodies so cross-references between guides (read-next
// links) can point at guides declared later in the file.

const explained: Guide = {
  slug: 'guitar-modes-explained',
  title: 'Guitar Modes Explained — Without the Theory Degree | Modal Runs',
  description: 'What modes actually are, why the same seven notes sound completely different, the seven modes ranked brightest to darkest, and how to learn them by ear instead of memorising patterns.',
  h1: 'Guitar modes, explained like you’re a guitarist',
  blurb: 'What a mode actually is, why the same notes sound different, and the bright-to-dark ranking.',
  render: () => page(explained, `
    <div class="tldr"><p><strong>TL;DR:</strong> a mode is the major scale with a different note treated as home. Same seven notes, different centre of gravity. There are seven of them, and you already know two: the major scale is Ionian, and natural minor is Aeolian.</p></div>

    <h2>What is a mode, actually?</h2>
    <p>Take the notes of C major: <strong>${notesLine('C', 'ionian')}</strong>. Play them while a <strong>C</strong> drones underneath and you get C major — sunny, resolved, done. Now keep playing <em>exactly the same notes</em>, but let a <strong>D</strong> drone underneath instead. Nothing about your fingers changed, and yet the music now sounds cooler, jazzier, slightly melancholy. That is ${mlink('D', 'dorian')}.</p>
    <p>The notes never made the mode. The <em>home note</em> did. A mode is what happens when you keep the notes and move the gravity.</p>

    <h2>If the notes are the same, why do they sound different?</h2>
    <p>Because your ear doesn’t hear note names — it hears <em>distances from home</em>. When home is C, the note B sits a major 7th away and aches to resolve upward. When home is D, that same B sits a major 6th away and just sounds warm. Move the home, and every note's job changes.</p>

    <h2>The seven modes, brightest to darkest</h2>
    <p>Comparing them all from the same root is the honest way to hear it — each step down this list flattens one more note:</p>
    <div class="tablewrap"><table>
      <tr><th>Mode</th><th>In one line</th><th>Notes from C</th></tr>
      <tr><td>${mlink('C', 'lydian')}</td><td>major, but floating — the dreamy one</td><td>${notesLine('C', 'lydian')}</td></tr>
      <tr><td>${mlink('C', 'ionian')}</td><td>plain major — resolved and sunny</td><td>${notesLine('C', 'ionian')}</td></tr>
      <tr><td>${mlink('C', 'mixolydian')}</td><td>major with swagger — the rock’n’roll one</td><td>${notesLine('C', 'mixolydian')}</td></tr>
      <tr><td>${mlink('C', 'dorian')}</td><td>minor with its chin up — the cool one</td><td>${notesLine('C', 'dorian')}</td></tr>
      <tr><td>${mlink('C', 'aeolian')}</td><td>plain minor — the sad one</td><td>${notesLine('C', 'aeolian')}</td></tr>
      <tr><td>${mlink('C', 'phrygian')}</td><td>dark and Spanish — tension one fret above home</td><td>${notesLine('C', 'phrygian')}</td></tr>
      <tr><td>${mlink('C', 'locrian')}</td><td>unstable on purpose — home itself is dissonant</td><td>${notesLine('C', 'locrian')}</td></tr>
    </table></div>

    <h2>The two ways to think about modes — and when to use each</h2>
    <p><strong>Relative</strong> thinking says: D Dorian is just C major starting from D. This is true, and it is how you <em>find the notes</em> — your existing major-scale shapes already contain every mode.</p>
    <p><strong>Parallel</strong> thinking says: D Dorian is D minor with the 6th raised. This is also true, and it is how you <em>hear the sound</em> — one familiar scale, one changed note, one new colour.</p>
    <p>Use relative thinking for your hands and parallel thinking for your ears. Players who only ever think relatively end up noodling C major over everything and wondering why their "modes" all sound identical. (They do. That’s the trap.)</p>

    <h2>How do you actually learn them?</h2>
    <p>Not by memorising seven fretboard patterns — patterns tell your fingers where to go, not your ears where home is. The fix is embarrassingly old: hold a drone on the root, improvise the mode over it, and aim deliberately at the one note that makes that mode itself. Ten minutes of that teaches you more Dorian than a month of pattern drills.</p>
    ${cta('D', 'dorian', 'Hear it now: improvise D Dorian over a D drone')}
  `, [whichFirst, hearing]),
}

const whichFirst: Guide = {
  slug: 'which-mode-first',
  title: 'Which Guitar Mode Should You Learn First? | Modal Runs',
  description: 'Start with Dorian if you already solo in minor pentatonic; start with Mixolydian if you live on blues and dominant chords. A learning order that follows your ears, with reasons.',
  h1: 'Which mode should you learn first?',
  blurb: 'Dorian for most players, Mixolydian for blues hands — and the order for the rest.',
  render: () => page(whichFirst, `
    <div class="tldr"><p><strong>TL;DR:</strong> learn <strong>Dorian</strong> first. If your hands already live in the minor pentatonic box, Dorian is one gentle step away and instantly sounds like music. If you’re a blues or classic-rock player who lives on dominant chords, start with <strong>Mixolydian</strong> instead.</p></div>

    <h2>You already know two modes</h2>
    <p>The major scale <em>is</em> ${mlink('C', 'ionian', 'Ionian')}, and natural minor <em>is</em> ${mlink('A', 'aeolian', 'Aeolian')}. If you can play either, you’re not starting from zero — you’re choosing your third mode, not your first. That reframing matters, because the question is really: <em>which new colour is closest to what my hands already do?</em></p>

    <h2>Why Dorian first</h2>
    <p>Three reasons:</p>
    <ol>
      <li><strong>Your fingers are already there.</strong> The A minor pentatonic box lives inside ${mlink('A', 'dorian')} — Dorian just adds the 2nd and the natural 6th around notes you already trust.</li>
      <li><strong>It’s forgiving.</strong> Over a minor vamp, every Dorian note sounds intentional. There is no "wrong note" cliff the way there is with Phrygian’s flat 2nd.</li>
      <li><strong>It’s everywhere.</strong> Santana vamps, "So What", funk grooves, half of every jam night in a minor key — the first mode you learn should be one you’ll actually use that week.</li>
    </ol>
    <p>The notes of A Dorian: <strong>${notesLine('A', 'dorian')}</strong>. One note — the F# — separates it from the A natural minor you already know. Learn to <em>aim</em> at that note and you’ve learned the mode.</p>

    <h2>When Mixolydian first instead</h2>
    <p>If your musical home is blues, country, or AC/DC-school rock, your ears are already tuned to dominant 7th chords — and ${mlink('A', 'mixolydian', 'Mixolydian')} is the scale those chords come from. For you it will click faster than Dorian, because the flat 7th is a sound you’ve been hearing your whole life.</p>

    <h2>A learning order that works</h2>
    <div class="tablewrap"><table>
      <tr><th>Order</th><th>Mode</th><th>Why now</th></tr>
      <tr><td>1</td><td>${mlink('A', 'dorian', 'Dorian')}</td><td>One note from minor pentatonic; usable immediately</td></tr>
      <tr><td>2</td><td>${mlink('A', 'mixolydian', 'Mixolydian')}</td><td>The major-side workhorse; unlocks blues and rock vamps</td></tr>
      <tr><td>3</td><td>${mlink('A', 'lydian', 'Lydian')}</td><td>One note from major; teaches you to <em>hear</em> a single alteration</td></tr>
      <tr><td>4</td><td>${mlink('A', 'phrygian', 'Phrygian')}</td><td>The dramatic one — by now your ear can handle the flat 2nd</td></tr>
      <tr><td>5</td><td>${mlink('A', 'locrian', 'Locrian')}</td><td>Last, honestly. Rarely a home key; useful as tension vocabulary</td></tr>
    </table></div>
    <p>Ionian and Aeolian aren’t in the table because you’re not learning them — you’re recognising them.</p>
    ${cta('A', 'dorian', 'Start now: A Dorian over a drone')}
  `, [hearing, dorianVsAeolian]),
}

const dorianVsAeolian: Guide = {
  slug: 'dorian-vs-aeolian',
  title: 'Dorian vs Aeolian (Natural Minor): The One Note That Changes Everything | Modal Runs',
  description: 'Dorian and Aeolian differ by exactly one note — the 6th. What that note does, where you’ve heard each mode, and a 60-second exercise to hear the difference for yourself.',
  h1: 'Dorian vs Aeolian: one note apart',
  blurb: 'Both minor. One note different. Completely different mood.',
  render: () => page(dorianVsAeolian, `
    <div class="tldr"><p><strong>TL;DR:</strong> both are minor scales, and they differ by exactly one note: the <strong>6th</strong>. Dorian’s 6th is major (bright), Aeolian’s is minor (dark). That single note is the difference between "cool" and "sad".</p></div>

    <h2>The only difference</h2>
    ${compareTable('D', 'dorian', 'aeolian')}
    <p>Six of the seven notes are identical. The bolded pair is the entire argument: <strong>B natural</strong> makes it ${mlink('D', 'dorian')}, <strong>Bb</strong> makes it ${mlink('D', 'aeolian')}.</p>

    <h2>What one semitone actually does</h2>
    <p>The natural 6th <em>lifts</em>. Play a D minor groove and land on B natural: the music leans forward, like it’s about to smile. That’s the Santana vamp, the "So What" sound, every funk progression that stays on one minor chord for four minutes without getting sad about it.</p>
    <p>The flat 6th <em>sinks</em>. Land on Bb over the same groove and the note sighs downward toward the 5th. That’s the power-ballad move, the "Stairway" melancholy, the sound your ear labels <em>properly</em> minor.</p>
    <p>Neither is better. Dorian is minor that keeps moving; Aeolian is minor that lets itself feel it.</p>

    <h2>Which one am I hearing?</h2>
    <div class="tablewrap"><table>
      <tr><th>If the minor music feels…</th><th>It’s probably</th><th>Because</th></tr>
      <tr><td>groovy, funky, cool, unresolved-but-happy-about-it</td><td><strong>Dorian</strong></td><td>the major 6th keeps the light on</td></tr>
      <tr><td>sad, epic, heavy, resigned</td><td><strong>Aeolian</strong></td><td>the flat 6th pulls everything down</td></tr>
    </table></div>

    <h2>Hear it yourself in 60 seconds</h2>
    <ol>
      <li>Hold a <strong>D</strong> drone.</li>
      <li>Improvise in D minor and keep landing on <strong>Bb</strong>. Feel it sink.</li>
      <li>Now replace every Bb with <strong>B natural</strong>. Same everything else. Feel the room brighten.</li>
    </ol>
    <p>Once you’ve done this over a drone, you will never confuse the two again — the difference stops being trivia and becomes a sound you own.</p>
    ${cta('D', 'dorian', 'Do the exercise: D Dorian over a drone')}
  `, [whichFirst, hearing]),
}

const blues: Guide = {
  slug: 'best-mode-for-blues',
  title: 'What Mode Is Best for Blues? Mixolydian, Dorian, and the Truth | Modal Runs',
  description: 'Mixolydian fits major-key blues because every chord is a dominant 7th; Dorian owns minor blues; and the blues scale is the attitude you smear over both. A cheat sheet included.',
  h1: 'What mode is best for blues?',
  blurb: 'Mixolydian for major blues, Dorian for minor blues, and why blues breaks the rules anyway.',
  render: () => page(blues, `
    <div class="tldr"><p><strong>TL;DR:</strong> for a standard major-key blues, <strong>Mixolydian</strong> matches the chords. For a minor blues, <strong>Dorian</strong> is the classic choice. And over both, the minor pentatonic/blues scale remains legal at all times — blues mixes major and minor <em>on purpose</em>.</p></div>

    <h2>Why blues breaks the normal rules</h2>
    <p>A 12-bar blues in A uses A7, D7, and E7 — three <em>dominant 7th</em> chords. In textbook harmony, dominant chords are tension that must resolve; in blues, they’re just… home. That’s why plain major scale sounds wrong over blues (its natural 7th fights the chords) and why blues players happily bend minor 3rds over major chords. The genre’s whole flavour is that friction.</p>

    <h2>Major-key blues: Mixolydian</h2>
    <p>${mlink('A', 'mixolydian')} — <strong>${notesLine('A', 'mixolydian')}</strong> — is the major scale with the 7th flattened, which makes it agree with an A7 chord note-for-note. It gives you the sweet major 3rd and 6th that pentatonic alone doesn’t offer.</p>
    <p>The pro move: follow the chords. A Mixolydian over A7, ${mlink('D', 'mixolydian', 'D Mixolydian')} over D7, ${mlink('E', 'mixolydian', 'E Mixolydian')} over E7. Each switch is only a note or two of change, and suddenly you’re "playing the changes" instead of coasting on one box.</p>

    <h2>Minor blues: Dorian</h2>
    <p>Over a minor blues (Am7 to Dm7 and back), ${mlink('A', 'dorian')} is the standard answer — its natural 6th (F#) is literally the 3rd of the D chord, so the scale agrees with both chords at once. Aeolian works too, but darker; Dorian is why a minor blues can groove instead of mope.</p>

    <h2>And the blues scale?</h2>
    <p>Always available. The minor pentatonic plus its flat 5th isn’t a "mode" — it’s an attitude layer that blues lets you smear over any of the above. The mature sound is the blend: pentatonic grit for the shout lines, Mixolydian sweetness for the answers.</p>

    <h2>Cheat sheet</h2>
    <div class="tablewrap"><table>
      <tr><th>Situation</th><th>Play</th><th>Why</th></tr>
      <tr><td>Major blues, one scale for everything</td><td>minor pentatonic / blues scale</td><td>the classic rub; always works</td></tr>
      <tr><td>Major blues, following the chords</td><td><strong>Mixolydian per chord</strong></td><td>matches every dominant 7th exactly</td></tr>
      <tr><td>Minor blues</td><td><strong>Dorian</strong></td><td>natural 6th agrees with the iv chord</td></tr>
      <tr><td>Slow minor blues, maximum drama</td><td>Aeolian</td><td>the flat 6th sobs on cue</td></tr>
    </table></div>
    ${cta('A', 'mixolydian', 'Try it: A Mixolydian over a drone')}
  `, [dorianVsAeolian, artists]),
}

const artists: Guide = {
  slug: 'what-modes-famous-guitarists-use',
  title: 'What Modes Do Famous Guitarists Actually Use? | Modal Runs',
  description: 'Santana’s Dorian, Satriani’s Lydian, the Grateful Dead’s Mixolydian, metal’s Phrygian — who uses which mode, which song to hear it in, and what to steal from each.',
  h1: 'What modes do famous guitarists actually use?',
  blurb: 'Santana = Dorian, Satriani = Lydian, the Dead = Mixolydian, metal = Phrygian. With receipts.',
  render: () => page(artists, `
    <div class="tldr"><p><strong>TL;DR:</strong> most players you’d recognise built a career on one or two modal colours. Santana is Dorian. Satriani’s ballads are Lydian. The Grateful Dead jam in Mixolydian. Metal’s darkness is mostly Phrygian and Aeolian. Nobody lives in Locrian — that’s the joke and the lesson.</p></div>

    <div class="tablewrap"><table>
      <tr><th>Player / scene</th><th>Mode</th><th>Hear it in</th></tr>
      <tr><td>Carlos Santana</td><td>${mlink('A', 'dorian', 'Dorian')}</td><td>"Oye Como Va" — an Am–D7 vamp that never leaves</td></tr>
      <tr><td>Miles Davis (every guitarist stole it)</td><td>${mlink('D', 'dorian', 'Dorian')}</td><td>"So What" — sixteen bars of D Dorian, eight of Eb</td></tr>
      <tr><td>Joe Satriani</td><td>${mlink('C', 'lydian', 'Lydian')}</td><td>"Flying in a Blue Dream" — the floating #4 as a lead voice</td></tr>
      <tr><td>Grateful Dead / jam bands</td><td>${mlink('B', 'mixolydian', 'Mixolydian')}</td><td>"Fire on the Mountain" — two chords, one mode, forever</td></tr>
      <tr><td>The Beatles (folk-rock side)</td><td>${mlink('E', 'mixolydian', 'Mixolydian')}</td><td>"Norwegian Wood" — the flat 7th doing the melody’s work</td></tr>
      <tr><td>Metallica and metal at large</td><td>${mlink('E', 'phrygian', 'Phrygian')}</td><td>"Wherever I May Roam" — the flat 2nd as a riff engine</td></tr>
      <tr><td>Flamenco tradition</td><td>${mlink('E', 'phrygian', 'Phrygian')}</td><td>the Andalusian cadence, resolved onto a major chord</td></tr>
      <tr><td>Every power ballad ever</td><td>${mlink('A', 'aeolian', 'Aeolian')}</td><td>"Stairway to Heaven" solo territory</td></tr>
    </table></div>

    <h2>What to steal from each</h2>
    <p><strong>From Santana:</strong> that one mode over one vamp is a whole song. He isn’t running scales — he’s singing through the Dorian 6th and letting the band hold the floor. Steal the patience.</p>
    <p><strong>From Satriani:</strong> a "wrong" note held with total confidence becomes the hook. The Lydian #4 only floats if you don’t apologise for it.</p>
    <p><strong>From the Dead:</strong> Mixolydian is a campfire, not a lecture. Two chords and the flat 7th will carry a twenty-minute jam if your phrasing breathes.</p>
    <p><strong>From metal:</strong> the Phrygian flat 2nd works rhythmically, not just melodically — chug the root, stab the note one fret up, and you’ve written half the genre.</p>

    <h2>The honest footnote about Locrian</h2>
    <p>You’ll notice no one on the list lives in ${mlink('E', 'locrian', 'Locrian')}. Its home chord is diminished, so almost nothing settles there — it appears as a passing colour and as trivia questions. Learn it last, use it as tension, and don’t let anyone sell you a "Locrian masterclass".</p>
    ${cta('A', 'dorian', 'Steal Santana’s move: A Dorian over a drone')}
  `, [blues, spanish]),
}

const spanish: Guide = {
  slug: 'why-spanish-music-sounds-spanish',
  title: 'Why Does Spanish Music Sound Spanish? (It’s Phrygian) | Modal Runs',
  description: 'The flamenco sound is the Phrygian mode: a flat 2nd one fret above home, the Andalusian cadence, and the Phrygian dominant variant with its raised 3rd. Explained on guitar, in E.',
  h1: 'Why does Spanish music sound Spanish?',
  blurb: 'One note, one fret above home: the Phrygian flat 2nd, and the cadence built on it.',
  render: () => page(spanish, `
    <div class="tldr"><p><strong>TL;DR:</strong> one note does it — the <strong>flat 2nd</strong>, a semitone above the root. That’s the ${mlink('E', 'phrygian', 'Phrygian')} mode, and on a guitar in E it’s literally the open low string against the first fret. Spain lives one fret above home.</p></div>

    <h2>The note that does it</h2>
    <p>E Phrygian is <strong>${notesLine('E', 'phrygian')}</strong> — a minor scale whose second note, <strong>F</strong>, sits a single semitone above home. Most scales put a whole step there; that half-step gap is the entire flavour. Ring the open E string and play F on the first fret above it: that crunch, that lean, is flamenco in two notes.</p>
    <p>This is also why guitar is <em>the</em> Phrygian instrument. In E, the mode’s tension lives on the easiest two notes you own: an open string and its first fret.</p>

    <h2>The Andalusian cadence</h2>
    <p>The classic Spanish progression walks downhill: <strong>Am – G – F – E</strong>. Notice where it stops — not on Am, but on <strong>E</strong>. The E chord is home, and the F chord one fret above it keeps falling onto it, over and over. That downward F→E pull is the flat 2nd acting as harmony instead of melody. Once you hear the cadence as "everything sliding down onto E", you can’t unhear it.</p>

    <h2>Phrygian vs Phrygian dominant</h2>
    <p>Pure Phrygian has a minor 3rd, but flamenco usually resolves onto a <em>major</em> chord — E major, not E minor. Raise Phrygian’s 3rd and you get <strong>Phrygian dominant</strong> (<strong>${SCALES['phrygian_dom'].intervals.map(iv => noteName((pc('E') + iv) % 12, false)).join(', ')}</strong> in E): the flat 2nd’s darkness plus a major chord’s confidence, with an exotic step-and-a-half gap between them. That hybrid is the sound of bullring trumpets, surf-rock villains, and every "Spanish guitar" stock photo you’ve ever heard.</p>

    <h2>Metal stole the same note</h2>
    <p>The riff language of thrash and its descendants — root chug, stab one fret up, return — is the same flat 2nd wearing distortion instead of nylon strings. Flamenco and Slayer are cousins through one interval; only the amps differ.</p>
    ${cta('E', 'phrygian', 'Play it: E Phrygian over an E drone')}
    <p>Feeling brave? The app also holds the hybrid: <a href="${appLink('E', 'phrygian_dom')}">improvise E Phrygian dominant over the same drone</a> and hear the major 3rd flip the mood from dark to dramatic.</p>
  `, [artists, explained]),
}

const lydianVsMajor: Guide = {
  slug: 'lydian-vs-major',
  title: 'Lydian vs Major (Ionian): One Sharp Note, a Different World | Modal Runs',
  description: 'Lydian is the major scale with the 4th raised a semitone. Why that removes the scale’s gravity, where the floating film-score sound comes from, and a 60-second exercise to hear it.',
  h1: 'Lydian vs Major: one sharp note apart',
  blurb: 'Raise the 4th a semitone and major stops resolving and starts floating.',
  render: () => page(lydianVsMajor, `
    <div class="tldr"><p><strong>TL;DR:</strong> Lydian is the major scale with one alteration — the <strong>4th raised a semitone</strong>. Major sounds resolved and grounded; Lydian sounds weightless. One note removes the scale’s gravity.</p></div>

    <h2>The only difference</h2>
    ${compareTable('C', 'ionian', 'lydian')}
    <p><strong>F</strong> makes it ${mlink('C', 'ionian', 'C Major')}; <strong>F#</strong> makes it ${mlink('C', 'lydian')}. Everything else is identical.</p>

    <h2>Why the 4th is the note that matters</h2>
    <p>In a major scale, the 4th is the restless one — it sits a semitone above the 3rd and wants to fall onto it. (Jazz players literally call it the "avoid note" over major chords.) Melodies in major are forever managing that downward pull.</p>
    <p>Raise it, and the pull vanishes. The #4 sits a comfortable whole step from the notes on either side, nothing needs to resolve anywhere, and the whole scale stops leaning. That’s the floating sensation: not a new tension, but the <em>removal</em> of one you’d stopped noticing.</p>

    <h2>Where you’ve heard it</h2>
    <p>Film and TV composers reach for Lydian whenever the brief says "wonder": flying scenes, wide landscapes, title cards for things set in space. The Simpsons theme leans on the sharp 4th in its opening notes. And Joe Satriani built entire ballads — "Flying in a Blue Dream" most famously — on treating the #4 as a melody note to <em>hold</em>, not resolve.</p>

    <h2>Hear it yourself in 60 seconds</h2>
    <ol>
      <li>Hold a <strong>C</strong> drone.</li>
      <li>Play the C major scale and pause on <strong>F</strong>. Feel it itch to fall to E.</li>
      <li>Now play <strong>F#</strong> instead and just… stay there. No itch. The note hangs in the air like it owns the place.</li>
    </ol>
    ${cta('C', 'lydian', 'Float for a while: C Lydian over a drone')}
  `, [explained, hearing]),
}

const hearing: Guide = {
  slug: 'how-to-hear-the-modes',
  title: 'How to Actually Hear the Modes: The Drone Method | Modal Runs',
  description: 'Why learning seven patterns fails, the drone method step by step, and the one characteristic note to aim for in each mode — the ear-first way to make modes stick.',
  h1: 'How to actually hear the modes',
  blurb: 'The drone method, step by step — and the one note to aim for in each mode.',
  render: () => page(hearing, `
    <div class="tldr"><p><strong>TL;DR:</strong> hold a drone on the root, improvise the mode over it, and deliberately land on that mode’s <em>characteristic note</em>. Your ear learns the colour in minutes because it finally has something to measure against. Patterns alone can’t teach this — they tell your fingers where to go, not your ears where home is.</p></div>

    <h2>Why the seven-patterns approach fails</h2>
    <p>The standard advice — memorise seven fretboard patterns, one per mode — produces guitarists who can <em>play</em> every mode and <em>hear</em> none of them. The patterns all contain the same notes, so without something asserting a home note underneath, everything collapses back into the parent major scale. You practised for a month and built a very elaborate way to play C major.</p>
    <p>A mode isn’t a pattern. It’s a relationship between notes and a home. No home, no mode.</p>

    <h2>The drone method, step by step</h2>
    <ol>
      <li><strong>Hold a drone on the root.</strong> A low, sustained note — this is the "home" your ear will measure everything against.</li>
      <li><strong>Improvise slowly in the mode.</strong> Not runs — phrases. Leave space. Every note you play is now heard <em>against</em> the drone.</li>
      <li><strong>Aim at the characteristic note</strong> (table below). Approach it, land on it, hold it, leave it, come back. That note against the drone <em>is</em> the mode.</li>
      <li><strong>Switch modes, keep the drone.</strong> Same root, new mode — the parallel comparison is where the colours become unmistakable.</li>
      <li><strong>Ten minutes, daily-ish.</strong> Ears build slower than fingers and faster than you’d think.</li>
    </ol>

    <h2>The one note to aim for in each mode</h2>
    <div class="tablewrap"><table>
      <tr><th>Mode</th><th>Aim for</th><th>What landing on it feels like</th></tr>
      ${MODES.map(m => {
        const feel: Record<ModeKey, string> = {
          ionian: 'the lean of the 7th resolving up into home',
          dorian: 'minor suddenly smiling — the lift',
          phrygian: 'a knife one fret above home',
          lydian: 'weightlessness; nothing needs to resolve',
          mixolydian: 'major relaxing its shoulders',
          aeolian: 'the sigh down onto the 5th',
          locrian: 'the floor giving way',
        }
        return `<tr><td>${mlink('A', m)}</td><td><strong>${MODE_COPY[m].focusLabel}</strong></td><td>${feel[m]}</td></tr>`
      }).join('\n      ')}
    </table></div>
    <p>All seven links above use the same root on purpose — same home, different colour is the fastest comparison your ear can make.</p>

    <h2>Where Modal Runs fits</h2>
    <p>This method needs two things: a drone that never gets bored, and feedback on whether you actually landed the note you were aiming for. That’s the whole app. It holds the drone in any key, lights the mode up on the neck, listens through your mic while you play, and tells you when you hit the characteristic note — the moment ear training stops being homework and starts being a game.</p>
    ${cta('A', 'dorian', 'Run the method now: A Dorian, drone on')}
  `, [explained, whichFirst]),
}

// Order here = order on the /guides/ index.
export const GUIDES: Guide[] = [
  explained,
  whichFirst,
  hearing,
  dorianVsAeolian,
  lydianVsMajor,
  blues,
  spanish,
  artists,
]

// Contextual "go deeper" links for the programmatic mode pages.
export const GUIDES_FOR_MODE: Record<ModeKey, Guide[]> = {
  ionian: [explained, lydianVsMajor],
  dorian: [dorianVsAeolian, whichFirst],
  phrygian: [spanish, artists],
  lydian: [lydianVsMajor, artists],
  mixolydian: [blues, artists],
  aeolian: [dorianVsAeolian, hearing],
  locrian: [artists, explained],
}

export function guidesIndexPage(): string {
  const title = 'Guitar Mode Guides — Comparisons, Learning Order & Ear Training | Modal Runs'
  const description = 'Hand-written guides to the guitar modes: Dorian vs Aeolian, which mode to learn first, the best mode for blues, why Spanish music sounds Spanish, and how to hear modes by ear.'
  return `<!DOCTYPE html>
<html lang="en">
<head>
    ${head({ title, description, canonicalPath: '/guides/' })}
</head>
<body>
  ${SITE_HEADER}
  <main>
    <h1>Guides</h1>
    <p class="lead">The questions the <a href="/modes/">mode pages</a> can’t answer alone: which mode, why, and what’s the difference. Short, opinionated, and written for guitarists — every one of them ends at <a href="/">a drone you can practice over</a>.</p>
    <div class="tablewrap"><table>
      ${GUIDES.map(g => `<tr><td><a href="/guides/${g.slug}/"><strong>${g.h1}</strong></a><br/>${g.blurb}</td></tr>`).join('\n      ')}
    </table></div>
  </main>
  ${footer()}
</body>
</html>
`
}
