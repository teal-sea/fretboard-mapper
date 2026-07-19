# AppState and Persistence

## The object
`AppState` (`types/music.ts`) has ~53 fields; `initialState` at the top of
App.tsx mirrors it — **adding a field is a mandatory two-file edit**, and a
missing `initialState` default is a runtime `undefined` bug, not a compile
error. Effective initial state is `{ ...initialState, ...loadPersistedState() }`.
Full field tables live in `docs/03-state.md`.

Mutation is `up(partial)` only (a `setState(s => ({...s, ...partial}))`
wrapper). Functional updates that need previous state (progression stepper,
`bumpBpm`) use `setState` directly with the same single object — allowed,
same source of truth.

## What's deliberately NOT in AppState
- **Audio-transport flags** — `droneOn`, `listening`, `metronomeOn`,
  `micError`, `heardMidi`, `micLevel`: local `useState` in App.tsx. The
  "is sound on" truth is split across these locals plus persisted
  `progressionPlaying`; `isPlaying` derives from all of them in `togglePlay`'s
  neighborhood ([[App.tsx and Components]]).
- **Per-round game state** — lives inside [[The Practice Engines]] hooks.
  A game's live progress should not survive a refresh.
- **Separately-persisted progress** — owned sounds (`utils/concepts.ts`, key
  `fm.ownedSounds`), walk claims (`utils/progress.ts`, `mr.progress`),
  favorites/streak (`utils/favorites.ts`, `utils/streak.ts`). Different
  lifecycle, different keys, not AppState.

## The three persistence paths
1. **localStorage** — `utils/persist.ts`, the ONLY file that touches the
   `fm.appState` key. Load-bearing detail: `TRANSIENT_RESET` forces
   `progressionPlaying:false`, `progressionIndex:-1` on load so a reload
   never resurrects a "playing" state with no actual sound. Version stamps
   drop stale palettes/keys. No shape validation (same-origin only, accepted
   risk).
2. **Shareable URLs** — `utils/urlState.ts`. `?key=A&mode=dorian` style.
   Every param is validated against whitelists (`VALID_ROOTS`, `SCALES`,
   `CHORDS`, `APP_MODES`, `LANGUAGES`) before touching state — the
   strongest-validated input path in the app. Keep it that way.
3. **Cloud sync (subscribers)** — `utils/cloudSync.ts` defines `SYNCED_KEYS`
   (favorites, streak, colors, tuning, theme, language…, 9 keys).
   `pickSyncedState` whitelists outgoing; since 2026-07-19
   `pickSyncedPartial` whitelists BOTH what `api/sync.ts` stores and what
   `AccountMenu` merges back on pull — a corrupted row can't poison every
   device. The push/pull dance and its dedupe ref are in
   [[App.tsx and Components]] under AccountMenu.

## Driving the app from code
```ts
up({ keyRoot:'D', keyQuality:'dorian', selectedScaleRoot:'D',
     selectedScaleKey:'dorian', viewMode:'scales',
     selectedChordRoot:null, selectedChordKey:null })
```
That's the whole API. The Walk's `goToPosition` and the Run's `applyTwist`
are canonical examples ([[The Practice Engines]]). See [[The Golden Rules]] #1.
