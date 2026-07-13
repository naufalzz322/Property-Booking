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
  const body = await req.json();
  const { reason } = body;

  if (!reason?.trim()) {
    return NextResponse.json({ error: "Alasan pembatalan wajib diisi" }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { unit: { include: { property: true } } },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  // Allow cancellation from CONFIRMED, WAITING_PAYMENT, or CHECKED_IN status
  if (!["CONFIRMED", "WAITING_PAYMENT", "CHECKED_IN"].includes(booking.status)) {
    return NextResponse.json(
      { error: "Booking tidak dapat dibatalkan dari status ini" },
      { status: 400 }
    );
  }

  // Update booking status
  await prisma.booking.update({
    where: { id },
    data: {
      status: "CANCELLED",
    },
  });

  // Create booking event
  await prisma.bookingEvent.create({
    data: {
      bookingId: id,
      eventType: "CANCELLED",
      message: `Booking dibatalkan: ${reason}`,
      metadata: {
        reason,
        cancelledAt: new Date().toISOString(),
      },
    },
  });

  // Reset unit status to AVAILABLE
  await prisma.unit.update({
    where: { id: booking.unitId },
    data: { status: "AVAILABLE" },
  });

  // Send WA notification to guest
  const unitDisplayName = booking.unit.name || booking.unit.property?.name;
  const message = `Booking Dibatalkan

Halo ${booking.guestName},

Booking Anda untuk Unit ${booking.unit.unitNumber} (${unitDisplayName}) telah dibatalkan.

Alasan: ${reason}

Jika ada pertanyaan, silakan hubungi kami.

Terima kasih.`;

  await sendWANotification(booking.guestPhone, message);

  return NextResponse.json({ success: true });
}
