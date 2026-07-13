import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendWANotification } from "@/lib/wa";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { unit: { include: { property: true } }, tenant: true },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (booking.status !== "PAID") {
    return NextResponse.json({ error: "Booking harus sudah dibayar terlebih dahulu" }, { status: 400 });
  }

  // Update booking status
  await prisma.booking.update({
    where: { id },
    data: {
      status: "CHECKED_IN",
      checkedInAt: new Date(),
    },
  });

  // Create booking event
  await prisma.bookingEvent.create({
    data: {
      bookingId: id,
      eventType: "CHECKED_IN",
      message: "Tenant berhasil check-in",
      metadata: {
        checkedInAt: new Date().toISOString(),
      },
    },
  });

  // Update unit status to OCCUPIED
  await prisma.unit.update({
    where: { id: booking.unitId },
    data: { status: "OCCUPIED" },
  });

  // Calculate contract end date
  const contractEnd = booking.durationMonths
    ? new Date(booking.checkInDate.getTime() + booking.durationMonths * 30 * 24 * 60 * 60 * 1000)
    : null;

  // Update tenant contract end
  if (booking.tenant) {
    await prisma.tenant.update({
      where: { id: booking.tenant.id },
      data: { contractEnd },
    });
  }

  // Send WA notification to guest
  const unitDisplayName = booking.unit.name || booking.unit.property?.name;
  const message = `Check-in Berhasil

Halo ${booking.guestName},

Selamat! Anda berhasil check-in di Unit ${booking.unit.unitNumber} (${unitDisplayName}).

Silakan ke lokasi dan hubungi admin untuk pengambilan kunci.

Info akun tenant portal sudah dikirimkan sebelumnya.

Selamat tinggal!`;

  await sendWANotification(booking.guestPhone, message);

  return NextResponse.json({ success: true });
}
