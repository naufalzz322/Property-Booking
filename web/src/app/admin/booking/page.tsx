import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { BookingListClient } from "@/components/admin/BookingListClient";

export const dynamic = "force-dynamic";

async function getBookings() {
  const bookings = await prisma.booking.findMany({
    include: {
      unit: { include: { property: true } },
      tenant: { select: { id: true, name: true } },
      invoices: {
        orderBy: { createdAt: "desc" },
        take: 1, // Latest invoice
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Serialize Decimals to numbers for client components
  // Convert dates to ISO strings for client compatibility
  // Calculate total price based on duration
  return bookings.map((b) => {
    let totalPrice: number | null = null;
    if (b.durationMonths && b.unit.pricePerMonth) {
      totalPrice = Number(b.unit.pricePerMonth) * b.durationMonths;
    } else if (b.durationNights && b.unit.pricePerNight) {
      totalPrice = Number(b.unit.pricePerNight) * b.durationNights;
    }

    // Get latest invoice
    const latestInvoice = b.invoices[0];

    // Exclude raw arrays with Decimal objects
    const { invoices, unit, tenant, ...rest } = b;

    // Convert unit fields
    const convertedUnit = {
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
      property: unit.property,
    };

    return {
      ...rest,
      checkInDate: b.checkInDate instanceof Date ? b.checkInDate.toISOString() : String(b.checkInDate),
      createdAt: b.createdAt instanceof Date ? b.createdAt.toISOString() : String(b.createdAt),
      totalPrice,
      invoice: latestInvoice ? {
        id: latestInvoice.id,
        status: latestInvoice.status,
        totalAmount: Number(latestInvoice.totalAmount),
      } : null,
      unit: convertedUnit,
      tenant,
    };
  });
}

async function getUnits() {
  const units = await prisma.unit.findMany({
    orderBy: [
      { status: "asc" },
      { type: "asc" },
      { unitNumber: "asc" },
    ],
  });

  return units.map((u) => ({
    id: u.id,
    name: u.name || `Unit ${u.unitNumber}`,
    unitNumber: u.unitNumber,
    type: u.type,
    pricePerMonth: u.pricePerMonth ? Number(u.pricePerMonth) : null,
    pricePerNight: u.pricePerNight ? Number(u.pricePerNight) : null,
    status: u.status,
  }));
}

export default async function BookingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const [bookings, units] = await Promise.all([getBookings(), getUnits()]);

  return <BookingListClient bookings={bookings} units={units} />;
}
