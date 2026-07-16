import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendWANotification } from "@/lib/wa";
import { sendBookingConfirmationEmail } from "@/lib/email";
import { getOwnerPhone, getPropertyEmail } from "@/lib/property";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

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
    include: { unit: { include: { property: true } } },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (booking.status !== "PENDING") {
    return NextResponse.json({ error: "Booking sudah diproses" }, { status: 400 });
  }

  // Update booking status to CONFIRMED
  await prisma.booking.update({
    where: { id },
    data: {
      status: "CONFIRMED",
      confirmedAt: new Date(),
    },
  });

  // Create booking event
  await prisma.bookingEvent.create({
    data: {
      bookingId: id,
      eventType: "CONFIRMED",
      message: "Booking dikonfirmasi oleh admin",
      metadata: {
        confirmedAt: new Date().toISOString(),
      },
    },
  });

  // Update unit status
  await prisma.unit.update({
    where: { id: booking.unitId },
    data: { status: "BOOKED" },
  });

  // Format dates for messages
  const checkInDateFormatted = format(booking.checkInDate, "dd MMMM yyyy", { locale: idLocale });
  const unitDisplayName = booking.unit.name || booking.unit.property.name;

  // Send Wa notification to guest
  try {
    const waMessage = `Booking Dikonfirmasi

Halo ${booking.guestName},

Booking kamu telah dikonfirmasi.

Detail:
- Unit: ${unitDisplayName} · ${booking.unit.unitNumber}
- Check-in: ${checkInDateFormatted}
- Durasi: ${booking.durationMonths ? `${booking.durationMonths} bulan` : `${booking.durationNights} malam`}

Kamu akan menerima akun tenant setelah konfirmasi check-in.

Sampai jumpa!`;

    await sendWANotification(booking.guestPhone, waMessage);
  } catch (waError) {
    console.error(`[Confirm Booking] Failed to send WA to ${booking.guestPhone}:`, waError);
  }

  // Send email notification
  try {
    const ownerPhone = await getOwnerPhone();
    const replyTo = await getPropertyEmail();

    await sendBookingConfirmationEmail({
      guestEmail: booking.guestEmail,
      guestName: booking.guestName,
      bookingNumber: booking.bookingNumber,
      unitNumber: booking.unit.unitNumber,
      propertyName: unitDisplayName,
      checkInDate: checkInDateFormatted,
      duration: booking.durationMonths || booking.durationNights || 1,
      durationType: booking.durationMonths ? "bulan" : "malam",
      ownerPhone,
      replyTo,
    });
  } catch (emailError) {
    console.error(`[Confirm Booking] Failed to send email to ${booking.guestEmail}:`, emailError);
  }

  return NextResponse.json({
    success: true,
    message: "Booking berhasil dikonfirmasi",
  });
}
