// ─── Progress ───────────────────────────────────────────────────────
// What you've earned, kept between sessions.
//
// A collection mechanic that forgets you is not a collection mechanic. Claiming
// four modes and then losing them because you closed a tab is the fastest way
// to make someone stop caring. Everything you earn here is permanent.
//
// Claims are keyed by the SCALE FAMILY, not by the key you happened to enter it
// from — because A Aeolian and C Ionian are the same seven notes, so walking
// "A minor" and walking "C major" are the same walk. Claiming D Dorian counts
// whether you arrived from A minor or from C major.

import { SCALES, getScaleNotes } from './musicTheory'

export interface Progress {
  version: number
  claims: Record<string, string[]>   // familyId → tonics claimed
  completed: string[]                // families walked end to end
}

const STORAGE_KEY = 'mr.progress'
const VERSION = 1

// ─── Storage ───
// Do NOT assume localStorage works. It can be missing, blocked (private mode,
// embedded webview, cross-origin iframe), full, or — as in our own test env —
// present but with setItem not actually being a function.
//
// Swallowing that failure silently is how you lose someone's progress without
// ever finding out. So: probe it once, and if it's unusable, fall back to an
// in-memory store. Progress then survives the session even if it can't survive
// the tab. Never a crash, never a silent black hole.
interface Store {
  getItem(k: string): string | null
  setItem(k: string, v: string): void
  removeItem(k: string): void
}

function memoryStore(): Store {
  const m = new Map<string, string>()
  return {
    getItem: k => (m.has(k) ? m.get(k)! : null),
    setItem: (k, v) => { m.set(k, v) },
    removeItem: k => { m.delete(k) },
  }
}

const FALLBACK = memoryStore()
let resolved: Store | null = null

function store(): Store {
  if (resolved) return resolved
  try {
    const ls = (globalThis as { localStorage?: Store }).localStorage
    if (
      ls &&
      typeof ls.setItem === 'function' &&
      typeof ls.getItem === 'function' &&
      typeof ls.removeItem === 'function'
    ) {
      // Prove it actually round-trips before trusting it with anything.
      const probe = '__mr_probe__'
      ls.setItem(probe, '1')
      const ok = ls.getItem(probe) === '1'
      ls.removeItem(probe)
      if (ok) {
        resolved = ls
        return resolved
      }
    }
  } catch {
    // fall through
  }
  resolved = FALLBACK
  return resolved
}

// Tests and the app both benefit from being able to see which one we got.
export function storageIsPersistent(): boolean {
  return store() !== FALLBACK
}

// Two scales are the same family if they are the same set of notes.
// A Aeolian and C Ionian collapse to one id, which is the entire point.
export function familyId(root: string, scaleKey: string): string {
  const scale = SCALES[scaleKey]
  if (!scale) return `${root}-${scaleKey}`
  return [...getScaleNotes(root, scale)].sort((a, b) => a - b).join('.')
}

function empty(): Progress {
  return { version: VERSION, claims: {}, completed: [] }
}

export function loadProgress(): Progress {
  try {
    const raw = store().getItem(STORAGE_KEY)
    if (!raw) return empty()
    const p = JSON.parse(raw) as Progress
    if (!p || p.version !== VERSION || typeof p.claims !== 'object') return empty()
    return { version: VERSION, claims: p.claims ?? {}, completed: p.completed ?? [] }
  } catch {
    return empty() // corrupt payload — start clean rather than crash
  }
}

export function saveProgress(p: Progress): void {
  try {
    store().setItem(STORAGE_KEY, JSON.stringify(p))
  } catch {
    // A full quota must never break the app mid-session.
  }
}

export function getClaims(family: string): string[] {
  return loadProgress().claims[family] ?? []
}

// Earn a mode. Idempotent — you cannot claim the same one twice, and nothing
// can ever take one away.
export function claimMode(family: string, tonic: string): Progress {
  const p = loadProgress()
  const current = p.claims[family] ?? []
  if (current.includes(tonic)) return p

  const next: Progress = {
    ...p,
    claims: { ...p.claims, [family]: [...current, tonic] },
  }
  saveProgress(next)
  return next
}

export function markCompleted(family: string): Progress {
  const p = loadProgress()
  if (p.completed.includes(family)) return p
  const next: Progress = { ...p, completed: [...p.completed, family] }
  saveProgress(next)
  return next
}

export function isCompleted(family: string): boolean {
  return loadProgress().completed.includes(family)
}

// Every mode you own, across every key you've walked. This is the number that
// should only ever go up.
export function totalClaimed(): number {
  const p = loadProgress()
  return Object.values(p.claims).reduce((n, list) => n + list.length, 0)
}

export function keysWalked(): number {
  return loadProgress().completed.length
}

export function resetProgress(): void {
  try {
    store().removeItem(STORAGE_KEY)
  } catch {
    // no-op
  }
}
