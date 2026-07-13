"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog-context";
import {
  Building2,
  Calendar,
  Clock,
  Phone,
  Mail,
  MessageCircle,
  Check,
  X,
  Loader2,
  FileText,
  UserCircle,
  Home,
  Receipt,
  AlertTriangle,
  Ban,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Booking } from "./BookingCard";

interface BookingDetailDrawerProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (booking: Booking) => Promise<void>;
  onReject?: (booking: Booking, reason?: string) => Promise<void>;
  onCancel?: (booking: Booking, reason?: string) => Promise<void>;
  onCheckIn?: (booking: Booking) => Promise<void>;
  onCreateTenant?: (booking: Booking) => void;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: "Menunggu", color: "text-amber-800", bg: "bg-amber-100" },
  CONFIRMED: { label: "Dikonfirmasi", color: "text-blue-800", bg: "bg-blue-100" },
  WAITING_PAYMENT: { label: "Belum Lunas", color: "text-orange-800", bg: "bg-orange-100" },
  PAID: { label: "Lunas", color: "text-violet-800", bg: "bg-violet-100" },
  CHECKED_IN: { label: "Checked In", color: "text-emerald-800", bg: "bg-emerald-100" },
  CHECKOUT: { label: "Checkout", color: "text-slate-800", bg: "bg-slate-100" },
  REJECTED: { label: "Ditolak", color: "text-red-800", bg: "bg-red-100" },
  CANCELLED: { label: "Dibatalkan", color: "text-slate-600", bg: "bg-slate-100" },
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

export function BookingDetailDrawer({
  booking,
  isOpen,
  onClose,
  onConfirm,
  onReject,
  onCancel,
  onCheckIn,
  onCreateTenant,
}: BookingDetailDrawerProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const { confirm } = useConfirm();

  if (!booking) return null;

  const status = statusConfig[booking.status] || statusConfig.PENDING;
  const isPending = booking.status === "PENDING";
  const isConfirmed = booking.status === "CONFIRMED";
  const isWaitingPayment = booking.status === "WAITING_PAYMENT";
  const isCheckedIn = booking.status === "CHECKED_IN";
  const isCancellable = booking.status === "CONFIRMED" || booking.status === "WAITING_PAYMENT";

  const handleConfirm = async () => {
    if (!onConfirm) return;
    setIsConfirming(true);
    try {
      await onConfirm(booking);
      onClose();
    } finally {
      setIsConfirming(false);
    }
  };

  const handleReject = async () => {
    if (!onReject) return;
    setIsRejecting(true);
    try {
      await onReject(booking);
      onClose();
    } finally {
      setIsRejecting(false);
    }
  };

  const handleCancel = async () => {
    if (!onCancel) return;
    const confirmed = await confirm({
      title: "Batalkan Booking?",
      description: `Booking dari ${booking.guestName} akan dibatalkan. Tindakan ini tidak dapat dikembalikan.`,
      icon: "danger",
      confirmText: "Ya, Batalkan",
      destructive: true,
      requireReason: true,
      reasonPlaceholder: "Masukkan alasan pembatalan...",
      reasonDefaultValue: "Booking dibatalkan oleh pengelola. Silakan hubungi kami untuk informasi lebih lanjut.",
      onConfirm: async (reason) => {
        await onCancel(booking, reason);
        onClose();
      },
    });
  };

  const handleCheckIn = async () => {
    if (!onCheckIn) return;
    setIsCheckingIn(true);
    try {
      await onCheckIn(booking);
      onClose();
    } finally {
      setIsCheckingIn(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold", getAvatarColor(booking.guestName))}>
                {getInitials(booking.guestName)}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{booking.guestName}</h2>
                <p className="text-sm text-slate-500 font-mono">{booking.bookingNumber}</p>
              </div>
            </div>
            <span className={cn("px-3 py-1 rounded-full text-sm font-medium", status.bg, status.color)}>
              {status.label}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Guest Contact */}
          <section className="bg-slate-50 rounded-2xl p-5">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Informasi Kontak
            </h3>
            <div className="space-y-3">
              <a
                href={`https://wa.me/${booking.guestPhone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors"
              >
                <MessageCircle className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="text-sm font-medium text-slate-900">WhatsApp</p>
                  <p className="text-sm text-slate-600">{booking.guestPhone}</p>
                </div>
              </a>
              <a
                href={`tel:${booking.guestPhone}`}
                className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
              >
                <Phone className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Telepon</p>
                  <p className="text-sm text-slate-600">{booking.guestPhone}</p>
                </div>
              </a>
              <a
                href={`mailto:${booking.guestEmail}`}
                className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
              >
                <Mail className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Email</p>
                  <p className="text-sm text-slate-600">{booking.guestEmail}</p>
                </div>
              </a>
            </div>
          </section>

          {/* Booking Details */}
          <section className="space-y-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Detail Booking
            </h3>
            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
              {/* Unit */}
              <div className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Home className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-500">Unit</p>
                  <p className="font-medium text-slate-900">
                    {booking.unit.name || booking.unit.property.name} - Unit {booking.unit.unitNumber}
                  </p>
                </div>
              </div>

              {/* Check-in */}
              <div className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-500">Check-in</p>
                  <p className="font-medium text-slate-900">
                    {format(parseISO(booking.checkInDate), "EEEE, dd MMMM yyyy", { locale: id })}
                  </p>
                </div>
              </div>

              {/* Duration */}
              <div className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-500">Durasi</p>
                  <p className="font-medium text-slate-900">
                    {formatDuration(booking.durationMonths, booking.durationNights)}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Price */}
          {booking.totalPrice != null && (
            <section className="space-y-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Ringkasan Pembayaran
              </h3>
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-5 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-300 text-sm">Total Pembayaran</p>
                    <p className="text-sm text-slate-400 mt-1">
                      {formatDuration(booking.durationMonths, booking.durationNights)}
                    </p>
                  </div>
                  <p className="text-3xl font-bold">
                    {formatCurrency(booking.totalPrice)}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Notes */}
          {booking.notes && (
            <section className="space-y-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Catatan Tamu
              </h3>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <p className="text-sm text-slate-700">{booking.notes}</p>
              </div>
            </section>
          )}

          {/* Timeline placeholder */}
          <section className="space-y-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Timeline
            </h3>
            <div className="relative pl-6 space-y-4">
              <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-slate-200" />
              {/* Created */}
              <div className="relative">
                <div className="absolute left-[-18px] top-1 w-3 h-3 rounded-full bg-amber-500 border-2 border-white" />
                <p className="text-xs text-slate-500">
                  {format(parseISO(booking.createdAt), "dd MMM yyyy, HH:mm", { locale: id })}
                </p>
                <p className="text-sm font-medium text-slate-900">Booking dibuat</p>
              </div>
              {booking.status !== "PENDING" && (
                <div className="relative">
                  <div className="absolute left-[-18px] top-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                  <p className="text-xs text-slate-500">
                    {format(parseISO(booking.createdAt), "dd MMM yyyy, HH:mm", { locale: id })}
                  </p>
                  <p className="text-sm font-medium text-slate-900">Dikonfirmasi</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4">
          {isPending ? (
            <div className="space-y-3">
              <Button
                onClick={handleConfirm}
                disabled={isConfirming || isRejecting}
                className="w-full h-12 !bg-amber-500 hover:!bg-amber-600 text-white"
              >
                {isConfirming ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Check className="w-5 h-5" />
                )}
                <span className="ml-2">Konfirmasi Booking</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleReject}
                disabled={isConfirming || isRejecting}
                className="w-full h-12 border-2 !border-red-500 !text-red-600 hover:!bg-red-50"
              >
                {isRejecting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <X className="w-5 h-5" />
                )}
                <span className="ml-2">Tolak</span>
              </Button>
            </div>
          ) : isConfirmed ? (
            <div className="space-y-3">
              {!booking.tenant ? (
                <Button
                  onClick={() => onCreateTenant?.(booking)}
                  className="w-full h-12 !bg-amber-500 hover:!bg-amber-600 text-white"
                >
                  <UserPlus className="w-5 h-5" />
                  <span className="ml-2">Buat Tenant</span>
                </Button>
              ) : (
                <Button
                  onClick={() => window.open(`/admin/invoice/${booking.invoice?.id || booking.id}`, "_blank")}
                  className="w-full h-12 !bg-amber-500 hover:!bg-amber-600 text-white"
                >
                  <FileText className="w-5 h-5" />
                  <span className="ml-2">Lihat Invoice</span>
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleCancel}
                className="w-full h-12 border-2 !border-red-500 !text-red-600 hover:!bg-red-50"
              >
                <Ban className="w-5 h-5" />
                <span className="ml-2">Batal</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open(`/admin/booking/${booking.id}`, "_blank")}
                className="w-full h-12"
              >
                <FileText className="w-5 h-5" />
                <span className="ml-2">Lihat Detail</span>
              </Button>
            </div>
          ) : isWaitingPayment ? (
            <div className="space-y-3">
              <Button
                onClick={() => window.open(`/admin/invoice/${booking.invoice?.id || booking.id}`, "_blank")}
                className="w-full h-12 !bg-amber-500 hover:!bg-amber-600 text-white"
              >
                <FileText className="w-5 h-5" />
                <span className="ml-2">Lihat Invoice</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                className="w-full h-12 border-2 !border-red-500 !text-red-600 hover:!bg-red-50"
              >
                <Ban className="w-5 h-5" />
                <span className="ml-2">Batal</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open(`/admin/booking/${booking.id}`, "_blank")}
                className="w-full h-12"
              >
                <FileText className="w-5 h-5" />
                <span className="ml-2">Lihat Detail</span>
              </Button>
            </div>
          ) : isCheckedIn ? (
            <div className="space-y-3">
              <Button
                onClick={() => window.open(`/admin/invoice/${booking.invoice?.id || booking.id}`, "_blank")}
                className="w-full h-12 !bg-amber-500 hover:!bg-amber-600 text-white"
              >
                <FileText className="w-5 h-5" />
                <span className="ml-2">Lihat Invoice</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open(`/admin/booking/${booking.id}`, "_blank")}
                className="w-full h-12"
              >
                <FileText className="w-5 h-5" />
                <span className="ml-2">Lihat Detail</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Button
                onClick={() => window.open(`/admin/invoice/${booking.invoice?.id || booking.id}`, "_blank")}
                className="w-full h-12 !bg-amber-500 hover:!bg-amber-600 text-white"
              >
                <FileText className="w-5 h-5" />
                <span className="ml-2">Lihat Invoice</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open(`/admin/booking/${booking.id}`, "_blank")}
                className="w-full h-12"
              >
                <FileText className="w-5 h-5" />
                <span className="ml-2">Lihat Detail</span>
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
