import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import ApprovalClient from "@/components/ApprovalClient"
import { approveExpense, rejectExpense, bulkApprove } from "@/app/actions/approval"

export const dynamic = 'force-dynamic'

export default async function ApprovalsPage() {
  const session = await auth()
  const role = (session?.user as any)?.role
  if (role !== 'ADMIN') redirect('/')

  const expenses = await prisma.expense.findMany({
    where: { approvalStatus: 'PENDING' },
    include: {
      costItem: {
        include: {
          project: { select: { id: true, name: true } },
          category: { select: { name: true } }
        }
      },
      supplier: { select: { name: true } }
    },
    orderBy: { createdAt: 'asc' }
  })

  const history = await prisma.expense.findMany({
    where: { approvalStatus: { in: ['APPROVED', 'REJECTED'] }, reviewedBy: { not: null } },
    include: {
      costItem: {
        include: { project: { select: { id: true, name: true } } }
      }
    },
    orderBy: { updatedAt: 'desc' },
    take: 20
  })

  const pendingCount = expenses.length
  const totalPendingValue = expenses.reduce((sum, e) => sum + Number(e.amount), 0)

  const serialized = expenses.map(e => ({
    id: e.id,
    amount: Number(e.amount),
    date: e.date.toISOString(),
    receiptNo: e.receiptNo,
    notes: e.notes,
    receiptImageUrl: e.receiptImageUrl,
    submittedBy: e.submittedBy,
    createdAt: e.createdAt.toISOString(),
    costItemName: e.costItem.name,
    categoryName: e.costItem.category.name,
    projectId: e.costItem.project.id,
    projectName: e.costItem.project.name,
    supplierName: e.supplier?.name || null
  }))

  const historyData = history.map(e => ({
    id: e.id,
    amount: Number(e.amount),
    approvalStatus: e.approvalStatus,
    reviewedBy: e.reviewedBy,
    reviewNote: e.reviewNote,
    updatedAt: e.updatedAt.toISOString(),
    costItemName: e.costItem.name,
    projectName: e.costItem.project.name
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            Expense Approvals
            {pendingCount > 0 && (
              <span style={{ fontSize: '0.75rem', background: '#ef4444', color: 'white', padding: '0.15rem 0.5rem', borderRadius: '99px', fontWeight: 700 }}>
                {pendingCount} Pending
              </span>
            )}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
            Review and approve expense submissions from your team.
          </p>
        </div>
        {totalPendingValue > 0 && (
          <div style={{ textAlign: 'right', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '8px', padding: '0.75rem 1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Pending Value</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f59e0b' }}>Rp {totalPendingValue.toLocaleString('id-ID')}</div>
          </div>
        )}
      </header>

      <ApprovalClient
        expenses={serialized}
        history={historyData}
        approveAction={approveExpense}
        rejectAction={rejectExpense}
        bulkApproveAction={bulkApprove}
      />
    </div>
  )
}
