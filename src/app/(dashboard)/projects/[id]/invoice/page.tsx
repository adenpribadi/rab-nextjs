import React from 'react'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import PrintButton from '@/components/PrintButton'

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
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

  const company = await prisma.companyProfile.findUnique({ where: { id: 1 } }) || {
    name: 'RAB ERP Solution Inc.',
    address: '123 Tech Boulevard\nJakarta Selatan, 12345',
    phone: '',
    email: 'finance@raberp.com',
    website: ''
  };

  // Calculate totals
  const estimateTotal = project.items.reduce((sum, item) => sum + Number(item.totalPrice), 0)
  
  // Group items by category for cleaner display
  const itemsByCategory = project.items.reduce((acc, item) => {
    const catName = item.category.name;
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(item);
    return acc;
  }, {} as Record<string, typeof project.items>);

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        /* Override global layout */
        .erp-sidebar, .topbar-header { display: none !important; }
        .scrollable-main { padding: 2rem 0 !important; background: #e5e7eb !important; }
        
        /* Invoice Styles */
        body { font-family: 'Inter', sans-serif; background: #e5e7eb !important; }
        * { color: #111827 !important; }
        
        .invoice-table { width: 100%; border-collapse: collapse; margin-top: 1.5rem; font-size: 0.85rem; }
        .invoice-table th { background: #f9fafb !important; padding: 0.5rem 0.75rem; text-align: left; border-bottom: 2px solid #e5e7eb !important; font-weight: 600; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; color: #6b7280 !important; }
        .invoice-table td { padding: 0.5rem 0.75rem; border-bottom: 1px solid #f3f4f6 !important; }
        .category-row { background: #fcfcfd !important; font-weight: 600; }
        
        /* Responsive Mobile Styles */
        @media (max-width: 768px) {
          .scrollable-main { padding: 0 !important; }
          .invoice-container { padding: 1rem !important; margin: 0 !important; box-shadow: none !important; }
          .flex-row { flex-direction: column !important; gap: 1.5rem; }
          .flex-row > div { text-align: left !important; width: 100%; }
          .flex-row > div > div { margin-left: 0 !important; }
          .table-responsive { overflow-x: auto; width: 100%; }
          .invoice-table { min-width: 600px; }
          h1 { font-size: 1.5rem !important; }
        }

        @media print {
          body { background: white !important; }
          .scrollable-main { padding: 0 !important; background: white !important; overflow: visible !important; }
          .no-print { display: none !important; }
          @page { margin: 0; size: A4; }
          .invoice-container { margin: 0 !important; padding: 1.5cm 2cm !important; box-shadow: none !important; max-width: none !important; min-height: auto !important; }
          .flex-row { flex-direction: row !important; gap: 0; }
          .flex-row > div:last-child { text-align: right !important; }
          .table-responsive { overflow: visible !important; }
        }
      `}} />

      <div className="invoice-container" style={{ display: 'flex', flexDirection: 'column', maxWidth: '21cm', margin: '0 auto', background: 'white', padding: '1.5cm 2cm', minHeight: '29.7cm', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
        {/* Action Buttons */}
        <div className="no-print" style={{ position: 'fixed', top: '1rem', right: '1rem', display: 'flex', gap: '1rem', zIndex: 100 }}>
          <PrintButton />
        </div>

        {/* Header */}
        <div className="flex-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #f3f4f6 !important', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800, color: '#111827 !important' }}>INVOICE / QUOTATION</h1>
          <div style={{ marginTop: '0.5rem', color: '#4b5563 !important', fontSize: '0.9rem' }}>
            Reference: INV-PROJ-{project.id.toString().padStart(4, '0')}<br/>
            Date: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 700 }}>{company.name}</h2>
          <div style={{ color: '#4b5563 !important', fontSize: '0.9rem', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
            {company.address}<br/>
            {company.email}
          </div>
        </div>
      </div>

      {/* Project Details */}
      <div className="flex-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#6b7280 !important', margin: '0 0 0.5rem 0', letterSpacing: '0.05em' }}>Bill To</h3>
          <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.2rem' }}>{project.clientName || 'Valued Client'}</div>
          <div style={{ color: '#4b5563 !important', fontSize: '0.95rem' }}>{project.location || 'Location not specified'}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#6b7280 !important', margin: '0 0 0.5rem 0', letterSpacing: '0.05em' }}>Project Summary</h3>
          <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.2rem' }}>{project.name}</div>
          <div style={{ color: '#4b5563 !important', fontSize: '0.95rem' }}>
            Period: {project.startDate ? project.startDate.toLocaleDateString('id-ID') : 'TBD'} - {project.endDate ? project.endDate.toLocaleDateString('id-ID') : 'TBD'}
          </div>
        </div>
      </div>

      {/* Description */}
      {project.description && (
        <div style={{ marginBottom: '2rem', padding: '1rem', background: '#f9fafb !important', borderRadius: '4px', borderLeft: '4px solid #3b82f6 !important' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#374151 !important' }}>Scope of Work:</h4>
          <div style={{ fontSize: '0.9rem', color: '#4b5563 !important', whiteSpace: 'pre-wrap' }}>{project.description}</div>
        </div>
      )}

      {/* Items Table */}
      <div className="table-responsive">
        <table className="invoice-table">
          <thead>
            <tr>
              <th style={{ width: '5%' }}>No</th>
              <th style={{ width: '45%' }}>Description</th>
              <th style={{ width: '10%', textAlign: 'right' }}>Qty</th>
              <th style={{ width: '10%' }}>Unit</th>
              <th style={{ width: '15%', textAlign: 'right' }}>Unit Price (Rp)</th>
              <th style={{ width: '15%', textAlign: 'right' }}>Amount (Rp)</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(itemsByCategory).map(([categoryName, items]) => (
              <React.Fragment key={categoryName}>
                <tr className="category-row">
                  <td colSpan={6} style={{ color: '#374151 !important' }}>{categoryName}</td>
                </tr>
                {items.map((item, index) => (
                  <tr key={item.id}>
                    <td style={{ textAlign: 'center', color: '#6b7280 !important' }}>{index + 1}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{item.name}</div>
                      {item.description && <div style={{ fontSize: '0.8rem', color: '#6b7280 !important', marginTop: '0.2rem' }}>{item.description}</div>}
                    </td>
                    <td style={{ textAlign: 'right' }}>{Number(item.quantity)}</td>
                    <td>{item.unit}</td>
                    <td style={{ textAlign: 'right' }}>{Number(item.unitPrice).toLocaleString('id-ID')}</td>
                    <td style={{ textAlign: 'right', fontWeight: 500 }}>{Number(item.totalPrice).toLocaleString('id-ID')}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4} style={{ border: 'none !important' }}></td>
              <td style={{ textAlign: 'right', fontWeight: 600, padding: '1rem 0.75rem' }}>Subtotal:</td>
              <td style={{ textAlign: 'right', fontWeight: 600, padding: '1rem 0.75rem' }}>Rp {estimateTotal.toLocaleString('id-ID')}</td>
            </tr>
            <tr>
              <td colSpan={4} style={{ border: 'none !important' }}></td>
              <td style={{ textAlign: 'right', fontWeight: 600, padding: '0.5rem 0.75rem', color: '#6b7280 !important' }}>Tax (0%):</td>
              <td style={{ textAlign: 'right', fontWeight: 600, padding: '0.5rem 0.75rem', color: '#6b7280 !important' }}>Rp 0</td>
            </tr>
            <tr>
              <td colSpan={4} style={{ border: 'none !important' }}></td>
              <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '1.1rem', padding: '1rem 0.75rem', borderTop: '2px solid #111827 !important' }}>Grand Total:</td>
              <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '1.1rem', padding: '1rem 0.75rem', borderTop: '2px solid #111827 !important', color: '#2563eb !important' }}>
                Rp {estimateTotal.toLocaleString('id-ID')}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Footer / Signatures */}
      <div className="flex-row" style={{ marginTop: '4rem', display: 'flex', justifyContent: 'space-between', pageBreakInside: 'avoid' }}>
        <div>
          <div style={{ marginBottom: '4rem', fontWeight: 600, color: '#374151 !important' }}>Client Approval</div>
          <div style={{ borderTop: '1px solid #9ca3af !important', width: '200px', paddingTop: '0.5rem', color: '#6b7280 !important', fontSize: '0.9rem' }}>
            Signature & Date
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ marginBottom: '4rem', fontWeight: 600, color: '#374151 !important' }}>Authorized By</div>
          <div style={{ borderTop: '1px solid #9ca3af !important', width: '200px', paddingTop: '0.5rem', color: '#6b7280 !important', fontSize: '0.9rem', textAlign: 'right', marginLeft: 'auto' }}>
            {company.name}
          </div>
        </div>
      </div>
      
      {/* Footer Note */}
      <div style={{ marginTop: 'auto', paddingTop: '4rem' }}>
        <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#9ca3af !important', borderTop: '1px solid #e5e7eb !important', paddingTop: '1rem' }}>
          Thank you for your business. Payment is due within 14 days of the invoice date.
        </div>
      </div>
    </div>
    </>
  )
}
