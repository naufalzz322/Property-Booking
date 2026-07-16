import prisma from "./prisma";
import { addMonths, addDays, format } from "date-fns";

export interface DateRange {
  start: Date;
  end: Date;
}

export async function isUnitAvailable(
  unitId: string,
  checkIn: Date,
  durationMonths?: number,
  durationNights?: number
): Promise<{ available: boolean; conflictingBookings?: string[] }> {
  let checkOut: Date;
  if (durationMonths) {
    checkOut = addMonths(checkIn, durationMonths);
  } else if (durationNights) {
    checkOut = addDays(checkIn, durationNights);
  } else {
    throw new Error("Must provide either durationMonths or durationNights");
  }

  const allBookings = await prisma.booking.findMany({
    where: {
      unitId,
      status: { in: ["CONFIRMED", "CHECKED_IN"] },
    },
  });

  const overlaps = allBookings.filter((booking) => {
    const existingStart = new Date(booking.checkInDate);
    let existingEnd: Date;

    if (booking.durationMonths) {
      existingEnd = addMonths(existingStart, booking.durationMonths);
    } else if (booking.durationNights) {
      existingEnd = addDays(existingStart, booking.durationNights);
    } else {
      return false;
    }

    // Next-day policy: minimum 1 day gap between bookings
    // Checkout day is blocked for new check-ins (room being cleaned/prepared)
    const newEnd = checkOut;

    return (
      // New check-in overlaps existing booking (including checkout day)
      (checkIn >= existingStart && checkIn <= existingEnd) ||
      // New check-out overlaps existing booking
      (newEnd > existingStart && newEnd <= existingEnd) ||
      // New booking completely contains existing booking
      (checkIn <= existingStart && newEnd >= existingEnd)
    );
  });

  return {
    available: overlaps.length === 0,
    conflictingBookings: overlaps.map((b) => b.bookingNumber),
  };
}

export async function getBookedDates(
  unitId: string,
  year: number,
  month: number
): Promise<Array<{ date: string; status: "booked" | "checked_in" }>> {
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0);

  const bookings = await prisma.booking.findMany({
    where: {
      unitId,
      status: { in: ["CONFIRMED", "CHECKED_IN"] },
      checkInDate: { lte: endOfMonth },
    },
  });

  const bookedDates: Array<{ date: string; status: "booked" | "checked_in" }> = [];

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

    let current = new Date(Math.max(checkIn.getTime(), startOfMonth.getTime()));
    const end = new Date(Math.min(effectiveEnd.getTime(), endOfMonth.getTime()));

    // Next-day policy: include checkout day as blocked (room being prepared)
    while (current <= end) {
      bookedDates.push({
        date: format(current, "yyyy-MM-dd"),
        status: booking.status === "CHECKED_IN" ? "checked_in" : "booked",
      });
      current = addDays(current, 1);
    }
  }

  return bookedDates;
}
