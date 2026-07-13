"use client";

import { Clock, CalendarCheck, Home, CheckCircle2, Loader2, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { BookingCard, Booking, BookingCardSkeleton } from "./BookingCard";

interface BookingColumnProps {
  status: "PENDING" | "CONFIRMED" | "WAITING_PAYMENT" | "CHECKED_IN" | "CHECKOUT";
  bookings: Booking[];
  onConfirm?: (booking: Booking) => Promise<void>;
  onReject?: (booking: Booking) => Promise<void>;
  onCancel?: (booking: Booking) => Promise<void>;
  onCheckIn?: (booking: Booking) => Promise<void>;
  onCreateTenant?: (booking: Booking) => void;
  onCardClick?: (booking: Booking) => void;
  isLoading?: boolean;
}

const columnConfig = {
  PENDING: {
    title: "Menunggu",
    subtitle: "Perlu diproses",
    icon: Clock,
    color: "amber",
    headerBg: "bg-amber-50",
    headerBorder: "border-amber-200",
    countBg: "bg-amber-100 text-amber-700",
  },
  CONFIRMED: {
    title: "Dikonfirmasi",
    subtitle: "Siap dibuatkan tenant",
    icon: CalendarCheck,
    color: "blue",
    headerBg: "bg-blue-50",
    headerBorder: "border-blue-200",
    countBg: "bg-blue-100 text-blue-700",
  },
  WAITING_PAYMENT: {
    title: "Belum Lunas",
    subtitle: "Invoice dikirim",
    icon: Wallet,
    color: "orange",
    headerBg: "bg-orange-50",
    headerBorder: "border-orange-200",
    countBg: "bg-orange-100 text-orange-700",
  },
  PAID: {
    title: "Lunas",
    subtitle: "Pembayaran diterima",
    icon: CheckCircle2,
    color: "violet",
    headerBg: "bg-violet-50",
    headerBorder: "border-violet-200",
    countBg: "bg-violet-100 text-violet-700",
  },
  CHECKED_IN: {
    title: "Checked In",
    subtitle: "Sedang berpenghuni",
    icon: Home,
    color: "emerald",
    headerBg: "bg-emerald-50",
    headerBorder: "border-emerald-200",
    countBg: "bg-emerald-100 text-emerald-700",
  },
  CHECKOUT: {
    title: "Checkout",
    subtitle: "Sudah keluar",
    icon: CheckCircle2,
    color: "slate",
    headerBg: "bg-slate-50",
    headerBorder: "border-slate-200",
    countBg: "bg-slate-100 text-slate-600",
  },
};

export function BookingColumn({
  status,
  bookings,
  onConfirm,
  onReject,
  onCancel,
  onCheckIn,
  onCreateTenant,
  onCardClick,
  isLoading = false,
}: BookingColumnProps) {
  const config = columnConfig[status];
  const Icon = config.icon;

  return (
    <div className="flex flex-col rounded-xl border overflow-hidden h-full">
      {/* Column Header */}
      <div
        className={cn(
          "px-4 py-3 flex-shrink-0",
          config.headerBg,
          config.headerBorder,
          "border-b"
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={cn("w-5 h-5", {
              "text-amber-600": config.color === "amber",
              "text-blue-600": config.color === "blue",
              "text-orange-600": config.color === "orange",
              "text-violet-600": config.color === "violet",
              "text-emerald-600": config.color === "emerald",
              "text-slate-600": config.color === "slate",
            })} />
            <div>
              <h3 className="font-semibold text-slate-900">{config.title}</h3>
              <p className="text-xs text-slate-500">{config.subtitle}</p>
            </div>
          </div>
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-sm font-semibold",
              config.countBg
            )}
          >
            {bookings.length}
          </span>
        </div>
      </div>

      {/* Cards Container - Scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <BookingCardSkeleton key={i} />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[100px] py-8 text-center">
            <Icon className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-sm text-slate-400">Belum ada booking</p>
          </div>
        ) : (
          bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onConfirm={onConfirm}
              onReject={onReject}
              onCancel={onCancel}
              onCheckIn={onCheckIn}
              onCreateTenant={onCreateTenant}
              onClick={onCardClick}
            />
          ))
        )}
      </div>
    </div>
  );
}
