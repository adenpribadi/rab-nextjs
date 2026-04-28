import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { addClient, updateClient, deleteClient } from '@/app/actions/client'
import DeleteClientButton from '@/components/DeleteClientButton'

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string, add?: string }>
}) {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { projects: true }
      }
    }
  })

  const resolvedParams = await searchParams
  const isEditing = !!resolvedParams.edit
  const isAdding = !!resolvedParams.add
  
  let editClient = null
  if (isEditing) {
    editClient = clients.find(c => c.id === parseInt(resolvedParams.edit as string))
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>Master Clients</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>
            Manage your clients, customers, and their contact information.
          </p>
        </div>
        <Link href="/clients?add=true" className="btn-primary" style={{ textDecoration: 'none' }}>
          + Add Client
        </Link>
      </div>

      <div className="glass-card">
        {clients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ margin: '0 auto 1rem', opacity: 0.5 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3>No Clients Found</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>You haven't added any clients to your database yet.</p>
            <Link href="/clients?add=true" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>Add Your First Client</Link>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 500 }}>Client / Company</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 500 }}>Contact Info</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 500 }}>Projects</th>
                <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 500 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{client.name}</div>
                    {client.company && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{client.company}</div>}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      {client.email && (
                        <span style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                          {client.email}
                        </span>
                      )}
                      {client.phone && (
                        <span style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                          {client.phone}
                        </span>
                      )}
                      {client.address && (
                         <span style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'flex-start', gap: '0.4rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                         <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ marginTop: '0.1rem' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                         {client.address}
                       </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <span style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                      {client._count.projects} Projects
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <Link href={`/clients?edit=${client.id}`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }} title="Edit">
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <form action={deleteClient}>
                        <input type="hidden" name="id" value={client.id} />
                        <DeleteClientButton />
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal for Add/Edit Client */}
      {(isAdding || isEditing) && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div className="glass-card" style={{
            background: 'var(--bg-secondary)', width: '100%', maxWidth: '500px',
            padding: '1.5rem', border: '1px solid var(--border-color)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>{isEditing ? 'Edit Client' : 'Add New Client'}</h3>
              <Link href="/clients" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '1.2rem' }}>&times;</Link>
            </div>
            
            <form action={isEditing ? updateClient : addClient} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {isEditing && <input type="hidden" name="id" value={editClient?.id} />}
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="input-label">Contact Name *</label>
                  <input type="text" name="name" defaultValue={editClient?.name} className="input-field" required placeholder="e.g. John Doe" />
                </div>
                <div>
                  <label className="input-label">Company Name</label>
                  <input type="text" name="company" defaultValue={editClient?.company || ''} className="input-field" placeholder="e.g. PT Maju Bersama" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="input-label">Email Address</label>
                  <input type="email" name="email" defaultValue={editClient?.email || ''} className="input-field" placeholder="e.g. john@example.com" />
                </div>
                <div>
                  <label className="input-label">Phone Number</label>
                  <input type="text" name="phone" defaultValue={editClient?.phone || ''} className="input-field" placeholder="e.g. 081234567890" />
                </div>
              </div>

              <div>
                <label className="input-label">Full Address</label>
                <textarea name="address" defaultValue={editClient?.address || ''} className="input-field" rows={3} placeholder="Complete billing/project address..."></textarea>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <Link href="/clients" style={{ padding: '0.5rem 1.5rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', textDecoration: 'none', borderRadius: '4px' }}>
                  Cancel
                </Link>
                <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1.5rem' }}>
                  {isEditing ? 'Save Changes' : 'Create Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
