"use client";

import { useMemo } from "react";
import { BookingColumn } from "./BookingColumn";
import { Booking } from "./BookingCard";

interface BookingBoardProps {
  bookings: Booking[];
  onConfirm?: (booking: Booking) => Promise<void>;
  onReject?: (booking: Booking) => Promise<void>;
  onCancel?: (booking: Booking) => Promise<void>;
  onCheckIn?: (booking: Booking) => Promise<void>;
  onCreateTenant?: (booking: Booking) => void;
  onCardClick?: (booking: Booking) => void;
  isLoading?: boolean;
}

const STATUSES = ["PENDING", "CONFIRMED", "WAITING_PAYMENT", "CHECKED_IN", "CHECKOUT"] as const;

export function BookingBoard({
  bookings,
  onConfirm,
  onReject,
  onCancel,
  onCheckIn,
  onCreateTenant,
  onCardClick,
  isLoading = false,
}: BookingBoardProps) {
  // Group bookings by status
  const bookingsByStatus = useMemo(() => {
    const grouped: Record<string, Booking[]> = {
      PENDING: [],
      CONFIRMED: [],
      WAITING_PAYMENT: [],
      CHECKED_IN: [],
      CHECKOUT: [],
    };

    bookings.forEach((booking) => {
      if (grouped[booking.status]) {
        grouped[booking.status].push(booking);
      } else if (booking.status === "PAID") {
        // Merge PAID into WAITING_PAYMENT
        grouped.WAITING_PAYMENT.push(booking);
      } else if (booking.status === "REJECTED" || booking.status === "CANCELLED") {
        // Skip rejected/cancelled for now
      } else {
        grouped.PENDING.push(booking);
      }
    });

    // Sort each group by createdAt (newest first)
    Object.keys(grouped).forEach((status) => {
      grouped[status].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });

    return grouped;
  }, [bookings]);

  return (
    <div className="flex flex-col gap-3 overflow-y-auto" style={{ height: "calc((100vh - 120px) * 1.5)" }}>
      {/* Row 1: PENDING + CONFIRMED */}
      <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
        <BookingColumn
          status="PENDING"
          bookings={bookingsByStatus.PENDING}
          onConfirm={onConfirm}
          onReject={onReject}
          onCancel={onCancel}
          onCheckIn={onCheckIn}
          onCreateTenant={onCreateTenant}
          onCardClick={onCardClick}
          isLoading={isLoading}
        />
        <BookingColumn
          status="CONFIRMED"
          bookings={bookingsByStatus.CONFIRMED}
          onConfirm={onConfirm}
          onReject={onReject}
          onCancel={onCancel}
          onCheckIn={onCheckIn}
          onCreateTenant={onCreateTenant}
          onCardClick={onCardClick}
          isLoading={isLoading}
        />
      </div>

      {/* Row 2: WAITING_PAYMENT + CHECKED_IN */}
      <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
        <BookingColumn
          status="WAITING_PAYMENT"
          bookings={bookingsByStatus.WAITING_PAYMENT}
          onConfirm={onConfirm}
          onReject={onReject}
          onCancel={onCancel}
          onCheckIn={onCheckIn}
          onCreateTenant={onCreateTenant}
          onCardClick={onCardClick}
          isLoading={isLoading}
        />
        <BookingColumn
          status="CHECKED_IN"
          bookings={bookingsByStatus.CHECKED_IN}
          onConfirm={onConfirm}
          onReject={onReject}
          onCancel={onCancel}
          onCheckIn={onCheckIn}
          onCreateTenant={onCreateTenant}
          onCardClick={onCardClick}
          isLoading={isLoading}
        />
      </div>

      {/* Row 3: CHECKOUT + empty */}
      <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
        <BookingColumn
          status="CHECKOUT"
          bookings={bookingsByStatus.CHECKOUT}
          onConfirm={onConfirm}
          onReject={onReject}
          onCancel={onCancel}
          onCheckIn={onCheckIn}
          onCreateTenant={onCreateTenant}
          onCardClick={onCardClick}
          isLoading={isLoading}
        />
        <div className="bg-slate-50/30 rounded-xl border border-dashed border-slate-200" />
      </div>
    </div>
  );
}
