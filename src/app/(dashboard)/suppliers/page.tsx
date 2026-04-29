import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { addSupplier, updateSupplier, deleteSupplier } from '@/app/actions/supplier'
import DeleteSupplierButton from '@/components/DeleteSupplierButton'

export default async function SuppliersPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string, add?: string }>
}) {
  const suppliers = await prisma.supplier.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { expenses: true }
      }
    }
  })

  const resolvedParams = await searchParams
  const isEditing = !!resolvedParams.edit
  const isAdding = !!resolvedParams.add
  
  let editSupplier = null
  if (isEditing) {
    editSupplier = suppliers.find(s => s.id === parseInt(resolvedParams.edit as string))
  }

  return (
    <div>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>Vendors & Suppliers</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>
            Manage the material stores and sub-contractors.
          </p>
        </div>
        <Link href="/suppliers?add=true" className="btn-primary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Supplier
        </Link>
      </header>

      <div className="glass-card">
        {suppliers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ margin: '0 auto 1rem', opacity: 0.5 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3>No Suppliers Found</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>You haven't added any material vendors or sub-contractors.</p>
            <Link href="/suppliers?add=true" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>Add Your First Supplier</Link>
          </div>
        ) : (
          <div className="table-responsive-wrapper">
            <table className="responsive-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 500 }}>Store / Vendor Name</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 500 }}>Category</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 500 }}>Contact Info</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 500 }}>Recorded Expenses</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 500 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((supplier) => (
                  <tr key={supplier.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td data-label="Store / Vendor Name" style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--accent-primary)', fontSize: '1rem' }}>{supplier.name}</div>
                    </td>
                    <td data-label="Category" style={{ padding: '1rem' }}>
                      {supplier.category ? (
                        <span style={{ padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {supplier.category}
                        </span>
                      ) : '-'}
                    </td>
                    <td data-label="Contact Info" style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {supplier.contactName && (
                          <span style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            {supplier.contactName}
                          </span>
                        )}
                        {supplier.phone && (
                          <span style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            {supplier.phone}
                          </span>
                        )}
                        {supplier.address && (
                           <span style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'flex-start', gap: '0.4rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                           <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ marginTop: '0.1rem' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                           {supplier.address}
                         </span>
                        )}
                      </div>
                    </td>
                    <td data-label="Recorded Expenses" style={{ padding: '1rem', textAlign: 'center' }}>
                      <span style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                        {supplier._count.expenses} Transactions
                      </span>
                    </td>
                    <td data-label="Action" style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }} className="table-actions-mobile">
                        <Link href={`/suppliers?edit=${supplier.id}`} style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }} title="Edit">
                          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span className="mobile-only-text" style={{ display: 'none' }}>Edit</span>
                        </Link>
                        <form action={deleteSupplier} style={{ display: 'inline' }}>
                          <input type="hidden" name="id" value={supplier.id} />
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <DeleteSupplierButton />
                            <span className="mobile-only-text" style={{ display: 'none', color: 'var(--error)' }}>Delete</span>
                          </div>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Add/Edit Supplier */}
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
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>{isEditing ? 'Edit Supplier' : 'Add New Supplier'}</h3>
              <Link href="/suppliers" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '1.2rem' }}>&times;</Link>
            </div>
            
            <form action={isEditing ? updateSupplier : addSupplier} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {isEditing && <input type="hidden" name="id" value={editSupplier?.id} />}
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                <div>
                  <label className="input-label">Store / Company Name *</label>
                  <input type="text" name="name" defaultValue={editSupplier?.name} className="input-field" required placeholder="e.g. TB. Bangunan Jaya" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="input-label">Supplier Category</label>
                  <input type="text" name="category" defaultValue={editSupplier?.category || ''} className="input-field" placeholder="e.g. Material / Alat Berat" />
                </div>
                <div>
                  <label className="input-label">Person in Charge</label>
                  <input type="text" name="contactName" defaultValue={editSupplier?.contactName || ''} className="input-field" placeholder="e.g. Koh Ahong" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                <div>
                  <label className="input-label">Phone Number / WhatsApp</label>
                  <input type="text" name="phone" defaultValue={editSupplier?.phone || ''} className="input-field" placeholder="e.g. 081234567890" />
                </div>
              </div>

              <div>
                <label className="input-label">Store Address</label>
                <textarea name="address" defaultValue={editSupplier?.address || ''} className="input-field" rows={2} placeholder="Complete physical address..."></textarea>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <Link href="/suppliers" style={{ padding: '0.5rem 1.5rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', textDecoration: 'none', borderRadius: '4px' }}>
                  Cancel
                </Link>
                <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1.5rem' }}>
                  {isEditing ? 'Save Changes' : 'Add Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
