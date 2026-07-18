// Cross-device sync: the subset of AppState worth persisting server-side
// for subscribers, mirroring what utils/persist.ts already keeps in
// localStorage for everyone. Pure helpers — no network/React here, see
// components/AccountMenu.tsx for the effect that calls these.
import type { AppState } from '../types/music'

export const SYNCED_KEYS = [
  'favorites',
  'practiceStreak',
  'lastPracticeDate',
  'intervalColors',
  'tuningKey',
  'noteStyle',
  'theme',
  'colorTheme',
  'language',
] as const satisfies readonly (keyof AppState)[]

export type SyncedState = Pick<AppState, (typeof SYNCED_KEYS)[number]>

export function pickSyncedState(state: AppState): SyncedState {
  const picked = {} as SyncedState
  for (const key of SYNCED_KEYS) (picked as any)[key] = state[key]
  return picked
}
