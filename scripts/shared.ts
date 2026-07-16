// ─── Shared chrome + spelling for the static page cluster ────────────
// Everything both page families (/modes/ and /guides/) need: the enharmonic
// spelling rules, URL slugs, the authored per-mode copy, and the HTML shell.
// Musical facts still come from musicTheory.ts — this file only decides how
// to NAME and DRESS them.

import { SCALES, noteName } from '../src/utils/musicTheory'

export const ORIGIN = 'https://modalruns.com'

// ─── Spelling: which enharmonic name a key actually uses ─────────────
// A mode is spelled like its parent major key: A Dorian borrows G major's
// F#, C Locrian borrows Db major's five flats. Deriving the parent per
// (root, mode) is what makes the pages say "C# Dorian: C# D# E F# G# A# B"
// instead of the pitch-class soup a naive flat/sharp toggle produces.
export const MAJOR = SCALES['ionian'].intervals
export const MODES = ['ionian', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'aeolian', 'locrian'] as const
export type ModeKey = typeof MODES[number]

const FLAT_PARENTS = new Set([5, 10, 3, 8, 1]) // F, Bb, Eb, Ab, Db major

export function parentPc(rootPc: number, mode: ModeKey): number {
  const deg = MODES.indexOf(mode)
  return ((rootPc - MAJOR[deg]) % 12 + 12) % 12
}

// Parent pc 6 (F#/Gb major) goes sharp: F# Ionian and B Lydian are far more
// common spellings than Gb Ionian and Cb-flavoured anything.
export function usesFlats(rootPc: number, mode: ModeKey): boolean {
  return FLAT_PARENTS.has(parentPc(rootPc, mode))
}

export function rootNameFor(rootPc: number, mode: ModeKey): string {
  return noteName(rootPc, usesFlats(rootPc, mode))
}

export function notesOf(rootPc: number, mode: ModeKey): string[] {
  const flats = usesFlats(rootPc, mode)
  return SCALES[mode].intervals.map(iv => noteName((rootPc + iv) % 12, flats))
}

export const ENHARMONIC: Record<string, string> = {
  'C#': 'Db', 'Db': 'C#', 'D#': 'Eb', 'Eb': 'D#',
  'F#': 'Gb', 'Gb': 'F#', 'G#': 'Ab', 'Ab': 'G#',
  'A#': 'Bb', 'Bb': 'A#',
}

// ─── URL slugs ───────────────────────────────────────────────────────
// "c-sharp-dorian", "e-flat-mixolydian" — the words people type into a
// search box, not URL-encoded accidentals.
export function slugRoot(name: string): string {
  return name.replace('#', '-sharp').replace(/(.)b$/, '$1-flat').toLowerCase()
}

export function pageSlug(rootPc: number, mode: ModeKey): string {
  return `${slugRoot(rootNameFor(rootPc, mode))}-${mode}`
}

export function pagePath(rootPc: number, mode: ModeKey): string {
  return `/modes/${pageSlug(rootPc, mode)}/`
}

// ─── The authored layer: seven modes' worth of prose ─────────────────
// `focus` is the interval label (matching musicTheory's interval names)
// whose note gets called out as the mode's characteristic colour.
export interface ModeCopy {
  title: string          // display name, e.g. "Dorian"
  quality: string        // "minor-type" / "major-type"
  focus: string          // interval label from INTERVAL_NAMES
  focusLabel: string     // how a human says it
  hook: string           // one sentence: what it IS
  sound: string          // 2-3 sentences: what it sounds like, where you've heard it
  practice: string       // one sentence: what to listen for over the drone
}

export const MODE_COPY: Record<ModeKey, ModeCopy> = {
  ionian: {
    title: 'Ionian',
    quality: 'major-type',
    focus: '7',
    focusLabel: 'major 7th',
    hook: 'Ionian is the plain major scale — the resolved, "everything is fine" sound that most Western music treats as home.',
    sound: 'It is the sound of nursery rhymes, pop choruses, and triumphant film endings. Every other mode on this site is this same set of notes with a different note treated as home, which is why learning Ionian well makes the other six come almost for free.',
    practice: 'Over the drone, listen for how the major 7th leans hungrily into the root — that pull is what "resolved" actually means.',
  },
  dorian: {
    title: 'Dorian',
    quality: 'minor-type',
    focus: '6',
    focusLabel: 'natural 6th',
    hook: 'Dorian is a minor scale with one note lifted: the 6th is major instead of minor, which turns "sad" into "cool".',
    sound: 'It is the sound of "Oye Como Va" and most of Santana, of "So What" and modal jazz, of funk vamps that sit on one minor chord forever without getting boring. Minor, but hopeful — melancholy with its chin up.',
    practice: 'Over the drone, everything sounds like plain minor until you land the natural 6th — that one note is the whole Dorian flavour, so aim for it on purpose.',
  },
  phrygian: {
    title: 'Phrygian',
    quality: 'minor-type',
    focus: 'b2',
    focusLabel: 'flat 2nd',
    hook: 'Phrygian is a minor scale with the note directly above home pushed down a semitone — instant darkness.',
    sound: 'That flat 2nd is the sound of flamenco, of Andalusian cadences, and of half the metal riffs ever written. It sits a single fret above the root, so the tension is always one finger away.',
    practice: 'Over the drone, hammer between the root and the flat 2nd — that semitone grind IS Phrygian; the rest of the scale is just context for it.',
  },
  lydian: {
    title: 'Lydian',
    quality: 'major-type',
    focus: 'b5',
    focusLabel: 'sharp 4th',
    hook: 'Lydian is the major scale with the 4th raised a semitone — major, but floating instead of grounded.',
    sound: 'It is the dreamy, weightless sound of film scores, "The Simpsons" theme, and Joe Satriani ballads ("Flying in a Blue Dream" is a Lydian tutorial with a record deal). The sharp 4th refuses to resolve downward the way a normal 4th does, so the whole scale hovers.',
    practice: 'Over the drone, hold the sharp 4th and let it ring — in any other major context it would be a wrong note; here it is the point.',
  },
  mixolydian: {
    title: 'Mixolydian',
    quality: 'major-type',
    focus: 'b7',
    focusLabel: 'flat 7th',
    hook: 'Mixolydian is the major scale with the 7th lowered — bright on top, bluesy underneath.',
    sound: 'It is the default scale of rock and roll: AC/DC riffs, the Grateful Dead, Celtic fiddle tunes, and every 12-bar solo that sounds happy but not naive. The flat 7th is what lets a major key swagger instead of beam.',
    practice: 'Over the drone, compare the flat 7th against where your ear expects a leading tone — that relaxed "no need to resolve" feel is the whole mode.',
  },
  aeolian: {
    title: 'Aeolian',
    quality: 'minor-type',
    focus: 'b6',
    focusLabel: 'flat 6th',
    hook: 'Aeolian is the natural minor scale — the plain sad one, the shadow twin of the major scale.',
    sound: 'It is the sound of most minor-key rock and pop: "Stairway to Heaven", "Losing My Religion", every power ballad. The flat 6th is what separates it from Dorian — where Dorian lifts, Aeolian sinks.',
    practice: 'Over the drone, walk the flat 6th down to the 5th and feel it settle — that sigh is the natural minor signature.',
  },
  locrian: {
    title: 'Locrian',
    quality: 'diminished',
    focus: 'b5',
    focusLabel: 'flat 5th',
    hook: 'Locrian is the unstable one: both the 2nd and the 5th are flattened, so home itself is a diminished chord that never feels settled.',
    sound: 'With no perfect 5th to stand on, Locrian refuses to resolve — which is exactly why metal (Slayer, Meshuggah territory) and jazz players reaching for maximum tension keep it around. It is less a place to live than a place to pass through menacingly.',
    practice: 'Over the drone, notice how even the root feels provisional — the flat 5th keeps kicking the floor out. Resolving anywhere else afterwards feels like surfacing.',
  },
}

// ─── Shared page chrome ──────────────────────────────────────────────
export const CSS = `
  :root { color-scheme: dark }
  * { margin: 0; padding: 0; box-sizing: border-box }
  body { background: #050507; color: #e8e6f0; font: 17px/1.65 -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif }
  main { max-width: 780px; margin: 0 auto; padding: 24px 20px 64px }
  a { color: #c9a0ff; text-decoration: none }
  a:hover { text-decoration: underline }
  header.site { display: flex; align-items: center; gap: 10px; padding: 18px 20px; max-width: 780px; margin: 0 auto }
  header.site img { width: 34px; height: 34px; filter: drop-shadow(0 0 10px rgba(152,70,234,0.5)) }
  header.site a { color: #e8e6f0; font-weight: 600; letter-spacing: 0.02em }
  h1 { font-size: 1.9rem; line-height: 1.25; margin: 18px 0 14px; background: linear-gradient(90deg, #09cede, #9846ea, #f749a2); -webkit-background-clip: text; background-clip: text; color: transparent }
  h2 { font-size: 1.15rem; margin: 36px 0 10px; color: #fff }
  p { margin: 10px 0; color: #bdb8d0 }
  p strong, li strong, td strong { color: #fff }
  .lead { font-size: 1.05rem; color: #d8d4e8 }
  .tldr { border-left: 3px solid #9846ea; padding: 12px 18px; background: #0f0d18; border-radius: 0 12px 12px 0; margin: 18px 0 }
  .tldr p { color: #d8d4e8 }
  ol, main > ul { margin: 10px 0 10px 24px; color: #bdb8d0 }
  ol li, main > ul li { margin: 7px 0 }
  figure { margin: 22px 0; overflow-x: auto }
  figure svg { display: block; min-width: 640px; width: 100%; height: auto }
  figcaption { font-size: 0.85rem; color: #8a84a3; margin-top: 6px }
  .cta { display: block; margin: 30px 0; padding: 18px 22px; border-radius: 14px; text-align: center;
         background: linear-gradient(135deg, #6a2fc0, #9846ea); color: #fff; font-size: 1.12rem; font-weight: 650;
         box-shadow: 0 0 34px rgba(152,70,234,0.35) }
  .cta:hover { text-decoration: none; filter: brightness(1.1) }
  .cta small { display: block; font-weight: 400; font-size: 0.85rem; opacity: 0.85; margin-top: 4px }
  .tablewrap { overflow-x: auto }
  table { border-collapse: collapse; width: 100%; margin: 12px 0; font-size: 0.95rem }
  th, td { text-align: left; padding: 7px 12px; border-bottom: 1px solid #1d1a2a }
  th { color: #8a84a3; font-weight: 500 }
  td { color: #bdb8d0 }
  ul.links { list-style: none; display: flex; flex-wrap: wrap; gap: 8px 14px; margin: 10px 0 }
  ul.links li { background: #12101c; border: 1px solid #241f38; border-radius: 999px }
  ul.links li a { display: block; padding: 6px 14px; font-size: 0.9rem }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px; margin: 14px 0 }
  .grid a { background: #12101c; border: 1px solid #241f38; border-radius: 10px; padding: 9px 12px; font-size: 0.92rem }
  footer { max-width: 780px; margin: 0 auto; padding: 22px 20px 46px; border-top: 1px solid #1d1a2a; font-size: 0.9rem; color: #8a84a3 }
  footer a { margin-right: 18px }
`

export function head(opts: { title: string; description: string; canonicalPath: string }): string {
  return `<meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${opts.title}</title>
    <meta name="description" content="${opts.description}" />
    <link rel="canonical" href="${ORIGIN}${opts.canonicalPath}" />
    <meta name="theme-color" content="#050507" />
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${ORIGIN}${opts.canonicalPath}" />
    <meta property="og:site_name" content="Modal Runs" />
    <meta property="og:title" content="${opts.title}" />
    <meta property="og:description" content="${opts.description}" />
    <meta property="og:image" content="${ORIGIN}/og.jpg" />
    <meta name="twitter:card" content="summary_large_image" />
    <style>${CSS}</style>
    <script>window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments) }</script>
    <script defer src="/_vercel/insights/script.js"></script>`
}

export const SITE_HEADER = `<header class="site"><img src="/mark.png" alt="" /><a href="/">Modal Runs</a></header>`

export function footer(): string {
  return `<footer><a href="/modes/">All modes, all keys</a><a href="/guides/">Guides</a><a href="/">Open the app</a><span>Modal Runs — free guitar practice that listens.</span></footer>`
}

// A deep link into the live app, preset to a key + mode.
export function appLink(rootName: string, mode: string): string {
  return `/?key=${encodeURIComponent(rootName)}&mode=${mode}`
}
