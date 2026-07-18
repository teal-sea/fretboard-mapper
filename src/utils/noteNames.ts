// ─── Note naming: letters vs fixed-do solfège ────────────────────────
// The engine speaks letters internally (C, C#, Db…) — forever. This module
// is DISPLAY ONLY: it converts a letter spelling to what the user's language
// actually calls that note. Fixed-do languages name notes Do Re Mi Fa Sol
// La Si (in their own script — До Ре Ми in Cyrillic, ドレミ in katakana);
// Germanic/Slavic letter languages call B "H" (and Bb "B"). English
// defaults to letters but can opt into solfège too.

export type Language =
  | 'en' | 'es' | 'fr' | 'it' | 'pt'
  | 'de' | 'nl' | 'pl' | 'ru' | 'uk' | 'tr'
  | 'ja' | 'ko' | 'zh' | 'vi' | 'id' | 'hi'
export type NoteStyle = 'letters' | 'solfege'

export const LANGUAGES: { key: Language; label: string; defaultStyle: NoteStyle }[] = [
  { key: 'en', label: 'English', defaultStyle: 'letters' },
  { key: 'es', label: 'Español', defaultStyle: 'solfege' },
  { key: 'fr', label: 'Français', defaultStyle: 'solfege' },
  { key: 'it', label: 'Italiano', defaultStyle: 'solfege' },
  { key: 'pt', label: 'Português', defaultStyle: 'solfege' },
  { key: 'de', label: 'Deutsch', defaultStyle: 'letters' },
  { key: 'nl', label: 'Nederlands', defaultStyle: 'letters' },
  { key: 'pl', label: 'Polski', defaultStyle: 'letters' },
  { key: 'ru', label: 'Русский', defaultStyle: 'solfege' },
  { key: 'uk', label: 'Українська', defaultStyle: 'solfege' },
  { key: 'tr', label: 'Türkçe', defaultStyle: 'solfege' },
  { key: 'ja', label: '日本語', defaultStyle: 'solfege' },
  { key: 'ko', label: '한국어', defaultStyle: 'solfege' },
  { key: 'zh', label: '中文', defaultStyle: 'letters' },
  { key: 'vi', label: 'Tiếng Việt', defaultStyle: 'solfege' },
  { key: 'id', label: 'Bahasa Indonesia', defaultStyle: 'letters' },
  { key: 'hi', label: 'हिन्दी', defaultStyle: 'letters' },
]

// C D E F G A B, in each language's spelling (accents matter — Ré is not Re
// to a French reader, Dó/Fá/Lá carry accents in Portuguese; Cyrillic and
// CJK languages write solfège in their own script).
const SOLFEGE: Record<Language, string[]> = {
  en: ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'],
  es: ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'],
  fr: ['Do', 'Ré', 'Mi', 'Fa', 'Sol', 'La', 'Si'],
  it: ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'],
  pt: ['Dó', 'Ré', 'Mi', 'Fá', 'Sol', 'Lá', 'Si'],
  de: ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'],
  nl: ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'],
  pl: ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'],
  ru: ['До', 'Ре', 'Ми', 'Фа', 'Соль', 'Ля', 'Си'],
  uk: ['До', 'Ре', 'Мі', 'Фа', 'Соль', 'Ля', 'Сі'],
  tr: ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'],
  ja: ['ド', 'レ', 'ミ', 'ファ', 'ソ', 'ラ', 'シ'],
  ko: ['도', '레', '미', '파', '솔', '라', '시'],
  zh: ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'],
  vi: ['Đô', 'Rê', 'Mi', 'Fa', 'Sol', 'La', 'Si'],
  id: ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'],
  hi: ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'],
}

// German-convention letter languages: B is written H, and Bb is written B.
// (German, Dutch in classical usage, Polish. Dutch pop usage is drifting
// toward international B, but H is what method books teach.)
const GERMAN_B = new Set<Language>(['de', 'pl'])

const LETTER_INDEX: Record<string, number> = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 }

// 'C#' → 'Do#', 'Eb' → 'Mib', 'F' → 'Fa'. Anything unparseable passes
// through untouched so a stray label can never crash a render.
export function displayNote(name: string, style: NoteStyle, language: Language): string {
  const letter = name.charAt(0).toUpperCase()
  const idx = LETTER_INDEX[letter]
  if (idx === undefined) return name
  if (style === 'letters') {
    if (GERMAN_B.has(language) && letter === 'B') {
      // B → H, Bb → B, B# stays theoretical enough to leave as H#.
      return name.slice(1) === 'b' ? 'B' : 'H' + name.slice(1)
    }
    return name
  }
  return SOLFEGE[language][idx] + name.slice(1)
}
