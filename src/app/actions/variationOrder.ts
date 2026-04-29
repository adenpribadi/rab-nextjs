'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createVariationOrder(formData: FormData) {
  const projectId = parseInt(formData.get('projectId') as string)
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  
  // Extract items from JSON if passed that way, or handle complex form
  // For simplicity in this initial version, we'll assume items are handled in a specific way
  // But let's create the VO first
  
  await prisma.variationOrder.create({
    data: {
      projectId,
      title,
      description,
      status: 'PENDING',
      totalAmount: 0
    }
  })

  revalidatePath(`/projects/${projectId}`)
}

export async function addVOItem(formData: FormData) {
  const voId = parseInt(formData.get('variationOrderId') as string)
  const categoryId = parseInt(formData.get('categoryId') as string)
  const name = formData.get('name') as string
  const quantity = parseFloat(formData.get('quantity') as string)
  const unitPrice = parseFloat(formData.get('unitPrice') as string)
  const unit = formData.get('unit') as string
  
  const totalPrice = quantity * unitPrice
  
  const voCheck = await prisma.variationOrder.findUnique({ where: { id: voId } })
  if (voCheck?.status === 'APPROVED') throw new Error("Cannot add items to an approved Variation Order")

  await prisma.$transaction(async (tx) => {
    await tx.vOItem.create({
      data: {
        variationOrderId: voId,
        categoryId,
        name,
        quantity,
        unitPrice,
        totalPrice,
        unit
      }
    })

    // Update VO totalAmount
    const vo = await tx.variationOrder.findUnique({
      where: { id: voId },
      include: { items: true }
    })

    const newTotal = vo?.items.reduce((sum, item) => sum + Number(item.totalPrice), 0) || 0

    await tx.variationOrder.update({
      where: { id: voId },
      data: { totalAmount: newTotal }
    })
  })

  // We need the projectId for revalidation
  const vo = await prisma.variationOrder.findUnique({ where: { id: voId } })
  if (vo) revalidatePath(`/projects/${vo.projectId}`)
}

export async function updateVOStatus(voId: number, status: 'PENDING' | 'APPROVED' | 'REJECTED') {
  const vo = await prisma.variationOrder.update({
    where: { id: voId },
    data: { status }
  })

  revalidatePath(`/projects/${vo.projectId}`)
  return vo
}

export async function deleteVO(voId: number) {
  const vo = await prisma.variationOrder.findUnique({ where: { id: voId } })
  if (!vo) return
  if (vo.status === 'APPROVED') throw new Error("Cannot delete an approved Variation Order")

  await prisma.variationOrder.delete({
    where: { id: voId }
  })

  revalidatePath(`/projects/${vo.projectId}`)
}
