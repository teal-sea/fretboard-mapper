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

### ⚠️ Neon glow: SVG halo layers, not CSS filters

**iOS Safari silently ignores the CSS `filter` property on SVG elements.**
This shipped as a real bug: every note dot glowed on desktop and rendered
completely flat on actual iPhones, and no desktop-browser or Playwright-WebKit
check caught it. The glow is therefore built from **layered `<circle>` halos**
(r×2 and r×1.4 at low opacity behind each in-position dot) which render
everywhere; the inline `drop-shadow` filter is kept purely as a desktop bonus.
If you add any new glow effect to the neck, build it from SVG shapes first and
treat CSS filters as progressive enhancement — never the other way around.

## `FlowCanvas.tsx` — Flow's ambient particle layer

A full-stage `<canvas>` behind Flow's UI, mounted once per Flow session. Pure
presentation, no theory/audio state — `App.tsx` tells it "a note was heard"
(`pulse: FlowPulse | null`) or "home moved" (`wave: number`, incremented) and
it answers with light: slow ambient dust always drifting (spawns
probabilistically every animation frame so the stage is never dead, even
before the first note), a colored spark burst per note heard (in that note's
interval color), and a firework + shockwave ring when the player lands home.

```ts
<FlowCanvas active={isFlow} pulse={flowPulse} wave={flowWave} homeColor={...} />
```

**Layering note:** `.fretboard-container`'s default background
(`var(--bg-surface)`) is solid, correct for Explore/Modes where readability
against the ghost watermark matters — but the neck fills nearly the whole
stage in Flow and sits at a higher z-index directly over this canvas. If the
particle layer ever looks "broken" or invisible again, check
`.jam-neck .fretboard-container`'s background before touching `FlowCanvas`
itself — the canvas can be running perfectly and still have nowhere visible
to render.

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

## Flow's ear-training games (Find It, Echo) — not components, but a pattern

Live inline in `App.tsx`, selected via `flowJam` (`docs/03-state.md`). Both
"withhold the answer, confirm on a real hit" games (Find It: name a note, hunt
it on the neck; Echo: play back a phrase). If you add a third (Mystery, the
fading-scaffold ramp — see the roadmap), reuse this shape rather than
reinventing it:

1. **Enter/exit effect** — `flowJam === '<mode>' && isPlaying` toggles an
   `<mode>On` boolean and resets score/streak. Mirrors `findItOn`/`echoOn`.
2. **A "generate the next round" effect**, guarded on `<mode>On && <round-state> is empty`
   — fires once when a round is needed, sets the round data. Safe because it
   only re-fires when the round data goes back to empty, not on every render.
3. **A detection effect reacting to `heardMidi`.** Read any progress that
   effect *also writes* through a **ref**, not state — and keep the effect's
   own dependency array to just `[heardMidi, <mode>On]`. Two real bugs shipped
   from getting this wrong: Find It's advance-timer got cancelled by its own
   trigger (setting `findItRevealed` inside an effect that listed
   `findItRevealed` as a dependency re-ran the effect immediately, whose
   cleanup cancelled the just-scheduled timeout), and Echo's mid-phrase
   progress falsely "missed" every phrase past one note (advancing
   `echoPlayedIdx` inside an effect that depended on `echoPlayedIdx` re-ran it
   against the same still-current `heardMidi`, now checked against the *next*
   expected note). Both are the same root cause: **an effect must not list a
   piece of state as a dependency if the effect's own body sets that state and
   the effect also needs to keep running afterward** — the resulting re-entry
   either cancels a timer it just scheduled, or re-checks stale input against
   new expected state. Reading through a ref sidesteps it entirely.
4. **A separate "advance after this round resolves" effect**, keyed only on
   the round's status field (not on the round data). Its `setTimeout` moves to
   the next round or repeats the current one. Keeping this *out* of the
   detection effect is what avoids bug #1 above.
5. **A dedicated `computeFretboard(..., activeNotes, ...)` board** local to the
   mode (`findItBoard`/`echoBoard`), swapped in via the `board` prop at the
   `<Fretboard>` call site — not a new prop on `Fretboard` itself. Pass an
   empty `Set()` to blank the neck while hunting; a non-empty one only to
   confirm a hit (or never, if the mode is ear-only like Echo).

## In-`App.tsx` helper components

`App.tsx` also defines small local components at the bottom: `ToggleSwitch` and
`CollapsibleSection` (used by the settings drawer and advanced panels). Not
exported; keep them there unless reused elsewhere.
