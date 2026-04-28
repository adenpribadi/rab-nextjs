'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateCompanyProfile(formData: FormData) {
  const name = formData.get('name') as string;
  const address = formData.get('address') as string;
  const phone = formData.get('phone') as string;
  const email = formData.get('email') as string;
  const website = formData.get('website') as string;

  await prisma.companyProfile.upsert({
    where: { id: 1 },
    update: { name, address, phone, email, website },
    create: { id: 1, name, address, phone, email, website }
  });

  revalidatePath('/settings');
  revalidatePath('/');
}

export async function createUser(formData: FormData) {
  const username = formData.get('username') as string;
  const name = formData.get('name') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;

  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      username,
      name,
      password: hashedPassword,
      role
    }
  });

  revalidatePath('/settings');
}

export async function deleteUser(id: number) {
  // Prevent deleting the last admin if we wanted to be safe
  await prisma.user.delete({ where: { id } });
  revalidatePath('/settings');
}
