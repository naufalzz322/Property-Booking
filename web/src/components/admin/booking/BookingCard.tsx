"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  Calendar,
  Clock,
  Phone,
  MessageCircle,
  Check,
  X,
  Loader2,
  ChevronRight,
  AlertTriangle,
  UserCheck,
  UserPlus,
  Ban,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { format, parseISO, formatDistanceToNow } from "date-fns";
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
  notes: string | null;
  status: string;
  createdAt: string;
  totalPrice?: number | null;
  unit: {
    unitNumber: string;
    name?: string | null;
    property: { name: string };
  };
  tenant?: { id: string; name: string } | null;
  invoice?: {
    id: string;
    status: string;
    totalAmount: number;
  } | null;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  PENDING: { label: "Menunggu", color: "text-amber-800", bg: "bg-amber-100 border-amber-200", dot: "bg-amber-500" },
  CONFIRMED: { label: "Dikonfirmasi", color: "text-blue-800", bg: "bg-blue-100 border-blue-200", dot: "bg-blue-500" },
  WAITING_PAYMENT: { label: "Belum Lunas", color: "text-orange-800", bg: "bg-orange-100 border-orange-200", dot: "bg-orange-500" },
  PAID: { label: "Lunas", color: "text-violet-800", bg: "bg-violet-100 border-violet-200", dot: "bg-violet-500" },
  CHECKED_IN: { label: "Checked In", color: "text-emerald-800", bg: "bg-emerald-100 border-emerald-200", dot: "bg-emerald-500" },
  CHECKOUT: { label: "Checkout", color: "text-slate-800", bg: "bg-slate-100 border-slate-200", dot: "bg-slate-500" },
  REJECTED: { label: "Ditolak", color: "text-red-800", bg: "bg-red-100 border-red-200", dot: "bg-red-500" },
  CANCELLED: { label: "Dibatalkan", color: "text-slate-600", bg: "bg-slate-100 border-slate-200", dot: "bg-slate-400" },
};

function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return "—";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDuration(months: number | null, nights: number | null): string {
  if (months) return `${months} bulan`;
  if (nights) return `${nights} malam`;
  return "—";
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string): string {
  const colors = [
    "bg-violet-100 text-violet-800",
    "bg-blue-100 text-blue-800",
    "bg-emerald-100 text-emerald-800",
    "bg-amber-100 text-amber-800",
    "bg-rose-100 text-rose-800",
    "bg-cyan-100 text-cyan-800",
    "bg-purple-100 text-purple-800",
  ];
  const index = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
}

interface BookingCardProps {
  booking: Booking;
  onConfirm?: (booking: Booking) => Promise<void>;
  onReject?: (booking: Booking, reason?: string) => Promise<void>;
  onCancel?: (booking: Booking, reason?: string) => Promise<void>;
  onCheckIn?: (booking: Booking) => Promise<void>;
  onCreateTenant?: (booking: Booking) => void;
  onClick?: (booking: Booking) => void;
  compact?: boolean;
}

export function BookingCard({
  booking,
  onConfirm,
  onReject,
  onCancel,
  onCheckIn,
  onCreateTenant,
  onClick,
  compact = false,
}: BookingCardProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const status = statusConfig[booking.status] || statusConfig.PENDING;
  const isPending = booking.status === "PENDING";
  const isConfirmed = booking.status === "CONFIRMED";
  const isWaitingPayment = booking.status === "WAITING_PAYMENT";
  const isPaid = booking.status === "PAID";
  const isCheckedIn = booking.status === "CHECKED_IN";
  const isCancellable = booking.status === "CONFIRMED" || booking.status === "WAITING_PAYMENT";

  // Calculate urgency - booking older than 24h
  const createdDate = parseISO(booking.createdAt);
  const checkInDate = parseISO(booking.checkInDate);

  // Only calculate on client to avoid hydration mismatch
  const hoursOld = mounted ? (Date.now() - createdDate.getTime()) / (1000 * 60 * 60) : 0;
  const isUrgent = hoursOld > 24 && isPending;

  // Check-in date info
  const isToday = mounted ? checkInDate.toDateString() === new Date().toDateString() : false;
  const isTomorrow = mounted
    ? new Date(checkInDate.getTime() + 86400000).toDateString() === new Date().toDateString()
    : false;

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

  const handleCancel = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onCancel) return;
    setIsCancelling(true);
    try {
      await onCancel(booking);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleCheckIn = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onCheckIn) return;
    setIsCheckingIn(true);
    try {
      await onCheckIn(booking);
    } finally {
      setIsCheckingIn(false);
    }
  };

  if (compact) {
    // Compact version for collapsed view
    return (
      <button
        onClick={() => onClick?.(booking)}
        className="w-full flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all text-left"
      >
        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0", getAvatarColor(booking.guestName))}>
          {getInitials(booking.guestName)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-900 truncate">{booking.guestName}</p>
          <p className="text-xs text-slate-500">Unit {booking.unit.unitNumber}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </button>
    );
  }

  return (
    <div
      onClick={() => onClick?.(booking)}
      className={cn(
        "group bg-white rounded-2xl border overflow-hidden transition-all duration-200 hover:shadow-md hover:border-slate-300 cursor-pointer relative",
        isUrgent ? "border-amber-300 ring-2 ring-amber-100" : "border-slate-200"
      )}
    >
      {/* Header */}
      <div className="p-4 pb-3 pt-5 pr-14">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0", getAvatarColor(booking.guestName))}>
              {getInitials(booking.guestName)}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-900 truncate group-hover:text-amber-600 transition-colors">
                {booking.guestName}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                  {booking.bookingNumber}
                </span>
                {isUrgent && (
                  <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                    <AlertTriangle className="w-3 h-3" />
                    Lama
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Status Badge - Always top right */}
          <span className="absolute top-4 right-4">
            <span className={cn("inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border", status.bg, status.color)}>
              <span className={cn("w-1.5 h-1.5 rounded-full", status.dot)} />
              {status.label}
            </span>
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="px-4 pb-3 space-y-2">
        {/* Unit */}
        <div className="flex items-center gap-2 text-sm">
          <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span className="text-slate-600">
            {booking.unit.name || booking.unit.property.name} · Unit {booking.unit.unitNumber}
          </span>
        </div>

        {/* Check-in */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span className={cn("text-slate-600", isToday && "font-semibold text-emerald-600")} suppressHydrationWarning>
            {format(checkInDate, "dd MMM yyyy", { locale: id })}
            {mounted && isToday && " (Hari ini)"}
            {mounted && isTomorrow && " (Besok)"}
          </span>
        </div>

        {/* Duration */}
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span className="text-slate-600">
            {formatDuration(booking.durationMonths, booking.durationNights)}
          </span>
        </div>
      </div>

      {/* Price */}
      {booking.totalPrice != null && (
        <div className="px-4 pb-3">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-slate-500">Total</span>
            <span className="text-lg font-bold text-slate-900">
              {formatCurrency(booking.totalPrice)}
            </span>
          </div>
        </div>
      )}

      {/* Actions - Only for PENDING */}
      {isPending && (
        <div className="px-4 pb-4 space-y-2">
          <Button
            size="sm"
            onClick={handleConfirm}
            disabled={isConfirming || isRejecting}
            className="w-full h-9 !bg-emerald-600 hover:!bg-emerald-700 text-white"
          >
            {isConfirming ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            <span className="ml-1">Konfirmasi Booking</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleReject}
            disabled={isConfirming || isRejecting}
            className="w-full h-9 border-2 !border-red-500 !text-red-600 hover:!bg-red-50"
          >
            {isRejecting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <X className="w-4 h-4" />
            )}
            <span className="ml-1">Tolak</span>
          </Button>
        </div>
      )}

      {/* Non-pending actions */}
      {!isPending && (
        <div className="px-4 pb-4 space-y-2">
          {/* CONFIRMED: Create Tenant */}
          {isConfirmed && !booking.tenant && (
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onCreateTenant?.(booking);
              }}
              className="w-full h-9 !bg-amber-500 hover:!bg-amber-600 text-white"
            >
              <UserPlus className="w-4 h-4" />
              <span className="ml-1">Buat Tenant</span>
            </Button>
          )}

          {/* CONFIRMED (has tenant) & WAITING_PAYMENT: Lihat Invoice */}
          {(isConfirmed && booking.tenant) || isWaitingPayment ? (
            <Link
              href={`/admin/invoice/${booking.invoice?.id || booking.id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors font-medium"
            >
              <FileText className="w-4 h-4" />
              <span>Lihat Invoice</span>
            </Link>
          ) : null}

          {/* CHECKED_IN: Lihat Invoice */}
          {isCheckedIn && (
            <Link
              href={`/admin/invoice/${booking.invoice?.id || booking.id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors font-medium"
            >
              <FileText className="w-4 h-4" />
              <span>Lihat Invoice</span>
            </Link>
          )}

          {/* CHECKOUT: Lihat Invoice */}
          {!isCheckedIn && !isConfirmed && !isWaitingPayment && !isPending && (
            <Link
              href={`/admin/invoice/${booking.invoice?.id || booking.id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors font-medium"
            >
              <FileText className="w-4 h-4" />
              <span>Lihat Invoice</span>
            </Link>
          )}

          {/* CONFIRMED: Batal */}
          {isConfirmed && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              disabled={isCancelling}
              className="w-full h-9 border-2 !border-red-500 !text-red-600 hover:!bg-red-50"
            >
              {isCancelling ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Ban className="w-4 h-4" />
              )}
              <span className="ml-1">Batal</span>
            </Button>
          )}

          {/* WAITING_PAYMENT: Batal */}
          {isWaitingPayment && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              disabled={isCancelling}
              className="w-full h-9 border-2 !border-red-500 !text-red-600 hover:!bg-red-50"
            >
              {isCancelling ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Ban className="w-4 h-4" />
              )}
              <span className="ml-1">Batal</span>
            </Button>
          )}

          {/* View Detail Link */}
          <Link
            href={`/admin/booking/${booking.id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-2 w-full py-2 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Lihat Detail</span>
          </Link>
        </div>
      )}

      {/* Footer - Time since */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-100">
        <p className="text-xs text-slate-400" suppressHydrationWarning>
          {mounted ? formatDistanceToNow(createdDate, { addSuffix: true, locale: id }) : "Baru saja"}
        </p>
      </div>
    </div>
  );
}

// Skeleton for loading state
export function BookingCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 bg-slate-200 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-32 bg-slate-200 rounded" />
          <div className="h-3 w-20 bg-slate-100 rounded" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-4 w-full bg-slate-100 rounded" />
        <div className="h-4 w-3/4 bg-slate-100 rounded" />
      </div>
      <div className="h-8 w-24 bg-slate-100 rounded" />
    </div>
  );
}
