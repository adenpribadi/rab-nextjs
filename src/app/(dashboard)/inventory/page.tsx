import { prisma } from "@/lib/prisma"
import { addStockMovement, updateMinStock } from "@/app/actions/inventory"
import InventoryClient from "@/components/InventoryClient"

export const dynamic = 'force-dynamic'

export default async function InventoryPage() {
  const materials = await prisma.material.findMany({
    include: {
      movements: {
        orderBy: { createdAt: 'desc' },
        take: 5
      }
    },
    orderBy: { name: 'asc' }
  })

  const projects = await prisma.project.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  })

  // Summary stats
  const totalItems = materials.length
  const lowStockItems = materials.filter(m => Number(m.currentStock) <= Number(m.minStock) && Number(m.minStock) > 0).length
  const totalStockValue = materials.reduce((sum, m) => sum + (Number(m.currentStock) * Number(m.unitPrice)), 0)

  const serialized = materials.map(m => ({
    id: m.id,
    name: m.name,
    unit: m.unit,
    unitPrice: Number(m.unitPrice),
    categoryId: m.categoryId,
    currentStock: Number(m.currentStock),
    minStock: Number(m.minStock),
    movements: m.movements.map(mv => ({
      id: mv.id,
      type: mv.type,
      quantity: Number(mv.quantity),
      notes: mv.notes,
      projectId: mv.projectId,
      createdAt: mv.createdAt.toISOString()
    }))
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 700 }}>Inventory & Stock</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
            Track material stock levels, receive new stock, and monitor usage.
          </p>
        </div>
      </header>

      {/* Summary Metrics */}
      <div className="metrics-grid">
        <div className="metric-card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '1.25rem', borderLeft: '4px solid var(--accent-primary)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.5rem' }}>Total Items</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{totalItems}</div>
        </div>
        <div className="metric-card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '1.25rem', borderLeft: `4px solid ${lowStockItems > 0 ? 'var(--error)' : 'var(--success)'}` }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.5rem' }}>Low Stock Alert</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: lowStockItems > 0 ? 'var(--error)' : 'var(--success)' }}>{lowStockItems}</div>
        </div>
        <div className="metric-card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '1.25rem', borderLeft: '4px solid var(--warning)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.5rem' }}>Est. Stock Value</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>Rp {(totalStockValue / 1000000).toFixed(1)}M</div>
        </div>
      </div>

      {/* Main inventory table with client interactions */}
      <InventoryClient
        materials={serialized}
        projects={projects}
        addMovementAction={addStockMovement}
        updateMinStockAction={updateMinStock}
      />
    </div>
  )
}
