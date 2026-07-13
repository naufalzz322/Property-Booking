import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookingNumber: string }> }
) {
  try {
    const { bookingNumber } = await params;

    const booking = await prisma.booking.findUnique({
      where: { bookingNumber },
      include: {
        unit: {
          include: {
            property: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({
      booking: {
        id: booking.id,
        bookingNumber: booking.bookingNumber,
        guestName: booking.guestName,
        guestPhone: booking.guestPhone,
        guestEmail: booking.guestEmail,
        checkInDate: booking.checkInDate,
        durationMonths: booking.durationMonths,
        durationNights: booking.durationNights,
        status: booking.status,
        unit: {
          id: booking.unit.id,
          unitNumber: booking.unit.unitNumber,
          name: booking.unit.name,
          type: booking.unit.type,
          property: {
            name: booking.unit.property.name,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching booking:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
