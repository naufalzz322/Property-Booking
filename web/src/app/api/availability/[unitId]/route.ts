import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { addMonths, addDays, format, startOfMonth, endOfMonth } from "date-fns";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ unitId: string }> }
) {
  const { unitId } = await params;
  const searchParams = request.nextUrl.searchParams;
  const year = searchParams.get("year");
  const month = searchParams.get("month");

  if (!unitId) {
    return NextResponse.json({ error: "unitId is required" }, { status: 400 });
  }

  const now = new Date();
  const targetYear = year ? parseInt(year) : now.getFullYear();
  const targetMonth = month ? parseInt(month) : now.getMonth() + 1;

  const startOfTargetMonth = startOfMonth(new Date(targetYear, targetMonth - 1, 1));
  const endOfTargetMonth = endOfMonth(new Date(targetYear, targetMonth - 1, 1));

  // Find all active bookings for this unit
  const bookings = await prisma.booking.findMany({
    where: {
      unitId,
      status: { in: ["CONFIRMED", "CHECKED_IN"] },
      checkInDate: { lte: endOfTargetMonth },
    },
    select: {
      id: true,
      bookingNumber: true,
      checkInDate: true,
      durationMonths: true,
      durationNights: true,
      status: true,
    },
  });

  // Generate booked dates (including checkout day - next-day policy)
  // Guest checks out in the morning, room is cleaned/prepared for next guest
  const bookedDates: Array<{
    date: string;
    status: "booked" | "checked_in";
    bookingNumber: string;
  }> = [];

  for (const booking of bookings) {
    const checkIn = new Date(booking.checkInDate);
    let checkOut: Date;

    if (booking.durationMonths) {
      checkOut = addMonths(checkIn, booking.durationMonths);
    } else if (booking.durationNights) {
      checkOut = addDays(checkIn, booking.durationNights);
    } else {
      continue;
    }

    // Next-day policy: include checkout day as blocked
    // Room is being prepared for the next guest
    const effectiveEnd = addDays(checkOut, 1);

    // Only include dates within the target month
    const start = checkIn < startOfTargetMonth ? startOfTargetMonth : checkIn;
    const end = effectiveEnd > endOfTargetMonth ? endOfTargetMonth : effectiveEnd;

    let current = new Date(start);
    while (current <= end) {
      // Only add if within the month - use local date parts to avoid timezone issues
      if (current >= startOfTargetMonth && current <= endOfTargetMonth) {
        const year = current.getFullYear();
        const month = String(current.getMonth() + 1).padStart(2, '0');
        const day = String(current.getDate()).padStart(2, '0');
        bookedDates.push({
          date: `${year}-${month}-${day}`,
          status: booking.status === "CHECKED_IN" ? "checked_in" : "booked",
          bookingNumber: booking.bookingNumber,
        });
      }
      current = addDays(current, 1);
    }
  }

  return NextResponse.json({
    bookedDates,
    year: targetYear,
    month: targetMonth,
    totalBooked: bookedDates.length,
  });
}
