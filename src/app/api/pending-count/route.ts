import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  const count = await prisma.expense.count({
    where: { approvalStatus: 'PENDING' }
  });
  return NextResponse.json({ count });
}
