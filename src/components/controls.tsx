// ─── Small shared controls ───
// Dumb presentational widgets used by the Settings drawer and the Study
// advanced panel. No app state — everything comes in through props.
import { useState } from 'react'

export function ToggleSwitch({ label, on, toggle }: { label: string; on: boolean; toggle: () => void }) {
  return (
    <div className="switch-row" onClick={toggle}>
      <span>{label}</span>
      <div className={`switch-track ${on ? 'on' : ''}`}>
        <div className="switch-thumb" />
      </div>
    </div>
  )
}

export function DrawerSlider({ label, value, max, onChange }: {
  label: string; value: number; max: number; onChange: (v: number) => void
}) {
  return (
    <div className="slider-row">
      <span className="slider-row-label">{label}</span>
      <input
        className="slider"
        type="range"
        min={0}
        max={max}
        step={0.01}
        value={value}
        aria-label={label}
        onChange={e => onChange(Number(e.target.value))}
      />
      <span className="slider-row-value">{Math.round((value / max) * 100)}%</span>
    </div>
  )
}

export function CollapsibleSection({ title, children, variant = 'default' }: {
  title: string; children: React.ReactNode; variant?: 'default' | 'panel'
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`collapsible ${open ? 'open' : ''} collapsible-${variant}`}>
      <button className="collapsible-header" onClick={() => setOpen(!open)}>
        <span className="collapsible-arrow">{open ? '▾' : '▸'}</span>
        <span className="collapsible-title">{title}</span>
      </button>
      <div className="collapsible-body">
        <div className="collapsible-inner">
          {children}
        </div>
      </div>
    </div>
  )
}
