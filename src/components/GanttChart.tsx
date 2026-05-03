'use client'

import Link from 'next/link'

interface GanttProject {
  id: number
  name: string
  clientName: string | null
  status: string
  startDate: string | null
  endDate: string | null
  budget: number
  estimateTotal: number
  realizedTotal: number
}

const STATUS_COLOR = {
  PLANNING: { bar: '#f59e0b', bg: 'rgba(245,158,11,0.12)', text: '#f59e0b' },
  IN_PROGRESS: { bar: '#3b82f6', bg: 'rgba(59,130,246,0.12)', text: '#3b82f6' },
  COMPLETED: { bar: '#10b981', bg: 'rgba(16,185,129,0.12)', text: '#10b981' },
}

export default function GanttChart({ projects }: { projects: GanttProject[] }) {
  const validProjects = projects.filter(p => p.startDate && p.endDate)
  if (!validProjects.length) return null

  const allStarts = validProjects.map(p => new Date(p.startDate!).getTime())
  const allEnds = validProjects.map(p => new Date(p.endDate!).getTime())
  const minDate = new Date(Math.min(...allStarts))
  const maxDate = new Date(Math.max(...allEnds))

  // Extend range a bit
  minDate.setDate(1)
  maxDate.setMonth(maxDate.getMonth() + 1, 0)

  const totalMs = maxDate.getTime() - minDate.getTime()
  const today = new Date()
  const todayPct = Math.max(0, Math.min(100, ((today.getTime() - minDate.getTime()) / totalMs) * 100))

  // Build month headers
  const months: { label: string; leftPct: number; widthPct: number }[] = []
  const cursor = new Date(minDate.getFullYear(), minDate.getMonth(), 1)
  while (cursor <= maxDate) {
    const start = Math.max(cursor.getTime(), minDate.getTime())
    const end = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0, 23, 59, 59).getTime()
    const leftPct = ((start - minDate.getTime()) / totalMs) * 100
    const widthPct = ((Math.min(end, maxDate.getTime()) - start) / totalMs) * 100
    months.push({
      label: cursor.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }),
      leftPct,
      widthPct
    })
    cursor.setMonth(cursor.getMonth() + 1)
  }

  return (
    <div className="glass-card gantt-container" style={{ padding: '1.5rem', overflow: 'hidden' }}>
      <div className="gantt-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="var(--accent-primary)">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Gantt Chart
        </h2>
        <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.7rem', flexWrap: 'wrap' }}>
          {Object.entries(STATUS_COLOR).map(([status, c]) => (
            <span key={status} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: c.text }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: c.bar, display: 'inline-block' }} />
              {status.replace('_', ' ')}
            </span>
          ))}
        </div>
      </div>

      <div style={{ overflowX: 'auto', paddingBottom: '1rem' }} className="gantt-scroll-area">
        <div style={{ minWidth: '800px' }}>
          {/* Month header */}
          <div className="gantt-month-header" style={{ display: 'flex', marginBottom: '0.5rem', paddingLeft: '180px', position: 'relative', height: '24px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              {months.map((m, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: `${m.leftPct}%`,
                    width: `${m.widthPct}%`,
                    fontSize: '0.65rem',
                    color: 'var(--text-muted)',
                    borderLeft: '1px solid var(--border-color)',
                    paddingLeft: '4px',
                    height: '100%',
                    boxSizing: 'border-box'
                  }}
                >
                  {m.label}
                </div>
              ))}
            </div>
          </div>

          {/* Project rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {validProjects.map((p, idx) => {
              const start = new Date(p.startDate!).getTime()
              const end = new Date(p.endDate!).getTime()
              const leftPct = ((start - minDate.getTime()) / totalMs) * 100
              const widthPct = ((end - start) / totalMs) * 100
              const colors = STATUS_COLOR[p.status as keyof typeof STATUS_COLOR] || STATUS_COLOR.PLANNING
              const progressPct = p.estimateTotal > 0 ? Math.min((p.realizedTotal / p.estimateTotal) * 100, 100) : 0
              const durationDays = Math.round((end - start) / (1000 * 60 * 60 * 24))
              const isOverdue = p.status !== 'COMPLETED' && new Date(p.endDate!) < today

              return (
                <div key={p.id} className="gantt-row" style={{ display: 'flex', alignItems: 'center', gap: '0', height: '40px' }}>
                  {/* Project label */}
                  <div className="gantt-label" style={{ width: '180px', flexShrink: 0, paddingRight: '1rem', overflow: 'hidden' }}>
                    <Link
                      href={`/projects/${p.id}`}
                      style={{ textDecoration: 'none', display: 'block' }}
                    >
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.clientName || 'No client'}</span>
                        {isOverdue && <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.6rem' }}>!</span>}
                      </div>
                    </Link>
                  </div>

                  {/* Gantt bar track */}
                  <div style={{ flex: 1, position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}>
                    {/* Month grid lines */}
                    {months.map((m, i) => (
                      <div key={i} style={{
                        position: 'absolute', left: `${m.leftPct}%`, top: 0, bottom: 0,
                        borderLeft: '1px solid rgba(255,255,255,0.04)', pointerEvents: 'none'
                      }} />
                    ))}

                    {/* Today line */}
                    {todayPct >= 0 && todayPct <= 100 && (
                      <div style={{
                        position: 'absolute', left: `${todayPct}%`, top: 0, bottom: 0,
                        borderLeft: '2px dashed rgba(239,68,68,0.6)', pointerEvents: 'none', zIndex: 2
                      }}>
                        <span style={{ position: 'absolute', top: '0', left: '3px', fontSize: '0.6rem', color: '#ef4444', whiteSpace: 'nowrap' }}>Today</span>
                      </div>
                    )}

                    {/* The bar */}
                    <div style={{
                      position: 'absolute',
                      left: `${Math.max(0, leftPct)}%`,
                      width: `${Math.max(0.5, widthPct)}%`,
                      height: '28px',
                      borderRadius: '6px',
                      background: colors.bg,
                      border: `1px solid ${colors.bar}`,
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      zIndex: 1,
                      cursor: 'pointer'
                    }}>
                      {/* Progress fill */}
                      {progressPct > 0 && (
                        <div style={{
                          position: 'absolute', left: 0, top: 0, bottom: 0,
                          width: `${progressPct}%`,
                          background: colors.bar,
                          opacity: 0.3,
                          borderRadius: '6px 0 0 6px'
                        }} />
                      )}
                      {/* Label inside bar */}
                      <span style={{
                        padding: '0 8px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        color: colors.text,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        position: 'relative',
                        zIndex: 1
                      }}>
                        {durationDays}d · {progressPct.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
        <span>📅 Range: {minDate.toLocaleDateString('id-ID')} — {maxDate.toLocaleDateString('id-ID')}</span>
        <span>📊 {validProjects.length} projects with timeline</span>
        <span style={{ color: '#ef4444' }}>— Today indicator</span>
        <span>Bar fill = realization progress</span>
      </div>
    </div>
  )
}
