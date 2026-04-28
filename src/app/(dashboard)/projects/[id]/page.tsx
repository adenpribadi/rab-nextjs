import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { addCostItem, updateCostItem, deleteCostItem } from '@/app/actions/costItem'
import { addExpense, deleteExpense } from '@/app/actions/expense'
import ExportButtons from '@/components/ExportButtons'
import CostItemFormModal from '@/components/CostItemFormModal'
import ExpenseFormModal from '@/components/ExpenseFormModal'
import DeleteCostItemButton from '@/components/DeleteCostItemButton'

export default async function ProjectDetails({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ editItem?: string, addItem?: string, expenseItem?: string }>
}) {
  const { id } = await params
  const projectId = parseInt(id)
  
  const resolvedSearchParams = await searchParams
  const editItemId = resolvedSearchParams?.editItem ? parseInt(resolvedSearchParams.editItem) : null
  const expenseItemId = resolvedSearchParams?.expenseItem ? parseInt(resolvedSearchParams.expenseItem) : null
  const showAddItem = resolvedSearchParams?.addItem === 'true'
  
  if (isNaN(projectId)) {
    notFound()
  }

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

  if (!project) {
    notFound()
  }

  let categories = await prisma.category.findMany()
  if (categories.length === 0) {
    await prisma.category.createMany({
      data: [
        { name: 'Pekerjaan Persiapan' },
        { name: 'Pekerjaan Tanah & Pasir' },
        { name: 'Pekerjaan Pasangan & Plesteran' },
        { name: 'Pekerjaan Atap' },
        { name: 'Pekerjaan Elektrikal' },
      ]
    })
    categories = await prisma.category.findMany()
  }

  const rawMaterials = await prisma.material.findMany({ orderBy: { name: 'asc' } })
  const materials = rawMaterials.map(m => ({
    id: m.id,
    name: m.name,
    unit: m.unit,
    unitPrice: Number(m.unitPrice),
    categoryId: m.categoryId
  }))

  const suppliers = await prisma.supplier.findMany({ orderBy: { name: 'asc' } })

  const estimateTotal = project.items.reduce((sum, item) => sum + Number(item.totalPrice), 0)
  const realizedTotal = project.items.reduce((sum, item) => {
    return sum + (item.expenses ? item.expenses.reduce((expSum, exp) => expSum + Number(exp.amount), 0) : 0)
  }, 0)
  
  const budget = Number(project.budget)
  const isEstimateOverBudget = estimateTotal > budget
  const budgetPercentage = budget > 0 ? Math.min((estimateTotal / budget) * 100, 100) : 0
  const realizationPercentage = estimateTotal > 0 ? Math.min((realizedTotal / estimateTotal) * 100, 100) : 0
  
  const rawItemToEdit = editItemId ? project.items.find(i => i.id === editItemId) : null;
  const itemToEdit = rawItemToEdit ? {
    id: rawItemToEdit.id,
    name: rawItemToEdit.name,
    description: rawItemToEdit.description,
    quantity: Number(rawItemToEdit.quantity),
    unit: rawItemToEdit.unit,
    unitPrice: Number(rawItemToEdit.unitPrice),
    categoryId: rawItemToEdit.categoryId
  } : null;

  const rawExpenseItem = expenseItemId ? project.items.find(i => i.id === expenseItemId) : null;
  const expenseItemToEdit = rawExpenseItem ? {
    id: rawExpenseItem.id,
    name: rawExpenseItem.name,
    totalPrice: Number(rawExpenseItem.totalPrice),
    expenses: rawExpenseItem.expenses.map(exp => ({
      id: exp.id,
      amount: Number(exp.amount),
      date: exp.date.toISOString(),
      receiptNo: exp.receiptNo,
      notes: exp.notes,
      receiptImageUrl: exp.receiptImageUrl
    }))
  } : null;

  return (
    <div style={{ padding: '0', maxWidth: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '100%' }}>
      {/* Dense Header */}
      <div className="mobile-header-wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border-color)', borderRadius: '8px 8px 0 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '1.2rem' }}>&larr;</Link>
          <h1 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 600, color: 'var(--text-primary)' }}>
            {project.name}
          </h1>
          <span style={{ 
            background: project.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.15)' : project.status === 'IN_PROGRESS' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(245, 158, 11, 0.15)', 
            color: project.status === 'COMPLETED' ? 'var(--success)' : project.status === 'IN_PROGRESS' ? 'var(--accent-primary)' : 'var(--warning)', 
            padding: '0.15rem 0.5rem', 
            borderRadius: '4px', 
            fontSize: '0.75rem', 
            fontWeight: 600,
            border: `1px solid ${project.status === 'COMPLETED' ? 'var(--success)' : project.status === 'IN_PROGRESS' ? 'var(--accent-primary)' : 'var(--warning)'}`
          }}>
            {project.status.replace('_', ' ')}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            ID: PROJ-{project.id.toString().padStart(4, '0')}
          </div>
          <Link href={`/projects/${project.id}/edit`} className="btn-primary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', boxShadow: 'none' }}>
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ marginRight: '0.25rem' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Project
          </Link>
        </div>
      </div>
      
      {/* Budget Warning Banner */}
      {isEstimateOverBudget && (
        <div className="no-print" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderLeft: '4px solid var(--error)', padding: '1rem 1.5rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '-0.25rem', marginBottom: '0.5rem' }}>
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="var(--error)">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div style={{ color: '#fca5a5' }}>
            <strong style={{ display: 'block', fontSize: '0.95rem', marginBottom: '0.2rem', color: 'var(--error)' }}>CRITICAL: BUDGET CEILING EXCEEDED</strong>
            <span style={{ fontSize: '0.85rem' }}>
              The estimated project cost (<strong>Rp {estimateTotal.toLocaleString('id-ID')}</strong>) has exceeded the specified budget (<strong>Rp {budget.toLocaleString('id-ID')}</strong>) by <strong>Rp {(estimateTotal - budget).toLocaleString('id-ID')}</strong>. 
              Please review the Bill of Quantities or request a budget revision.
            </span>
          </div>
        </div>
      )}

      {/* Dense Metrics Panel */}
      <div className="responsive-grid-detail" style={{ marginBottom: '1.5rem' }}>
        
        {/* Info Grid */}
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', fontSize: '0.85rem' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Client / Owner</div>
              <div style={{ fontWeight: 600 }}>{project.clientName || '-'}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Location</div>
              <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{project.location || '-'}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Timeline</div>
              <div style={{ fontWeight: 600 }}>
                {project.startDate ? project.startDate.toLocaleDateString('id-ID') : '-'} s/d {project.endDate ? project.endDate.toLocaleDateString('id-ID') : '-'}
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Total Items</div>
              <div style={{ fontWeight: 600 }}>{project.items.length} records</div>
            </div>
          </div>
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Description / Scope</div>
            <div style={{ lineHeight: 1.4 }}>{project.description || 'No description provided.'}</div>
          </div>
        </div>

        {/* Financial Summary */}
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Budget Ceiling</span>
            <span style={{ fontWeight: 600 }}>Rp {budget.toLocaleString('id-ID')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>RAB Estimate</span>
            <span style={{ fontWeight: 700, color: isEstimateOverBudget ? 'var(--error)' : 'inherit' }}>Rp {estimateTotal.toLocaleString('id-ID')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Actual Realized</span>
            <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>Rp {realizedTotal.toLocaleString('id-ID')}</span>
          </div>
          
          <div style={{ height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
            <div style={{ 
              position: 'absolute', left: 0, top: 0, bottom: 0, 
              width: `${realizationPercentage}%`, 
              background: 'var(--accent-primary)',
              transition: 'width 0.3s ease'
            }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>Realization vs Estimate</span>
            <span>{realizationPercentage.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Main RAB Items Table Area */}
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        <div className="mobile-header-wrap" style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>Bill of Quantities (BoQ) / RAB Items</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <ExportButtons 
              project={{ 
                id: project.id,
                name: project.name, 
                items: project.items.map(i => ({ 
                  category: { name: i.category.name }, 
                  name: i.name, 
                  description: i.description, 
                  quantity: Number(i.quantity), 
                  unit: i.unit, 
                  unitPrice: Number(i.unitPrice), 
                  totalPrice: Number(i.totalPrice),
                  expenses: i.expenses.map(e => ({ amount: Number(e.amount) }))
                })) 
              }} 
              estimateTotal={estimateTotal} 
              realizedTotal={realizedTotal}
            />
            <Link href={`/projects/${project.id}?addItem=true`} className="btn-primary no-print" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>+ Add Item</Link>
          </div>
        </div>

        <div style={{ overflowX: 'auto', flex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '2px solid var(--border-color)' }}>
              <tr>
                <th style={{ padding: '0.5rem 1rem', fontWeight: 600, color: 'var(--text-muted)', width: '40px' }}>No</th>
                <th style={{ padding: '0.5rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Work Category</th>
                <th style={{ padding: '0.5rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Item Description</th>
                <th style={{ padding: '0.5rem 1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right', width: '80px' }}>Qty</th>
                <th style={{ padding: '0.5rem 1rem', fontWeight: 600, color: 'var(--text-muted)', width: '80px' }}>Unit</th>
                <th style={{ padding: '0.5rem 1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right', width: '120px' }}>Unit Price (Rp)</th>
                <th style={{ padding: '0.5rem 1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right', width: '130px' }}>Estimate (Rp)</th>
                <th style={{ padding: '0.5rem 1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right', width: '130px' }}>Realized (Rp)</th>
                <th style={{ padding: '0.5rem 1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center', width: '100px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {project.items.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No cost items found. Add a new item below to start building the RAB.
                  </td>
                </tr>
              ) : (
                project.items.map((item, index) => {
                  const itemRealized = item.expenses ? item.expenses.reduce((sum, exp) => sum + Number(exp.amount), 0) : 0;
                  const itemEstimate = Number(item.totalPrice);
                  const isOver = itemRealized > itemEstimate;
                  
                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)', background: index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                      <td style={{ padding: '0.5rem 1rem', color: 'var(--text-muted)' }}>{index + 1}</td>
                      <td style={{ padding: '0.5rem 1rem' }}>
                        <span style={{ background: 'var(--bg-tertiary)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', border: '1px solid var(--border-color)' }}>
                          {item.category.name}
                        </span>
                      </td>
                      <td style={{ padding: '0.5rem 1rem' }}>
                        <div style={{ fontWeight: 500 }}>{item.name}</div>
                        {item.description && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{item.description}</div>}
                      </td>
                      <td style={{ padding: '0.5rem 1rem', textAlign: 'right', fontWeight: 500 }}>{Number(item.quantity)}</td>
                      <td style={{ padding: '0.5rem 1rem', color: 'var(--text-muted)' }}>{item.unit}</td>
                      <td style={{ padding: '0.5rem 1rem', textAlign: 'right' }}>{Number(item.unitPrice).toLocaleString('id-ID')}</td>
                      <td style={{ padding: '0.5rem 1rem', textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }}>{itemEstimate.toLocaleString('id-ID')}</td>
                      <td style={{ padding: '0.5rem 1rem', textAlign: 'right', fontWeight: 600, color: isOver ? 'var(--error)' : 'var(--accent-primary)' }}>
                        {itemRealized > 0 ? itemRealized.toLocaleString('id-ID') : '-'}
                      </td>
                      <td style={{ padding: '0.5rem 1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          <Link href={`/projects/${project.id}?expenseItem=${item.id}`} style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontSize: '0.8rem' }} title="Input/View Realization">
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </Link>
                          <Link href={`/projects/${project.id}?editItem=${item.id}`} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.8rem' }} title="Edit">
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>
                          <form action={deleteCostItem}>
                            <input type="hidden" name="id" value={item.id} />
                            <input type="hidden" name="projectId" value={project.id} />
                            <DeleteCostItemButton />
                          </form>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
            {project.items.length > 0 && (
              <tfoot style={{ borderTop: '2px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                <tr>
                  <td colSpan={6} style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600 }}>Grand Total:</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                    {estimateTotal.toLocaleString('id-ID')}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 700, fontSize: '0.95rem', color: realizedTotal > estimateTotal ? 'var(--error)' : 'var(--accent-primary)', whiteSpace: 'nowrap' }}>
                    {realizedTotal.toLocaleString('id-ID')}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Inline form removed in favor of Modal */}
      </div>

      {/* Unified Add/Edit Modal Overlay */}
      {(itemToEdit || showAddItem) && (
        <CostItemFormModal 
          projectId={project.id}
          itemToEdit={itemToEdit}
          categories={categories}
          materials={materials}
          action={itemToEdit ? updateCostItem : addCostItem}
        />
      )}

      {/* Expense Modal Overlay */}
      {expenseItemToEdit && (
        <ExpenseFormModal
          projectId={project.id}
          costItem={expenseItemToEdit}
          suppliers={suppliers}
          action={addExpense}
          deleteAction={deleteExpense}
        />
      )}
    </div>
  )
}
