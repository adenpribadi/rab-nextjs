'use server';

import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export async function addSupplier(formData: FormData) {
  const name = formData.get('name') as string;
  const contactName = formData.get('contactName') as string;
  const phone = formData.get('phone') as string;
  const address = formData.get('address') as string;
  const category = formData.get('category') as string;

  if (!name) {
    throw new Error('Store/Company name is required');
  }

  await prisma.supplier.create({
    data: {
      name,
      contactName: contactName || null,
      phone: phone || null,
      address: address || null,
      category: category || null,
    },
  });

  redirect('/suppliers');
}

export async function updateSupplier(formData: FormData) {
  const id = parseInt(formData.get('id') as string);
  const name = formData.get('name') as string;
  const contactName = formData.get('contactName') as string;
  const phone = formData.get('phone') as string;
  const address = formData.get('address') as string;
  const category = formData.get('category') as string;

  if (!id || !name) {
    throw new Error('ID and Store/Company name are required');
  }

  await prisma.supplier.update({
    where: { id },
    data: {
      name,
      contactName: contactName || null,
      phone: phone || null,
      address: address || null,
      category: category || null,
    },
  });

  redirect('/suppliers');
}

export async function deleteSupplier(formData: FormData) {
  const id = parseInt(formData.get('id') as string);

  if (!id) {
    throw new Error('ID is required');
  }

  await prisma.supplier.delete({
    where: { id },
  });

  redirect('/suppliers');
}
