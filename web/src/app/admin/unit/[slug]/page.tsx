import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { UnitDetailClient } from "@/components/admin/UnitDetailClient";

export const dynamic = "force-dynamic";

async function getUnit(slug: string) {
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

  return unit;
}

export default async function UnitDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const { slug } = await params;
  const unit = await getUnit(slug);

  if (!unit) {
    notFound();
  }

  // Serialize dates and Decimal
  const unitForClient = {
    id: unit.id,
    slug: unit.slug,
    name: unit.name,
    unitNumber: unit.unitNumber,
    type: unit.type,
    description: unit.description,
    facilities: unit.facilities,
    photos: unit.photos,
    status: unit.status,
    pricePerMonth: unit.pricePerMonth ? Number(unit.pricePerMonth) : null,
    pricePerNight: unit.pricePerNight ? Number(unit.pricePerNight) : null,
    createdAt: unit.createdAt.toISOString(),
    property: unit.property,
    currentTenant: unit.tenants[0]
      ? {
          id: unit.tenants[0].id,
          name: unit.tenants[0].name,
          phone: unit.tenants[0].phone,
          contractStart: unit.tenants[0].contractStart.toISOString(),
          contractEnd: unit.tenants[0].contractEnd?.toISOString() || null,
          isActive: unit.tenants[0].isActive,
        }
      : null,
    bookings: unit.bookings.map((b) => ({
      id: b.id,
      bookingNumber: b.bookingNumber,
      guestName: b.guestName,
      checkInDate: b.checkInDate.toISOString(),
      status: b.status,
    })),
    invoices: unit.invoices.map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      period: inv.period,
      totalAmount: Number(inv.totalAmount),
      status: inv.status,
      dueDate: inv.dueDate.toISOString(),
    })),
    _count: unit._count,
  };

  return <UnitDetailClient unit={unitForClient} />;
}
