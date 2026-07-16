// ─── Chord landing pages ─────────────────────────────────────────────
// The counterpart to modePages.ts: one static page per (root × chord type)
// — 25 chord types × 12 roots = 300 pages — under /chords/, plus an index.
// Same rules as the mode cluster: every musical fact (notes, formula,
// voicings, compatible scales) is computed from musicTheory.ts; only the
// per-chord-type prose (chordCopy.ts) is authored.
//
// Chord roots are spelled with sharps uniformly (the standard chord-chart
// convention — a lone chord has no "parent key" the way a mode does, so
// there's no equivalent of the mode cluster's parent-major-key spelling
// rule to borrow).

import {
  CHORDS, TUNINGS,
  noteName, intervalName, formulaString,
  getChordVoicings, getCompatibleScales,
} from '../src/utils/musicTheory'
import type { ChordVoicing } from '../src/utils/musicTheory'
import { NOTE_NAMES, type ChordDef } from '../src/types/music'
import { DEFAULT_INTERVAL_COLORS } from '../src/utils/defaultColors'
import { CHORD_COPY } from './chordCopy'
import {
  ORIGIN, MODES, type ModeKey, MODE_COPY,
  pagePath as modePagePath, slugRoot,
  head, SITE_HEADER, footer, breadcrumbList, articleSchema, faqPageSchema, chordAppLink,
} from './shared'

const CHORD_KEYS = Object.keys(CHORDS)
const ROOT_COUNT = 12 // 0..11, sharps-only spelling for chord pages

function chordSlug(chord: ChordDef): string {
  return chord.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function chordRootName(pc: number): string {
  return NOTE_NAMES[pc]
}

export function chordPagePath(rootPc: number, chordKey: string): string {
  return `/chords/${slugRoot(chordRootName(rootPc))}-${chordSlug(CHORDS[chordKey])}/`
}

// ─── Chord-box voicing diagram (SVG) ──────────────────────────────────
// Standard vertical chord-chart orientation: strings top-to-bottom as
// vertical lines, frets as horizontal lines, X/O above the nut for
// muted/open strings, coloured dots (by interval, same palette as the
// mode-page fretboards) at fretted positions.
function voicingSvg(rootPc: number, chord: ChordDef, voicing: ChordVoicing, ariaLabel: string): string {
  const STRINGS = 6
  const ROWS = 4
  const STR_GAP = 34
  const FRET_GAP = 38
  const LEFT = 26
  const TOP = 42
  const width = LEFT + (STRINGS - 1) * STR_GAP + 24
  const height = TOP + ROWS * FRET_GAP + 16

  const { frets, baseFret } = voicing
  const displayStart = baseFret === 0 ? 1 : baseFret
  const tuning = TUNINGS['standard']

  const parts: string[] = []
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${ariaLabel}">`)
  parts.push(`<rect width="${width}" height="${height}" fill="#0a0912" rx="8"/>`)

  if (baseFret === 0) {
    parts.push(`<rect x="${LEFT - 3}" y="${TOP - 3}" width="${(STRINGS - 1) * STR_GAP + 6}" height="5" fill="#e8e6f0"/>`)
  } else {
    parts.push(`<text x="${LEFT - 10}" y="${TOP + FRET_GAP * 0.65}" fill="#8a84a3" font-size="12" text-anchor="end" font-family="sans-serif">${baseFret}fr</text>`)
    parts.push(`<line x1="${LEFT}" y1="${TOP}" x2="${LEFT + (STRINGS - 1) * STR_GAP}" y2="${TOP}" stroke="#3a3450" stroke-width="2"/>`)
  }
  for (let f = 0; f <= ROWS; f++) {
    const y = TOP + f * FRET_GAP
    parts.push(`<line x1="${LEFT}" y1="${y}" x2="${LEFT + (STRINGS - 1) * STR_GAP}" y2="${y}" stroke="#241f38" stroke-width="1.5"/>`)
  }
  for (let s = 0; s < STRINGS; s++) {
    const x = LEFT + s * STR_GAP
    parts.push(`<line x1="${x}" y1="${TOP}" x2="${x}" y2="${TOP + ROWS * FRET_GAP}" stroke="#3a3450" stroke-width="1.5"/>`)
  }

  const chordPcs = new Set(chord.intervals.map((iv: number) => (rootPc + iv) % 12))
  for (let s = 0; s < STRINGS; s++) {
    const x = LEFT + s * STR_GAP
    const f = frets[s]
    if (f === null) {
      parts.push(`<text x="${x}" y="${TOP - 10}" fill="#6a6486" font-size="15" text-anchor="middle" font-family="sans-serif" font-weight="700">&#215;</text>`)
      continue
    }
    if (f === 0) {
      parts.push(`<circle cx="${x}" cy="${TOP - 13}" r="6" fill="none" stroke="#e8e6f0" stroke-width="2"/>`)
      continue
    }
    const row = f - displayStart
    if (row < 0 || row >= ROWS) continue
    const y = TOP + row * FRET_GAP + FRET_GAP / 2
    const pc = (tuning.notes[s] + f) % 12
    const semis = ((pc - rootPc) % 12 + 12) % 12
    const fill = chordPcs.has(pc) ? (DEFAULT_INTERVAL_COLORS[intervalName(semis)] ?? '#888') : '#666'
    const isRoot = semis === 0
    parts.push(`<circle cx="${x}" cy="${y}" r="9.5" fill="${fill}"${isRoot ? ' stroke="#fff" stroke-width="2"' : ''}/>`)
  }
  parts.push('</svg>')
  return parts.join('\n')
}

function voicingsBlock(rootPc: number, chord: ChordDef): string {
  const voicings = getChordVoicings(chordRootName(rootPc), chord, TUNINGS['standard'], 15)
  if (!voicings.length) return '<p>No clean root-position grip was found for this chord in standard tuning — try it as an arpeggio instead.</p>'
  const cells = voicings.map((v, i) => {
    const label = v.baseFret === 0 ? 'Open position' : `Fret ${v.baseFret}`
    return `<figure>
      ${voicingSvg(rootPc, chord, v, `${chordRootName(rootPc)}${chord.suffix} chord voicing ${i + 1}, ${label}`)}
      <figcaption>${label}</figcaption>
    </figure>`
  }).join('\n    ')
  return `<div class="voicing-grid">\n    ${cells}\n    </div>`
}

// ─── One chord page ───────────────────────────────────────────────────
function chordPage(rootPc: number, chordKey: string): string {
  const chord = CHORDS[chordKey]
  const copy = CHORD_COPY[chordKey]
  const root = chordRootName(rootPc)
  const displayName = `${root}${chord.suffix}`
  const noteNames = chord.intervals.map((iv: number) => noteName((rootPc + iv) % 12, false))
  const notesList = noteNames.join(', ')
  const canonicalPath = chordPagePath(rootPc, chordKey)

  const title = `${displayName} Chord (${chord.name}) on Guitar — Notes, Voicings & Fretboard | Modal Runs`
  const description = `${displayName} guitar chord: ${notesList}. Every playable voicing, the formula, and a free drone to hear it against — Modal Runs listens through your mic while you practice.`

  const compatible = getCompatibleScales(root, chord)
  const modeMatches = compatible.filter((c): c is { key: ModeKey; name: string } => (MODES as readonly string[]).includes(c.key))
  const otherMatches = compatible.filter(c => !(MODES as readonly string[]).includes(c.key)).slice(0, 4)
  const scalesSection = modeMatches.length
    ? `<ul class="links">
      ${modeMatches.slice(0, 8).map(m => `<li><a href="${modePagePath(rootPc, m.key as ModeKey)}">${root} ${MODE_COPY[m.key as ModeKey].title}</a></li>`).join('\n      ')}
    </ul>${otherMatches.length ? `<p>Also compatible: ${otherMatches.map(m => m.name).join(', ')}.</p>` : ''}`
    : `<p>${compatible.slice(0, 6).map(m => m.name).join(', ') || 'No exact scale match in the built-in library — every note here still comes straight from the chord’s own formula.'}</p>`

  const sameCategory = CHORD_KEYS.filter(k => k !== chordKey && CHORDS[k].category === chord.category).slice(0, 6)

  const structuredData = [
    breadcrumbList([
      { name: 'Modal Runs', path: '/' },
      { name: 'Chords', path: '/chords/' },
      { name: displayName, path: canonicalPath },
    ]),
    articleSchema({ headline: title, description, path: canonicalPath, inLanguage: 'en' }),
    faqPageSchema([{ q: `What notes are in a ${displayName} chord?`, a: `${displayName} (${chord.name}) is built from ${notesList} — the formula ${formulaString(chord.intervals)} from the root.` }]),
  ]

  return `<!DOCTYPE html>
<html lang="en">
<head>
    ${head({ title, description, canonicalPath, jsonLd: structuredData })}
    <style>
      .voicing-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 18px; margin: 18px 0 }
      .voicing-grid figure { margin: 0 }
      .voicing-grid figcaption { text-align: center }
    </style>
</head>
<body>
  ${SITE_HEADER}
  <main>
    <h1>${displayName} Chord <span style="font-size:0.6em;color:#8a84a3">(${chord.name})</span></h1>
    <p class="lead">${copy.hook} The notes of ${displayName} are <strong>${notesList}</strong>.</p>
    <p>${copy.sound}</p>

    <h2>${displayName} voicings on guitar</h2>
    <p>Every playable, root-in-the-bass grip standard tuning offers, computed from the chord’s own formula — not a fixed shape library.</p>
    ${voicingsBlock(rootPc, chord)}

    <a class="cta" href="${chordAppLink(root, chordKey)}">Hear ${displayName} against a drone →<small>Free, in your browser. See every voicing on the full neck.</small></a>
    <p>${copy.practice}</p>

    <h2>Formula and intervals</h2>
    <p><strong>${formulaString(chord.intervals)}</strong> — ${chord.intervals.length} notes.</p>

    <h2>Scales that fit ${displayName}</h2>
    <p>Every scale below contains all of this chord’s notes — safe territory to improvise in over it.</p>
    ${scalesSection}

    <h2>Other ${chord.category.toLowerCase()} on ${root}</h2>
    <ul class="links">
      ${sameCategory.map(k => `<li><a href="${chordPagePath(rootPc, k)}">${root}${CHORDS[k].suffix} <span style="opacity:0.6">(${CHORDS[k].name})</span></a></li>`).join('\n      ')}
    </ul>
  </main>
  ${footer({ modesHref: '/chords/', modesLabel: 'All chords', appLabel: 'Open the app', tag: 'Modal Runs — free guitar practice that listens.' })}
</body>
</html>
`
}

// ─── The /chords/ index ────────────────────────────────────────────────
function chordsIndexPage(): string {
  const title = 'Guitar Chords in Every Key — Voicings, Notes & Formulas | Modal Runs'
  const description = 'Every playable voicing for 25 chord types across all 12 keys — triads, sevenths, and extended chords — with notes, formulas, and a free drone to hear them against.'
  const categories = ['Triads', 'Sevenths', 'Extended']

  const sections = categories.map(cat => {
    const keys = CHORD_KEYS.filter(k => CHORDS[k].category === cat)
    const rows = keys.map(k => {
      const cells = Array.from({ length: ROOT_COUNT }, (_, pc) =>
        `<a href="${chordPagePath(pc, k)}">${chordRootName(pc)}${CHORDS[k].suffix}</a>`
      ).join('\n        ')
      return `<h3>${CHORDS[k].name}</h3>
      <div class="grid">
        ${cells}
      </div>`
    }).join('\n\n    ')
    return `<h2>${cat}</h2>\n    ${rows}`
  }).join('\n\n    ')

  const structuredData = [
    breadcrumbList([{ name: 'Modal Runs', path: '/' }, { name: 'Chords', path: '/chords/' }]),
    articleSchema({ headline: title, description, path: '/chords/', inLanguage: 'en' }),
  ]

  return `<!DOCTYPE html>
<html lang="en">
<head>
    ${head({ title, description, canonicalPath: '/chords/', jsonLd: structuredData })}
</head>
<body>
  ${SITE_HEADER}
  <main>
    <h1>Every chord, every key</h1>
    <p class="lead">25 chord types — triads, sevenths, and extended chords — mapped across all 12 keys, every playable voicing computed and shown. Pick a chord; <a href="/">the app</a> shows it on the full neck and lets you hear it against a drone. Building a key from the ground up? Start with <a href="/modes/">the modes</a>.</p>

    ${sections}
  </main>
  ${footer({ modesHref: '/chords/', modesLabel: 'All chords', appLabel: 'Open the app', tag: 'Modal Runs — free guitar practice that listens.' })}
</body>
</html>
`
}

export function allChordPagePaths(): string[] {
  const paths: string[] = []
  for (let pc = 0; pc < ROOT_COUNT; pc++) for (const key of CHORD_KEYS) paths.push(chordPagePath(pc, key))
  return paths
}

export function writeChordPages(write: (path: string, html: string) => void): number {
  let count = 0
  for (let pc = 0; pc < ROOT_COUNT; pc++) {
    for (const key of CHORD_KEYS) {
      write(chordPagePath(pc, key), chordPage(pc, key))
      count++
    }
  }
  write('/chords/', chordsIndexPage())
  return count
}
