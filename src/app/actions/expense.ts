'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

export async function addExpense(formData: FormData) {
  const session = await auth();
  const username = (session?.user as any)?.username || 'unknown';
  const role = (session?.user as any)?.role || 'USER';

  const projectId = parseInt(formData.get('projectId') as string);
  const costItemId = parseInt(formData.get('costItemId') as string);
  const amount = parseFloat(formData.get('amount') as string);
  const dateStr = formData.get('date') as string;
  const receiptNo = formData.get('receiptNo') as string | null;
  const notes = formData.get('notes') as string | null;
  const supplierIdStr = formData.get('supplierId') as string | null;

  if (isNaN(projectId) || isNaN(costItemId) || isNaN(amount) || !dateStr) {
    throw new Error('Missing required fields for expense');
  }

  // Admin expenses are auto-approved; USER expenses go PENDING
  const approvalStatus = role === 'ADMIN' ? 'APPROVED' : 'PENDING';

  await prisma.expense.create({
    data: {
      costItemId,
      amount,
      date: new Date(dateStr),
      receiptNo,
      notes,
      supplierId: supplierIdStr ? parseInt(supplierIdStr) : null,
      submittedBy: username,
      approvalStatus
    }
  });

  revalidatePath(`/projects/${projectId}`);
}

export async function deleteExpense(formData: FormData) {
  const projectId = parseInt(formData.get('projectId') as string);
  const id = parseInt(formData.get('id') as string);

  if (isNaN(id) || isNaN(projectId)) return;

  await prisma.expense.delete({
    where: { id }
  });

  revalidatePath(`/projects/${projectId}`);
}
