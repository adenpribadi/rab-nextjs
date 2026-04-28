import { prisma } from "@/lib/prisma"
import { updateCompanyProfile, createUser, deleteUser } from "@/app/actions/settings"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function SettingsPage() {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') {
    // Only admins can access settings
    // For now, let's allow it but we should ideally protect it
  }

  const company = await prisma.companyProfile.findUnique({ where: { id: 1 } }) || {
    name: 'My Company',
    address: '',
    phone: '',
    email: '',
    website: ''
  };

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div style={{ padding: '0', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header>
        <h1 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 700 }}>System Settings</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Manage your company identity and user accounts.</p>
      </header>

      <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem', alignItems: 'flex-start' }}>
        
        {/* Company Profile Section */}
        <section className="glass-card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--accent-primary)">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Company Profile
          </h2>
          <form action={updateCompanyProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="input-label">Company Name</label>
              <input name="name" defaultValue={company.name} className="input-field" required />
            </div>
            <div>
              <label className="input-label">Address</label>
              <textarea name="address" defaultValue={company.address || ''} className="input-field" rows={3} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="input-label">Phone</label>
                <input name="phone" defaultValue={company.phone || ''} className="input-field" />
              </div>
              <div>
                <label className="input-label">Email</label>
                <input name="email" defaultValue={company.email || ''} type="email" className="input-field" />
              </div>
            </div>
            <div>
              <label className="input-label">Website</label>
              <input name="website" defaultValue={company.website || ''} className="input-field" />
            </div>
            <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>Save Changes</button>
          </form>
        </section>

        {/* User Management Section */}
        <section className="glass-card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--accent-primary)">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            User Accounts
          </h2>
          
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Add New User</h3>
            <form action={createUser} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '0.75rem', alignItems: 'flex-end' }}>
              <div>
                <label className="input-label" style={{ fontSize: '0.7rem' }}>Username</label>
                <input name="username" className="input-field" required style={{ padding: '0.4rem' }} />
              </div>
              <div>
                <label className="input-label" style={{ fontSize: '0.7rem' }}>Full Name</label>
                <input name="name" className="input-field" style={{ padding: '0.4rem' }} />
              </div>
              <div>
                <label className="input-label" style={{ fontSize: '0.7rem' }}>Password</label>
                <input name="password" type="password" className="input-field" required style={{ padding: '0.4rem' }} />
              </div>
              <div>
                <select name="role" className="input-field" style={{ padding: '0.4rem' }}>
                  <option value="USER">Estimator</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <button type="submit" className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>Add</button>
            </form>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>User</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Role</th>
                  <th style={{ textAlign: 'center', padding: '0.5rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <div style={{ fontWeight: 600 }}>{u.username}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.name || '-'}</div>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span style={{ 
                        fontSize: '0.7rem', 
                        padding: '0.1rem 0.4rem', 
                        borderRadius: '4px', 
                        background: u.role === 'ADMIN' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                        color: u.role === 'ADMIN' ? '#a78bfa' : '#60a5fa'
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                      {u.username !== 'admin' && (
                        <form action={async () => { 'use server'; await deleteUser(u.id); }}>
                          <button type="submit" style={{ color: 'var(--error)', fontSize: '0.75rem' }}>Delete</button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
