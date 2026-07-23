// Vercel Edge Function: renders the actual scale for the requested key+mode
// as a social preview card. Every mode/chord page (and the shareable app
// URL) used to point at one static /og.jpg regardless of what was being
// shared — so a link to "D Dorian" looked identical to a link to the
// homepage in Discord/iMessage/Twitter previews. This makes the preview
// match the content, using the same deterministic theory engine as the
// page itself (golden rule: never hardcode notes — see CLAUDE.md).
import { ImageResponse } from '@vercel/og'
import { SCALES, intervalName } from '../src/utils/musicTheory'
import { DEFAULT_INTERVAL_COLORS } from '../src/utils/defaultColors'
import { MODES, MODE_COPY, rootNameFor, notesOf, type ModeKey } from '../scripts/shared'

export const config = { runtime: 'edge' }

function isModeKey(v: string | null): v is ModeKey {
  return v !== null && (MODES as readonly string[]).includes(v)
}

export default function handler(req: Request) {
  const { searchParams } = new URL(req.url)
  const keyParam = Number(searchParams.get('key'))
  const modeParam = searchParams.get('mode')

  const rootPc = Number.isInteger(keyParam) && keyParam >= 0 && keyParam <= 11 ? keyParam : 0
  const mode: ModeKey = isModeKey(modeParam) ? modeParam : 'ionian'

  const root = rootNameFor(rootPc, mode)
  const notes = notesOf(rootPc, mode)
  const intervals = SCALES[mode].intervals.map((iv: number) => intervalName(iv))
  const displayName = `${root} ${MODE_COPY[mode].title}`

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#050507',
          padding: '64px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '9999px',
              background: DEFAULT_INTERVAL_COLORS['R'],
            }}
          />
          <div style={{ color: '#8a84a3', fontSize: '28px' }}>Modal Runs</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <div style={{ display: 'flex', color: '#f2f0f8', fontSize: '76px', fontWeight: 700 }}>
            {displayName}
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            {notes.map((n, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '72px',
                  height: '72px',
                  borderRadius: '9999px',
                  background: DEFAULT_INTERVAL_COLORS[intervals[i]] ?? '#888',
                  color: '#0a0a0f',
                  fontSize: '26px',
                  fontWeight: 700,
                }}
              >
                {n}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', color: '#6a6486', fontSize: '26px' }}>
          modalruns.com — hears you play, lights up the neck
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
