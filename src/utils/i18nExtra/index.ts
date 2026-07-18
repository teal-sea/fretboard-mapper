// ─── Batch-two languages ─────────────────────────────────────────────
// The original four (es/fr/it/pt) live inline in i18n.ts/i18nContent.ts,
// keyed English-string → per-language entry. Every language added since
// gets its own file here instead: one flat Record<englishKey, translation>
// per language, merged into t() ahead of the inline tables. Missing key →
// English fallback, same as always.
//
// These twelve tables are the single largest thing in the JS bundle (~52%
// of it gzipped), and any given visitor needs exactly one of them — or
// zero, if they're on English (which needs no table: the lookup key IS the
// English string). So each language is a lazy import() chunk, fetched only
// when that language is actually active. t() reads the synchronous cache
// below; ensureExtra() populates it and the app re-renders once it lands.

import type { Language } from '../noteNames'

// One import() per language → one chunk per language. Only the active
// visitor's language is ever fetched.
const LOADERS: Partial<Record<Language, () => Promise<Record<string, string>>>> = {
  de: () => import('./de').then(m => m.de),
  nl: () => import('./nl').then(m => m.nl),
  pl: () => import('./pl').then(m => m.pl),
  ru: () => import('./ru').then(m => m.ru),
  uk: () => import('./uk').then(m => m.uk),
  tr: () => import('./tr').then(m => m.tr),
  ja: () => import('./ja').then(m => m.ja),
  ko: () => import('./ko').then(m => m.ko),
  zh: () => import('./zh').then(m => m.zh),
  vi: () => import('./vi').then(m => m.vi),
  id: () => import('./id').then(m => m.id),
  hi: () => import('./hi').then(m => m.hi),
}

// Tables that have finished loading. t() reads only from here, synchronously.
const LOADED: Partial<Record<Language, Record<string, string>>> = {}
// In-flight loads, so a language is fetched at most once.
const PENDING: Partial<Record<Language, Promise<void>>> = {}

// Synchronous accessor for t(): the table if it's loaded, else undefined
// (→ English fallback until ensureExtra resolves).
export function extraFor(lang: Language): Record<string, string> | undefined {
  return LOADED[lang]
}

// Kick off (or await an in-flight) load of a language's table. Languages
// with no loader — English and the inline es/fr/it/pt — resolve instantly.
export function ensureExtra(lang: Language): Promise<void> {
  if (LOADED[lang] || !LOADERS[lang]) return Promise.resolve()
  if (!PENDING[lang]) {
    PENDING[lang] = LOADERS[lang]!().then(tbl => { LOADED[lang] = tbl })
  }
  return PENDING[lang]!
}
