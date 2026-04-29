'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Expense {
  id: number
  amount: number
  date: string
  receiptNo: string | null
  notes: string | null
  receiptImageUrl: string | null
  submittedBy: string | null
  createdAt: string
  costItemName: string
  categoryName: string
  projectId: number
  projectName: string
  supplierName: string | null
}

interface HistoryItem {
  id: number
  amount: number
  approvalStatus: string
  reviewedBy: string | null
  reviewNote: string | null
  updatedAt: string
  costItemName: string
  projectName: string
}

export default function ApprovalClient({
  expenses,
  history,
  approveAction,
  rejectAction,
  bulkApproveAction
}: {
  expenses: Expense[]
  history: HistoryItem[]
  approveAction: (id: number) => Promise<void>
  rejectAction: (id: number, reason: string) => Promise<void>
  bulkApproveAction: (ids: number[]) => Promise<void>
}) {
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [rejectModal, setRejectModal] = useState<{ id: number; name: string } | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<'pending' | 'history'>('pending')

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const toggleSelect = (id: number) => {
    const s = new Set(selected)
    if (s.has(id)) s.delete(id); else s.add(id)
    setSelected(s)
  }

  const toggleAll = () => {
    if (selected.size === expenses.length) setSelected(new Set())
    else setSelected(new Set(expenses.map(e => e.id)))
  }

  async function handleApprove(id: number) {
    setLoading(true)
    try { await approveAction(id); showToast('Expense approved!') }
    catch { showToast('Failed to approve.', 'error') }
    finally { setLoading(false) }
  }

  async function handleBulkApprove() {
    if (!selected.size) return
    setLoading(true)
    try { await bulkApproveAction(Array.from(selected)); setSelected(new Set()); showToast(`${selected.size} expenses approved!`) }
    catch { showToast('Bulk approve failed.', 'error') }
    finally { setLoading(false) }
  }

  async function handleRejectSubmit() {
    if (!rejectModal) return
    setLoading(true)
    try { await rejectAction(rejectModal.id, rejectReason); setRejectModal(null); setRejectReason(''); showToast('Expense rejected.') }
    catch { showToast('Failed to reject.', 'error') }
    finally { setLoading(false) }
  }

  return (
    <>
      {toast && (
        <div style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 9999, background: toast.type === 'success' ? '#10b981' : '#ef4444', color: 'white', padding: '0.75rem 1.25rem', borderRadius: '8px', fontSize: '0.85rem', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
          {toast.msg}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid var(--border-color)' }}>
        {[{ key: 'pending', label: `Pending (${expenses.length})` }, { key: 'history', label: 'Review History' }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)} style={{
            padding: '0.6rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
            background: 'none', border: 'none', borderBottom: tab === t.key ? '2px solid var(--accent-primary)' : '2px solid transparent',
            color: tab === t.key ? 'var(--accent-primary)' : 'var(--text-muted)', transition: 'all 0.2s'
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'pending' ? (
        <>
          {/* Bulk Actions */}
          {expenses.length > 0 && (
            <div className="approval-bulk-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.75rem 1rem', background: 'var(--bg-secondary)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input type="checkbox" checked={selected.size === expenses.length} onChange={toggleAll} />
                Select All
              </label>
              {selected.size > 0 && (
                <button onClick={handleBulkApprove} disabled={loading} style={{ padding: '0.4rem 1rem', background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>
                  ✓ Approve Selected ({selected.size})
                </button>
              )}
            </div>
          )}

          {expenses.length === 0 ? (
            <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
              <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>All Clear!</div>
              <div style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>No expenses pending approval.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {expenses.map(e => (
                <div key={e.id} className="glass-card approval-card" style={{
                  padding: '1rem 1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start',
                  borderLeft: `4px solid #f59e0b`
                }}>
                  <input type="checkbox" checked={selected.has(e.id)} onChange={() => toggleSelect(e.id)} style={{ marginTop: '0.2rem' }} />
                  
                  {/* Receipt thumbnail */}
                  {e.receiptImageUrl && !e.receiptImageUrl.endsWith('.pdf') ? (
                    <a href={e.receiptImageUrl} target="_blank" rel="noopener noreferrer">
                      <img src={e.receiptImageUrl} alt="Receipt" style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-color)', flexShrink: 0 }} />
                    </a>
                  ) : (
                    <div style={{ width: '56px', height: '56px', background: 'var(--bg-tertiary)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid var(--border-color)' }}>
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--text-muted)">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  )}

                  {/* Info */}
                  <div className="approval-card-info" style={{ flex: 1, minWidth: 0 }}>
                    <div className="approval-info-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: '#f59e0b' }}>
                          Rp {e.amount.toLocaleString('id-ID')}
                        </div>
                        <div style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>
                          <span style={{ fontWeight: 600 }}>{e.costItemName}</span>
                          <span style={{ color: 'var(--text-muted)' }}> · {e.categoryName}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          <Link href={`/projects/${e.projectId}`} style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>
                            📂 {e.projectName}
                          </Link>
                          {e.supplierName && <span> · 🏢 {e.supplierName}</span>}
                        </div>
                        {e.notes && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', fontStyle: 'italic' }}>"{e.notes}"</div>}
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(e.date).toLocaleDateString('id-ID')}
                        </div>
                        {e.submittedBy && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                            by {e.submittedBy}
                          </div>
                        )}
                        {e.receiptNo && (
                          <div style={{ fontSize: '0.7rem', background: 'var(--bg-tertiary)', padding: '0.1rem 0.4rem', borderRadius: '4px', marginTop: '0.25rem' }}>
                            {e.receiptNo}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="approval-card-actions" style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, alignItems: 'center' }}>
                    <button
                      onClick={() => handleApprove(e.id)}
                      disabled={loading}
                      style={{ padding: '0.4rem 1rem', background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => setRejectModal({ id: e.id, name: e.costItemName })}
                      disabled={loading}
                      style={{ padding: '0.4rem 1rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}
                    >
                      ✕ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* History Tab */
        <div className="glass-card history-table-container" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '2px solid var(--border-color)' }}>
              <tr>
                <th style={{ padding: '0.6rem 1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'left' }}>Expense</th>
                <th style={{ padding: '0.6rem 1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>Amount</th>
                <th style={{ padding: '0.6rem 1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '0.6rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Reviewed By</th>
                <th style={{ padding: '0.6rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No review history yet.</td></tr>
              ) : history.map((h, i) => (
                <tr key={h.id} style={{ borderBottom: '1px solid var(--border-color)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                  <td style={{ padding: '0.6rem 1rem' }}>
                    <div style={{ fontWeight: 500 }}>{h.costItemName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{h.projectName}</div>
                  </td>
                  <td style={{ padding: '0.6rem 1rem', textAlign: 'right', fontWeight: 600 }}>Rp {h.amount.toLocaleString('id-ID')}</td>
                  <td style={{ padding: '0.6rem 1rem', textAlign: 'center' }}>
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px',
                      background: h.approvalStatus === 'APPROVED' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                      color: h.approvalStatus === 'APPROVED' ? '#10b981' : '#ef4444'
                    }}>
                      {h.approvalStatus}
                    </span>
                    {h.reviewNote && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem', fontStyle: 'italic' }}>{h.reviewNote}</div>}
                  </td>
                  <td style={{ padding: '0.6rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{h.reviewedBy || '-'}</td>
                  <td style={{ padding: '0.6rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(h.updatedAt).toLocaleDateString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-card" style={{ background: 'var(--bg-secondary)', width: '100%', maxWidth: '420px', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1rem' }}>Reject: {rejectModal.name}</h3>
            <div>
              <label className="input-label">Reason for Rejection</label>
              <textarea
                className="input-field"
                rows={3}
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="e.g. Amount doesn't match receipt, Please resubmit with valid receipt..."
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button onClick={() => { setRejectModal(null); setRejectReason('') }} style={{ flex: 1, padding: '0.6rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleRejectSubmit} disabled={loading || !rejectReason.trim()} style={{ flex: 1, padding: '0.6rem', background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
