import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;

  const unit = await prisma.unit.findUnique({
    where: { slug },
    include: {
      property: true,
      tenants: {
        where: { isActive: true },
        take: 1,
        orderBy: { contractStart: "desc" },
        select: {
          id: true,
          name: true,
          phone: true,
          contractStart: true,
          contractEnd: true,
          isActive: true,
        },
      },
      bookings: {
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          bookingNumber: true,
          guestName: true,
          checkInDate: true,
          status: true,
        },
      },
      invoices: {
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          invoiceNumber: true,
          period: true,
          totalAmount: true,
          status: true,
          dueDate: true,
        },
      },
      _count: {
        select: { bookings: true, invoices: true },
      },
    },
  });

  if (!unit) {
    return NextResponse.json({ error: "Unit not found" }, { status: 404 });
  }

  // Serialize dates and Decimal
  const serializedUnit = {
    ...unit,
    pricePerMonth: unit.pricePerMonth ? Number(unit.pricePerMonth) : null,
    pricePerNight: unit.pricePerNight ? Number(unit.pricePerNight) : null,
    createdAt: unit.createdAt.toISOString(),
    currentTenant: unit.tenants[0] ? {
      ...unit.tenants[0],
      contractStart: unit.tenants[0].contractStart.toISOString(),
      contractEnd: unit.tenants[0].contractEnd?.toISOString() || null,
    } : null,
    bookings: unit.bookings.map((b) => ({
      ...b,
      checkInDate: b.checkInDate.toISOString(),
    })),
    invoices: unit.invoices.map((inv) => ({
      ...inv,
      totalAmount: Number(inv.totalAmount),
      dueDate: inv.dueDate.toISOString(),
    })),
  };

  return NextResponse.json({ unit: serializedUnit });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const body = await req.json();

  try {
    const unit = await prisma.unit.update({
      where: { slug },
      data: {
        unitNumber: body.unitNumber,
        slug: body.slug,
        name: body.name,
        type: body.type,
        pricePerMonth: body.pricePerMonth ? Number(body.pricePerMonth) : null,
        pricePerNight: body.pricePerNight ? Number(body.pricePerNight) : null,
        facilities: body.facilities,
        description: body.description,
        photos: body.photos,
        status: body.status,
      },
    });

    return NextResponse.json({ unit });
  } catch (error) {
    console.error("Failed to update unit:", error);
    return NextResponse.json({ error: "Failed to update unit" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;

  try {
    await prisma.unit.delete({ where: { slug } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete unit:", error);
    return NextResponse.json({ error: "Failed to delete unit" }, { status: 500 });
  }
}
