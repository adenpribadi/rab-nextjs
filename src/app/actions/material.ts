'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function addMaterial(formData: FormData) {
  const name = formData.get('name') as string
  const unit = formData.get('unit') as string
  const unitPrice = parseFloat(formData.get('unitPrice') as string)
  const categoryIdStr = formData.get('categoryId') as string
  const categoryId = categoryIdStr ? parseInt(categoryIdStr) : null

  if (!name || !unit || isNaN(unitPrice)) return

  await prisma.material.create({
    data: {
      name,
      unit,
      unitPrice,
      categoryId
    }
  })

  revalidatePath('/materials')
}

export async function updateMaterial(formData: FormData) {
  const id = parseInt(formData.get('id') as string)
  const name = formData.get('name') as string
  const unit = formData.get('unit') as string
  const unitPrice = parseFloat(formData.get('unitPrice') as string)
  const categoryIdStr = formData.get('categoryId') as string
  const categoryId = categoryIdStr ? parseInt(categoryIdStr) : null

  if (isNaN(id) || !name || !unit || isNaN(unitPrice)) return

  await prisma.material.update({
    where: { id },
    data: {
      name,
      unit,
      unitPrice,
      categoryId
    }
  })

  revalidatePath('/materials')
}

export async function deleteMaterial(formData: FormData) {
  const id = parseInt(formData.get('id') as string)
  if (isNaN(id)) return

  await prisma.material.delete({
    where: { id }
  })

  revalidatePath('/materials')
}
