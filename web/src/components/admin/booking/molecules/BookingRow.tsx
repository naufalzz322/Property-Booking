"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Calendar, Clock, Phone, Mail, ChevronRight, Check, X, Loader2 } from "lucide-react";
import { StatusBadge } from "../atoms/StatusBadge";
import { GuestAvatar } from "../atoms/GuestAvatar";
import { QuickPrice, formatCurrency } from "../atoms/QuickPrice";
import { TimeAgo } from "../atoms/TimeAgo";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";

export interface Booking {
  id: string;
  bookingNumber: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  checkInDate: string;
  durationMonths: number | null;
  durationNights: number | null;
  status: string;
  createdAt: string;
  totalPrice?: number | null;
  unit: {
    unitNumber: string;
    name?: string | null;
    property: { name: string };
  };
}

interface BookingRowProps {
  booking: Booking;
  onConfirm?: (booking: Booking) => Promise<void>;
  onReject?: (booking: Booking, reason?: string) => Promise<void>;
  onClick?: () => void;
}

function formatDuration(booking: Booking): string {
  if (booking.durationMonths) return `${booking.durationMonths} bulan`;
  if (booking.durationNights) return `${booking.durationNights} malam`;
  return "—";
}

function formatCheckInDate(dateStr: string): string {
  const date = parseISO(dateStr);
  return format(date, "dd MMM yyyy", { locale: id });
}

export function BookingRow({ booking, onConfirm, onReject, onClick }: BookingRowProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const handleConfirm = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onConfirm) return;
    setIsConfirming(true);
    try {
      await onConfirm(booking);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleReject = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onReject) return;
    setIsRejecting(true);
    try {
      await onReject(booking);
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <tr
      onClick={onClick}
      className="group cursor-pointer hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-b-0"
    >
      {/* Booking Number */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
            {booking.bookingNumber}
          </span>
          <TimeAgo dateString={booking.createdAt} />
        </div>
      </td>

      {/* Guest Info */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <GuestAvatar name={booking.guestName} size="sm" />
          <div className="min-w-0">
            <p className="font-medium text-slate-900 truncate max-w-[150px]">
              {booking.guestName}
            </p>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {booking.guestPhone}
            </p>
          </div>
        </div>
      </td>

      {/* Unit Info */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-sm text-slate-900 truncate max-w-[120px]">
              {booking.unit.name || booking.unit.property.name}
            </p>
            <p className="text-xs text-slate-500">Unit {booking.unit.unitNumber}</p>
          </div>
        </div>
      </td>

      {/* Check-in Date & Duration */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <div>
            <p className="text-sm text-slate-900">
              {formatCheckInDate(booking.checkInDate)}
            </p>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDuration(booking)}
            </p>
          </div>
        </div>
      </td>

      {/* Total Price */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <QuickPrice amount={booking.totalPrice} size="sm" />
      </td>

      {/* Status */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <StatusBadge status={booking.status} size="sm" />
      </td>

      {/* Actions */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <div className="flex items-center gap-1">
          {booking.status === "PENDING" ? (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleConfirm}
                disabled={isConfirming}
                className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                title="Terima"
              >
                {isConfirming ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleReject}
                disabled={isRejecting}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Tolak"
              >
                {isRejecting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <X className="w-4 h-4" />
                )}
              </Button>
            </>
          ) : null}
          <Link
            href={`/admin/booking/${booking.id}`}
            className="inline-flex items-center justify-center h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            title="Detail"
          >
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </td>
    </tr>
  );
}
