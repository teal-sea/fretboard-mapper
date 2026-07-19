// ─── Settings drawer ───
// The slide-over for global prefs (theme, tuning, frets, display toggles,
// mic, drone/pad voicing, interval colors). Pure state-in / up()-out — it
// owns nothing; every change goes through the single AppState updater.
import type { AppState } from '../types/music'
import { TUNINGS } from '../utils/musicTheory'
import { DEFAULT_INTERVAL_COLORS, ALL_INTERVALS } from '../utils/defaultColors'
import { ToggleSwitch, DrawerSlider, CollapsibleSection } from './controls'

const THEME_OPTIONS: { key: AppState['colorTheme']; label: string; accent: string }[] = [
  { key: 'obsidian', label: 'Obsidian', accent: '#d4a017' },
  { key: 'midnight', label: 'Midnight', accent: '#5b8def' },
  { key: 'ember', label: 'Ember', accent: '#e07830' },
  { key: 'vapor', label: 'Vapor', accent: '#d050a0' },
  { key: 'sage', label: 'Sage', accent: '#40b870' },
]

export default function SettingsDrawer({ open, onClose, state, up, T }: {
  open: boolean
  onClose: () => void
  state: AppState
  up: (partial: Partial<AppState>) => void
  T: (s: string) => string
}) {
  return (
    <>
      <div className={`settings-drawer ${open ? 'open' : ''}`}>
        <div className="drawer-header">
          <span className="drawer-title">{T('Settings')}</span>
          <button className="drawer-close" onClick={onClose} aria-label="Close settings">&times;</button>
        </div>
        <div className="drawer-body">
          <div className="drawer-section">
            <span className="drawer-label">THEME</span>
            <select className="type-select" value={state.colorTheme} aria-label="Color theme"
              onChange={e => up({ colorTheme: e.target.value as AppState['colorTheme'] })}>
              {THEME_OPTIONS.map(t => (
                <option key={t.key} value={t.key}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="drawer-section">
            <div className="drawer-row">
              {/* Guitar-model choice retired — the Les Paul render wasn't
                  earning its select. guitarModel stays in AppState pinned to
                  'strat'; the renderer still supports both if it returns. */}
              <div className="drawer-half">
                <span className="drawer-label">{T('TUNING')}</span>
                <select className="type-select" value={state.tuningKey} aria-label="Tuning"
                  onChange={e => up({ tuningKey: e.target.value })}>
                  {Object.entries(TUNINGS).map(([key, t]) => (
                    <option key={key} value={key}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="drawer-section">
            <div className="drawer-row">
              <div className="drawer-half">
                <span className="drawer-label">FRETS</span>
                <select className="type-select" value={state.numFrets} aria-label="Number of frets"
                  onChange={e => up({ numFrets: Number(e.target.value) })}>
                  {[12, 15, 17, 19, 21, 24].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="drawer-half">
                <span className="drawer-label">INLAYS</span>
                <select className="type-select" value={state.inlayStyle} aria-label="Fretboard inlay style"
                  onChange={e => up({ inlayStyle: e.target.value as AppState['inlayStyle'] })}>
                  <option value="dots">Dots</option>
                  <option value="blocks">Blocks</option>
                  <option value="none">None</option>
                </select>
              </div>
            </div>
          </div>

          <div className="drawer-section">
            <span className="drawer-label">DISPLAY</span>
            <ToggleSwitch label="Note Names" on={state.showNoteNames} toggle={() => up({ showNoteNames: !state.showNoteNames })} />
            <ToggleSwitch label="Intervals" on={state.showIntervals} toggle={() => up({ showIntervals: !state.showIntervals })} />
            <ToggleSwitch label="Highlight Root" on={state.highlightRoot} toggle={() => up({ highlightRoot: !state.highlightRoot })} />
            <ToggleSwitch label="Left-Handed" on={state.showLeftHanded} toggle={() => up({ showLeftHanded: !state.showLeftHanded })} />
          </div>

          <div className="drawer-section">
            <span className="drawer-label">{T('MICROPHONE')}</span>
            <ToggleSwitch label={T('Echo Cancellation')} on={state.micEchoCancellation} toggle={() => up({ micEchoCancellation: !state.micEchoCancellation })} />
            <p className="drawer-hint">
              {T('On by default for laptop mic + laptop speakers, to cancel the backing sound bleeding back in. Turn this OFF if you’re on an audio interface or a mic’d amp — echo cancellation has nothing real to cancel there and can make notes cut in and out. Stop and restart Listen/Play after changing this.')}
            </p>
          </div>

          <div className="drawer-section">
            <span className="drawer-label">{T('DRONE')}</span>
            <DrawerSlider
              label={T('Volume')} value={state.droneVolume} max={3}
              onChange={v => up({ droneVolume: v })}
            />
            <DrawerSlider
              label={T('Spread')} value={state.droneSpread} max={1.5}
              onChange={v => up({ droneSpread: v })}
            />
            <DrawerSlider
              label={T('Tone')} value={state.droneTone} max={1}
              onChange={v => up({ droneTone: v })}
            />
          </div>

          <div className="drawer-section">
            <span className="drawer-label">PAD</span>
            <DrawerSlider
              label={T('Volume')} value={state.padVolume} max={3}
              onChange={v => up({ padVolume: v })}
            />
            <DrawerSlider
              label={T('Spread')} value={state.padSpread} max={1.5}
              onChange={v => up({ padSpread: v })}
            />
            <DrawerSlider
              label={T('Tone')} value={state.padTone} max={1}
              onChange={v => up({ padTone: v })}
            />
          </div>

          <CollapsibleSection title="COLORS">
            <div className="drawer-section">
              <div className="color-header">
                <button className="reset-btn" onClick={() => up({ intervalColors: { ...DEFAULT_INTERVAL_COLORS } })}>&#8634; Reset</button>
              </div>
              <div className="color-grid">
                {ALL_INTERVALS.map(iv => (
                  <label key={iv} className="color-swatch" title={iv}>
                    <input type="color" value={state.intervalColors[iv] || '#888'}
                      onChange={e => up({ intervalColors: { ...state.intervalColors, [iv]: e.target.value } })} />
                    <span className="swatch-fill" style={{ background: state.intervalColors[iv] || '#888' }} />
                  </label>
                ))}
              </div>
            </div>
          </CollapsibleSection>
        </div>
      </div>
      <div
        className={`drawer-overlay ${open ? 'open' : ''}`}
        onClick={onClose}
      />
    </>
  )
}
