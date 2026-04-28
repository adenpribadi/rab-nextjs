import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const expenseId = formData.get('expenseId') as string;

    if (!file || !expenseId) {
      return NextResponse.json({ error: 'Missing file or expenseId' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only images and PDF are allowed.' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 5MB.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public/uploads/receipts/
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'receipts');
    await mkdir(uploadDir, { recursive: true });

    const ext = file.name.split('.').pop();
    const filename = `receipt_${expenseId}_${Date.now()}.${ext}`;
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/receipts/${filename}`;

    // Update expense with image URL
    await prisma.expense.update({
      where: { id: parseInt(expenseId) },
      data: { receiptImageUrl: publicUrl }
    });

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
