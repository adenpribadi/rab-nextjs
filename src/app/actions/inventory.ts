'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addStockMovement(formData: FormData) {
  const materialId = parseInt(formData.get('materialId') as string);
  const type = formData.get('type') as string; // IN | OUT | ADJUST
  const quantity = parseFloat(formData.get('quantity') as string);
  const notes = formData.get('notes') as string;
  const projectId = formData.get('projectId') as string;

  if (isNaN(materialId) || isNaN(quantity) || quantity <= 0) return;

  // Create movement record
  await prisma.stockMovement.create({
    data: {
      materialId,
      type,
      quantity,
      notes,
      projectId: projectId ? parseInt(projectId) : null
    }
  });

  // Update stock level
  const material = await prisma.material.findUnique({ where: { id: materialId } });
  if (!material) return;

  let newStock = Number(material.currentStock);
  if (type === 'IN') newStock += quantity;
  else if (type === 'OUT') newStock -= quantity;
  else if (type === 'ADJUST') newStock = quantity; // Direct set

  await prisma.material.update({
    where: { id: materialId },
    data: { currentStock: newStock }
  });

  revalidatePath('/inventory');
}

export async function updateMinStock(formData: FormData) {
  const materialId = parseInt(formData.get('materialId') as string);
  const minStock = parseFloat(formData.get('minStock') as string);

  if (isNaN(materialId) || isNaN(minStock)) return;

  await prisma.material.update({
    where: { id: materialId },
    data: { minStock }
  });

  revalidatePath('/inventory');
}
