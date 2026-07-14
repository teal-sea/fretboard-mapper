# 03 · State — the `AppState` contract

This is the most important page for anyone changing behavior or building a layer
that **drives** the app (a concept engine, presets, deep-links, tests). The whole
UI is a pure function of this one object.

## The pattern

```ts
// App.tsx
const [state, setState] = useState<AppState>(() => ({ ...initialState, ...loadPersistedState() }))
const up = useCallback((p: Partial<AppState>) => setState(s => ({ ...s, ...p })), [])
```

`up(partial)` is the **only** way state changes. State **persists to
localStorage** (`utils/persist.ts`) via a `useEffect` on every change and is
merged over `initialState` on load.

Want the neck to show A Dorian, position 5, with the backing sound in that key?
You don't navigate a UI — you write the state:

```ts
up({
  keyRoot: 'A',
  keyQuality: 'dorian',
  selectedScaleRoot: 'A',
  selectedScaleKey: 'dorian',
  viewMode: 'scales',
  scalePosition: 5,
})
// The backing sound follows automatically: a useEffect on `droneTuning`
// retunes whatever is playing. Whether anything plays at all is the local
// `droneOn` flag, driven by the unified Play button (togglePlay), which
// starts the selected backing mode AND the mic together.
```

Everything re-derives. This is the seam every future feature plugs into.

## The full contract

Defined in `src/types/music.ts`. Fields grouped by role. **Bold** = the ones a
driving layer will most often set.

### Key selection (the harmonic center)
| Field | Type | Meaning |
|---|---|---|
| **`keyRoot`** | `string` | Tonic note name, e.g. `'A'`. |
| **`keyQuality`** | `string` | Key's mode id — `'ionian'` (major), `'aeolian'` (natural minor), `'harmonic_minor'`, `'melodic_minor'`, or any `SCALES` key. Drives the diatonic harmony. |

### What's drawn on the neck
| Field | Type | Meaning |
|---|---|---|
| **`viewMode`** | `'chords' \| 'scales'` | Whether a chord is overlaid on the scale, or just the scale. |
| `selectedChordRoot` | `string \| null` | Root of the highlighted chord (chord view). |
| `selectedChordKey` | `string \| null` | Key into `CHORDS` for the highlighted chord. |
| **`selectedScaleRoot`** | `string \| null` | Root of the displayed scale (falls back to `keyRoot`). |
| **`selectedScaleKey`** | `string \| null` | Key into `SCALES` for the displayed scale (falls back to `keyQuality`). |

> **Invariant:** the neck always shows *a scale*; a selected chord is *overlaid*
> as chord tones. Deselecting a chord (`selectedChord* = null`, `viewMode:'scales'`)
> returns to the pure scale. See the `activeNotes` `useMemo` in `App.tsx`.

### App shell: Study vs Learn vs Flow
| Field | Type | Meaning |
|---|---|---|
| **`appMode`** | `'study' \| 'learn' \| 'flow'` | `'study'` = the full mapper. `'learn'` = the guided concept drills (this mode was *called* "flow" before a real Flow existed — its CSS classes are still `.flow-*`). `'flow'` = the endless jam: hit Play, improvise, home evolves underneath you via sibling modes (`utils/flowEngine.ts` + `FlowCanvas` particles), no tasks, no fail state. |
| **`conceptId`** | `string \| null` | Active Learn concept (key into `CONCEPTS` in `utils/concepts.ts`). `applyConcept()` writes a whole `up()` partial from it. |
| `flowEvolve` | `'static' \| 'diatonic' \| 'custom'` | How Flow's backing evolves: stay put, drift through sibling modes, or follow `flowChords`. |
| `flowChords` | `number[]` | Custom evolution order — diatonic degree indices, duplicates allowed. |
| `flowPaceSec` | `number` | Seconds between evolution steps (60/120/240 in the UI). |
| `showTheory` | `boolean` | Theory layer visibility. |
| `onboarded` | `boolean` | First-run intro dismissed (persisted). |

### View / technique mode
| Field | Type | Meaning |
|---|---|---|
| **`activeTab`** | `'explore' \| 'technique'` | `'technique'` swaps the board to a technique-pattern overlay. |
| `techniqueMode` | `'3nps' \| 'arpeggios' \| 'tapping'` | Which technique generator (`arpeggios` = sweep). |
| `selectedPattern` | `number` | 0-based pattern index: 3NPS = scale-degree start; arps/tapping = diatonic-degree index. |
| `advancedMode` | `boolean` | Reveals the advanced panel (practice / technique / harmony map). |

### Fretboard display
| Field | Type | Meaning |
|---|---|---|
| `tuningKey` | `string` | Key into `TUNINGS`. |
| **`scalePosition`** | `number \| null` | 1-based CAGED position window; `null` = whole neck. |
| **`chordPosition`** | `number \| null` | 1-based index into `getChordVoicings` — isolates one playable grip of the selected chord; `null` = the normal chord-over-scale view. Reset to `null` when the chord changes. |
| `zoomToPosition` | `boolean` | Crop the SVG to the active position. |
| `numFrets` | `number` | Frets rendered (12–24). |
| `fretRange` | `[number,number] \| null` | Visible fret window `[lo,hi]`; `null` = whole neck. |
| `showNoteNames` / `showIntervals` | `boolean` | Note-dot labels. Both true = `'both'`; derived into `displayMode`. |
| `highlightRoot` | `boolean` | Emphasize root notes. |
| `showLeftHanded` | `boolean` | Mirror the neck. |
| `inlayStyle` | `'dots' \| 'blocks' \| 'none'` | Inlay style. |
| `guitarModel` | `'strat' \| 'lespaul'` | Scale length + string spacing. |
| `intervalColors` | `Record<string,string>` | Interval-label → color (defaults from `defaultColors.ts`). |
| `theme` | `'dark' \| 'light'` | Light/dark. |
| `colorTheme` | `'obsidian'\|'midnight'\|'ember'\|'vapor'\|'sage'` | Accent palette (CSS class). |

### Audio / progression stepper
| Field | Type | Meaning |
|---|---|---|
| **`backingMode`** | `'drone' \| 'chord' \| 'arp'` | What Play triggers underneath the mode: a pedal-tone drone, the mode's parent chord held on the pad, or that chord arpeggiated at `progressionBpm`. The chord comes from the concept's `chordKey` (Flow) or `chordIntervalsForScale` (Study). Kept as a list (`BACKING_MODES`) so a 4th option is a one-line add. |
| `droneVolume` / `droneSpread` / `droneTone` | `number` | Drone sound-design knobs (0–3 / 0–1.5 / 0–1); synced to the engine via `useEffect`s. Settings → DRONE. |
| `padVolume` / `padSpread` / `padTone` | `number` | Same for the pad (the arpeggiator reuses these). Settings → PAD. |
| `padLatched` | `boolean` | Whether the chord pad sustains indefinitely when a chord plays. |
| `progression` | `number[]` | Sequence of diatonic degree indices (0–6), duplicates allowed. |
| `progressionIndex` | `number` | Current step (`-1` = stopped). |
| `progressionPlaying` | `boolean` | Stepper running. |
| `progressionBpm` | `number` | 40–200. Also the arpeggiator's tempo. |
| `progressionBarsPerChord` | `number` | 1, 2, or 4 bars per chord. |

> **Not in `AppState`:** `droneOn`, `listening`, `metronomeOn`, `micError`,
> `heardMidi`, `micLevel`, and the Flow-session ephemera (`focusFound`,
> `walkState`, `runState`, `collectionOpen`…) are local `useState` in `App.tsx`
> — side-effect flags and per-session game state that shouldn't persist.
> Separately-persisted progress lives in `utils/concepts.ts` (`fm.ownedSounds`)
> and `utils/progress.ts` (`mr.progress`), not in `AppState`.

## `initialState`

Defaults to **A aeolian** (natural minor), scales view, standard tuning, 15 frets,
dark theme, backing mode `'drone'`, progression `[0,3,4]` (i–iv–v) at 80 BPM.
Full literal at the top of `App.tsx` — but remember the *effective* initial
state is `{ ...initialState, ...loadPersistedState() }`.

## Recipes for driving the app

**Show a mode in a position:**
```ts
up({ keyRoot:'D', keyQuality:'dorian', selectedScaleRoot:'D',
     selectedScaleKey:'dorian', viewMode:'scales', scalePosition:2 })
```
**Highlight a diatonic chord over its scale:** use the computed `DiatonicChord`
(from `getDiatonicChords`) so the chord is guaranteed in-key:
```ts
up({ selectedChordRoot: dc.root, selectedChordKey: dc.chordKey, viewMode:'chords' })
```
**Switch to a sweep arpeggio on degree ii:**
```ts
up({ activeTab:'technique', techniqueMode:'arpeggios', selectedPattern:1 })
```
**Load a whole "concept" at once** — one `up()` can set key, scale, position, and
technique together; the board and labels reconcile in a single render.

## Rules for changing state shape

- Add fields to the `AppState` interface in `types/music.ts` **and** to
  `initialState` in `App.tsx` (a missing default = `undefined` bugs).
- Never store derived data in `AppState` (positions, note sets, labels are all
  `useMemo`d). If you're tempted to cache a computed value in state, memoize
  instead.
- Keep new mutation flowing through `up()`. Don't introduce a second `useState`
  for board-affecting data.
