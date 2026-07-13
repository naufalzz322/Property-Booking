import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { BookingDetailClient } from "@/components/admin/BookingDetailClient";

export const dynamic = "force-dynamic";

async function getBooking(id: string) {
  return prisma.booking.findUnique({
    where: { id },
    include: {
      unit: { include: { property: true } },
      tenant: true,
      invoices: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      events: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const { id } = await params;
  const booking = await getBooking(id);

  if (!booking) {
    notFound();
  }

  // Convert Decimal to number for client component
  const bookingForClient = {
    id: booking.id,
    bookingNumber: booking.bookingNumber,
    unitId: booking.unitId,
    guestName: booking.guestName,
    guestPhone: booking.guestPhone,
    guestEmail: booking.guestEmail,
    checkInDate: booking.checkInDate instanceof Date ? booking.checkInDate.toISOString() : String(booking.checkInDate),
    durationMonths: booking.durationMonths,
    durationNights: booking.durationNights,
    notes: booking.notes,
    status: booking.status,
    confirmedAt: booking.confirmedAt,
    checkedInAt: booking.checkedInAt,
    checkedOutAt: booking.checkedOutAt,
    rejectionReason: booking.rejectionReason,
    createdAt: booking.createdAt instanceof Date ? booking.createdAt.toISOString() : String(booking.createdAt),
    unit: {
      id: booking.unit.id,
      slug: booking.unit.slug,
      name: booking.unit.name,
      unitNumber: booking.unit.unitNumber,
      type: booking.unit.type,
      description: booking.unit.description,
      facilities: booking.unit.facilities,
      photos: booking.unit.photos,
      status: booking.unit.status,
      pricePerMonth: booking.unit.pricePerMonth ? Number(booking.unit.pricePerMonth) : null,
      pricePerNight: booking.unit.pricePerNight ? Number(booking.unit.pricePerNight) : null,
      property: booking.unit.property,
    },
    invoices: booking.invoices.map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      period: inv.period,
      rentAmount: Number(inv.rentAmount),
      electricAmount: Number(inv.electricAmount),
      waterAmount: Number(inv.waterAmount),
      otherAmount: Number(inv.otherAmount),
      totalAmount: Number(inv.totalAmount),
      status: inv.status,
      dueDate: inv.dueDate,
    })),
    events: booking.events.map((ev) => ({
      id: ev.id,
      eventType: ev.eventType,
      message: ev.message,
      metadata: ev.metadata,
      createdAt: ev.createdAt instanceof Date ? ev.createdAt.toISOString() : String(ev.createdAt),
    })),
    tenant: booking.tenant ? {
      id: booking.tenant.id,
      name: booking.tenant.name,
      email: booking.tenant.email,
      phone: booking.tenant.phone,
      isActive: booking.tenant.isActive,
      contractStart: booking.tenant.contractStart,
      contractEnd: booking.tenant.contractEnd,
    } : null,
  };

  return <BookingDetailClient booking={bookingForClient} />;
}
