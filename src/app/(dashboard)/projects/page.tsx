import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function ProjectsPage({
  searchParams
}: {
  searchParams: Promise<{ search?: string, status?: string }>
}) {
  const resolvedParams = await searchParams;
  const search = resolvedParams.search || '';
  const status = resolvedParams.status || '';

  const projects = await prisma.project.findMany({
    where: {
      AND: [
        search ? {
          OR: [
            { name: { contains: search } },
            { clientName: { contains: search } },
            { location: { contains: search } }
          ]
        } : {},
        status ? { status: status as any } : {}
      ]
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <header className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>Projects Directory</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>Manage and oversee all your cost estimation projects.</p>
        </div>
        <Link href="/projects/new" className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Project
        </Link>
      </header>

      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        <form method="GET" action="/projects" style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input 
              type="text" 
              name="search"
              defaultValue={search}
              placeholder="Search name, client, or location..." 
              style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.4rem 0.75rem', fontSize: '0.85rem', color: 'var(--text-primary)', width: '300px' }} 
            />
            <select 
              name="status"
              defaultValue={status}
              style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.4rem 0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}
            >
              <option value="">All Statuses</option>
              <option value="PLANNING">Planning</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
            <button type="submit" className="btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>Filter</button>
            {(search || status) && (
              <Link href="/projects" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', alignSelf: 'center' }}>Clear</Link>
            )}
          </div>
        </form>

        <div style={{ overflowX: 'auto', flex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
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
                projects.map((project, index) => (
                  <tr key={project.id} style={{ borderBottom: '1px solid var(--border-color)', background: index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)', transition: 'background 0.2s' }} className="table-row-hover">
                    <td style={{ padding: '0.75rem 1.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                      PROJ-{project.id.toString().padStart(4, '0')}
                    </td>
                    <td style={{ padding: '0.75rem 1.5rem' }}>
                      <Link href={`/projects/${project.id}`} style={{ fontWeight: 600, color: 'var(--accent-primary)', textDecoration: 'none' }}>
                        {project.name}
                      </Link>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        {project.clientName || 'No Client Assigned'}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1.5rem', color: 'var(--text-secondary)' }}>
                      {project.location || '-'}
                    </td>
                    <td style={{ padding: '0.75rem 1.5rem', color: 'var(--text-secondary)' }}>
                      {project.startDate ? project.startDate.toLocaleDateString('id-ID') : 'TBD'}
                    </td>
                    <td style={{ padding: '0.75rem 1.5rem', textAlign: 'right', fontWeight: 600 }}>
                      Rp {Number(project.budget).toLocaleString('id-ID')}
                    </td>
                    <td style={{ padding: '0.75rem 1.5rem', textAlign: 'center' }}>
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
                    <td style={{ padding: '0.75rem 1.5rem', textAlign: 'center' }}>
                      <Link href={`/projects/${project.id}`} style={{ padding: '0.3rem 0.75rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--text-primary)', textDecoration: 'none' }}>
                        Open
                      </Link>
                    </td>
                  </tr>
                ))
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
