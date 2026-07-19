# App.tsx and Components

## App.tsx (2,545 lines post-refactor, was 3,184)
Still the shell on purpose: holds AppState + `up()`, ~150 hooks of derived
state and wiring, and the three-stage render. Rough map:

- **Top**: constants (`HARMONY_ROWS`, `MINOR_QUALITIES`, `initialState`),
  persist/URL-sync effects, i18n (`T`, `dn`, `noteMap`, `tuningLabels`).
- **Derived theory memos**: `diatonicChords`, `harmonyGrid`, `activeNotes` →
  `board` (deps deliberately narrowed to the fields read — don't widen back
  to `[state]`), `scalePositions`, `chordVoicings`, `techniquePositions`.
- **The transport block** (~600–1000): progression stepper
  (`advanceProgression` via functional `setState`, timer ref), local audio
  flags, drone knobs, the backing effect, `togglePlay`, mic poll, tuner.
  **Deliberately not extracted** — one coupled unit, zero test coverage,
  regressions inaudible to CI ([[hot]]). It coordinates [[The Audio Engine]]
  and [[Mic and Pitch Detection]].
- **Hook calls**: [[The Practice Engines]] + flow drift/session bookkeeping.
- **Render helpers** (the file's dedupe idiom): `renderBackingControls`,
  `renderPlayButton`, `renderHeardNote`, `bumpBpm`. Add the 4th shared
  transport widget HERE, not as a copy-paste.
- **Render**: Learn stage, Flow stage, Study stage, tuner overlay,
  `<SettingsDrawer/>`, `<Veils/>`.

Merge hotspots if two agents work in parallel: `togglePlay`, the backing
effect, `initialState`+`AppState` (paired edit), the top constants block.

## Components
- **Fretboard.tsx** — the neck. SVG, viewBox-scaled, ResizeObserver,
  auto-scrolls highlighted positions into view on phones. 21 props, 5 render
  modes (normal/overlay/technique/run/focus). **`React.memo`'d** since
  2026-07-19 — keep its props referentially stable (that's why `tuningLabels`
  is memoized in App). Known gap: no SVG text alternative ([[hot]]).
- **FlowCanvas.tsx** — Flow's particle layer. Correct rAF/ResizeObserver
  cleanup; bursts keyed by `pulse.id`. Ignores `prefers-reduced-motion`
  ([[hot]]). If particles look "broken", check
  `.jam-neck .fretboard-container` background before touching the canvas.
- **SettingsDrawer.tsx** — pure state-in/`up()`-out prefs slide-over;
  `THEME_OPTIONS` lives with it. Uses **controls.tsx** (`ToggleSwitch`,
  `DrawerSlider`, `CollapsibleSection` — the last also used by Study's
  advanced panel).
- **Veils.tsx** — upgrade thank-you (closes on a resolved chord in the
  user's key — rule 6), desktop nudge (owns its once-ever localStorage state),
  intro. App keeps the audio payoff + `onboarded` writes.
- **AccountMenu.tsx** — Clerk-gated (mounted only when
  `VITE_CLERK_PUBLISHABLE_KEY` set); login/upgrade/portal buttons AND the
  cloud-sync effect. Sync mechanics: pull once per subscribed session
  (re-whitelisted via `pickSyncedPartial`), debounced 1.5 s push, and a
  **serverState ref** that skips pushing what the server already has — this
  replaced a consumed-once `justPulled` boolean that could swallow the first
  edit after a pull. Post-checkout it polls Clerk until the webhook flips
  `subscribed`.

## Styling
One file: `src/styles/index.css` (3,449 lines post-prune). CSS variables on
`:root`, theme classes (`.app.dark/.light` + color themes), box-drawing
section banners, flat class-based specificity (4 `!important` total). The
root div builds classes dynamically (`mode-${appMode}`, theme names) — grep
before declaring a selector dead; the 2026-07-19 prune already removed the
truly dead generation.
