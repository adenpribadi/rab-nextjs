'use client'

import { useState } from 'react'

interface Material {
  id: number
  name: string
  unit: string
  unitPrice: number
  currentStock: number
  minStock: number
  movements: { id: number; type: string; quantity: number; notes: string | null; projectId: number | null; createdAt: string }[]
}

interface Project {
  id: number
  name: string
}

export default function InventoryClient({
  materials,
  projects,
  addMovementAction,
  updateMinStockAction
}: {
  materials: Material[]
  projects: Project[]
  addMovementAction: (f: FormData) => Promise<void>
  updateMinStockAction: (f: FormData) => Promise<void>
}) {
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
  const [movementType, setMovementType] = useState<'IN' | 'OUT' | 'ADJUST'>('IN')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'low' | 'ok'>('all')
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function handleMovement(formData: FormData) {
    try {
      await addMovementAction(formData)
      setSelectedMaterial(null)
      showToast('Stock updated successfully!')
    } catch {
      showToast('Failed to update stock.', 'error')
    }
  }

  const filtered = materials.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase())
    const isLow = m.currentStock <= m.minStock && m.minStock > 0
    if (filter === 'low') return matchSearch && isLow
    if (filter === 'ok') return matchSearch && !isLow
    return matchSearch
  })

  const getStockStatus = (m: Material) => {
    if (m.minStock === 0) return { label: 'No Minimum', color: 'var(--text-muted)', bg: 'rgba(255,255,255,0.05)' }
    if (m.currentStock === 0) return { label: 'OUT OF STOCK', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' }
    if (m.currentStock <= m.minStock) return { label: 'LOW STOCK', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' }
    return { label: 'OK', color: '#10b981', bg: 'rgba(16,185,129,0.1)' }
  }

  return (
    <>
      {toast && (
        <div style={{
          position: 'fixed', top: '1rem', right: '1rem', zIndex: 9999,
          background: toast.type === 'success' ? '#10b981' : '#ef4444',
          color: 'white', padding: '0.75rem 1.25rem', borderRadius: '8px',
          fontSize: '0.85rem', boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          {toast.msg}
        </div>
      )}

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Toolbar */}
        <div className="responsive-filter-bar" style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-tertiary)' }}>
          <div className="filter-inputs" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1 1 100%' }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search material..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.6rem 0.75rem 0.6rem 2.25rem', fontSize: '0.85rem', color: 'var(--text-primary)', width: '100%', outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', flex: '1 1 auto' }}>
              {(['all', 'low', 'ok'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    flex: 1, padding: '0.5rem', fontSize: '0.75rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600,
                    background: filter === f ? 'var(--accent-primary)' : 'var(--bg-primary)',
                    color: filter === f ? 'white' : 'var(--text-muted)',
                    border: `1px solid ${filter === f ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                    whiteSpace: 'nowrap'
                  }}
                >
                  {f === 'all' ? 'All' : f === 'low' ? '⚠ Low' : '✓ OK'}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Showing {filtered.length} materials
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive-wrapper" style={{ overflowX: 'auto' }}>
          <table className="responsive-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '2px solid var(--border-color)' }}>
              <tr>
                <th style={{ padding: '0.6rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Material Name</th>
                <th style={{ padding: '0.6rem 1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center' }}>Unit</th>
                <th style={{ padding: '0.6rem 1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>Unit Price</th>
                <th style={{ padding: '0.6rem 1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center' }}>Current Stock</th>
                <th style={{ padding: '0.6rem 1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center' }}>Min Stock</th>
                <th style={{ padding: '0.6rem 1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>Stock Value</th>
                <th style={{ padding: '0.6rem 1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '0.6rem 1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No materials found.
                  </td>
                </tr>
              ) : filtered.map((m, idx) => {
                const status = getStockStatus(m)
                const stockValue = m.currentStock * m.unitPrice
                return (
                  <tr key={m.id} style={{ borderBottom: '1px solid var(--border-color)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                    <td data-label="Material Name" style={{ padding: '0.6rem 1rem', fontWeight: 500 }}>{m.name}</td>
                    <td data-label="Unit" style={{ padding: '0.6rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>{m.unit}</td>
                    <td data-label="Unit Price" style={{ padding: '0.6rem 1rem', textAlign: 'right' }}>Rp {m.unitPrice.toLocaleString('id-ID')}</td>
                    <td data-label="Current Stock" style={{ padding: '0.6rem 1rem', textAlign: 'center', fontWeight: 700, fontSize: '1rem', color: m.currentStock === 0 ? 'var(--error)' : 'var(--text-primary)' }}>
                      {Number(m.currentStock).toLocaleString('id-ID')}
                    </td>
                    <td data-label="Min Stock" style={{ padding: '0.6rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      {m.minStock > 0 ? Number(m.minStock).toLocaleString('id-ID') : '-'}
                    </td>
                    <td data-label="Stock Value" style={{ padding: '0.6rem 1rem', textAlign: 'right', fontWeight: 500 }}>
                      {stockValue > 0 ? `Rp ${stockValue.toLocaleString('id-ID')}` : '-'}
                    </td>
                    <td data-label="Status" style={{ padding: '0.6rem 1rem', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px', background: status.bg, color: status.color }}>
                        {status.label}
                      </span>
                    </td>
                    <td data-label="Action" style={{ padding: '0.6rem 1rem', textAlign: 'center' }}>
                      <button
                        onClick={() => setSelectedMaterial(m)}
                        style={{
                          padding: '0.4rem 1rem', fontSize: '0.75rem', borderRadius: '4px', cursor: 'pointer',
                          background: 'rgba(59,130,246,0.1)', color: 'var(--accent-primary)',
                          border: '1px solid rgba(59,130,246,0.3)', fontWeight: 600, width: '100%'
                        }}
                      >
                        Manage Stock
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Movement Modal */}
      {selectedMaterial && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem'
        }}>
          <div className="glass-card" style={{
            background: 'var(--bg-secondary)', width: '100%', maxWidth: '520px',
            padding: '1.5rem', maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>📦 {selectedMaterial.name}</h3>
              <button onClick={() => setSelectedMaterial(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.3rem' }}>×</button>
            </div>

            {/* Stock info bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: '6px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Current Stock</div>
                <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>{Number(selectedMaterial.currentStock).toLocaleString('id-ID')} {selectedMaterial.unit}</div>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: '6px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Unit Price</div>
                <div style={{ fontWeight: 600 }}>Rp {selectedMaterial.unitPrice.toLocaleString('id-ID')}</div>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: '6px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Stock Value</div>
                <div style={{ fontWeight: 600 }}>Rp {(selectedMaterial.currentStock * selectedMaterial.unitPrice).toLocaleString('id-ID')}</div>
              </div>
            </div>

            {/* Movement Type Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              {(['IN', 'OUT', 'ADJUST'] as const).map(t => (
                <button key={t} onClick={() => setMovementType(t)} style={{
                  flex: 1, padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem',
                  background: movementType === t
                    ? (t === 'IN' ? 'rgba(16,185,129,0.2)' : t === 'OUT' ? 'rgba(239,68,68,0.2)' : 'rgba(59,130,246,0.2)')
                    : 'var(--bg-tertiary)',
                  color: movementType === t
                    ? (t === 'IN' ? '#10b981' : t === 'OUT' ? '#ef4444' : '#3b82f6')
                    : 'var(--text-muted)',
                  border: `1px solid ${movementType === t
                    ? (t === 'IN' ? 'rgba(16,185,129,0.4)' : t === 'OUT' ? 'rgba(239,68,68,0.4)' : 'rgba(59,130,246,0.4)')
                    : 'var(--border-color)'}`
                }}>
                  {t === 'IN' ? '⬆ Stock In' : t === 'OUT' ? '⬇ Stock Out' : '⚖ Adjust'}
                </button>
              ))}
            </div>

            <form action={handleMovement} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="hidden" name="materialId" value={selectedMaterial.id} />
              <input type="hidden" name="type" value={movementType} />

              <div>
                <label className="input-label">
                  {movementType === 'ADJUST' ? 'Set Stock To (new absolute value)' : `Quantity (${selectedMaterial.unit})`}
                </label>
                <input type="number" name="quantity" className="input-field" required min="0.01" step="0.01" placeholder={movementType === 'ADJUST' ? 'New stock value...' : 'e.g. 50'} />
              </div>

              {movementType === 'OUT' && (
                <div>
                  <label className="input-label">Project (Optional)</label>
                  <select name="projectId" className="input-field">
                    <option value="">-- General Usage --</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="input-label">Notes (Optional)</label>
                <input type="text" name="notes" className="input-field" placeholder={movementType === 'IN' ? 'e.g. Purchase from TB. Maju' : movementType === 'OUT' ? 'e.g. Used for Project X' : 'e.g. Physical count adjustment'} />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setSelectedMaterial(null)} style={{ flex: 1, padding: '0.6rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 2, padding: '0.6rem' }}>
                  {movementType === 'IN' ? '✓ Receive Stock' : movementType === 'OUT' ? '✓ Record Usage' : '✓ Set Stock Level'}
                </button>
              </div>
            </form>

            {/* Recent Movements */}
            {selectedMaterial.movements.length > 0 && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 0.75rem' }}>Recent Movements</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {selectedMaterial.movements.map(mv => (
                    <div key={mv.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '0.4rem 0.6rem', background: 'var(--bg-tertiary)', borderRadius: '4px' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ color: mv.type === 'IN' ? '#10b981' : mv.type === 'OUT' ? '#ef4444' : '#3b82f6', fontWeight: 700, fontSize: '0.7rem' }}>{mv.type}</span>
                        <span style={{ fontWeight: 600 }}>{Number(mv.quantity).toLocaleString('id-ID')} {selectedMaterial.unit}</span>
                        {mv.notes && <span style={{ color: 'var(--text-muted)' }}>· {mv.notes}</span>}
                      </div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{new Date(mv.createdAt).toLocaleDateString('id-ID')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
