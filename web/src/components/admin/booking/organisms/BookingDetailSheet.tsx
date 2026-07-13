"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "../atoms/StatusBadge";
import { GuestAvatar } from "../atoms/GuestAvatar";
import { formatCurrencyFull } from "../atoms/QuickPrice";
import { TimeAgo } from "../atoms/TimeAgo";
import { Booking } from "../molecules/BookingRow";
import {
  Building2,
  Calendar,
  Clock,
  Phone,
  Mail,
  Check,
  X,
  Loader2,
  ArrowRight,
  FileText,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";

interface BookingDetailSheetProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (booking: Booking) => Promise<void>;
  onReject?: (booking: Booking, reason?: string) => Promise<void>;
}

function formatDuration(booking: Booking): string {
  if (booking.durationMonths) return `${booking.durationMonths} bulan`;
  if (booking.durationNights) return `${booking.durationNights} malam`;
  return "—";
}

export function BookingDetailSheet({
  booking,
  isOpen,
  onClose,
  onConfirm,
  onReject,
}: BookingDetailSheetProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const handleConfirm = async () => {
    if (!booking || !onConfirm) return;
    setIsConfirming(true);
    try {
      await onConfirm(booking);
      onClose();
    } finally {
      setIsConfirming(false);
    }
  };

  const handleReject = async () => {
    if (!booking || !onReject) return;
    setIsRejecting(true);
    try {
      await onReject(booking);
      onClose();
    } finally {
      setIsRejecting(false);
    }
  };

  if (!booking) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm bg-slate-100 text-slate-600 px-2 py-1 rounded">
                {booking.bookingNumber}
              </span>
              <StatusBadge status={booking.status} size="sm" />
            </div>
            <TimeAgo dateString={booking.createdAt} />
          </div>
          <SheetDescription className="sr-only">
            Detail booking {booking.bookingNumber}
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Guest & Booking Info */}
          <div className="grid grid-cols-2 gap-6">
            {/* Guest Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Informasi Tamu
              </h3>
              <div className="flex items-center gap-3">
                <GuestAvatar name={booking.guestName} size="lg" />
                <div>
                  <p className="font-semibold text-slate-900">{booking.guestName}</p>
                  <a
                    href={`tel:${booking.guestPhone}`}
                    className="text-sm text-slate-500 hover:text-blue-600 flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" />
                    {booking.guestPhone}
                  </a>
                </div>
              </div>
              {booking.guestEmail && (
                <a
                  href={`mailto:${booking.guestEmail}`}
                  className="text-sm text-slate-500 hover:text-blue-600 flex items-center gap-1"
                >
                  <Mail className="w-3.5 h-3.5" />
                  {booking.guestEmail}
                </a>
              )}
            </div>

            {/* Booking Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Detail Booking
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-700">
                    {booking.unit.name || booking.unit.property.name} · Unit {booking.unit.unitNumber}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-4" />
                  <span className="text-slate-500">
                    Unit {booking.unit.unitNumber}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-700">
                    {format(parseISO(booking.checkInDate), "dd MMMM yyyy", { locale: id })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-700">{formatDuration(booking)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Price Summary */}
          {booking.totalPrice != null && (
            <div className="bg-slate-50 rounded-lg p-4 space-y-2">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Ringkasan Pembayaran
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Total</span>
                <span className="text-xl font-bold text-slate-900">
                  {formatCurrencyFull(booking.totalPrice)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-slate-200 pt-4 space-y-3">
          {booking.status === "PENDING" && (
            <div className="flex gap-3">
              <Button
                onClick={handleConfirm}
                disabled={isConfirming || isRejecting}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isConfirming ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Konfirmasi
              </Button>
              <Button
                onClick={handleReject}
                disabled={isConfirming || isRejecting}
                variant="outline"
                className="flex-1 border-2 border-red-500 text-red-600 hover:bg-red-50"
              >
                {isRejecting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <X className="w-4 h-4 mr-2" />
                )}
                Tolak
              </Button>
            </div>
          )}

          {/* Related Links */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Link
              href={`/admin/booking/${booking.id}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            >
              <FileText className="w-4 h-4" />
              Lihat Detail
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
