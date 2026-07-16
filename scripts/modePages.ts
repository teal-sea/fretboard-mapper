// ─── Mode landing pages ──────────────────────────────────────────────
// Build-time generator for the static cluster: one crawlable HTML page per
// (root × mode) — 84 pages — plus the /guides/ articles, both indexes, and
// a full sitemap. This is the SEO/GEO surface of the app: the SPA itself
// ships one URL and no crawlable text, so these pages are what search
// engines and AI crawlers actually read.
//
// Every musical fact on every page is COMPUTED from musicTheory.ts (golden
// rule #2): notes, spellings, formulas, chords, sibling modes, and every SVG
// fret position. Only the per-mode prose (shared.ts) and the guide articles
// (guides.ts) are authored.
//
// Runs as a Vite plugin on closeBundle, writing straight into dist/. Zero
// new dependencies; never touches the app bundle.

import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'
import {
  SCALES, TUNINGS,
  getScaleNotes, getDiatonicChords, computeFretboard,
  noteIndex, noteName, formulaString, intervalName,
} from '../src/utils/musicTheory'
import { DEFAULT_INTERVAL_COLORS } from '../src/utils/defaultColors'
import {
  ORIGIN, MAJOR, MODES, type ModeKey, MODE_COPY, ENHARMONIC,
  parentPc, usesFlats, rootNameFor, pageSlug, pagePath, appLink,
  head, SITE_HEADER, footer,
} from './shared'
import { GUIDES, GUIDES_FOR_MODE, guidesIndexPage } from './guides'

// ─── Fretboard SVG ───────────────────────────────────────────────────
// Schematic neck, frets 0–12, standard tuning, every scale tone labelled
// and coloured by interval with the app's own palette. Positions come from
// computeFretboard — the exact function the live app renders from.
function fretboardSvg(rootName: string, mode: ModeKey, flats: boolean): string {
  const NUM_FRETS = 12
  const scaleSet = getScaleNotes(rootName, SCALES[mode])
  const board = computeFretboard(TUNINGS['standard'], rootName, scaleSet, NUM_FRETS)

  const FRET_W = 60, STR_GAP = 30, LEFT = 46, TOP = 26
  const width = LEFT + (NUM_FRETS + 1) * FRET_W + 14
  const height = TOP + 5 * STR_GAP + 40
  const stringY = (s: number) => TOP + (5 - s) * STR_GAP // low E at the bottom
  const noteX = (f: number) => LEFT + f * FRET_W + FRET_W / 2

  const parts: string[] = []
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${rootName} ${MODE_COPY[mode].title} scale mapped on a guitar fretboard, frets 0 to 12">`)
  parts.push(`<rect width="${width}" height="${height}" fill="#0a0912" rx="10"/>`)

  // Fret lines + numbers (nut sits after the open-string column)
  for (let f = 0; f <= NUM_FRETS; f++) {
    const x = LEFT + f * FRET_W
    const isNut = f === 0
    parts.push(`<line x1="${x}" y1="${TOP - 8}" x2="${x}" y2="${TOP + 5 * STR_GAP + 8}" stroke="${isNut ? '#5a5470' : '#241f38'}" stroke-width="${isNut ? 4 : 2}"/>`)
    if (f > 0) parts.push(`<text x="${noteX(f)}" y="${height - 10}" fill="#6a6486" font-size="11" text-anchor="middle" font-family="sans-serif">${f}</text>`)
  }
  // Inlay markers
  for (const f of [3, 5, 7, 9, 12]) {
    const cy = TOP + 2.5 * STR_GAP
    if (f === 12) {
      parts.push(`<circle cx="${noteX(f)}" cy="${cy - STR_GAP}" r="4" fill="#1d1a2a"/><circle cx="${noteX(f)}" cy="${cy + STR_GAP}" r="4" fill="#1d1a2a"/>`)
    } else {
      parts.push(`<circle cx="${noteX(f)}" cy="${cy}" r="4" fill="#1d1a2a"/>`)
    }
  }
  // Strings
  for (let s = 0; s < 6; s++) {
    parts.push(`<line x1="${LEFT}" y1="${stringY(s)}" x2="${width - 14}" y2="${stringY(s)}" stroke="#3a3450" stroke-width="${1 + (5 - s) * 0.3}"/>`)
  }
  // Open-string labels
  const labels = TUNINGS['standard'].labels
  for (let s = 0; s < 6; s++) {
    parts.push(`<text x="16" y="${stringY(s) + 4}" fill="#6a6486" font-size="12" font-family="sans-serif">${labels[s]}</text>`)
  }
  // Scale notes — colour by interval, spell by this page's parent key
  for (const string of board) {
    for (const fn of string) {
      if (!fn.isInScale) continue
      const cx = fn.fret === 0 ? LEFT + 1 : noteX(fn.fret)
      const y = stringY(fn.stringIndex)
      const fill = DEFAULT_INTERVAL_COLORS[fn.intervalName] ?? '#888'
      const label = noteName(fn.degree, flats)
      const r = fn.isRoot ? 12.5 : 11
      parts.push(`<circle cx="${cx}" cy="${y}" r="${r}" fill="${fill}"${fn.isRoot ? ' stroke="#fff" stroke-width="2"' : ''}/>`)
      parts.push(`<text x="${cx}" y="${y + 3.5}" fill="#0a0a0f" font-size="10" font-weight="700" text-anchor="middle" font-family="sans-serif">${label}</text>`)
    }
  }
  parts.push('</svg>')
  return parts.join('\n')
}

// ─── One mode page ───────────────────────────────────────────────────
function modePage(rootPc: number, mode: ModeKey): string {
  const copy = MODE_COPY[mode]
  const flats = usesFlats(rootPc, mode)
  const root = rootNameFor(rootPc, mode)
  const scale = SCALES[mode]
  const noteNames = scale.intervals.map(iv => noteName((rootPc + iv) % 12, flats))
  const notesList = noteNames.join(', ')
  const alt = ENHARMONIC[root]
  const displayName = `${root} ${copy.title}`
  const focusSemis = scale.intervals.find(iv => intervalName(iv) === copy.focus)
  const focusNote = focusSemis !== undefined ? noteName((rootPc + focusSemis) % 12, flats) : ''

  // Parent major key — the "same notes as" hook, and the sibling links
  const parent = parentPc(rootPc, mode)
  const parentName = noteName(parent, flats)
  const siblings = MODES.filter(m => m !== mode).map(m => {
    const sibDeg = MODES.indexOf(m)
    const sibPc = (parent + MAJOR[sibDeg]) % 12
    return { pc: sibPc, mode: m }
  })
  const sameRoot = MODES.filter(m => m !== mode).map(m => ({ pc: rootPc, mode: m }))

  const chords = getDiatonicChords(root, scale).map(deg => deg[0]).filter(Boolean)
  const chordRows = chords.map(c => {
    // Respell the chord root with this page's parent-key spelling — the
    // engine's own display heuristic is tuned for the app, not for print.
    const name = noteName(noteIndex(c.root), flats) + c.chordDef.suffix
    return `<tr><td>${c.romanNumeral}</td><td><strong>${name}</strong></td><td>${c.chordDef.name}</td></tr>`
  }).join('\n')

  const title = `${displayName}${alt ? ` (${alt})` : ''} Scale on Guitar — Notes, Fretboard Map & Drone | Modal Runs`
  const description = `${displayName} on guitar: ${notesList}. Interactive fretboard map, diatonic chords, and a free drone to improvise over — Modal Runs listens through your mic and lights up what you play.`

  const relativeLine = mode === 'ionian'
    ? `Every mode on this site is built from a major scale. ${displayName} is the major scale of ${root} itself — the other six modes below reuse its exact notes with a different home.`
    : `${displayName} contains exactly the same notes as <a href="${pagePath(parent, 'ionian')}">${parentName} Major</a>. Nothing about the notes changes — what changes is which one feels like home, and that changes everything about the sound.`

  const guideLinks = GUIDES_FOR_MODE[mode]
    .map(g => `<li><a href="/guides/${g.slug}/">${g.h1}</a></li>`)
    .join('\n      ')

  return `<!DOCTYPE html>
<html lang="en">
<head>
    ${head({ title, description, canonicalPath: pagePath(rootPc, mode) })}
</head>
<body>
  ${SITE_HEADER}
  <main>
    <h1>${displayName}${alt ? ` <span style="font-size:0.6em;color:#8a84a3">(${alt} ${copy.title})</span>` : ''} on Guitar</h1>
    <p class="lead">${copy.hook} The notes of ${displayName} are <strong>${notesList}</strong>. Its characteristic note is <strong>${focusNote}</strong> — the ${copy.focusLabel} — the one note that gives this ${copy.quality} scale its colour.</p>
    <p>${copy.sound}</p>

    <h2>${displayName} across the whole neck</h2>
    <figure>
      ${fretboardSvg(root, mode, flats)}
      <figcaption>Standard tuning, frets 0–12. The gold notes are the root (${root}); every colour marks an interval, the same palette the app uses.</figcaption>
    </figure>

    <a class="cta" href="${appLink(root, mode)}">Practice ${displayName} over a drone →<small>Free, in your browser. It listens through your mic and lights up what you play.</small></a>
    <p>${copy.practice}</p>

    <h2>Formula and intervals</h2>
    <p><strong>${formulaString(scale.intervals)}</strong> — ${scale.intervals.length} notes. ${copy.quality === 'major-type' ? 'The natural 3rd makes it a major-family scale.' : copy.quality === 'minor-type' ? 'The flat 3rd makes it a minor-family scale.' : 'The flat 3rd and flat 5th stack into a diminished triad on the root.'}</p>

    <h2>Chords in ${displayName}</h2>
    <p>These are the diatonic chords — the harmony built from only the notes above. Vamping between any of them keeps you inside the mode.</p>
    <table>
      <tr><th>Degree</th><th>Chord</th><th>Quality</th></tr>
      ${chordRows}
    </table>

    <h2>Same notes, different home</h2>
    <p>${relativeLine}</p>
    <ul class="links">
      ${siblings.map(s => `<li><a href="${pagePath(s.pc, s.mode)}">${rootNameFor(s.pc, s.mode)} ${MODE_COPY[s.mode].title}</a></li>`).join('\n      ')}
    </ul>

    <h2>Other modes on ${root}</h2>
    <p>Keep the same root and swap the scale — the fastest way to hear what each mode actually does.</p>
    <ul class="links">
      ${sameRoot.map(s => `<li><a href="${pagePath(s.pc, s.mode)}">${rootNameFor(s.pc, s.mode)} ${MODE_COPY[s.mode].title}</a></li>`).join('\n      ')}
    </ul>

    <h2>Go deeper</h2>
    <ul class="links">
      ${guideLinks}
    </ul>
  </main>
  ${footer()}
</body>
</html>
`
}

// ─── The /modes/ index ───────────────────────────────────────────────
function indexPage(): string {
  const title = 'Guitar Modes in Every Key — Fretboard Maps, Notes & Drones | Modal Runs'
  const description = 'Fretboard maps for all seven modes in all twelve keys: notes, diatonic chords, and a free drone to improvise over. Modal Runs listens through your mic while you practice.'

  const sections = MODES.map(mode => {
    const copy = MODE_COPY[mode]
    const cells = Array.from({ length: 12 }, (_, pc) =>
      `<a href="${pagePath(pc, mode)}">${rootNameFor(pc, mode)} ${copy.title}</a>`
    ).join('\n      ')
    return `<h2>${copy.title}</h2>
    <p>${copy.hook}</p>
    <div class="grid">
      ${cells}
    </div>`
  }).join('\n\n    ')

  return `<!DOCTYPE html>
<html lang="en">
<head>
    ${head({ title, description, canonicalPath: '/modes/' })}
</head>
<body>
  ${SITE_HEADER}
  <main>
    <h1>Every mode, every key</h1>
    <p class="lead">The seven modes of the major scale, mapped across the guitar neck in all twelve keys — with the notes, the chords that live inside each one, and a drone to improvise over. Pick a key; the page shows you the map, and <a href="/">the app</a> listens while you play it. New to modes? Start with the <a href="/guides/">guides</a>.</p>

    ${sections}
  </main>
  ${footer()}
</body>
</html>
`
}

// ─── Sitemap ─────────────────────────────────────────────────────────
function sitemap(): string {
  const urls = ['/', '/modes/', '/guides/']
  for (const g of GUIDES) urls.push(`/guides/${g.slug}/`)
  for (const mode of MODES) for (let pc = 0; pc < 12; pc++) urls.push(pagePath(pc, mode))
  const lastmod = new Date().toISOString().slice(0, 10)
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${ORIGIN}${u}</loc><lastmod>${lastmod}</lastmod></url>`).join('\n')}
</urlset>
`
}

// ─── Vite plugin ─────────────────────────────────────────────────────
export function modePagesPlugin(): Plugin {
  let outDir = 'dist'
  return {
    name: 'mode-pages',
    apply: 'build',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir)
    },
    closeBundle() {
      let count = 0
      for (const mode of MODES) {
        for (let pc = 0; pc < 12; pc++) {
          const dir = path.join(outDir, 'modes', pageSlug(pc, mode))
          fs.mkdirSync(dir, { recursive: true })
          fs.writeFileSync(path.join(dir, 'index.html'), modePage(pc, mode))
          count++
        }
      }
      fs.writeFileSync(path.join(outDir, 'modes', 'index.html'), indexPage())
      for (const g of GUIDES) {
        const dir = path.join(outDir, 'guides', g.slug)
        fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(path.join(dir, 'index.html'), g.render())
      }
      fs.writeFileSync(path.join(outDir, 'guides', 'index.html'), guidesIndexPage())
      // Overwrites the placeholder copied from public/ — this one knows
      // about every generated page.
      fs.writeFileSync(path.join(outDir, 'sitemap.xml'), sitemap())
      console.log(`  ✓ mode-pages: ${count} mode pages + ${GUIDES.length} guides + indexes + sitemap`)
    },
  }
}
