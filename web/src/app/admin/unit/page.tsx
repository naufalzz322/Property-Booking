import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { UnitListClient } from "@/components/admin/UnitListClient";

export const dynamic = "force-dynamic";

async function getUnits() {
  const units = await prisma.unit.findMany({
    include: {
      property: true,
      tenants: {
        where: { isActive: true },
        take: 1,
        orderBy: { contractStart: "desc" },
        select: {
          id: true,
          name: true,
          contractEnd: true,
          contractStart: true,
        },
      },
      bookings: {
        where: { status: { in: ["PENDING", "CONFIRMED", "PAID", "CHECKED_IN"] } },
        take: 1,
        orderBy: { checkInDate: "asc" },
        select: {
          id: true,
          guestName: true,
          checkInDate: true,
          status: true,
        },
      },
      _count: { select: { bookings: true, invoices: true } },
    },
    orderBy: [{ property: { name: "asc" } }, { unitNumber: "asc" }],
  });

  // Convert Decimal to number and flatten relations
  return units.map((u) => ({
    id: u.id,
    name: u.name,
    unitNumber: u.unitNumber,
    slug: u.slug,
    type: u.type,
    status: u.status,
    pricePerMonth: u.pricePerMonth ? Number(u.pricePerMonth) : null,
    pricePerNight: u.pricePerNight ? Number(u.pricePerNight) : null,
    facilities: u.facilities,
    description: u.description,
    photos: u.photos,
    property: u.property,
    currentTenant: u.tenants[0] ? {
      ...u.tenants[0],
      contractEnd: u.tenants[0].contractEnd?.toISOString() || null,
      contractStart: u.tenants[0].contractStart.toISOString(),
    } : null,
    currentBooking: u.bookings[0] ? {
      ...u.bookings[0],
      checkInDate: u.bookings[0].checkInDate.toISOString(),
    } : null,
    _count: u._count,
  }));
}

export default async function UnitsPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const units = await getUnits();

  return <UnitListClient units={units} />;
}
