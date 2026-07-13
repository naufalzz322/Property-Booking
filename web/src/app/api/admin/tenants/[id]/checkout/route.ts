import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const tenant = await prisma.tenant.findUnique({
    where: { id },
    include: {
      unit: true,
      booking: true,
    },
  });

  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  // Update tenant to inactive
  await prisma.tenant.update({
    where: { id },
    data: { isActive: false },
  });

  // Update booking status to CHECKOUT if exists
  if (tenant.booking) {
    await prisma.booking.update({
      where: { id: tenant.booking.id },
      data: {
        status: "CHECKOUT",
        checkedOutAt: new Date(),
      },
    });
  }

  // Update unit status back to AVAILABLE
  await prisma.unit.update({
    where: { id: tenant.unitId },
    data: { status: "AVAILABLE" },
  });

  return NextResponse.json({
    success: true,
    message: "Tenant berhasil di-checkout",
  });
}
