// ─── Note naming: letters vs fixed-do solfège ────────────────────────
// The engine speaks letters internally (C, C#, Db…) — forever. This module
// is DISPLAY ONLY: it converts a letter spelling to what the user's language
// actually calls that note. Spanish, French, Italian and Portuguese name
// notes in fixed-do solfège (Do Re Mi Fa Sol La Si — Si, not Ti, in all of
// them); English defaults to letters but can opt into solfège too.

export type Language = 'en' | 'es' | 'fr' | 'it' | 'pt'
export type NoteStyle = 'letters' | 'solfege'

export const LANGUAGES: { key: Language; label: string; defaultStyle: NoteStyle }[] = [
  { key: 'en', label: 'English', defaultStyle: 'letters' },
  { key: 'es', label: 'Español', defaultStyle: 'solfege' },
  { key: 'fr', label: 'Français', defaultStyle: 'solfege' },
  { key: 'it', label: 'Italiano', defaultStyle: 'solfege' },
  { key: 'pt', label: 'Português', defaultStyle: 'solfege' },
]

// C D E F G A B, in each language's spelling (accents matter — Ré is not Re
// to a French reader, Dó/Fá/Lá carry accents in Portuguese).
const SOLFEGE: Record<Language, string[]> = {
  en: ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'],
  es: ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'],
  fr: ['Do', 'Ré', 'Mi', 'Fa', 'Sol', 'La', 'Si'],
  it: ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'],
  pt: ['Dó', 'Ré', 'Mi', 'Fá', 'Sol', 'Lá', 'Si'],
}

const LETTER_INDEX: Record<string, number> = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 }

// 'C#' → 'Do#', 'Eb' → 'Mib', 'F' → 'Fa'. Anything unparseable passes
// through untouched so a stray label can never crash a render.
export function displayNote(name: string, style: NoteStyle, language: Language): string {
  if (style === 'letters') return name
  const letter = name.charAt(0).toUpperCase()
  const idx = LETTER_INDEX[letter]
  if (idx === undefined) return name
  return SOLFEGE[language][idx] + name.slice(1)
}
