'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

export async function approveExpense(id: number) {
  const session = await auth();
  const username = (session?.user as any)?.username || 'admin';
  const role = (session?.user as any)?.role;

  if (role !== 'ADMIN') throw new Error('Unauthorized');

  await prisma.expense.update({
    where: { id },
    data: { approvalStatus: 'APPROVED', reviewedBy: username, reviewNote: null }
  });

  revalidatePath('/approvals');
  revalidatePath('/');
}

export async function rejectExpense(id: number, reason: string) {
  const session = await auth();
  const username = (session?.user as any)?.username || 'admin';
  const role = (session?.user as any)?.role;

  if (role !== 'ADMIN') throw new Error('Unauthorized');

  await prisma.expense.update({
    where: { id },
    data: { approvalStatus: 'REJECTED', reviewedBy: username, reviewNote: reason }
  });

  revalidatePath('/approvals');
  revalidatePath('/');
}

export async function bulkApprove(ids: number[]) {
  const session = await auth();
  const username = (session?.user as any)?.username || 'admin';
  const role = (session?.user as any)?.role;

  if (role !== 'ADMIN') throw new Error('Unauthorized');

  await prisma.expense.updateMany({
    where: { id: { in: ids } },
    data: { approvalStatus: 'APPROVED', reviewedBy: username }
  });

  revalidatePath('/approvals');
  revalidatePath('/');
}
