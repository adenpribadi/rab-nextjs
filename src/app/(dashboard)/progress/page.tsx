import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import ProgressClient from "@/components/ProgressClient"

export const dynamic = 'force-dynamic'

export default async function ProgressPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const projects = await prisma.project.findMany({
    where: {
      status: 'IN_PROGRESS'
    },
    include: {
      items: {
        include: {
          category: true,
          progressUpdates: {
            orderBy: { updateDate: 'desc' },
            take: 5
          }
        },
        orderBy: {
          categoryId: 'asc'
        }
      },
      variationOrders: {
        where: { status: 'APPROVED' },
        include: {
          items: {
            include: {
              category: true,
              progressUpdates: {
                orderBy: { updateDate: 'desc' },
                take: 5
              }
            }
          }
        }
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  })

  // Serialize Decimal for Client Component
  const serializedProjects = projects.map(p => ({
    id: p.id,
    name: p.name,
    clientName: p.clientName,
    budget: Number(p.budget),
    items: [
      ...p.items.map(item => ({
        id: item.id,
        name: item.name,
        categoryId: item.categoryId,
        category: { name: item.category.name },
        unit: item.unit,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
        actualProgress: Number(item.actualProgress),
        actualVolume: Number(item.actualVolume),
        isVO: false,
        progressUpdates: item.progressUpdates.map((up: any) => ({
          id: up.id,
          percentage: Number(up.percentage),
          volume: up.volume ? Number(up.volume) : null,
          staffName: up.staffName,
          updateDate: up.updateDate.toISOString(),
          description: up.description,
          updatedBy: up.updatedBy
        }))
      })),
      ...p.variationOrders.flatMap(vo => vo.items.map(item => ({
        id: item.id,
        name: `(VO) ${item.name}`,
        categoryId: item.categoryId,
        category: { name: item.category.name },
        unit: item.unit,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
        actualProgress: Number(item.actualProgress),
        actualVolume: Number(item.actualVolume),
        isVO: true,
        voId: vo.id,
        progressUpdates: item.progressUpdates.map((up: any) => ({
          id: up.id,
          percentage: Number(up.percentage),
          volume: up.volume ? Number(up.volume) : null,
          staffName: up.staffName,
          updateDate: up.updateDate.toISOString(),
          description: up.description,
          updatedBy: up.updatedBy
        }))
      })))
    ].sort((a, b) => a.categoryId - b.categoryId)
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <header className="page-header">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Field Progress Tracking</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Monitor and update the physical completion percentage for each RAB item.
          </p>
        </div>
      </header>

      <ProgressClient projects={serializedProjects} />
    </div>
  )
}
