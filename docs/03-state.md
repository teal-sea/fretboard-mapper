# 03 · State — the `AppState` contract

This is the most important page for anyone changing behavior or building a layer
that **drives** the app (a concept engine, presets, deep-links, tests). The whole
UI is a pure function of this one object.

## The pattern

```ts
// App.tsx
const [state, setState] = useState<AppState>(initialState)
const up = useCallback((p: Partial<AppState>) => setState(s => ({ ...s, ...p })), [])
```

`up(partial)` is the **only** way state changes. Want the neck to show A Dorian,
position 5, with the m9 arpeggio and the drone running in that key? You don't
navigate a UI — you write the state:

```ts
up({
  keyRoot: 'A',
  keyQuality: 'dorian',
  selectedScaleRoot: 'A',
  selectedScaleKey: 'dorian',
  viewMode: 'scales',
  scalePosition: 5,
})
// audio is imperative, not state:
startDrone(noteIndex('A'), SCALES['dorian'].intervals)
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
| `padLatched` | `boolean` | Whether the chord pad sustains indefinitely when a chord plays. |
| `progression` | `number[]` | Sequence of diatonic degree indices (0–6), duplicates allowed. |
| `progressionIndex` | `number` | Current step (`-1` = stopped). |
| `progressionPlaying` | `boolean` | Stepper running. |
| `progressionBpm` | `number` | 40–200. |
| `progressionBarsPerChord` | `number` | 1, 2, or 4 bars per chord. |

> **Not in `AppState`:** `metronomeOn` and `droneOn` are local `useState` in
> `App.tsx` — they're audio side-effect flags that don't change what's rendered.
> If you add persistence, decide deliberately whether these belong.

## `initialState`

Defaults to **A aeolian** (natural minor), scales view, standard tuning, 15 frets,
dark/obsidian, progression `[0,3,4]` (i–iv–v) at 80 BPM. Full literal at the top
of `App.tsx`.

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
