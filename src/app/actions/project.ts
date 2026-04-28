'use server';

import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export async function createProject(formData: FormData) {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const budget = parseFloat(formData.get('budget') as string);
  const location = formData.get('location') as string;
  const startDate = formData.get('startDate') as string;
  const endDate = formData.get('endDate') as string;
  const clientIdStr = formData.get('clientId') as string;
  
  if (!name || isNaN(budget)) {
    throw new Error('Name and budget are required');
  }

  let clientId = null;
  let clientName = formData.get('clientName') as string || null;

  if (clientIdStr) {
    clientId = parseInt(clientIdStr);
    const client = await prisma.client.findUnique({ where: { id: clientId }});
    if (client) {
      clientName = client.name;
    }
  }

  const project = await prisma.project.create({
    data: {
      name,
      description,
      budget,
      clientId,
      clientName: clientName || null,
      location: location || null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      status: 'PLANNING',
    },
  });

  redirect(`/projects/${project.id}`);
}

export async function updateProject(formData: FormData) {
  const id = parseInt(formData.get('id') as string);
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const budget = parseFloat(formData.get('budget') as string);
  const location = formData.get('location') as string;
  const startDate = formData.get('startDate') as string;
  const endDate = formData.get('endDate') as string;
  const status = formData.get('status') as any;
  const clientIdStr = formData.get('clientId') as string;
  
  if (!id || !name || isNaN(budget)) {
    throw new Error('ID, Name and budget are required');
  }

  let clientId = null;
  let clientName = formData.get('clientName') as string || null;

  if (clientIdStr) {
    clientId = parseInt(clientIdStr);
    const client = await prisma.client.findUnique({ where: { id: clientId }});
    if (client) {
      clientName = client.name;
    }
  } else {
    // If no clientId but there's a clientName, we just clear clientId
    if (clientName === '') clientName = null;
  }

  await prisma.project.update({
    where: { id },
    data: {
      name,
      description,
      budget,
      clientId,
      clientName: clientName,
      location: location || null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      status: status || 'PLANNING',
    },
  });

  redirect(`/projects/${id}`);
}
