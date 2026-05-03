import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DashboardCharts from "@/components/DashboardCharts";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const rawProjects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: {
          expenses: true,
          category: true
        }
      }
    }
  });

  const projects = rawProjects.map(p => ({
    id: p.id,
    name: p.name,
    budget: Number(p.budget),
    status: p.status,
    items: p.items.map(i => ({ 
      totalPrice: Number(i.totalPrice),
      expenses: i.expenses.map(e => ({ amount: Number(e.amount) })),
      categoryName: i.category.name
    })),
    clientName: p.clientName,
    location: p.location,
    startDate: p.startDate,
    endDate: p.endDate
  }));

  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'IN_PROGRESS').length;
  const completedProjects = projects.filter(p => p.status === 'COMPLETED').length;
  
  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalEstimate = projects.reduce((sum, p) => sum + p.items.reduce((iSum, i) => iSum + i.totalPrice, 0), 0);
  const estMargin = totalBudget - totalEstimate;
  const marginPercentage = totalBudget > 0 ? (estMargin / totalBudget) * 100 : 0;

  return (
    <div style={{ padding: '0', display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: '100%' }}>

      {/* Top Metrics Row */}
      <div className="metrics-grid">
        <div className="metric-card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '1.25rem', borderLeft: '4px solid var(--accent-primary)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.5rem' }}>Total Projects</div>
          <div className="metric-value" style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{totalProjects}</div>
        </div>

        <div className="metric-card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '1.25rem', borderLeft: '4px solid var(--accent-secondary)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.5rem' }}>Active / In Progress</div>
          <div className="metric-value" style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{activeProjects} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ {completedProjects} Done</span></div>
        </div>

        <div className="metric-card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '1.25rem', borderLeft: '4px solid var(--warning)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.5rem' }}>Accumulated Budget</div>
          <div className="metric-value" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Rp {(totalBudget / 1000000).toFixed(1)}M</div>
        </div>

        <div className="metric-card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '1.25rem', borderLeft: `4px solid ${estMargin >= 0 ? 'var(--success)' : 'var(--error)'}` }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.5rem' }}>Est. Gross Margin</div>
          <div className="metric-value" style={{ fontSize: '1.5rem', fontWeight: 700, color: estMargin >= 0 ? 'var(--success)' : 'var(--error)' }}>
            Rp {(estMargin / 1000000).toFixed(1)}M 
            <span style={{ fontSize: '0.85rem', marginLeft: '0.5rem', padding: '0.1rem 0.4rem', background: estMargin >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', borderRadius: '4px' }}>
              {marginPercentage.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <DashboardCharts projects={projects} />

      {/* Main Data Table Area */}
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>

        <div className="page-header" style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--accent-primary)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Recent Activity
          </h2>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link href="/projects/new" className="btn-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Project
            </Link>
            <Link href="/projects" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.4rem 0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              View All &rarr;
            </Link>
          </div>
        </div>

        <div className="table-responsive-wrapper" style={{ overflowX: 'auto', flex: 1 }}>
          <table className="responsive-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '2px solid var(--border-color)' }}>
              <tr>
                <th style={{ padding: '0.75rem 1.5rem', fontWeight: 600, color: 'var(--text-muted)' }}>Project ID</th>
                <th style={{ padding: '0.75rem 1.5rem', fontWeight: 600, color: 'var(--text-muted)' }}>Project Name & Client</th>
                <th style={{ padding: '0.75rem 1.5rem', fontWeight: 600, color: 'var(--text-muted)' }}>Location</th>
                <th style={{ padding: '0.75rem 1.5rem', fontWeight: 600, color: 'var(--text-muted)' }}>Timeline</th>
                <th style={{ padding: '0.75rem 1.5rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>Budget Ceiling</th>
                <th style={{ padding: '0.75rem 1.5rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '0.75rem 1.5rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No records found in the database. Please initialize a new project.
                  </td>
                </tr>
              ) : (
                projects.map((project, index) => {
                  const estimateCost = project.items.reduce((sum, item) => sum + item.totalPrice, 0);
                  const isOverBudget = project.budget > 0 && estimateCost > project.budget;

                  return (
                    <tr key={project.id} style={{ borderBottom: '1px solid var(--border-color)', background: index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)', transition: 'background 0.2s' }} className="table-row-hover">
                      <td data-label="Project ID" style={{ padding: '0.75rem 1.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        PROJ-{project.id.toString().padStart(4, '0')}
                      </td>
                      <td data-label="Project Name & Client" style={{ padding: '0.75rem 1.5rem' }}>
                        <Link href={`/projects/${project.id}`} style={{ fontWeight: 600, color: 'var(--accent-primary)', textDecoration: 'none' }}>
                          {project.name}
                        </Link>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          {project.clientName || 'No Client Assigned'}
                        </div>
                      </td>
                      <td data-label="Location" style={{ padding: '0.75rem 1.5rem', color: 'var(--text-secondary)' }}>
                        {project.location || '-'}
                      </td>
                      <td data-label="Timeline" style={{ padding: '0.75rem 1.5rem', color: 'var(--text-secondary)' }}>
                        {project.startDate ? new Date(project.startDate).toLocaleDateString('id-ID') : 'TBD'}
                      </td>
                      <td data-label="Budget Ceiling" style={{ padding: '0.75rem 1.5rem', textAlign: 'right', fontWeight: 600 }}>
                        <div style={{ color: isOverBudget ? 'var(--error)' : 'inherit' }}>
                          Rp {Number(project.budget).toLocaleString('id-ID')}
                        </div>
                        {isOverBudget && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--error)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.2rem' }}>
                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            OVERBUDGET
                          </div>
                        )}
                      </td>
                      <td data-label="Status" style={{ padding: '0.75rem 1.5rem', textAlign: 'center' }}>
                        <span style={{
                          background: project.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.15)' : project.status === 'IN_PROGRESS' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: project.status === 'COMPLETED' ? 'var(--success)' : project.status === 'IN_PROGRESS' ? 'var(--accent-primary)' : 'var(--warning)',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          border: `1px solid ${project.status === 'COMPLETED' ? 'var(--success)' : project.status === 'IN_PROGRESS' ? 'var(--accent-primary)' : 'var(--warning)'}`
                        }}>
                          {project.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td data-label="Action" style={{ padding: '0.75rem 1.5rem', textAlign: 'center' }}>
                        <div className="table-actions-mobile" style={{ display: 'flex', justifyContent: 'center' }}>
                          <Link href={`/projects/${project.id}`} style={{ padding: '0.3rem 0.75rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--text-primary)', textDecoration: 'none', width: '100%', textAlign: 'center' }}>
                            <span className="mobile-only-text" style={{ display: 'none' }}>Open Project Details</span>
                            <span className="desktop-only-text">Open</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div style={{ padding: '0.75rem 1.5rem', borderTop: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <div>Showing 1 to {projects.length} of {projects.length} entries</div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button disabled style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.2rem 0.5rem', color: 'var(--text-muted)' }}>Prev</button>
            <button disabled style={{ background: 'var(--accent-primary)', border: '1px solid var(--accent-primary)', borderRadius: '4px', padding: '0.2rem 0.5rem', color: 'white' }}>1</button>
            <button disabled style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.2rem 0.5rem', color: 'var(--text-muted)' }}>Next</button>
          </div>
        </div>

      </div>
    </div>
  );
}
