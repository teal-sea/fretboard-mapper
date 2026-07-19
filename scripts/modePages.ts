// ─── Mode landing pages ──────────────────────────────────────────────
// Build-time generator for the static cluster: one crawlable HTML page per
// (root × mode) in English — 84 pages — plus the same 84 in Spanish, French,
// Italian and Portuguese (solfège note names via the app's own displayNote),
// the /guides/ articles, all indexes, hreflang alternates, and a full
// sitemap. This is the SEO/GEO surface of the app: the SPA itself ships one
// URL and no crawlable text, so these pages are what search engines and AI
// crawlers actually read.
//
// Every musical fact on every page is COMPUTED from musicTheory.ts (golden
// rule #2): notes, spellings, formulas, chords, sibling modes, and every SVG
// fret position. Only the prose (shared.ts, locales.ts, guides.ts) is
// authored.
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
import { displayNote } from '../src/utils/noteNames'
import {
  ORIGIN, MAJOR, MODES, type ModeKey, MODE_COPY, ENHARMONIC,
  parentPc, usesFlats, rootNameFor, pageSlug, pagePath, appLink,
  head, SITE_HEADER, siteHeader, footer, breadcrumbList, articleSchema, faqPageSchema,
} from './shared'
import { GUIDES, GUIDES_FOR_MODE, guidesIndexPage } from './guides'
import { LOCALES, type Locale } from './locales'
import { allChordPagePaths, writeChordPages } from './chordPages'

function fmt(s: string, vars: Record<string, string | number>): string {
  return s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''))
}

// ─── Localized naming ────────────────────────────────────────────────
// 'Db' → 'Reb' (display) and 'Db' → 're-bemol' (slug); mode names fold
// their accents for slugs: Dórico → dorico.
function dispNote(engineName: string, locale: Locale): string {
  return displayNote(engineName, 'solfege', locale.code)
}

function foldAccents(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function slugRootL(engineName: string, locale: Locale): string {
  // Non-Latin locales provide romanized slug notes; URLs stay ASCII even
  // when the page displays До or ド.
  const letterIdx = 'CDEFGAB'.indexOf(engineName.charAt(0).toUpperCase())
  const base = locale.slugSolfege && letterIdx >= 0
    ? locale.slugSolfege[letterIdx] + engineName.slice(1)
    : dispNote(engineName, locale)
  const solfege = foldAccents(base).toLowerCase()
  return solfege.replace('#', `-${locale.sharpWord}`).replace(/(.)b$/, `$1-${locale.flatWord}`)
}

function pagePathL(rootPc: number, mode: ModeKey, locale: Locale): string {
  const root = rootNameFor(rootPc, mode)
  const modeSlug = foldAccents(locale.modeSlugs?.[mode] ?? locale.modeNames[mode]).toLowerCase()
  return `/${locale.code}/${locale.modesSegment}/${slugRootL(root, locale)}-${modeSlug}/`
}

// Every language version of one (root, mode) page, for hreflang tags.
// x-default points at English.
function alternatesFor(rootPc: number, mode: ModeKey): { hreflang: string; href: string }[] {
  return [
    { hreflang: 'en', href: `${ORIGIN}${pagePath(rootPc, mode)}` },
    ...LOCALES.map(l => ({ hreflang: l.code, href: `${ORIGIN}${pagePathL(rootPc, mode, l)}` })),
    { hreflang: 'x-default', href: `${ORIGIN}${pagePath(rootPc, mode)}` },
  ]
}

function indexAlternates(): { hreflang: string; href: string }[] {
  return [
    { hreflang: 'en', href: `${ORIGIN}/modes/` },
    ...LOCALES.map(l => ({ hreflang: l.code, href: `${ORIGIN}/${l.code}/${l.modesSegment}/` })),
    { hreflang: 'x-default', href: `${ORIGIN}/modes/` },
  ]
}

// Homepage alternates point at '/', not '/modes/' — a distinct page from
// indexAlternates above. English's '/' is the real SPA (index.html, built
// by Vite directly, not this plugin); the locale homepages below are the
// ones actually generated here.
function homeAlternates(): { hreflang: string; href: string }[] {
  return [
    { hreflang: 'en', href: `${ORIGIN}/` },
    ...LOCALES.map(l => ({ hreflang: l.code, href: `${ORIGIN}/${l.code}/` })),
    { hreflang: 'x-default', href: `${ORIGIN}/` },
  ]
}

// ─── Fretboard SVG ───────────────────────────────────────────────────
// Schematic neck, frets 0–12, standard tuning, every scale tone labelled
// and coloured by interval with the app's own palette. Positions come from
// computeFretboard — the exact function the live app renders from. `disp`
// converts an engine note name to the page language's spelling.
function fretboardSvg(
  rootName: string,
  mode: ModeKey,
  flats: boolean,
  disp: (n: string) => string,
  ariaLabel: string
): string {
  const NUM_FRETS = 12
  const scaleSet = getScaleNotes(rootName, SCALES[mode])
  const board = computeFretboard(TUNINGS['standard'], rootName, scaleSet, NUM_FRETS)

  const FRET_W = 60, STR_GAP = 30, LEFT = 46, TOP = 26
  const width = LEFT + (NUM_FRETS + 1) * FRET_W + 14
  const height = TOP + 5 * STR_GAP + 40
  const stringY = (s: number) => TOP + (5 - s) * STR_GAP // low E at the bottom
  const noteX = (f: number) => LEFT + f * FRET_W + FRET_W / 2

  const parts: string[] = []
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${ariaLabel}">`)
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
    parts.push(`<text x="16" y="${stringY(s) + 4}" fill="#6a6486" font-size="12" font-family="sans-serif">${disp(labels[s])}</text>`)
  }
  // Scale notes — colour by interval, spell by this page's parent key
  for (const string of board) {
    for (const fn of string) {
      if (!fn.isInScale) continue
      const cx = fn.fret === 0 ? LEFT + 1 : noteX(fn.fret)
      const y = stringY(fn.stringIndex)
      const fill = DEFAULT_INTERVAL_COLORS[fn.intervalName] ?? '#888'
      const label = disp(noteName(fn.degree, flats))
      const r = fn.isRoot ? 12.5 : 11
      const fontSize = label.length > 3 ? 8 : 10
      parts.push(`<circle cx="${cx}" cy="${y}" r="${r}" fill="${fill}"${fn.isRoot ? ' stroke="#fff" stroke-width="2"' : ''}/>`)
      parts.push(`<text x="${cx}" y="${y + 3.5}" fill="#0a0a0f" font-size="${fontSize}" font-weight="700" text-anchor="middle" font-family="sans-serif">${label}</text>`)
    }
  }
  parts.push('</svg>')
  return parts.join('\n')
}

// ─── Shared per-page derivations ─────────────────────────────────────
function pageFacts(rootPc: number, mode: ModeKey) {
  const flats = usesFlats(rootPc, mode)
  const root = rootNameFor(rootPc, mode)
  const scale = SCALES[mode]
  const noteNames = scale.intervals.map(iv => noteName((rootPc + iv) % 12, flats))
  const focusSemis = scale.intervals.find(iv => intervalName(iv) === MODE_COPY[mode].focus)
  const focusNote = focusSemis !== undefined ? noteName((rootPc + focusSemis) % 12, flats) : ''
  const parent = parentPc(rootPc, mode)
  const parentName = noteName(parent, flats)
  const siblings = MODES.filter(m => m !== mode).map(m => ({
    pc: (parent + MAJOR[MODES.indexOf(m)]) % 12,
    mode: m,
  }))
  const sameRoot = MODES.filter(m => m !== mode).map(m => ({ pc: rootPc, mode: m }))
  const chords = getDiatonicChords(root, scale).map(deg => deg[0]).filter(Boolean)
  return { flats, root, scale, noteNames, focusNote, parent, parentName, siblings, sameRoot, chords }
}

// ─── One mode page (English) ─────────────────────────────────────────
function modePage(rootPc: number, mode: ModeKey): string {
  const copy = MODE_COPY[mode]
  const { flats, root, scale, noteNames, focusNote, parent, parentName, siblings, sameRoot, chords } = pageFacts(rootPc, mode)
  const notesList = noteNames.join(', ')
  const alt = ENHARMONIC[root]
  const displayName = `${root} ${copy.title}`

  const chordRows = chords.map(c => {
    // Respell the chord root with this page's parent-key spelling — the
    // engine's own display heuristic is tuned for the app, not for print.
    const name = noteName(noteIndex(c.root), flats) + c.chordDef.suffix
    return `<tr><td>${c.romanNumeral}</td><td><strong>${name}</strong></td><td>${c.chordDef.name}</td></tr>`
  }).join('\n')

  const title = `${displayName}${alt ? ` (${alt})` : ''} Mode on Guitar — Scale, Chords & Fretboard Map | Modal Runs`
  const description = `${displayName} on guitar: ${notesList}. An interactive fretboard visualization of the diatonic chords, every note mapped across the neck, plus a free drone to improvise over — Modal Runs listens through your mic and lights up what you play.`

  const relativeLine = mode === 'ionian'
    ? `Every mode on this site is built from a major scale. ${displayName} is the major scale of ${root} itself — the other six modes below reuse its exact notes with a different home.`
    : `${displayName} contains exactly the same notes as <a href="${pagePath(parent, 'ionian')}">${parentName} Major</a>. Nothing about the notes changes — what changes is which one feels like home, and that changes everything about the sound.`

  const guideLinks = GUIDES_FOR_MODE[mode]
    .map(g => `<li><a href="/guides/${g.slug}/">${g.h1}</a></li>`)
    .join('\n      ')

  const canonicalPath = pagePath(rootPc, mode)
  const structuredData = [
    breadcrumbList([
      { name: 'Modal Runs', path: '/' },
      { name: 'Modes', path: '/modes/' },
      { name: displayName, path: canonicalPath },
    ]),
    articleSchema({ headline: title, description, path: canonicalPath, inLanguage: 'en' }),
    // The trending query is literally "what is dorian mode" — this answers
    // it with the exact sentence already opening the lead paragraph below,
    // so the markup never diverges from what's rendered.
    faqPageSchema([{ q: `What is ${displayName}?`, a: copy.hook }]),
  ]

  return `<!DOCTYPE html>
<html lang="en">
<head>
    ${head({ title, description, canonicalPath, alternates: alternatesFor(rootPc, mode), jsonLd: structuredData })}
</head>
<body>
  ${SITE_HEADER}
  <main>
    <h1>${displayName}${alt ? ` <span style="font-size:0.6em;color:#8a84a3">(${alt} ${copy.title})</span>` : ''} on Guitar</h1>
    <p class="lead">${copy.hook} The notes of ${displayName} are <strong>${notesList}</strong>. Its characteristic note is <strong>${focusNote}</strong> — the ${copy.focusLabel} — the one note that gives this ${copy.quality} scale its colour.</p>
    <p>${copy.sound}</p>

    <h2>Visualize ${displayName} across the whole neck</h2>
    <figure>
      ${fretboardSvg(root, mode, flats, n => n, `${root} ${copy.title} scale — a fretboard visualization showing every note on the guitar neck, frets 0 to 12`)}
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

// ─── One mode page (localized) ───────────────────────────────────────
function localizedModePage(rootPc: number, mode: ModeKey, locale: Locale): string {
  const copy = locale.copy[mode]
  const quality = MODE_COPY[mode].quality
  const t = locale.t
  const { flats, root, scale, noteNames, focusNote, parent, parentName, siblings, sameRoot, chords } = pageFacts(rootPc, mode)

  const disp = (n: string) => dispNote(n, locale)
  const dispRoot = disp(root)
  const displayName = `${dispRoot} ${locale.modeNames[mode]}`
  const notesList = noteNames.map(disp).join(', ')
  const alt = ENHARMONIC[root]
  const dispAlt = alt ? disp(alt) : ''

  const chordRows = chords.map(c => {
    const name = disp(noteName(noteIndex(c.root), flats)) + c.chordDef.suffix
    return `<tr><td>${c.romanNumeral}</td><td><strong>${name}</strong></td><td>${c.chordDef.name}</td></tr>`
  }).join('\n')

  const vars = {
    name: displayName,
    notes: notesList,
    root: dispRoot,
    focus: disp(focusNote),
    focusLabel: copy.focusLabel,
    hook: copy.hook,
    formula: formulaString(scale.intervals),
    n: scale.intervals.length,
    family: quality === 'major-type' ? t.familyMajor : quality === 'minor-type' ? t.familyMinor : t.familyDim,
    parent: `${disp(parentName)} ${locale.majorLabel}`,
    parentHref: pagePathL(parent, 'ionian', locale),
  }

  const title = fmt(t.title, { ...vars, name: `${displayName}${alt ? ` (${dispAlt})` : ''}` })
  const description = fmt(t.metaDesc, vars)
  const canonicalPath = pagePathL(rootPc, mode, locale)
  const relativeLine = mode === 'ionian' ? fmt(t.relativeIonian, vars) : fmt(t.relative, vars)
  const link = (s: { pc: number; mode: ModeKey }) =>
    `<li><a href="${pagePathL(s.pc, s.mode, locale)}">${disp(rootNameFor(s.pc, s.mode))} ${locale.modeNames[s.mode]}</a></li>`
  const structuredData = [
    breadcrumbList([
      { name: 'Modal Runs', path: '/' },
      { name: t.indexH1, path: `/${locale.code}/${locale.modesSegment}/` },
      { name: displayName, path: canonicalPath },
    ]),
    articleSchema({ headline: title, description, path: canonicalPath, inLanguage: locale.code }),
    faqPageSchema([{ q: fmt(t.faqQ, vars), a: copy.hook }]),
  ]

  return `<!DOCTYPE html>
<html lang="${locale.htmlLang}">
<head>
    ${head({
      title,
      description,
      canonicalPath,
      alternates: alternatesFor(rootPc, mode),
      jsonLd: structuredData,
    })}
</head>
<body>
  ${siteHeader(t.upgradeCta)}
  <main>
    <h1>${fmt(t.h1, { ...vars, name: `${displayName}${alt ? ` <span style="font-size:0.6em;color:#8a84a3">(${dispAlt})</span>` : ''}` })}</h1>
    <p class="lead">${fmt(t.lead, vars)}</p>
    <p>${copy.sound}</p>

    <h2>${fmt(t.neckHeading, vars)}</h2>
    <figure>
      ${fretboardSvg(root, mode, flats, disp, fmt(t.ariaFretboard, vars))}
      <figcaption>${fmt(t.figcaption, vars)}</figcaption>
    </figure>

    <a class="cta" href="${appLink(root, mode)}&lang=${locale.code}">${fmt(t.ctaMain, vars)}<small>${t.ctaSub}</small></a>
    <p>${copy.practice}</p>

    <h2>${t.formulaHeading}</h2>
    <p>${fmt(t.formulaLine, vars)}</p>

    <h2>${fmt(t.chordsHeading, vars)}</h2>
    <p>${t.chordsIntro}</p>
    <table>
      <tr><th>${t.thDegree}</th><th>${t.thChord}</th><th>${t.thQuality}</th></tr>
      ${chordRows}
    </table>

    <h2>${t.sameNotesHeading}</h2>
    <p>${relativeLine}</p>
    <ul class="links">
      ${siblings.map(link).join('\n      ')}
    </ul>

    <h2>${fmt(t.otherModesHeading, vars)}</h2>
    <p>${t.otherModesIntro}</p>
    <ul class="links">
      ${sameRoot.map(link).join('\n      ')}
    </ul>
  </main>
  ${footer({
    modesHref: `/${locale.code}/${locale.modesSegment}/`,
    modesLabel: t.footerModes,
    appLabel: t.footerApp,
    tag: t.footerTag,
    showGuides: false,
  })}
</body>
</html>
`
}

// ─── The /modes/ index (English) ─────────────────────────────────────
function indexPage(): string {
  const title = 'Guitar Modes in Every Key — Formulas, Notes & Fretboard Maps | Modal Runs'
  const description = 'All seven guitar modes in all twelve keys: the formula and notes of each mode, every neck position mapped, diatonic chords, and a free drone to improvise over. Modal Runs listens through your mic while you practice.'

  const sections = MODES.map(mode => {
    const copy = MODE_COPY[mode]
    const cells = Array.from({ length: 12 }, (_, pc) =>
      `<a href="${pagePath(pc, mode)}">${rootNameFor(pc, mode)} ${copy.title}</a>`
    ).join('\n      ')
    return `<h2>${copy.title}</h2>
    <p>${copy.hook}</p>
    <p><strong>Formula: ${formulaString(SCALES[mode].intervals)}</strong></p>
    <div class="grid">
      ${cells}
    </div>`
  }).join('\n\n    ')

  const languages = LOCALES
    .map(l => `<a href="/${l.code}/${l.modesSegment}/" hreflang="${l.code}">${l.t.indexH1}</a>`)
    .join(' · ')

  const structuredData = [
    breadcrumbList([{ name: 'Modal Runs', path: '/' }, { name: 'Modes', path: '/modes/' }]),
    articleSchema({ headline: title, description, path: '/modes/', inLanguage: 'en' }),
  ]

  return `<!DOCTYPE html>
<html lang="en">
<head>
    ${head({ title, description, canonicalPath: '/modes/', alternates: indexAlternates(), jsonLd: structuredData })}
</head>
<body>
  ${SITE_HEADER}
  <main>
    <h1>Every mode, every key</h1>
    <p class="lead">The seven modes of the major scale, mapped across the guitar neck in all twelve keys — with the notes, the chords that live inside each one, and a drone to improvise over. Pick a key; the page shows you the map, and <a href="/">the app</a> listens while you play it. New to modes? Start with the <a href="/guides/">guides</a>.</p>
    <p>${languages}</p>

    ${sections}
  </main>
  ${footer()}
</body>
</html>
`
}

// ─── The localized /{lang}/ homepage ──────────────────────────────────
// Previously missing entirely — every locale 404'd at its own root, only
// the /{lang}/{modes}/ cluster existed. hreflang alternates on the mode
// pages and index pages pointed language-cluster crawl paths at each
// other, but there was no actual localized landing page to send someone
// searching in Spanish/French/Italian/Portuguese to; they'd land on the
// English '/' regardless of language. This is a real page (not just a
// redirect) with its own translated copy, matching the depth of the
// English homepage's <noscript> fallback content.
function localizedHomePage(locale: Locale): string {
  const t = locale.t
  const canonicalPath = `/${locale.code}/`
  const modesPath = `/${locale.code}/${locale.modesSegment}/`
  const structuredData = [
    breadcrumbList([{ name: 'Modal Runs', path: '/' }, { name: t.homeH1, path: canonicalPath }]),
    articleSchema({ headline: t.homeTitle, description: t.homeDesc, path: canonicalPath, inLanguage: locale.code }),
  ]

  return `<!DOCTYPE html>
<html lang="${locale.htmlLang}">
<head>
    ${head({
      title: t.homeTitle,
      description: t.homeDesc,
      canonicalPath,
      alternates: homeAlternates(),
      jsonLd: structuredData,
    })}
</head>
<body>
  ${siteHeader(t.upgradeCta)}
  <main>
    <h1>${t.homeH1}</h1>
    <p class="lead">${t.homeLead}</p>
    <a class="cta" href="/?lang=${locale.code}">${t.footerApp} →</a>
    <p><a href="${modesPath}">${t.footerModes}</a></p>
  </main>
  ${footer({
    modesHref: modesPath,
    modesLabel: t.footerModes,
    appLabel: t.footerApp,
    tag: t.footerTag,
    showGuides: false,
  })}
</body>
</html>
`
}

// ─── The localized /{lang}/{modes}/ index ────────────────────────────
function localizedIndexPage(locale: Locale): string {
  const t = locale.t
  const sections = MODES.map(mode => {
    const cells = Array.from({ length: 12 }, (_, pc) =>
      `<a href="${pagePathL(pc, mode, locale)}">${dispNote(rootNameFor(pc, mode), locale)} ${locale.modeNames[mode]}</a>`
    ).join('\n      ')
    return `<h2>${locale.modeNames[mode]}</h2>
    <p>${locale.copy[mode].hook}</p>
    <div class="grid">
      ${cells}
    </div>`
  }).join('\n\n    ')

  const canonicalPath = `/${locale.code}/${locale.modesSegment}/`
  const structuredData = [
    breadcrumbList([{ name: 'Modal Runs', path: '/' }, { name: t.indexH1, path: canonicalPath }]),
    articleSchema({ headline: t.indexTitle, description: t.indexDesc, path: canonicalPath, inLanguage: locale.code }),
  ]

  return `<!DOCTYPE html>
<html lang="${locale.htmlLang}">
<head>
    ${head({
      title: t.indexTitle,
      description: t.indexDesc,
      canonicalPath,
      alternates: indexAlternates(),
      jsonLd: structuredData,
    })}
</head>
<body>
  ${siteHeader(t.upgradeCta)}
  <main>
    <h1>${t.indexH1}</h1>
    <p class="lead">${t.indexLead}</p>

    ${sections}
  </main>
  ${footer({
    modesHref: `/${locale.code}/${locale.modesSegment}/`,
    modesLabel: t.footerModes,
    appLabel: t.footerApp,
    tag: t.footerTag,
    showGuides: false,
  })}
</body>
</html>
`
}

// ─── Sitemap ─────────────────────────────────────────────────────────
function sitemap(): string {
  const urls = ['/', '/modes/', '/guides/', '/chords/']
  for (const g of GUIDES) urls.push(`/guides/${g.slug}/`)
  for (const mode of MODES) for (let pc = 0; pc < 12; pc++) urls.push(pagePath(pc, mode))
  urls.push(...allChordPagePaths())
  for (const locale of LOCALES) {
    urls.push(`/${locale.code}/`)
    urls.push(`/${locale.code}/${locale.modesSegment}/`)
    for (const mode of MODES) for (let pc = 0; pc < 12; pc++) urls.push(pagePathL(pc, mode, locale))
  }
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
      const write = (urlPath: string, html: string) => {
        const dir = path.join(outDir, ...urlPath.split('/').filter(Boolean))
        fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(path.join(dir, 'index.html'), html)
      }
      let count = 0
      for (const mode of MODES) {
        for (let pc = 0; pc < 12; pc++) {
          write(pagePath(pc, mode), modePage(pc, mode))
          count++
          for (const locale of LOCALES) {
            write(pagePathL(pc, mode, locale), localizedModePage(pc, mode, locale))
            count++
          }
        }
      }
      write('/modes/', indexPage())
      for (const locale of LOCALES) {
        write(`/${locale.code}/`, localizedHomePage(locale))
        write(`/${locale.code}/${locale.modesSegment}/`, localizedIndexPage(locale))
      }
      for (const g of GUIDES) write(`/guides/${g.slug}/`, g.render())
      write('/guides/', guidesIndexPage())
      const chordCount = writeChordPages(write)

      // Prerender a real fretboard into the root's splash so First/Largest
      // Contentful Paint land actual content painted from static HTML —
      // before the bundle runs — instead of a bare pulsing logo. Same
      // engine-driven SVG the mode pages use (golden rule 2: the engine
      // computes the frets, never hardcoded). C Ionian = the app's default
      // landing key, so it matches what React renders a beat later. If the
      // marker's ever missing, we just skip it rather than fail the build.
      const rootIndex = path.join(outDir, 'index.html')
      const marker = '<!--PRERENDERED_HERO-->'
      let rootHtml = fs.readFileSync(rootIndex, 'utf8')
      if (rootHtml.includes(marker)) {
        const heroSvg = fretboardSvg(
          'C', 'ionian', false, n => n,
          'C major scale across the guitar fretboard — every note of the scale lit on the neck'
        )
        rootHtml = rootHtml.replace(marker, `<div class="splash-board">${heroSvg}</div>`)
        fs.writeFileSync(rootIndex, rootHtml)
      } else {
        console.warn('  ⚠ root hero marker not found in index.html — splash left as-is')
      }

      // Overwrites the placeholder copied from public/ — this one knows
      // about every generated page.
      fs.writeFileSync(path.join(outDir, 'sitemap.xml'), sitemap())
      console.log(`  ✓ mode-pages: ${count} mode pages (en + ${LOCALES.length} locales) + ${GUIDES.length} guides + ${chordCount} chord pages + indexes + sitemap`)
    },
  }
}
