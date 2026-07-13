import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
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
      unit: { include: { property: true } },
      booking: true,
      invoices: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  return NextResponse.json({ tenant });
}

export async function PATCH(
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
  });

  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  const body = await req.json();
  const { name, phone, emergencyName, emergencyPhone } = body;

  // Validate required fields
  if (!name || !phone) {
    return NextResponse.json({ error: "Nama dan no. HP wajib diisi" }, { status: 400 });
  }

  // Update tenant
  const updatedTenant = await prisma.tenant.update({
    where: { id },
    data: {
      name,
      phone,
      emergencyName: emergencyName || null,
      emergencyPhone: emergencyPhone || null,
    },
  });

  return NextResponse.json({
    success: true,
    tenant: updatedTenant,
  });
}
