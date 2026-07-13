import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isUnitAvailable } from "@/lib/booking";
import { sendWANotification } from "@/lib/wa";
import { sendBookingReceivedEmail } from "@/lib/email";
import { getOwnerPhone, getPropertyEmail } from "@/lib/property";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { v4 as uuid } from "uuid";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { unitId, guestName, guestPhone, guestEmail, checkInDate, durationMonths, durationNights, notes } = body;

  if (!unitId || !guestName || !guestPhone || !guestEmail || !checkInDate) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Check unit exists and is available for booking
  const unit = await prisma.unit.findUnique({
    where: { id: unitId },
    include: { property: true },
  });

  if (!unit) {
    return NextResponse.json({ error: "Unit tidak ditemukan" }, { status: 404 });
  }

  // Only allow booking for AVAILABLE units
  if (unit.status !== "AVAILABLE") {
    const statusLabels: Record<string, string> = {
      BOOKED: "Unit sedang dalam proses pemesanan",
      OCCUPIED: "Unit sedang berpenghuni",
      MAINTENANCE: "Unit sedang dalam perbaikan",
    };
    return NextResponse.json(
      { error: statusLabels[unit.status] || "Unit tidak tersedia untuk dipesan" },
      { status: 409 }
    );
  }

  // Check unit availability for the requested dates
  const checkIn = new Date(checkInDate);

  // Use the appropriate duration based on unit type
  const isMonthlyUnit = unit.type === "KOS_BULANAN";
  const effectiveDurationMonths = isMonthlyUnit ? (durationMonths || null) : null;
  const effectiveDurationNights = !isMonthlyUnit ? (durationNights || durationMonths || null) : null;

  const availability = await isUnitAvailable(
    unitId,
    checkIn,
    effectiveDurationMonths ?? undefined,
    effectiveDurationNights ?? undefined
  );

  if (!availability.available) {
    return NextResponse.json(
      { error: "Unit tidak tersedia untuk tanggal tersebut", conflictingBookings: availability.conflictingBookings },
      { status: 409 }
    );
  }

  // Determine which duration to use based on unit type (already calculated above)
  const finalDurationMonths = isMonthlyUnit ? (durationMonths || null) : null;
  const finalDurationNights = !isMonthlyUnit ? (durationNights || null) : null;

  // Generate booking number: BK-{YYMMDD}-{SEQ}
  const now = new Date();
  const yearShort = String(now.getFullYear()).slice(-2); // 26
  const month = String(now.getMonth() + 1).padStart(2, "0"); // 07
  const day = String(now.getDate()).padStart(2, "0"); // 11
  const dateStr = `${yearShort}${month}${day}`; // 260711

  // Count bookings for today to get sequence
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const todayCount = await prisma.booking.count({
    where: { createdAt: { gte: todayStart, lt: todayEnd } },
  });
  const sequence = String(todayCount + 1).padStart(4, "0"); // 0001

  // Add microsecond-based suffix to prevent race conditions
  const microSuffix = Date.now().toString(36).slice(-4).toUpperCase();
  const bookingNumber = `BK-${dateStr}-${sequence}${microSuffix}`; // BK-260711-0001MXYZ

  // Create booking
  const booking = await prisma.booking.create({
    data: {
      bookingNumber,
      unitId,
      guestName,
      guestPhone,
      guestEmail,
      checkInDate: checkIn,
      durationMonths: finalDurationMonths,
      durationNights: finalDurationNights,
      notes,
      status: "PENDING",
    },
  });

  // Update unit status to BOOKED
  await prisma.unit.update({
    where: { id: unitId },
    data: { status: "BOOKED" },
  });

  // Send notification to owner
  const ownerPhone = await getOwnerPhone();
  if (ownerPhone && unit) {
    const unitDisplayName = unit.name || unit.property.name;
    const unitName = `${unitDisplayName} - Unit ${unit.unitNumber}`;
    const durationText = finalDurationNights
      ? `${finalDurationNights} malam`
      : finalDurationMonths
      ? `${finalDurationMonths} bulan`
      : "-";

    const message = `Booking Baru

No: ${bookingNumber}
Tamu: ${guestName}
HP: ${guestPhone}
Unit: ${unitName}
Check-in: ${checkIn.toLocaleDateString("id-ID")}
Durasi: ${durationText}${notes ? `
Catatan: ${notes}` : ""}

Segera proses di dashboard admin.`;

    await sendWANotification(ownerPhone, message);
  }

  // Send confirmation email to guest
  const checkInDateFormatted = format(checkIn, "dd MMMM yyyy", { locale: idLocale });
  const duration = finalDurationMonths || finalDurationNights || 1;
  const durationType = finalDurationMonths ? "bulan" : "malam";
  const unitPrice = Number(unit.pricePerMonth || unit.pricePerNight || 0);
  const totalPrice = unitPrice * duration;
  const propertyName = unit.property.name;
  const replyTo = await getPropertyEmail();

  console.log(`[Booking] Sending confirmation email to ${guestEmail} for booking ${bookingNumber}`);

  const emailResult = await sendBookingReceivedEmail({
    guestEmail,
    guestName,
    bookingNumber,
    unitNumber: unit.unitNumber,
    propertyName,
    checkInDate: checkInDateFormatted,
    duration,
    durationType,
    totalPrice,
    notes: notes || undefined,
    ownerPhone,
    replyTo,
  });

  if (!emailResult.success) {
    console.warn(`[Booking] Email sending failed: ${emailResult.error}`);
  }

  return NextResponse.json({ booking }, { status: 201 });
}
