'use server'

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function updateProgress(formData: FormData) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")

  const costItemIdRaw = formData.get('costItemId')
  const voItemIdRaw = formData.get('voItemId')
  const costItemId = costItemIdRaw ? parseInt(costItemIdRaw as string) : null
  const voItemId = voItemIdRaw ? parseInt(voItemIdRaw as string) : null
  
  const description = formData.get('description') as string
  const imageUrl = formData.get('imageUrl') as string || null
  const weather = formData.get('weather') as string || null
  const staffName = formData.get('staffName') as string || null
  
  const updateType = formData.get('updateType') as string // 'simple' or 'detailed'
  let percentage = 0
  let volume: number | null = null

  if (updateType === 'detailed') {
    volume = parseFloat(formData.get('volume') as string)
    const targetVolume = parseFloat(formData.get('targetVolume') as string)
    if (isNaN(volume) || isNaN(targetVolume)) throw new Error("Invalid volume data")
    
    // Calculate percentage based on volume
    percentage = (volume / targetVolume) * 100
    if (percentage > 100) percentage = 100 // Cap at 100%
  } else {
    percentage = parseFloat(formData.get('percentage') as string)
    if (isNaN(percentage)) throw new Error("Invalid percentage data")
  }

  // Use a transaction to update the current progress and create a history record
  await prisma.$transaction(async (tx) => {
    if (costItemId) {
      await tx.costItem.update({
        where: { id: costItemId },
        data: { 
          actualProgress: percentage,
          actualVolume: volume || undefined 
        }
      })
    } else if (voItemId) {
      await tx.vOItem.update({
        where: { id: voItemId },
        data: { 
          actualProgress: percentage,
          actualVolume: volume || undefined 
        }
      })
    }

    await tx.progressUpdate.create({
      data: {
        costItemId,
        voItemId,
        percentage,
        volume,
        weather,
        description,
        imageUrl,
        updatedBy: session.user?.name || session.user?.email || 'System',
        staffName: staffName // This is the Mandor name
      }
    })
  })

  revalidatePath('/progress')
}

export async function deleteProgress(updateId: number) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")

  const updateToDelete = await prisma.progressUpdate.findUnique({
    where: { id: updateId }
  })

  if (!updateToDelete) throw new Error("Update not found")

  const costItemId = updateToDelete.costItemId
  const voItemId = updateToDelete.voItemId

  await prisma.$transaction(async (tx) => {
    // Delete the update
    await tx.progressUpdate.delete({
      where: { id: updateId }
    })

    // Find the newest remaining update to restore state
    const lastUpdate = await tx.progressUpdate.findFirst({
      where: costItemId ? { costItemId } : { voItemId },
      orderBy: { updateDate: 'desc' }
    })

    // Update the record with the values from the previous record (or 0 if none left)
    if (costItemId) {
      await tx.costItem.update({
        where: { id: costItemId },
        data: {
          actualProgress: lastUpdate ? lastUpdate.percentage : 0,
          actualVolume: lastUpdate ? lastUpdate.volume || 0 : 0
        }
      })
    } else if (voItemId) {
      await tx.vOItem.update({
        where: { id: voItemId },
        data: {
          actualProgress: lastUpdate ? lastUpdate.percentage : 0,
          actualVolume: lastUpdate ? lastUpdate.volume || 0 : 0
        }
      })
    }
  })

  revalidatePath('/progress')
}

export async function getProgressHistory(costItemId: number) {
  return prisma.progressUpdate.findMany({
    where: { costItemId },
    orderBy: { updateDate: 'desc' }
  })
}
