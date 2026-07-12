import { useState } from 'react'
import { SCALES, getDiatonicChords, getCompatibleScales, noteIndex } from '../utils/musicTheory'
import { playChordPad, chordToMidi } from '../utils/audioEngine'
import type { DiatonicChord } from '../utils/musicTheory'
import type { AppState } from '../types/music'

interface Props {
  state: AppState
  onSelectChord: (root: string, chordKey: string) => void
}

export default function KeyMapView({ state, onSelectChord }: Props) {
  const scale = SCALES[state.keyQuality]
  if (!scale) return <div className="keymap-empty">Select a key first</div>

  const diatonicChords = getDiatonicChords(state.keyRoot, scale)
  const [expandedDeg, setExpandedDeg] = useState<number | null>(null)

  return (
    <div className="keymap">
      <h3 className="keymap-title">
        Key of {state.keyRoot} {scale.name}
      </h3>
      <div className="keymap-grid">
        {diatonicChords.map((degChords, deg) => (
          <DegreeCard
            key={deg}
            degree={deg}
            chords={degChords}
            expanded={expandedDeg === deg}
            onToggle={() => setExpandedDeg(expandedDeg === deg ? null : deg)}
            onSelectChord={onSelectChord}
          />
        ))}
      </div>
    </div>
  )
}

function DegreeCard({ degree, chords, expanded, onToggle, onSelectChord }: {
  degree: number; chords: DiatonicChord[]; expanded: boolean;
  onToggle: () => void; onSelectChord: (root: string, chordKey: string) => void
}) {
  if (chords.length === 0) return null
  const primary = chords[0]

  const handlePlay = (dc: DiatonicChord, e: React.MouseEvent) => {
    e.stopPropagation()
    playChordPad(chordToMidi(noteIndex(dc.root), dc.chordDef.intervals))
  }

  return (
    <div className={`degree-card ${expanded ? 'expanded' : ''}`}>
      <div className="degree-header" onClick={onToggle}>
        <span className="roman">{primary.romanNumeral}</span>
        <span className="chord-name">{primary.fullName}</span>
        <span className="voicing-count">{chords.length} voicing{chords.length > 1 ? 's' : ''}</span>
        <button className="play-btn" title="Play" onClick={e => handlePlay(primary, e)}>▶</button>
      </div>
      {expanded && (
        <div className="degree-voicings">
          {chords.map((dc, i) => (
            <VoicingPill key={i} dc={dc} onSelect={onSelectChord} onPlay={handlePlay} />
          ))}
        </div>
      )}
    </div>
  )
}

function VoicingPill({ dc, onSelect, onPlay }: {
  dc: DiatonicChord;
  onSelect: (root: string, chordKey: string) => void;
  onPlay: (dc: DiatonicChord, e: React.MouseEvent) => void
}) {
  const [showScales, setShowScales] = useState(false)
  const compatibleScales = showScales ? getCompatibleScales(dc.root, dc.chordDef) : []

  return (
    <div className="voicing-pill-wrap">
      <div className="voicing-pill">
        <button className="voicing-name" onClick={() => onSelect(dc.root, dc.chordKey)}>
          {dc.fullName}
        </button>
        <button className="play-btn small" onClick={e => onPlay(dc, e)} title="Play">▶</button>
        <button className="scales-toggle" onClick={() => setShowScales(!showScales)}>
          {showScales ? '▾' : '▸'} scales
        </button>
      </div>
      {showScales && compatibleScales.length > 0 && (
        <div className="compatible-scales">
          {compatibleScales.map(s => <span key={s.key} className="scale-tag">{s.name}</span>)}
        </div>
      )}
    </div>
  )
}
