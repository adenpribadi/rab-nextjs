'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function addClient(formData: FormData) {
  const name = formData.get('name') as string;
  const company = formData.get('company') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const address = formData.get('address') as string;

  await prisma.client.create({
    data: { name, company, email, phone, address }
  });

  revalidatePath('/clients');
}

export async function updateClient(formData: FormData) {
  const id = parseInt(formData.get('id') as string);
  const name = formData.get('name') as string;
  const company = formData.get('company') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const address = formData.get('address') as string;

  await prisma.client.update({
    where: { id },
    data: { name, company, email, phone, address }
  });

  revalidatePath('/clients');
}

export async function deleteClient(formData: FormData) {
  const id = parseInt(formData.get('id') as string);
  await prisma.client.delete({ where: { id } });
  revalidatePath('/clients');
}
