import React from 'react'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import PrintButton from '@/components/PrintButton'

export default async function RealizationReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const projectId = parseInt(id)
  
  if (isNaN(projectId)) return notFound()

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      items: {
        include: {
          category: true,
          expenses: true
        },
        orderBy: {
          categoryId: 'asc'
        }
      }
    }
  })

  if (!project) return notFound()

  const estimateTotal = project.items.reduce((sum, item) => sum + Number(item.totalPrice), 0)
  const realizedTotal = project.items.reduce((sum, item) => {
    return sum + (item.expenses ? item.expenses.reduce((expSum, exp) => expSum + Number(exp.amount), 0) : 0)
  }, 0)

  const itemsByCategory = project.items.reduce((acc, item) => {
    const catName = item.category.name;
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(item);
    return acc;
  }, {} as Record<string, typeof project.items>);

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .erp-sidebar, .topbar-header { display: none !important; }
        .scrollable-main { padding: 2rem 0 !important; background: #e5e7eb !important; }
        body { font-family: 'Inter', sans-serif; background: #e5e7eb !important; }
        * { color: #111827 !important; }
        
        .report-table { width: 100%; border-collapse: collapse; margin-top: 1.5rem; font-size: 0.8rem; }
        .report-table th { background: #f9fafb !important; padding: 0.5rem 0.5rem; text-align: left; border-bottom: 2px solid #e5e7eb !important; font-weight: 600; text-transform: uppercase; font-size: 0.7rem; color: #6b7280 !important; }
        .report-table td { padding: 0.5rem 0.5rem; border-bottom: 1px solid #f3f4f6 !important; }
        .category-row { background: #fcfcfd !important; font-weight: 600; }
        .status-badge { padding: 0.1rem 0.4rem; borderRadius: 4px; fontSize: 0.65rem; fontWeight: 700; textTransform: uppercase; }
        
        @media print {
          body { background: white !important; }
          .scrollable-main { padding: 0 !important; background: white !important; overflow: visible !important; }
          .no-print { display: none !important; }
          @page { margin: 1cm; size: A4 landscape; }
          .report-container { margin: 0 !important; padding: 0 !important; box-shadow: none !important; max-width: none !important; }
        }
      `}} />

      <div className="report-container" style={{ display: 'flex', flexDirection: 'column', maxWidth: '27cm', margin: '0 auto', background: 'white', padding: '1.5cm', minHeight: '21cm', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
        <div className="no-print" style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 100 }}>
          <PrintButton />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #f3f4f6', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>REALIZATION VS ESTIMATE REPORT</h1>
            <p style={{ margin: '0.25rem 0', color: '#4b5563', fontSize: '0.9rem' }}>Project: <strong>{project.name}</strong></p>
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.85rem' }}>
            <strong>Date:</strong> {new Date().toLocaleDateString('id-ID')}<br/>
            <strong>Status:</strong> {project.status.replace('_', ' ')}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '4px' }}>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Total Estimate (RAB)</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Rp {estimateTotal.toLocaleString('id-ID')}</div>
          </div>
          <div style={{ padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '4px' }}>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Total Realized (Actual)</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#3b82f6' }}>Rp {realizedTotal.toLocaleString('id-ID')}</div>
          </div>
          <div style={{ padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '4px' }}>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Overall Variance</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: (estimateTotal - realizedTotal) < 0 ? '#ef4444' : '#10b981' }}>
              {(estimateTotal - realizedTotal) < 0 ? '-' : '+'} Rp {Math.abs(estimateTotal - realizedTotal).toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        <table className="report-table">
          <thead>
            <tr>
              <th style={{ width: '30px' }}>No</th>
              <th>Description</th>
              <th style={{ textAlign: 'right', width: '60px' }}>Qty</th>
              <th style={{ width: '40px' }}>Unit</th>
              <th style={{ textAlign: 'right', width: '100px' }}>Unit Price</th>
              <th style={{ textAlign: 'right', width: '120px' }}>Est. Total</th>
              <th style={{ textAlign: 'right', width: '120px' }}>Realized</th>
              <th style={{ textAlign: 'right', width: '100px' }}>Variance</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(itemsByCategory).map(([category, items]) => (
              <React.Fragment key={category}>
                <tr className="category-row">
                  <td colSpan={8} style={{ padding: '0.4rem 0.5rem', fontSize: '0.75rem', color: '#374151', borderTop: '1px solid #e5e7eb' }}>
                    {category}
                  </td>
                </tr>
                {items.map((item, idx) => {
                  const itemEst = Number(item.totalPrice);
                  const itemRel = item.expenses.reduce((s, e) => s + Number(e.amount), 0);
                  const itemVar = itemEst - itemRel;
                  return (
                    <tr key={item.id}>
                      <td style={{ color: '#9ca3af' }}>{idx + 1}</td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{item.name}</div>
                      </td>
                      <td style={{ textAlign: 'right' }}>{Number(item.quantity)}</td>
                      <td>{item.unit}</td>
                      <td style={{ textAlign: 'right' }}>{Number(item.unitPrice).toLocaleString('id-ID')}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{itemEst.toLocaleString('id-ID')}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: itemRel > 0 ? '#3b82f6' : 'inherit' }}>
                        {itemRel > 0 ? itemRel.toLocaleString('id-ID') : '-'}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: itemVar < 0 ? '#ef4444' : '#10b981' }}>
                        {itemRel > 0 ? (itemVar < 0 ? `(${Math.abs(itemVar).toLocaleString('id-ID')})` : itemVar.toLocaleString('id-ID')) : '-'}
                      </td>
                    </tr>
                  )
                })}
              </React.Fragment>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: '#f9fafb', fontWeight: 800 }}>
              <td colSpan={5} style={{ textAlign: 'right', padding: '0.75rem' }}>GRAND TOTAL</td>
              <td style={{ textAlign: 'right', padding: '0.75rem' }}>{estimateTotal.toLocaleString('id-ID')}</td>
              <td style={{ textAlign: 'right', padding: '0.75rem', color: '#3b82f6' }}>{realizedTotal.toLocaleString('id-ID')}</td>
              <td style={{ textAlign: 'right', padding: '0.75rem', color: (estimateTotal - realizedTotal) < 0 ? '#ef4444' : '#10b981' }}>
                {(estimateTotal - realizedTotal).toLocaleString('id-ID')}
              </td>
            </tr>
          </tfoot>
        </table>

        <div style={{ marginTop: 'auto', paddingTop: '3rem', display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ textAlign: 'center', width: '200px' }}>
            <p style={{ marginBottom: '4rem', fontSize: '0.85rem' }}>Approved by,</p>
            <div style={{ borderTop: '1px solid #111827', width: '100%' }}></div>
            <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Project Manager</p>
          </div>
        </div>
      </div>
    </>
  )
}
