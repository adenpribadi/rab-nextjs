'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createVariationOrder, updateVOStatus, deleteVO, addVOItem } from '@/app/actions/variationOrder'

export default function VariationOrderSection({ 
  projectId, 
  variationOrders, 
  categories 
}: { 
  projectId: number, 
  variationOrders: any[], 
  categories: any[] 
}) {
  const [showAddVO, setShowAddVO] = useState(false)
  const [expandedVO, setExpandedVO] = useState<number | null>(null)
  const [showAddItem, setShowAddItem] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleStatusUpdate(id: number, status: any) {
    setLoading(true)
    await updateVOStatus(id, status)
    setLoading(false)
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this Variation Order?")) return
    setLoading(true)
    await deleteVO(id)
    setLoading(false)
  }

  return (
    <div style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Variation Orders (VO) / Addendum</h2>
        <button 
          onClick={() => setShowAddVO(true)}
          className="btn-primary" 
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
        >
          + Create New VO
        </button>
      </div>

      {variationOrders.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px dashed var(--border-color)', color: 'var(--text-muted)' }}>
          No Variation Orders recorded for this project yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {variationOrders.map((vo) => (
            <div key={vo.id} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
            <div 
              className="glass-card" 
              onClick={() => setExpandedVO(expandedVO === vo.id ? null : vo.id)}
              style={{ padding: '1rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: expandedVO === vo.id ? 'rgba(255,255,255,0.03)' : 'transparent', border: 'none', borderRadius: '12px 12px 0 0' }}
            >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>{vo.title}</span>
                    <span style={{ 
                      fontSize: '0.65rem', 
                      padding: '0.15rem 0.6rem', 
                      borderRadius: '20px', 
                      background: vo.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.15)' : vo.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: vo.status === 'APPROVED' ? 'var(--success)' : vo.status === 'REJECTED' ? 'var(--error)' : 'var(--warning)',
                      border: `1px solid ${vo.status === 'APPROVED' ? 'var(--success)' : vo.status === 'REJECTED' ? 'var(--error)' : 'var(--warning)'}`,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.02em'
                    }}>
                      {vo.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{vo.description || 'No description provided'}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Additional Value</div>
                    <div style={{ fontWeight: 700, color: 'var(--accent-primary)', fontSize: '1.05rem' }}>Rp {Number(vo.totalAmount).toLocaleString('id-ID')}</div>
                  </div>
                  <div style={{ padding: '0.5rem', borderRadius: '50%', background: expandedVO === vo.id ? 'rgba(255,255,255,0.05)' : 'transparent' }}>
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ transform: expandedVO === vo.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {expandedVO === vo.id && (
                <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.1)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '0.5rem' }}>Category</th>
                        <th style={{ padding: '0.5rem' }}>Item Name</th>
                        <th style={{ padding: '0.5rem', textAlign: 'right' }}>Qty</th>
                        <th style={{ padding: '0.5rem' }}>Unit</th>
                        <th style={{ padding: '0.5rem' }}>Price</th>
                        <th style={{ padding: '0.5rem', textAlign: 'right' }}>Total</th>
                        {vo.status === 'APPROVED' && <th style={{ padding: '0.5rem', textAlign: 'center', width: '100px' }}>Progress</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {vo.items.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>No items in this VO yet.</td>
                        </tr>
                      ) : (
                        vo.items.map((item: any) => (
                          <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '0.5rem' }}>
                              <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.05)', padding: '0.1rem 0.4rem', borderRadius: '4px', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                {item.category?.name}
                              </span>
                            </td>
                            <td style={{ padding: '0.5rem' }}>{item.name}</td>
                            <td style={{ padding: '0.5rem', textAlign: 'right' }}>{Number(item.quantity)}</td>
                            <td style={{ padding: '0.5rem' }}>{item.unit}</td>
                            <td style={{ padding: '0.5rem', textAlign: 'right' }}>{Number(item.unitPrice).toLocaleString('id-ID')}</td>
                            <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 600 }}>{Number(item.totalPrice).toLocaleString('id-ID')}</td>
                            {vo.status === 'APPROVED' && (
                              <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                                <Link href="/progress" title="Update Progress" style={{ textDecoration: 'none' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'center' }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: Number(item.actualProgress) >= 100 ? 'var(--success)' : 'var(--text-primary)' }}>
                                      {Number(item.actualProgress).toFixed(1)}%
                                    </div>
                                    <div style={{ width: '60px', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                                      <div style={{ width: `${item.actualProgress}%`, height: '100%', background: Number(item.actualProgress) >= 100 ? 'var(--success)' : 'var(--accent-primary)' }}></div>
                                    </div>
                                  </div>
                                </Link>
                              </td>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      {vo.status !== 'APPROVED' && (
                        <>
                          <button onClick={() => setShowAddItem(vo.id)} className="btn-secondary" style={{ padding: '0.4rem 0.9rem', fontSize: '0.75rem' }}>
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Item
                          </button>
                          <button onClick={() => handleDelete(vo.id)} className="btn-outline" style={{ padding: '0.4rem 0.9rem', fontSize: '0.75rem', color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete VO
                          </button>
                        </>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      {vo.status === 'PENDING' && (
                        <>
                          <button onClick={() => handleStatusUpdate(vo.id, 'APPROVED')} className="btn-primary" style={{ padding: '0.4rem 1.2rem', fontSize: '0.75rem', background: 'var(--success)', borderColor: 'var(--success)', boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.3)' }}>
                            Approve Addendum
                          </button>
                          <button onClick={() => handleStatusUpdate(vo.id, 'REJECTED')} className="btn-outline" style={{ padding: '0.4rem 1.2rem', fontSize: '0.75rem', color: 'var(--error)', borderColor: 'var(--error)' }}>
                            Reject
                          </button>
                        </>
                      )}
                      {vo.status !== 'PENDING' && (
                        <button onClick={() => handleStatusUpdate(vo.id, 'PENDING')} className="btn-outline" style={{ padding: '0.4rem 1.2rem', fontSize: '0.75rem' }}>
                          {vo.status === 'APPROVED' ? 'Unlock / Revise' : 'Revert to Pending'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add VO Modal */}
      {showAddVO && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <form 
            action={async (formData) => {
              setLoading(true)
              await createVariationOrder(formData)
              setShowAddVO(false)
              setLoading(false)
            }}
            className="glass-card"
            style={{ width: '100%', maxWidth: '450px', border: '1px solid var(--border-highlight)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)', transition: 'none', transform: 'none' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontFamily: 'var(--font-display)' }}>Create Variation Order</h3>
              <button type="button" onClick={() => setShowAddVO(false)} style={{ color: 'var(--text-muted)', fontSize: '1.5rem' }}>&times;</button>
            </div>
            <input type="hidden" name="projectId" value={projectId} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Variation Order Title</label>
                <input name="title" required placeholder="e.g. Tambahan Pekerjaan Pagar Samping" className="input-field" />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Rationale / Description</label>
                <textarea name="description" rows={3} placeholder="Explain the technical or client requirement for this change..." className="input-field" style={{ resize: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1 }}>
                  {loading ? 'Processing...' : 'Initialize VO'}
                </button>
                <button type="button" onClick={() => setShowAddVO(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <form 
            action={async (formData) => {
              setLoading(true)
              await addVOItem(formData)
              setShowAddItem(null)
              setLoading(false)
            }}
            className="glass-card"
            style={{ width: '100%', maxWidth: '480px', border: '1px solid var(--border-highlight)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)', transition: 'none', transform: 'none' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontFamily: 'var(--font-display)' }}>Add Work Item to VO</h3>
              <button type="button" onClick={() => setShowAddItem(null)} style={{ color: 'var(--text-muted)', fontSize: '1.5rem' }}>&times;</button>
            </div>
            <input type="hidden" name="variationOrderId" value={showAddItem} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Work Category</label>
                <select name="categoryId" required className="input-field">
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Item Description</label>
                <input name="name" required placeholder="e.g. Pengadaan & Pasang Marmer Statuario" className="input-field" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Quantity</label>
                  <input name="quantity" type="number" step="0.01" required className="input-field" />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Unit</label>
                  <input name="unit" required placeholder="m2, kg, lot..." className="input-field" />
                </div>
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Unit Price (Rp)</label>
                <input name="unitPrice" type="number" required placeholder="0" className="input-field" />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1 }}>
                  {loading ? 'Adding...' : 'Confirm Add Item'}
                </button>
                <button type="button" onClick={() => setShowAddItem(null)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
