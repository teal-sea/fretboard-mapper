// ─── FlowCanvas — the dopamine layer ─────────────────────────────────
// A full-stage particle field behind Flow's UI. Pure presentation: App tells
// it "a note was heard" (pulse) or "home moved" (wave) and it answers with
// light — silky drifting dust always, a spark burst per note in that note's
// interval color, and a firework + shockwave when the player lands home.
// No theory, no audio, no state that matters: unmount and nothing is lost.

import { useEffect, useRef } from 'react'

export interface FlowPulse {
  id: number       // increments per event so effects can diff
  color: string    // the heard note's interval color
  home: boolean    // landed on the current tonic → the big one
}

interface Particle {
  x: number; y: number
  vx: number; vy: number
  life: number     // 1 → 0
  decay: number
  size: number
  color: string
  drift: number    // phase for the curl-ish wander
  kind: 'dust' | 'spark' | 'ring'
}

const MAX_PARTICLES = 420

export default function FlowCanvas({ active, pulse, wave, homeColor }: {
  active: boolean
  pulse: FlowPulse | null
  wave: number
  homeColor: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particles = useRef<Particle[]>([])
  const lastPulseId = useRef(0)
  const lastWave = useRef(0)
  const raf = useRef(0)

  // Spawn on note events. Kept outside the rAF loop so a burst lands the
  // exact frame the note commits — latency here is the whole point.
  useEffect(() => {
    if (!pulse || pulse.id === lastPulseId.current) return
    lastPulseId.current = pulse.id
    const c = canvasRef.current
    if (!c) return
    const w = c.clientWidth, h = c.clientHeight
    const ps = particles.current
    const cx = w * (0.2 + Math.random() * 0.6)
    const cy = h * (0.35 + Math.random() * 0.3)

    if (pulse.home) {
      // The firework: you came home.
      for (let i = 0; i < 90; i++) {
        const a = (Math.PI * 2 * i) / 90 + Math.random() * 0.2
        const speed = 1.5 + Math.random() * 3.5
        ps.push({
          x: w / 2, y: h * 0.45,
          vx: Math.cos(a) * speed, vy: Math.sin(a) * speed - 0.4,
          life: 1, decay: 0.006 + Math.random() * 0.008,
          size: 1.5 + Math.random() * 2.5,
          color: Math.random() < 0.7 ? pulse.color : '#ffffff',
          drift: Math.random() * Math.PI * 2,
          kind: 'spark',
        })
      }
      ps.push({
        x: w / 2, y: h * 0.45, vx: 0, vy: 0,
        life: 1, decay: 0.02, size: 8, color: pulse.color,
        drift: 0, kind: 'ring',
      })
    } else {
      for (let i = 0; i < 16; i++) {
        const a = Math.random() * Math.PI * 2
        const speed = 0.4 + Math.random() * 1.6
        ps.push({
          x: cx, y: cy,
          vx: Math.cos(a) * speed, vy: Math.sin(a) * speed - 0.3,
          life: 1, decay: 0.01 + Math.random() * 0.015,
          size: 1 + Math.random() * 2,
          color: pulse.color,
          drift: Math.random() * Math.PI * 2,
          kind: 'spark',
        })
      }
    }
    if (ps.length > MAX_PARTICLES) ps.splice(0, ps.length - MAX_PARTICLES)
  }, [pulse])

  // Home moved: a slow shimmering sweep across the whole stage.
  useEffect(() => {
    if (wave === lastWave.current) return
    lastWave.current = wave
    const c = canvasRef.current
    if (!c) return
    const w = c.clientWidth, h = c.clientHeight
    const ps = particles.current
    for (let i = 0; i < 60; i++) {
      ps.push({
        x: -10, y: Math.random() * h,
        vx: 2 + Math.random() * 2.5, vy: (Math.random() - 0.5) * 0.4,
        life: 1, decay: 0.004 + Math.random() * 0.004,
        size: 0.8 + Math.random() * 1.8,
        color: homeColor,
        drift: Math.random() * Math.PI * 2,
        kind: 'dust',
      })
    }
    if (ps.length > MAX_PARTICLES) ps.splice(0, ps.length - MAX_PARTICLES)
  }, [wave, homeColor])

  useEffect(() => {
    const c = canvasRef.current
    if (!c || !active) return
    const ctx = c.getContext('2d')
    if (!ctx) return

    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      c.width = c.clientWidth * dpr
      c.height = c.clientHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(c)

    let t = 0
    const loop = () => {
      raf.current = requestAnimationFrame(loop)
      t += 0.008
      const w = c.clientWidth, h = c.clientHeight
      ctx.clearRect(0, 0, w, h)
      const ps = particles.current

      // Ambient dust: a slow constant breath so the stage is never dead,
      // even before the first note.
      if (ps.length < MAX_PARTICLES && Math.random() < 0.35) {
        ps.push({
          x: Math.random() * w, y: h + 6,
          vx: (Math.random() - 0.5) * 0.3, vy: -(0.15 + Math.random() * 0.35),
          life: 1, decay: 0.002 + Math.random() * 0.003,
          size: 0.6 + Math.random() * 1.6,
          color: homeColor,
          drift: Math.random() * Math.PI * 2,
          kind: 'dust',
        })
      }

      ctx.globalCompositeOperation = 'lighter'
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i]
        p.life -= p.decay
        if (p.life <= 0) { ps.splice(i, 1); continue }

        if (p.kind === 'ring') {
          p.size += 6
          ctx.strokeStyle = p.color
          ctx.globalAlpha = p.life * 0.5
          ctx.lineWidth = 2 + p.life * 3
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.stroke()
          continue
        }

        // Curl-ish wander — the "fluid" in the fluid dynamics budget version.
        p.drift += 0.02
        p.vx += Math.sin(t * 3 + p.drift) * 0.01
        p.vy += Math.cos(t * 2.6 + p.drift) * 0.008
        if (p.kind === 'spark') { p.vx *= 0.985; p.vy = p.vy * 0.985 + 0.012 }
        p.x += p.vx
        p.y += p.vy

        const alpha = p.kind === 'dust' ? p.life * 0.35 : p.life * 0.9
        const r = p.size * (p.kind === 'spark' ? 0.6 + p.life * 0.8 : 1)
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3)
        g.addColorStop(0, p.color)
        g.addColorStop(1, 'transparent')
        ctx.globalAlpha = alpha
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(p.x, p.y, r * 3, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'
    }
    raf.current = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf.current)
      ro.disconnect()
      particles.current = []
    }
  }, [active, homeColor])

  return <canvas ref={canvasRef} className="flow-canvas" aria-hidden="true" />
}
