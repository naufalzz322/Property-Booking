import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendWANotification } from "@/lib/wa";
import { sendBookingRejectedEmail } from "@/lib/email";
import { getPropertyEmail } from "@/lib/property";

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
    return NextResponse.json({ error: "Alasan penolakan wajib diisi" }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { unit: { include: { property: true } } },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (booking.status !== "PENDING") {
    return NextResponse.json({ error: "Booking sudah diproses" }, { status: 400 });
  }

  // Update booking status
  await prisma.booking.update({
    where: { id },
    data: {
      status: "REJECTED",
      rejectionReason: reason,
    },
  });

  // Create booking event
  await prisma.bookingEvent.create({
    data: {
      bookingId: id,
      eventType: "REJECTED",
      message: `Booking ditolak: ${reason}`,
      metadata: {
        reason,
        rejectedAt: new Date().toISOString(),
      },
    },
  });

  // Reset unit status
  await prisma.unit.update({
    where: { id: booking.unitId },
    data: { status: "AVAILABLE" },
  });

  // Send WA notification to guest
  const unitDisplayName = booking.unit.name || booking.unit.property?.name;
  const message = `Booking Ditolak

Halo ${booking.guestName},

Mohon maaf, booking untuk Unit ${booking.unit.unitNumber} (${unitDisplayName}) tidak dapat kami proses.

Alasan: ${reason}

Silakan hubungi kami untuk informasi lebih lanjut atau booking ulang dengan tanggal lain.

Terima kasih.`;

  await sendWANotification(booking.guestPhone, message);

  // Send email notification
  const replyTo = await getPropertyEmail();
  const propertyName = booking.unit.property?.name || "Pyta Property";

  await sendBookingRejectedEmail({
    guestEmail: booking.guestEmail,
    guestName: booking.guestName,
    bookingNumber: booking.bookingNumber,
    reason,
    propertyName,
    replyTo,
  });

  return NextResponse.json({ success: true });
}
