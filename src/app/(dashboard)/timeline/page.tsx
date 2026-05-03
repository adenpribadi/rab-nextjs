import { prisma } from "@/lib/prisma"
import Link from "next/link"
import GanttChart from "@/components/GanttChart"

export const dynamic = 'force-dynamic'

export default async function TimelinePage() {
  const rawProjects = await prisma.project.findMany({
    orderBy: { startDate: 'asc' },
    select: {
      id: true,
      name: true,
      clientName: true,
      status: true,
      startDate: true,
      endDate: true,
      budget: true,
      items: {
        select: {
          totalPrice: true,
          expenses: { select: { amount: true } }
        }
      }
    }
  })

  const projects = rawProjects.map(p => ({
    id: p.id,
    name: p.name,
    clientName: p.clientName,
    status: p.status,
    startDate: p.startDate?.toISOString() || null,
    endDate: p.endDate?.toISOString() || null,
    budget: Number(p.budget),
    estimateTotal: p.items.reduce((s, i) => s + Number(i.totalPrice), 0),
    realizedTotal: p.items.reduce((s, i) => s + i.expenses.reduce((es, e) => es + Number(e.amount), 0), 0),
  }))

  const withDates = projects.filter(p => p.startDate && p.endDate)
  const withoutDates = projects.filter(p => !p.startDate || !p.endDate)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <header className="page-header">
        <div>
          <h1 className="page-title" style={{ fontSize: '1.5rem' }}>Project Timeline</h1>
          <p className="page-subtitle" style={{ fontSize: '0.85rem' }}>
            Visual Gantt chart overview of all project schedules and progress.
          </p>
        </div>
        <Link href="/projects/new" className="btn-primary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Project
        </Link>
      </header>

      {withDates.length > 0 ? (
        <GanttChart projects={withDates} />
      ) : (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ margin: '0 auto 1rem', opacity: 0.3 }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p style={{ margin: 0 }}>No projects with timeline dates found.</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem' }}>Set Start & End dates on your projects to see them here.</p>
        </div>
      )}

      {withoutDates.length > 0 && (
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.9rem', margin: '0 0 1rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Projects without timeline dates ({withoutDates.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {withoutDates.map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: 'var(--bg-tertiary)', borderRadius: '4px', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ fontWeight: 500 }}>{p.name}</span>
                  {p.clientName && <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>· {p.clientName}</span>}
                </div>
                <Link href={`/projects/${p.id}/edit`} style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', textDecoration: 'none' }}>
                  Set Dates →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
