'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createCategory(formData: FormData) {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;

  if (!name) {
    throw new Error('Category name is required');
  }

  await prisma.category.create({
    data: {
      name,
      description: description || null,
    },
  });

  revalidatePath('/categories');
}

export async function deleteCategory(formData: FormData) {
  const id = parseInt(formData.get('id') as string);
  
  // Check if there are items using this category
  const itemsCount = await prisma.costItem.count({
    where: { categoryId: id }
  });

  if (itemsCount > 0) {
    throw new Error('Cannot delete category because it is being used by cost items.');
  }

  await prisma.category.delete({
    where: { id },
  });

  revalidatePath('/categories');
}

export async function updateCategory(formData: FormData) {
  const id = parseInt(formData.get('id') as string);
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;

  if (!id || !name) {
    throw new Error('ID and name are required');
  }

  await prisma.category.update({
    where: { id },
    data: {
      name,
      description: description || null,
    },
  });

  revalidatePath('/categories');
}
