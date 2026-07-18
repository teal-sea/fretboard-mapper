// ─── Batch-two languages ─────────────────────────────────────────────
// The original four (es/fr/it/pt) live inline in i18n.ts/i18nContent.ts,
// keyed English-string → per-language entry. Every language added since
// gets its own file here instead: one flat Record<englishKey, translation>
// per language, merged into t() ahead of the inline tables. Missing key →
// English fallback, same as always.

import type { Language } from '../noteNames'
import { de } from './de'
import { nl } from './nl'
import { pl } from './pl'
import { ru } from './ru'
import { uk } from './uk'
import { tr } from './tr'
import { ja } from './ja'
import { ko } from './ko'
import { zh } from './zh'
import { vi } from './vi'
import { id } from './id'
import { hi } from './hi'

export const EXTRA: Partial<Record<Language, Record<string, string>>> = {
  de, nl, pl, ru, uk, tr, ja, ko, zh, vi, id, hi,
}
