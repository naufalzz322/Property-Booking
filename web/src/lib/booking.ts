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
      existingEnd = addDays(checkIn, booking.durationNights); // Use checkIn as base for night calculations
    } else {
      return false;
    }

    // Use consistent exclusive end check for both existing and new booking
    // Check-in day is inclusive, check-out day is exclusive (guest leaves on check-out day)
    const newEnd = checkOut;

    return (
      // New check-in overlaps existing booking
      (checkIn >= existingStart && checkIn < existingEnd) ||
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

    let current = new Date(Math.max(checkIn.getTime(), startOfMonth.getTime()));
    const end = new Date(Math.min(checkOut.getTime(), endOfMonth.getTime()));

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
