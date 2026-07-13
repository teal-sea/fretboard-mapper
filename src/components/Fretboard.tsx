import { useMemo, useRef, useEffect, useState } from 'react'
import type { FretNote, DisplayMode, InlayStyle, GuitarModel } from '../types/music'
import { intervalName } from '../utils/musicTheory'

interface Props {
  board: FretNote[][]
  displayMode: DisplayMode
  inlayStyle: InlayStyle
  intervalColors: Record<string, string>
  highlightRoot: boolean
  showLeftHanded: boolean
  posRange: [number, number] | null
  numFrets?: number
  fretRange?: [number, number] | null
  tuningLabels: string[]
  guitarModel?: GuitarModel
  zoomToPosition?: boolean
  // Chord tone overlay — when provided, chord tones glow and passing tones dim
  chordToneNotes?: Set<number> | null
  chordRootIndex?: number | null
  // Technique overlay — highlight specific string+fret positions
  highlightedPositions?: Set<string> | null
  // Next chord tones — shown as ring outlines for anticipation
  nextChordToneNotes?: Set<number> | null
  // Live listening — the exact MIDI note currently heard from the mic.
  // Every fretboard location producing that pitch gets a "heard" ring.
  heardMidi?: number | null
  // Flow mode — the interval you're hunting. It glows; everything else recedes,
  // so the neck reads as one instruction instead of a wall of colour.
  focusInterval?: string | null
  focusColor?: string
  // Run player — the app walking you through an arpeggio, note by note.
  // Numbered steps: what you've played, what you're aiming at, what's coming.
  runNotes?: RunNoteMark[] | null
}

export interface RunNoteMark {
  stringIndex: number
  fret: number
  order: number
  status: 'done' | 'current' | 'todo'
  roll: boolean
}

// Real guitar scale lengths in inches → relative units
// Strat: 25.5", Les Paul: 24.75" (~3% shorter scale = tighter frets)
const SCALE_LENGTHS: Record<GuitarModel, number> = {
  strat: 25.5,
  lespaul: 24.75,
}

// String spacing differs slightly: Strat ~10.5mm, Les Paul ~10mm
const STRING_SPACINGS: Record<GuitarModel, number> = {
  strat: 40,
  lespaul: 38,
}

function fretPositions(numFrets: number, scaleLength: number): number[] {
  const positions: number[] = [0]
  for (let i = 1; i <= numFrets; i++) {
    positions.push(scaleLength - scaleLength / Math.pow(2, i / 12))
  }
  return positions
}

const STRING_GAUGES_PX = [1.2, 1.6, 2.2, 3.0, 3.8, 4.6]
const SINGLE_DOTS = [3, 5, 7, 9, 15, 17, 19, 21]
const DOUBLE_DOTS = [12, 24]
const BLOCK_FRETS = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24]

export default function Fretboard({
  board, displayMode, inlayStyle, intervalColors,
  highlightRoot, showLeftHanded, posRange, numFrets = 15, fretRange = null, tuningLabels,
  guitarModel = 'strat',
  zoomToPosition = false,
  chordToneNotes = null, chordRootIndex = null,
  highlightedPositions = null,
  nextChordToneNotes = null,
  heardMidi = null,
  focusInterval = null,
  focusColor = '#09cede',
  runNotes = null,
}: Props) {
  const runMap = useMemo(() => {
    if (!runNotes) return null
    const m = new Map<string, RunNoteMark>()
    // If a position appears twice in a run (up-and-back), the LIVE one wins.
    for (const r of runNotes) {
      const key = `${r.stringIndex}-${r.fret}`
      const prev = m.get(key)
      if (!prev || r.status === 'current' || (prev.status === 'todo' && r.status === 'done')) {
        m.set(key, r)
      }
    }
    return m
  }, [runNotes])
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(900)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) setContainerWidth(entry.contentRect.width)
    })
    ro.observe(el)
    setContainerWidth(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  // Scale the SVG to use the full available width.
  // Real scale length (25.5" or 24.75") determines the proportional fret spacing
  // — we just multiply by the available width to fill the screen.
  const realScale = SCALE_LENGTHS[guitarModel]
  // Convert inches to a working unit — fret 1 starts ~5.7% of scale length from nut
  // We render the full scale (24 frets ≈ 12.6" from nut on 25.5" scale)
  // For a 15-fret view, the visible portion is ~58% of the full scale length.
  const fullScaleAt24 = realScale - realScale / Math.pow(2, 24 / 12) // dist from nut to fret 24
  const visibleFraction = (realScale - realScale / Math.pow(2, numFrets / 12)) / fullScaleAt24
  // Pick scaleLength so the rendered fretboard fills available width
  const availableWidth = containerWidth - 80
  const minLastFretWidth = 28
  const lastFretFraction = 1 / Math.pow(2, (numFrets - 1) / 12) - 1 / Math.pow(2, numFrets / 12)
  const requiredScaleLength = minLastFretWidth / lastFretFraction
  // Aim to fill the full container width. realScale ratio dictates relative spacing automatically since fretPositions uses 12-tone equal temperament.
  const scaleLength = Math.max(availableWidth / Math.max(visibleFraction, 0.01) * (realScale / 25.5), requiredScaleLength, 600)

  const fretPos = useMemo(() => fretPositions(numFrets, scaleLength), [numFrets, scaleLength])

  const stringSpacing = STRING_SPACINGS[guitarModel]
  const paddingTop = 32
  const paddingBottom = 30
  const numStrings = board.length
  const fretboardHeight = (numStrings - 1) * stringSpacing
  const nutX = 56
  const boardWidth = fretPos[numFrets]
  const svgWidth = nutX + boardWidth + 24
  const svgHeight = fretboardHeight + paddingTop + paddingBottom

  // Zoom-to-position viewBox: when active, crop to just the position range
  const zoomedViewBox = useMemo(() => {
    if (!zoomToPosition || !posRange) return null
    const [lo, hi] = posRange
    const xStart = lo === 0 ? 0 : nutX + fretPos[lo] - 16
    const xEnd = nutX + fretPos[hi] + 16
    return { x: xStart, w: xEnd - xStart }
  }, [zoomToPosition, posRange, fretPos, nutX])

  // Fret-window viewBox: crop to a chosen fret range so high frets fill the width
  const windowViewBox = useMemo(() => {
    if (!fretRange) return null
    const [lo, hi] = fretRange
    const clampedHi = Math.min(hi, numFrets)
    if (clampedHi <= lo) return null
    const xStart = lo <= 0 ? 0 : nutX + fretPos[lo - 1] - 6
    const xEnd = nutX + fretPos[clampedHi] + 18
    return { x: xStart, w: xEnd - xStart }
  }, [fretRange, fretPos, nutX, numFrets])

  const viewBox = zoomedViewBox
    ? `${zoomedViewBox.x} 0 ${zoomedViewBox.w} ${svgHeight}`
    : windowViewBox
    ? `${windowViewBox.x} 0 ${windowViewBox.w} ${svgHeight}`
    : `0 0 ${svgWidth} ${svgHeight}`

  const stringOrder = useMemo(() => {
    return [...Array(numStrings)].map((_, i) => numStrings - 1 - i)
  }, [numStrings])

  // Is chord tone overlay active?
  const hasOverlay = chordToneNotes !== null && chordToneNotes.size > 0
  // Is technique overlay active?
  const hasTechOverlay = highlightedPositions !== null && highlightedPositions.size > 0

  return (
    <div className="fretboard-container" ref={containerRef}>
      <div className="fretboard-viewport">
        <svg
          width="100%"
          viewBox={viewBox}
          preserveAspectRatio="xMidYMid meet"
          className="fretboard-svg"
          style={showLeftHanded ? { transform: 'scaleX(-1)' } : undefined}
        >
          <defs>
            <linearGradient id="ebony" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1c1814" />
              <stop offset="40%" stopColor="#131110" />
              <stop offset="100%" stopColor="#1a1612" />
            </linearGradient>
            <linearGradient id="fret-wire" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d0ccc0" />
              <stop offset="50%" stopColor="#908880" />
              <stop offset="100%" stopColor="#c0b8b0" />
            </linearGradient>
            <linearGradient id="bone-nut" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f0e8d8" />
              <stop offset="50%" stopColor="#e0d4be" />
              <stop offset="100%" stopColor="#ede2ce" />
            </linearGradient>
            <linearGradient id="str-plain" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f0ece4" />
              <stop offset="50%" stopColor="#ccc6b8" />
              <stop offset="100%" stopColor="#e8e2d6" />
            </linearGradient>
            <linearGradient id="str-wound" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c8b898" />
              <stop offset="30%" stopColor="#8a7a60" />
              <stop offset="70%" stopColor="#a89878" />
              <stop offset="100%" stopColor="#c0b090" />
            </linearGradient>
            {/* Glow filter for chord tones */}
            <filter id="chord-tone-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Fretboard body */}
          <rect x={nutX} y={paddingTop - 14} width={boardWidth + 4} height={fretboardHeight + 28}
            fill="url(#ebony)" rx={3} />

          {/* Grain */}
          {[...Array(12)].map((_, i) => (
            <line key={`g${i}`} x1={nutX}
              y1={paddingTop - 14 + (i + 0.5) * (fretboardHeight + 28) / 12.5}
              x2={nutX + boardWidth}
              y2={paddingTop - 14 + (i + 0.5) * (fretboardHeight + 28) / 12.5 + (i % 3 - 1) * 1.5}
              stroke="rgba(255,255,255,0.015)" strokeWidth={0.5} />
          ))}

          {/* Position highlight */}
          {posRange && (
            <rect
              x={posRange[0] === 0 ? nutX - 5 : nutX + fretPos[posRange[0]]}
              y={paddingTop - 14}
              width={(nutX + fretPos[posRange[1]]) - (posRange[0] === 0 ? nutX - 5 : nutX + fretPos[posRange[0]])}
              height={fretboardHeight + 28}
              fill="rgba(212,160,23,0.08)" rx={2}
              className="pos-highlight"
            />
          )}

          {/* Inlays */}
          {inlayStyle === 'dots' && (
            <>
              {SINGLE_DOTS.filter(f => f <= numFrets).map(f => {
                const cx = nutX + (fretPos[f - 1] + fretPos[f]) / 2
                return <circle key={`d${f}`} cx={cx} cy={paddingTop + fretboardHeight / 2} r={5.5}
                  fill="rgba(255,255,255,0.10)" />
              })}
              {DOUBLE_DOTS.filter(f => f <= numFrets).map(f => {
                const cx = nutX + (fretPos[f - 1] + fretPos[f]) / 2
                return (<g key={`dd${f}`}>
                  <circle cx={cx} cy={paddingTop + fretboardHeight * 0.25} r={5.5} fill="rgba(255,255,255,0.10)" />
                  <circle cx={cx} cy={paddingTop + fretboardHeight * 0.75} r={5.5} fill="rgba(255,255,255,0.10)" />
                </g>)
              })}
            </>
          )}
          {inlayStyle === 'blocks' && BLOCK_FRETS.filter(f => f <= numFrets).map(f => {
            const x1 = nutX + fretPos[f - 1] + 5
            const x2 = nutX + fretPos[f] - 5
            return <rect key={`bl${f}`} x={x1} y={paddingTop - 4} width={Math.max(x2 - x1, 2)}
              height={fretboardHeight + 8} fill="rgba(255,255,255,0.14)" rx={2} />
          })}

          {/* Nut */}
          <rect x={nutX - 5} y={paddingTop - 14} width={7} height={fretboardHeight + 28}
            fill="url(#bone-nut)" rx={1.5} />

          {/* Fret wires */}
          {[...Array(numFrets)].map((_, i) => {
            const f = i + 1
            const x = nutX + fretPos[f]
            return <rect key={`fw${f}`} x={x - 1.2} y={paddingTop - 8} width={2.4}
              height={fretboardHeight + 16} fill="url(#fret-wire)" rx={0.5} />
          })}

          {/* Strings */}
          {stringOrder.map((si, visualIdx) => {
            const y = paddingTop + visualIdx * stringSpacing
            const gaugeIdx = numStrings - 1 - si
            const gauge = STRING_GAUGES_PX[gaugeIdx] ?? 2.5
            const isWound = gaugeIdx >= 3
            return <rect key={`s${si}`} x={nutX - 5} y={y - gauge / 2}
              width={boardWidth + 12} height={gauge}
              fill={isWound ? 'url(#str-wound)' : 'url(#str-plain)'} rx={gauge / 2} />
          })}

          {/* Open string labels */}
          {stringOrder.map((si, visualIdx) => {
            const y = paddingTop + visualIdx * stringSpacing
            return (
              <text key={`ol${si}`} x={nutX - 18} y={y}
                textAnchor="middle" dominantBaseline="central" className="open-string-label"
                style={showLeftHanded ? { transform: `scaleX(-1)`, transformOrigin: `${nutX - 18}px ${y}px` } : undefined}>
                {tuningLabels[si]}
              </text>
            )
          })}

          {/* Note circles */}
          {stringOrder.map((si, visualIdx) => {
            const y = paddingTop + visualIdx * stringSpacing
            return board[si].map((fn) => {
              if (!fn.isInScale) return null

              const inPos = !posRange || (fn.fret >= posRange[0] && fn.fret <= posRange[1])
              const cx = fn.fret === 0 ? nutX - 5
                : nutX + (fretPos[fn.fret - 1] + fretPos[fn.fret]) / 2

              const fretW = fn.fret === 0 ? 40 : fretPos[fn.fret] - fretPos[fn.fret - 1]
              const baseR = Math.max(12, Math.min(17, fretW * 0.28))
              const color = intervalColors[fn.intervalName] || '#888'

              // ─── Chord Tone Overlay Mode ───
              if (hasOverlay) {
                const isChordTone = chordToneNotes!.has(fn.degree)

                if (isChordTone) {
                  // CHORD TONE — big, glowing, labeled with chord interval
                  const r = baseR
                  const chordSemis = chordRootIndex !== null
                    ? ((fn.degree - chordRootIndex + 12) % 12)
                    : 0
                  const chordIv = chordRootIndex !== null ? intervalName(chordSemis) : fn.intervalName
                  const chordColor = chordRootIndex !== null
                    ? (intervalColors[chordIv] || color)
                    : color
                  const isChordRoot = chordSemis === 0 && chordRootIndex !== null

                  const isNextChordTone = nextChordToneNotes?.has(fn.degree) || false

                  return (
                    <g key={`n${si}-${fn.fret}`} className={`note-group ${inPos ? '' : 'ghosted'}`}>
                      {/* Outer glow ring */}
                      {inPos && <circle cx={cx} cy={y} r={r + 6} fill={chordColor} opacity={0.2}
                        className="chord-tone-glow" />}
                      {inPos && <circle cx={cx} cy={y} r={r + 3} fill={chordColor} opacity={0.12} />}
                      {/* Main dot */}
                      <circle cx={cx} cy={y} r={r} fill={chordColor}
                        stroke={isChordRoot && inPos ? '#fff' : 'rgba(255,255,255,0.5)'}
                        strokeWidth={isChordRoot && inPos ? 2.5 : 1.5} />
                      {/* Next chord tone ring — anticipation indicator */}
                      {isNextChordTone && inPos && (
                        <circle cx={cx} cy={y} r={r + 8} fill="none"
                          stroke="rgba(255,255,255,0.5)" strokeWidth={1.5}
                          strokeDasharray="4 3" className="next-chord-ring" />
                      )}
                      {/* Labels — chord interval */}
                      {inPos && (displayMode === 'notes' || displayMode === 'both') && (
                        <text x={cx} y={displayMode === 'both' ? y - 4.5 : y + 0.5}
                          textAnchor="middle" dominantBaseline="central" className="note-label"
                          style={showLeftHanded ? { transform: `scaleX(-1)`, transformOrigin: `${cx}px ${y}px` } : undefined}>
                          {fn.note}
                        </text>
                      )}
                      {inPos && (displayMode === 'intervals' || displayMode === 'both') && (
                        <text x={cx} y={displayMode === 'both' ? y + 5.5 : y + 0.5}
                          textAnchor="middle" dominantBaseline="central" className="chord-iv-label"
                          style={showLeftHanded ? { transform: `scaleX(-1)`, transformOrigin: `${cx}px ${y}px` } : undefined}>
                          {chordIv}
                        </text>
                      )}
                    </g>
                  )
                } else {
                  // PASSING TONE — visible with note + interval
                  const r = baseR * 0.7
                  const isNextChordTone = nextChordToneNotes?.has(fn.degree) || false
                  return (
                    <g key={`n${si}-${fn.fret}`} className={`note-group ${inPos ? 'passing-tone' : 'ghosted'}`}>
                      <circle cx={cx} cy={y} r={r} fill={color}
                        opacity={inPos && isNextChordTone ? 0.75 : inPos ? 0.55 : 0.12}
                        stroke={isNextChordTone && inPos ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.12)'} strokeWidth={isNextChordTone && inPos ? 1.5 : 0.5} />
                      {/* Next chord tone ring on passing tones */}
                      {isNextChordTone && inPos && (
                        <circle cx={cx} cy={y} r={baseR * 0.9} fill="none"
                          stroke="rgba(255,255,255,0.45)" strokeWidth={1.5}
                          strokeDasharray="4 3" className="next-chord-ring" />
                      )}
                      {inPos && (displayMode === 'notes' || displayMode === 'both') && (
                        <text x={cx} y={displayMode === 'both' ? y - 3.5 : y + 0.5}
                          textAnchor="middle" dominantBaseline="central" className="note-label"
                          style={{ fontSize: '8.5px', opacity: 0.75, ...(showLeftHanded ? { transform: `scaleX(-1)`, transformOrigin: `${cx}px ${y}px` } : {}) }}>
                          {fn.note}
                        </text>
                      )}
                      {inPos && (displayMode === 'intervals' || displayMode === 'both') && (
                        <text x={cx} y={displayMode === 'both' ? y + 4.5 : y + 0.5}
                          textAnchor="middle" dominantBaseline="central" className="interval-label"
                          style={{ fontSize: '8px', opacity: 0.65, ...(showLeftHanded ? { transform: `scaleX(-1)`, transformOrigin: `${cx}px ${y}px` } : {}) }}>
                          {fn.intervalName}
                        </text>
                      )}
                    </g>
                  )
                }
              }

              // ─── Technique Overlay Mode ───
              if (hasTechOverlay) {
                const posKey = `${si}-${fn.fret}`
                const isHighlighted = highlightedPositions!.has(posKey)

                if (isHighlighted) {
                  const r = baseR
                  return (
                    <g key={`n${si}-${fn.fret}`} className="note-group technique-highlight">
                      <circle cx={cx} cy={y} r={r + 5} fill={color} opacity={0.25}
                        className="technique-glow" />
                      <circle cx={cx} cy={y} r={r} fill={color}
                        stroke="#fff" strokeWidth={2} />
                      {(displayMode === 'notes' || displayMode === 'both') && (
                        <text x={cx} y={displayMode === 'both' ? y - 4.5 : y + 0.5}
                          textAnchor="middle" dominantBaseline="central" className="note-label"
                          style={showLeftHanded ? { transform: `scaleX(-1)`, transformOrigin: `${cx}px ${y}px` } : undefined}>
                          {fn.note}
                        </text>
                      )}
                      {(displayMode === 'intervals' || displayMode === 'both') && (
                        <text x={cx} y={displayMode === 'both' ? y + 5.5 : y + 0.5}
                          textAnchor="middle" dominantBaseline="central" className="interval-label"
                          style={showLeftHanded ? { transform: `scaleX(-1)`, transformOrigin: `${cx}px ${y}px` } : undefined}>
                          {fn.intervalName}
                        </text>
                      )}
                    </g>
                  )
                } else {
                  // Dim background scale tone
                  const r = baseR * 0.5
                  return (
                    <g key={`n${si}-${fn.fret}`} className="note-group passing-tone">
                      <circle cx={cx} cy={y} r={r} fill={color}
                        opacity={0.22} stroke="rgba(0,0,0,0.2)" strokeWidth={0.5} />
                    </g>
                  )
                }
              }

              // ─── Run Mode — the app walking you through the arpeggio ───
              // Numbered, in order. What you've played fills in; what you're
              // aiming at right now pulses. Everything else gets out of the way.
              if (runMap) {
                const mark = runMap.get(`${si}-${fn.fret}`)
                if (!mark) {
                  // Not in the run — still show it faintly. It's in the scale;
                  // you're allowed to be there, it's just not the exercise.
                  return (
                    <g key={`n${si}-${fn.fret}`} className="note-group">
                      <circle cx={cx} cy={y} r={baseR * 0.34} fill="#20252c" opacity={0.7} />
                    </g>
                  )
                }

                const isCurrent = mark.status === 'current'
                const isDone = mark.status === 'done'
                const r = isCurrent ? baseR * 1.05 : baseR * 0.92
                const fill = isCurrent ? focusColor : isDone ? '#2f3742' : '#191d24'

                return (
                  <g key={`n${si}-${fn.fret}`} className="note-group">
                    {isCurrent && (
                      <circle cx={cx} cy={y} r={r + 10} fill={focusColor} opacity={0.2}
                        className="run-target" />
                    )}
                    <circle cx={cx} cy={y} r={r} fill={fill}
                      stroke={isDone ? 'rgba(255,255,255,0.55)' : isCurrent ? '#fff' : 'rgba(255,255,255,0.22)'}
                      strokeWidth={isCurrent ? 2 : 1.2} />
                    {/* A roll: same fret, next string — flatten the finger, don't lift it */}
                    {mark.roll && (
                      <circle cx={cx} cy={y} r={r + 4} fill="none"
                        stroke="#ff8a4c" strokeWidth={1.4} strokeDasharray="3 2" />
                    )}
                    <text x={cx} y={y} textAnchor="middle" dominantBaseline="central"
                      className="interval-label"
                      style={{
                        fill: isCurrent ? '#06312b' : isDone ? '#e9ebee' : '#79818c',
                        fontWeight: 800,
                        ...(showLeftHanded
                          ? { transform: 'scaleX(-1)', transformOrigin: `${cx}px ${y}px` }
                          : {}),
                      }}>
                      {mark.order}
                    </text>
                  </g>
                )
              }

              // ─── Focus Mode (Flow) — one instruction, not a wall of colour ───
              // The target note ALWAYS glows. If the concept also has a shape to
              // grab (an arpeggio), those positions get a white outline ON TOP —
              // so the neck can never contradict "find the glowing ones".
              if (focusInterval) {
                const isTarget = fn.intervalName === focusInterval
                const isRootNote = fn.isRoot
                const inShape = highlightedPositions?.has(`${si}-${fn.fret}`) ?? false
                const r = isTarget ? baseR * 1.05 : baseR * 0.86

                // Focus is expressed with LIGHT, not with grey paint. Every note keeps
                // its interval colour — the same language Study speaks — and the target
                // simply burns while the rest recede. Filling non-targets with slate
                // made Flow look like a different app than the one on the box.
                const dimOpacity = inShape ? 0.72 : isRootNote ? 0.6 : 0.34

                return (
                  <g key={`n${si}-${fn.fret}`} className={`note-group ${inPos ? '' : 'ghosted'}`}>
                    {isTarget && inPos && (
                      <>
                        <circle cx={cx} cy={y} r={r + 10} fill={color} opacity={0.16}
                          className="focus-halo" />
                        <circle cx={cx} cy={y} r={r + 5} fill={color} opacity={0.22} />
                      </>
                    )}
                    <circle cx={cx} cy={y} r={r} fill={color}
                      opacity={isTarget ? 1 : dimOpacity}
                      stroke={
                        isTarget ? '#fff'
                        : inShape ? 'rgba(255,255,255,0.85)'
                        : isRootNote ? 'rgba(255,255,255,0.5)'
                        : 'rgba(255,255,255,0.12)'
                      }
                      strokeWidth={isTarget ? 2.2 : inShape ? 2 : isRootNote ? 1.4 : 0.75}
                      style={inPos
                        ? { filter: `drop-shadow(0 0 ${isTarget ? 10 : 3}px ${color}${isTarget ? '' : '70'})` }
                        : undefined} />
                    {inPos && (
                      <text x={cx} y={y} textAnchor="middle" dominantBaseline="central"
                        className="interval-label"
                        style={{
                          fill: '#0a0a0f',
                          opacity: isTarget ? 1 : 0.82,
                          fontWeight: isTarget ? 800 : 700,
                          ...(showLeftHanded
                            ? { transform: 'scaleX(-1)', transformOrigin: `${cx}px ${y}px` }
                            : {}),
                        }}>
                        {fn.intervalName}
                      </text>
                    )}
                  </g>
                )
              }

              // ─── Normal Mode (no overlay) ───
              const r = baseR
              const isRoot = fn.isRoot && highlightRoot

              return (
                <g key={`n${si}-${fn.fret}`} className={`note-group ${inPos ? '' : 'ghosted'}`}>
                  {isRoot && inPos && <circle cx={cx} cy={y} r={r + 4} fill={color} opacity={0.25} />}
                  <circle cx={cx} cy={y} r={r} fill={color}
                    stroke={isRoot && inPos ? '#fff' : 'rgba(255,255,255,0.14)'}
                    strokeWidth={isRoot && inPos ? 2 : 1}
                    style={inPos ? { filter: `drop-shadow(0 0 ${isRoot ? 8 : 4}px ${color}${isRoot ? '' : 'b0'})` } : undefined} />
                  {inPos && (displayMode === 'notes' || displayMode === 'both') && (
                    <text x={cx} y={displayMode === 'both' ? y - 4.5 : y + 0.5}
                      textAnchor="middle" dominantBaseline="central" className="note-label"
                      style={showLeftHanded ? { transform: `scaleX(-1)`, transformOrigin: `${cx}px ${y}px` } : undefined}>
                      {fn.note}
                    </text>
                  )}
                  {inPos && (displayMode === 'intervals' || displayMode === 'both') && (
                    <text x={cx} y={displayMode === 'both' ? y + 5.5 : y + 0.5}
                      textAnchor="middle" dominantBaseline="central" className="interval-label"
                      style={showLeftHanded ? { transform: `scaleX(-1)`, transformOrigin: `${cx}px ${y}px` } : undefined}>
                      {fn.intervalName}
                    </text>
                  )}
                </g>
              )
            })
          })}

          {/* Chord tone connecting lines — shows arpeggio shape within position */}
          {hasOverlay && posRange && (() => {
            // Collect chord tone positions within the active position
            const chordPoints: { cx: number; cy: number }[] = []
            stringOrder.forEach((si, visualIdx) => {
              const y = paddingTop + visualIdx * stringSpacing
              board[si].forEach(fn => {
                if (!fn.isInScale || !chordToneNotes!.has(fn.degree)) return
                const inPos = fn.fret >= posRange[0] && fn.fret <= posRange[1]
                if (!inPos) return
                const cx = fn.fret === 0 ? nutX - 5
                  : nutX + (fretPos[fn.fret - 1] + fretPos[fn.fret]) / 2
                chordPoints.push({ cx, cy: y })
              })
            })
            if (chordPoints.length < 2) return null
            // Draw connecting path
            const pathD = chordPoints.map((p, i) =>
              `${i === 0 ? 'M' : 'L'} ${p.cx} ${p.cy}`
            ).join(' ')
            return (
              <path d={pathD} fill="none" stroke="rgba(212,160,23,0.25)" strokeWidth={2}
                strokeDasharray="4 3" className="chord-connect-line" />
            )
          })()}

          {/* Heard-note layer — rings on every location producing the live pitch.
              Drawn on top so it works identically in all three render modes. */}
          {heardMidi !== null && stringOrder.map((si, visualIdx) => {
            const y = paddingTop + visualIdx * stringSpacing
            return board[si].map(fn => {
              if (fn.midi !== heardMidi) return null
              const cx = fn.fret === 0 ? nutX - 5
                : nutX + (fretPos[fn.fret - 1] + fretPos[fn.fret]) / 2
              const fretW = fn.fret === 0 ? 40 : fretPos[fn.fret] - fretPos[fn.fret - 1]
              const r = Math.max(12, Math.min(17, fretW * 0.28))
              // In-scale: bright confirmation. Out-of-scale: you're off the map —
              // still shown, because that's feedback too.
              const ringColor = fn.isInScale ? '#fff' : '#e05555'
              return (
                <g key={`h${si}-${fn.fret}`} className="heard-note">
                  {!fn.isInScale && (
                    <circle cx={cx} cy={y} r={r * 0.45} fill={ringColor} opacity={0.5} />
                  )}
                  <circle cx={cx} cy={y} r={r + 4} fill="none"
                    stroke={ringColor} strokeWidth={2.5} className="heard-ring" />
                  <circle cx={cx} cy={y} r={r + 9} fill="none"
                    stroke={ringColor} strokeWidth={1} opacity={0.4} className="heard-ring-outer" />
                </g>
              )
            })
          })}

          {/* Fret numbers */}
          {[...Array(numFrets)].map((_, i) => {
            const f = i + 1
            const x = nutX + (fretPos[f - 1] + fretPos[f]) / 2
            return (
              <text key={`fn${f}`} x={x} y={svgHeight - 4}
                textAnchor="middle" className="fret-number"
                style={showLeftHanded ? { transform: `scaleX(-1)`, transformOrigin: `${x}px ${svgHeight - 4}px` } : undefined}>
                {f}
              </text>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
