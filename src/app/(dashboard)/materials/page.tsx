import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { addMaterial, updateMaterial, deleteMaterial } from '@/app/actions/material'

export default async function MaterialsPage({
  searchParams
}: {
  searchParams: Promise<{ editItem?: string, addNew?: string }>
}) {
  let materials = await prisma.material.findMany({
    orderBy: { name: 'asc' }
  })
  
  let categories = await prisma.category.findMany()

  // Auto-seed materials if empty
  if (materials.length === 0) {
    // Ensure we have categories first
    if (categories.length === 0) {
      await prisma.category.createMany({
        data: [
          { name: 'Pekerjaan Persiapan' },
          { name: 'Pekerjaan Tanah & Pasir' },
          { name: 'Pekerjaan Pasangan & Plesteran' },
          { name: 'Pekerjaan Atap' },
          { name: 'Pekerjaan Elektrikal' },
        ]
      });
      categories = await prisma.category.findMany()
    }

    const catPersiapan = categories.find(c => c.name === 'Pekerjaan Persiapan')?.id;
    const catPasangan = categories.find(c => c.name === 'Pekerjaan Pasangan & Plesteran')?.id;
    const catAtap = categories.find(c => c.name === 'Pekerjaan Atap')?.id;
    const catElektrikal = categories.find(c => c.name === 'Pekerjaan Elektrikal')?.id;

    await prisma.material.createMany({
      data: [
        { name: 'Pekerja (Tukang)', unit: 'OH', unitPrice: 150000, categoryId: null },
        { name: 'Kepala Tukang', unit: 'OH', unitPrice: 180000, categoryId: null },
        { name: 'Mandor', unit: 'OH', unitPrice: 200000, categoryId: null },
        { name: 'Semen Portland 50kg', unit: 'Zak', unitPrice: 75000, categoryId: catPasangan },
        { name: 'Pasir Pasang', unit: 'M3', unitPrice: 250000, categoryId: catPasangan },
        { name: 'Batu Bata Merah', unit: 'Bh', unitPrice: 1000, categoryId: catPasangan },
        { name: 'Multiplek 12mm', unit: 'Lbr', unitPrice: 185000, categoryId: catPersiapan },
        { name: 'Baja Ringan C75', unit: 'Btg', unitPrice: 85000, categoryId: catAtap },
        { name: 'Genteng Metal Pasir', unit: 'Lbr', unitPrice: 35000, categoryId: catAtap },
        { name: 'Kabel NYM 2x1.5', unit: 'Roll', unitPrice: 350000, categoryId: catElektrikal },
        { name: 'Lampu Downlight 12W', unit: 'Pcs', unitPrice: 65000, categoryId: catElektrikal },
        { name: 'Cat Tembok Interior 25kg', unit: 'Pail', unitPrice: 1250000, categoryId: null },
      ]
    });
    
    materials = await prisma.material.findMany({
      orderBy: { name: 'asc' }
    });
  }

  const resolvedSearchParams = await searchParams
  const editItemId = resolvedSearchParams?.editItem ? parseInt(resolvedSearchParams.editItem) : null
  const itemToEdit = editItemId ? materials.find(m => m.id === editItemId) : null
  const isAddingNew = resolvedSearchParams?.addNew === 'true'

  return (
    <div style={{ padding: '0', maxWidth: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '100%' }}>
      {/* Header Area */}
      <header className="page-header" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>
            Materials & Wages
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
            Master database for AHSP estimation. Total: {materials.length} records.
          </p>
        </div>
        <Link href="/materials?addNew=true" className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Material
        </Link>
      </header>

      {/* Main Content Area */}
      <div className="responsive-grid" style={{ flex: 1, alignItems: 'flex-start' }}>
        
        {/* Table Area (Takes full width if no edit, or 2/3 width) */}
        <div className="glass-card" style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>Material / Wage Database</h2>
          </div>
          
          <div className="table-responsive-wrapper">
            <table className="responsive-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
              <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '2px solid var(--border-color)' }}>
                <tr>
                  <th style={{ padding: '0.5rem 1rem', fontWeight: 600, color: 'var(--text-muted)', width: '50px' }}>No</th>
                  <th style={{ padding: '0.5rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Material / Wage Name</th>
                  <th style={{ padding: '0.5rem 1rem', fontWeight: 600, color: 'var(--text-muted)', width: '150px' }}>Category</th>
                  <th style={{ padding: '0.5rem 1rem', fontWeight: 600, color: 'var(--text-muted)', width: '100px' }}>Unit</th>
                  <th style={{ padding: '0.5rem 1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right', width: '150px' }}>Unit Price (Rp)</th>
                  <th style={{ padding: '0.5rem 1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center', width: '100px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {materials.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No materials found. Add one below.
                    </td>
                  </tr>
                ) : (
                  materials.map((item, index) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)', background: index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                      <td data-label="#" style={{ padding: '0.5rem 1rem', color: 'var(--text-muted)' }}>{index + 1}</td>
                      <td data-label="Material / Wage Name" style={{ padding: '0.5rem 1rem', fontWeight: 600, color: 'var(--accent-primary)' }}>{item.name}</td>
                      <td data-label="Category" style={{ padding: '0.5rem 1rem', color: 'var(--text-muted)' }}>
                        {categories.find(c => c.id === item.categoryId)?.name || '-'}
                      </td>
                      <td data-label="Unit" style={{ padding: '0.5rem 1rem', color: 'var(--text-muted)' }}>{item.unit}</td>
                      <td data-label="Unit Price" style={{ padding: '0.5rem 1rem', textAlign: 'right', fontWeight: 700, color: 'var(--warning)' }}>
                        Rp {Number(item.unitPrice).toLocaleString('id-ID')}
                      </td>
                      <td data-label="Action" style={{ padding: '0.5rem 1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }} className="table-actions-mobile">
                          <Link href={`/materials?editItem=${item.id}`} style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span className="mobile-only-text" style={{ display: 'none' }}>Edit</span>
                          </Link>
                          <form action={deleteMaterial} style={{ display: 'inline' }}>
                            <input type="hidden" name="id" value={item.id} />
                            <button type="submit" style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              <span className="mobile-only-text" style={{ display: 'none' }}>Delete</span>
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>

      {/* Edit Modal Overlay */}
      {itemToEdit && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="glass-card" style={{
            background: 'var(--bg-secondary)',
            width: '100%',
            maxWidth: '500px',
            padding: '1.5rem',
            border: '1px solid var(--border-color)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Edit Material / Wage</h3>
              <Link href="/materials" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '1.2rem', lineHeight: 1 }}>&times;</Link>
            </div>
            
            <form action={updateMaterial} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="hidden" name="id" value={itemToEdit.id} />
              
              <div>
                <label className="input-label">Name</label>
                <input type="text" name="name" defaultValue={itemToEdit.name} className="input-field" required />
              </div>

              <div>
                <label className="input-label">Category (Optional)</label>
                <select name="categoryId" defaultValue={itemToEdit.categoryId || ''} className="input-field">
                  <option value="">-- No Category --</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="input-label">Unit</label>
                  <input type="text" name="unit" defaultValue={itemToEdit.unit} className="input-field" required />
                </div>
                <div>
                  <label className="input-label">Unit Price (Rp)</label>
                  <input type="number" name="unitPrice" defaultValue={Number(itemToEdit.unitPrice)} className="input-field" required />
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <Link href="/materials" className="btn-secondary" style={{ padding: '0.5rem 1rem', textDecoration: 'none' }}>
                  Cancel
                </Link>
                <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1.5rem' }}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Modal Overlay */}
      {isAddingNew && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="glass-card" style={{
            background: 'var(--bg-secondary)',
            width: '100%',
            maxWidth: '500px',
            padding: '1.5rem',
            border: '1px solid var(--border-color)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Add New Material / Wage</h3>
              <Link href="/materials" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '1.2rem', lineHeight: 1 }}>&times;</Link>
            </div>
            
            <form action={addMaterial} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="input-label">Material / Wage Name</label>
                <input type="text" name="name" className="input-field" required placeholder="e.g. Semen Portland, Pasir Pasang" />
              </div>

              <div>
                <label className="input-label">Category (Optional)</label>
                <select name="categoryId" className="input-field">
                  <option value="">-- No Category --</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="input-label">Unit</label>
                  <input type="text" name="unit" className="input-field" required placeholder="e.g. M3, Zak, OH" />
                </div>
                <div>
                  <label className="input-label">Unit Price (Rp)</label>
                  <input type="number" name="unitPrice" className="input-field" required placeholder="Price per unit" />
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <Link href="/materials" className="btn-secondary" style={{ padding: '0.5rem 1rem', textDecoration: 'none' }}>
                  Cancel
                </Link>
                <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1.5rem' }}>
                  Create Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
