'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function addCostItem(formData: FormData) {
  const projectId = parseInt(formData.get('projectId') as string);
  const categoryId = parseInt(formData.get('categoryId') as string);
  const name = formData.get('name') as string;
  const description = formData.get('description') as string | null;
  const quantity = parseFloat(formData.get('quantity') as string);
  const unit = formData.get('unit') as string;
  const unitPrice = parseFloat(formData.get('unitPrice') as string);

  if (!projectId || !categoryId || !name || isNaN(quantity) || isNaN(unitPrice)) {
    throw new Error('Missing required fields');
  }

  const totalPrice = quantity * unitPrice;

  await prisma.costItem.create({
    data: {
      projectId,
      categoryId,
      name,
      description,
      quantity,
      unit,
      unitPrice,
      totalPrice,
    },
  });

  revalidatePath(`/projects/${projectId}`);
}

export async function updateCostItem(formData: FormData) {
  const id = parseInt(formData.get('id') as string);
  const projectId = parseInt(formData.get('projectId') as string);
  const categoryId = parseInt(formData.get('categoryId') as string);
  const name = formData.get('name') as string;
  const description = formData.get('description') as string | null;
  const quantity = parseFloat(formData.get('quantity') as string);
  const unit = formData.get('unit') as string;
  const unitPrice = parseFloat(formData.get('unitPrice') as string);

  if (!id || !projectId || !categoryId || !name || isNaN(quantity) || isNaN(unitPrice)) {
    throw new Error('Missing required fields');
  }

  const totalPrice = quantity * unitPrice;

  await prisma.costItem.update({
    where: { id },
    data: {
      categoryId,
      name,
      description,
      quantity,
      unit,
      unitPrice,
      totalPrice,
    },
  });

  revalidatePath(`/projects/${projectId}`);
}

export async function deleteCostItem(formData: FormData) {
  const id = parseInt(formData.get('id') as string);
  const projectId = parseInt(formData.get('projectId') as string);

  if (!id || !projectId) {
    throw new Error('Missing ID or Project ID');
  }

  await prisma.costItem.delete({
    where: { id },
  });

  revalidatePath(`/projects/${projectId}`);
}
