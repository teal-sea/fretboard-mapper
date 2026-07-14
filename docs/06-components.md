# 06 · Components

## `Fretboard.tsx` — the neck renderer (default export)

Renders a **single responsive inline `<svg>`** (the board is all SVG, not divs;
it's wrapped in `.fretboard-container` → `.fretboard-viewport`). It measures its
container with a `ResizeObserver` and computes a `scaleLength` so the neck fills
the width, using **12-TET fret spacing** (`scaleLength - scaleLength/2^(i/12)`).
`<defs>` hold gradients (ebony board, fret wire, bone nut, wound/plain strings)
and a blur glow filter.

It's a **pure presentational component** — all inputs are props; it holds no
domain state (only `containerWidth` from the observer).

### Props

| Prop | Type | Purpose |
|---|---|---|
| `board` | `FretNote[][]` | The `[string][fret]` grid from `computeFretboard`. The data drawn. |
| `displayMode` | `'notes'\|'intervals'\|'both'` | Note-dot labels. |
| `inlayStyle` | `'dots'\|'blocks'\|'none'` | Position-marker style. |
| `intervalColors` | `Record<string,string>` | Interval label → CSS color for dots. |
| `highlightRoot` | `boolean` | White stroke + halo on roots. |
| `showLeftHanded` | `boolean` | Mirror horizontally (`scaleX(-1)`), text counter-flipped. |
| `posRange` | `[number,number] \| null` | Active position window; outside notes ghosted; drives the highlight rect. |
| `numFrets?` | `number` (15) | Frets rendered. |
| `fretRange?` | `[number,number] \| null` | Crop the viewBox to a fret window. |
| `tuningLabels` | `string[]` | Open-string labels left of the nut. |
| `guitarModel?` | `'strat'\|'lespaul'` | Scale length (25.5"/24.75") + string spacing (40/38). |
| `zoomToPosition?` | `boolean` | With `posRange`, crop viewBox to that position. |
| `chordToneNotes?` | `Set<number> \| null` | Chord-tone pitch classes → chord-tone overlay mode. |
| `chordRootIndex?` | `number \| null` | Chord root pitch class → relabels dots with chord-relative intervals. |
| `highlightedPositions?` | `Set<string> \| null` | `"stringIndex-fret"` keys → technique overlay mode. Also how a selected **chord grip** (`getChordVoicings` + `chordPosition`) renders. |
| `nextChordToneNotes?` | `Set<number> \| null` | Next chord's tones as dashed anticipation rings. |
| `heardMidi?` | `number \| null` | Live mic pitch — every location producing that pitch gets a "heard" ring (white = in scale, red = off the map). |
| `focusInterval?` / `focusColor?` | `string \| null` / `string` | Flow mode — the hunted interval burns, everything else recedes (light, not grey paint). |
| `runNotes?` | `RunNoteMark[] \| null` | Run player — numbered steps (`done/current/todo`) walking the player through an arpeggio. |

### Mutually-exclusive note-render modes (chosen by props, in code precedence order)
1. **Chord-tone overlay** (`chordToneNotes` set) — chord tones glow, other scale
   notes fade to passing tones; optional dashed `nextChordToneNotes` rings.
   Because this outranks the technique overlay, `App.tsx` **suppresses it when
   a grip is selected** so the voicing can render instead.
2. **Technique overlay** (`highlightedPositions` set) — only those `string-fret`
   cells highlighted, everything else dimmed. Used by 3NPS/sweep/tapping AND
   chord-grip browsing.
3. **Run mode** (`runNotes` set) — numbered walkthrough.
4. **Focus mode** (`focusInterval` set) — Flow's one-instruction neck.
5. **Normal** — all in-scale notes, roots emphasized.

`viewBox` is swapped dynamically for zoom-to-position or fret-window cropping.
Fret numbers are drawn as `<text>` along the bottom.

## `KeyMapView.tsx` — ⚠️ currently dead code

A functional alternate "Key Map" view, **not imported or mounted anywhere** (grep
confirms: the only reference is its own declaration). It's wired to real APIs, so
it works if adopted — but don't assume it's live.

```ts
function KeyMapView({ state, onSelectChord }: {
  state: AppState
  onSelectChord: (root: string, chordKey: string) => void
}): JSX.Element
```
Reads `SCALES[state.keyQuality]`, calls `getDiatonicChords(state.keyRoot, scale)`,
and renders one expandable `DegreeCard` per degree — showing the primary
(`inner[0]`) chord's Roman numeral, name, voicing count, and a play button; when
expanded, lists all voicings as `VoicingPill`s that can select/play the chord or
reveal `getCompatibleScales(...)` tags. `DegreeCard`/`VoicingPill` are in-file,
not exported.

**Decision pending:** adopt it as an alternate view (toggle via an `AppState`
field) or delete it. See [08-roadmap](08-roadmap.md). Leaving dead code around
misleads future readers.

## In-`App.tsx` helper components

`App.tsx` also defines small local components at the bottom: `ToggleSwitch` and
`CollapsibleSection` (used by the settings drawer and advanced panels). Not
exported; keep them there unless reused elsewhere.
