'use client'

import { useState } from 'react'
import Link from 'next/link'
import ReceiptUploader from './ReceiptUploader'

export default function ExpenseFormModal({ 
  projectId, 
  costItem, 
  suppliers,
  action,
  deleteAction
}: { 
  projectId: number, 
  costItem: any, 
  suppliers?: any[],
  action: any,
  deleteAction: any
}) {
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [receiptNo, setReceiptNo] = useState('')
  const [notes, setNotes] = useState('')
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null)

  const actualTotal = costItem.expenses ? costItem.expenses.reduce((sum: number, exp: any) => sum + Number(exp.amount), 0) : 0;
  const estimateTotal = Number(costItem.totalPrice);
  const remaining = estimateTotal - actualTotal;

  async function handleAddExpense(formData: FormData) {
    try {
      await action(formData);
      setAmount('');
      setReceiptNo('');
      setNotes('');
      setToast({ msg: 'Expense recorded successfully!', type: 'success' });
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      setToast({ msg: 'Failed to record expense.', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    }
  }

  async function handleDeleteExpense(formData: FormData) {
    if (confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteAction(formData);
        setToast({ msg: 'Expense deleted successfully!', type: 'success' });
        setTimeout(() => setToast(null), 3000);
      } catch (error) {
        setToast({ msg: 'Failed to delete expense.', type: 'error' });
        setTimeout(() => setToast(null), 3000);
      }
    }
  }

  return (
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
        maxWidth: '600px',
        padding: '1.5rem',
        border: '1px solid var(--border-color)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative'
      }}>
        {toast && (
          <div style={{
            position: 'absolute', top: '1rem', left: '50%', transform: 'translateX(-50%)',
            background: toast.type === 'success' ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)',
            color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', fontSize: '0.85rem', zIndex: 10,
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            {toast.msg}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Realization: {costItem.name}</h3>
          <Link href={`/projects/${projectId}`} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '1.2rem', lineHeight: 1 }}>&times;</Link>
        </div>

        {/* Summary Card */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1.5rem', background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Estimate (RAB)</div>
            <div style={{ fontWeight: 600 }}>Rp {estimateTotal.toLocaleString('id-ID')}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Actual Spent</div>
            <div style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>Rp {actualTotal.toLocaleString('id-ID')}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Variance</div>
            <div style={{ fontWeight: 600, color: remaining < 0 ? 'var(--error)' : 'var(--success)' }}>
              {remaining < 0 ? '-' : '+'}Rp {Math.abs(remaining).toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Expense History</h4>
          {costItem.expenses && costItem.expenses.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '0.4rem', textAlign: 'left' }}>Date</th>
                  <th style={{ padding: '0.4rem', textAlign: 'left' }}>Receipt</th>
                  <th style={{ padding: '0.4rem', textAlign: 'right' }}>Amount</th>
                  <th style={{ padding: '0.4rem', textAlign: 'center' }}>Bukti</th>
                  <th style={{ padding: '0.4rem', textAlign: 'center' }}></th>
                </tr>
              </thead>
              <tbody>
                {costItem.expenses.map((exp: any) => (
                  <tr key={exp.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.4rem', whiteSpace: 'nowrap' }}>{new Date(exp.date).toLocaleDateString('id-ID')}</td>
                    <td style={{ padding: '0.4rem' }}>
                      <div>{exp.receiptNo || '-'}</div>
                      {exp.notes && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{exp.notes}</div>}
                    </td>
                    <td style={{ padding: '0.4rem', textAlign: 'right', fontWeight: 500, whiteSpace: 'nowrap' }}>Rp {Number(exp.amount).toLocaleString('id-ID')}</td>
                    <td style={{ padding: '0.4rem', textAlign: 'center' }}>
                      <ReceiptUploader
                        expenseId={exp.id}
                        currentImageUrl={exp.receiptImageUrl}
                      />
                    </td>
                    <td style={{ padding: '0.4rem', textAlign: 'center' }}>
                      <form action={handleDeleteExpense}>
                        <input type="hidden" name="id" value={exp.id} />
                        <input type="hidden" name="projectId" value={projectId} />
                        <button type="submit" style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: 0 }} title="Delete">
                          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No expenses recorded yet.</div>
          )}
        </div>
        
        <form action={handleAddExpense} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          <h4 style={{ fontSize: '0.9rem', margin: 0, color: 'var(--text-primary)' }}>Add New Expense</h4>
          <input type="hidden" name="projectId" value={projectId} />
          <input type="hidden" name="costItemId" value={costItem.id} />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="input-label">Date</label>
              <input type="date" name="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="input-label">Amount (Rp)</label>
              <input type="number" name="amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="input-field" required placeholder="e.g. 500000" />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="input-label">Receipt / Invoice No. (Optional)</label>
              <input type="text" name="receiptNo" value={receiptNo} onChange={(e) => setReceiptNo(e.target.value)} className="input-field" placeholder="e.g. INV-001" />
            </div>
            <div>
              <label className="input-label">Notes (Optional)</label>
              <input type="text" name="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="input-field" placeholder="e.g. Purchased from Toko Abadi" />
            </div>
          </div>

          <div>
            <label className="input-label">Supplier / Vendor (Optional)</label>
            <select name="supplierId" className="input-field">
              <option value="">-- None --</option>
              {suppliers?.map(s => (
                <option key={s.id} value={s.id}>{s.name} {s.category ? `(${s.category})` : ''}</option>
              ))}
            </select>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Link href={`/projects/${projectId}`} style={{ padding: '0.5rem 1.5rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', textDecoration: 'none', borderRadius: '4px', textAlign: 'center', flex: 1, fontSize: '0.85rem' }}>
              Back
            </Link>
            <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1.5rem', flex: 1, fontSize: '0.85rem' }}>
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
