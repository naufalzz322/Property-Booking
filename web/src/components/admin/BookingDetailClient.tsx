"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  ArrowLeft,
  Check,
  X,
  Ban,
  UserPlus,
  Calendar,
  CreditCard,
  Home,
  FileText,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog-context";
import { CreateTenantModal } from "./booking/CreateTenantModal";
import { cn } from "@/lib/utils";

interface BookingEvent {
  id: string;
  eventType: string;
  message: string;
  metadata: Record<string, unknown> | unknown | null;
  createdAt: string | Date;
}

interface Booking {
  id: string;
  bookingNumber: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  checkInDate: string | Date;
  durationMonths: number | null;
  durationNights: number | null;
  notes: string | null;
  status: string;
  rejectionReason: string | null;
  confirmedAt: Date | string | null;
  createdAt: Date | string;
  unit: {
    unitNumber: string;
    slug: string;
    name?: string | null;
    pricePerMonth: number | null;
    property: { name: string };
  };
  tenant: { id: string; name: string } | null;
  invoices?: Array<{
    id: string;
    invoiceNumber: string;
    totalAmount: number;
    status: string;
    dueDate: Date;
  }>;
  events?: BookingEvent[];
}

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  WAITING_PAYMENT: "bg-orange-100 text-orange-700",
  PAID: "bg-violet-100 text-violet-700",
  CHECKED_IN: "bg-emerald-100 text-emerald-700",
  CHECKOUT: "bg-slate-100 text-slate-700",
  REJECTED: "bg-red-100 text-red-700",
  CANCELLED: "bg-slate-100 text-slate-500",
};

const statusLabels: Record<string, string> = {
  PENDING: "Menunggu Konfirmasi",
  CONFIRMED: "Dikonfirmasi",
  WAITING_PAYMENT: "Menunggu Pembayaran",
  PAID: "Lunas",
  CHECKED_IN: "Sudah Check-in",
  CHECKOUT: "Checkout",
  REJECTED: "Ditolak",
  CANCELLED: "Dibatalkan",
};

const eventConfig: Record<string, { label: string; icon: typeof Calendar; color: string }> = {
  CREATED: { label: "Booking dibuat", icon: Calendar, color: "text-amber-600 bg-amber-100" },
  CONFIRMED: { label: "Dikonfirmasi", icon: Check, color: "text-blue-600 bg-blue-100" },
  TENANT_CREATED: { label: "Tenant dibuat", icon: UserPlus, color: "text-violet-600 bg-violet-100" },
  INVOICE_SENT: { label: "Invoice dikirim", icon: FileText, color: "text-orange-600 bg-orange-100" },
  PAID: { label: "Pembayaran dikonfirmasi", icon: CreditCard, color: "text-green-600 bg-green-100" },
  CHECKED_IN: { label: "Check-in", icon: Home, color: "text-emerald-600 bg-emerald-100" },
  CHECKOUT: { label: "Check-out", icon: Clock, color: "text-slate-600 bg-slate-100" },
  REJECTED: { label: "Ditolak", icon: X, color: "text-red-600 bg-red-100" },
  CANCELLED: { label: "Dibatalkan", icon: Ban, color: "text-slate-600 bg-slate-100" },
};

export function BookingDetailClient({ booking }: { booking: Booking }) {
  const router = useRouter();
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [showCreateTenantModal, setShowCreateTenantModal] = useState(false);
  const [currentTenant, setCurrentTenant] = useState(booking.tenant);
  const { confirm } = useConfirm();

  const isCancellable = booking.status === "CONFIRMED";

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}/confirm`, {
        method: "POST",
      });

      if (res.ok) {
        success("Booking berhasil dikonfirmasi");
        router.push("/admin/booking");
        router.refresh();
      } else {
        const data = await res.json();
        showError(data.error || "Gagal mengkonfirmasi booking");
      }
    } catch {
      showError("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    const confirmed = await confirm({
      title: "Tolak Booking?",
      description: `Booking dari ${booking.guestName} akan ditolak. Tindakan ini tidak dapat dibatalkan.`,
      icon: "danger",
      confirmText: "Ya, Tolak",
      destructive: true,
      requireReason: true,
      reasonPlaceholder: "Masukkan alasan penolakan...",
      reasonDefaultValue: "Mohon maaf, unit tidak tersedia untuk tanggal yang diminta. Silakan hubungi kami untuk informasi lebih lanjut.",
      onConfirm: async (reason) => {
        setLoading(true);
        try {
          const res = await fetch(`/api/admin/bookings/${booking.id}/reject`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reason }),
          });

          if (res.ok) {
            success("Booking berhasil ditolak");
            router.push("/admin/booking");
            router.refresh();
          } else {
            showError("Gagal menolak booking");
          }
        } catch {
          showError("Terjadi kesalahan");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}/checkin`, {
        method: "POST",
      });

      if (res.ok) {
        success("Check-in berhasil");
        router.refresh();
      } else {
        showError("Gagal check-in");
      }
    } catch {
      showError("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
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
        setLoading(true);
        try {
          const res = await fetch(`/api/admin/bookings/${booking.id}/cancel`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reason }),
          });

          if (res.ok) {
            success("Booking berhasil dibatalkan");
            router.push("/admin/booking");
            router.refresh();
          } else {
            const data = await res.json();
            showError(data.error || "Gagal membatalkan booking");
          }
        } catch {
          showError("Terjadi kesalahan");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/booking" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{booking.bookingNumber}</h1>
            <p className="text-slate-500">
              Dibuat {format(new Date(booking.createdAt), "dd MMMM yyyy, HH:mm", { locale: id })}
            </p>
          </div>
        </div>
        <Badge className={statusColors[booking.status]} variant="secondary">
          {statusLabels[booking.status] || booking.status}
        </Badge>
      </div>

      {/* Info Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Guest Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Info Tamu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-slate-500">Nama Lengkap</p>
              <p className="font-medium">{booking.guestName}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">No. HP</p>
              <p className="font-medium">{booking.guestPhone}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Email</p>
              <p className="font-medium">{booking.guestEmail}</p>
            </div>
          </CardContent>
        </Card>

        {/* Booking Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Info Booking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-slate-500">Unit</p>
              <p className="font-medium">
                {booking.unit.name || booking.unit.property.name} - Unit {booking.unit.unitNumber}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Check-in</p>
              <p className="font-medium">
                {format(new Date(booking.checkInDate), "dd MMMM yyyy", { locale: id })}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Durasi</p>
              <p className="font-medium">
                {booking.durationMonths
                  ? `${booking.durationMonths} bulan`
                  : booking.durationNights
                  ? `${booking.durationNights} malam`
                  : "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Estimasi Biaya/bulan</p>
              <p className="font-medium">
                {booking.unit.pricePerMonth
                  ? `Rp ${booking.unit.pricePerMonth.toLocaleString("id-ID")}`
                  : "-"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {booking.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Catatan Tamu</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">{booking.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Rejection Reason */}
      {booking.status === "REJECTED" && booking.rejectionReason && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-lg text-red-700">Alasan Penolakan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{booking.rejectionReason}</p>
          </CardContent>
        </Card>
      )}

      {/* Tenant Created */}
      {booking.tenant && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-lg text-green-700">Tenant Dibuat</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-600">
              Akun tenant: <strong>{booking.tenant.name}</strong> berhasil dibuat
            </p>
          </CardContent>
        </Card>
      )}

      {/* Invoice Info */}
      {booking.invoices && booking.invoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Invoice</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {booking.invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium">{invoice.invoiceNumber}</p>
                  <p className="text-sm text-slate-500">
                    Jatuh tempo: {format(new Date(invoice.dueDate), "dd MMM yyyy", { locale: id })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">Rp {invoice.totalAmount.toLocaleString("id-ID")}</p>
                  <p className={`text-sm ${invoice.status === "PAID" ? "text-emerald-600" : invoice.status === "OVERDUE" ? "text-red-600" : "text-orange-600"}`}>
                    {invoice.status === "PAID" ? "Lunas" : invoice.status === "OVERDUE" ? "Overdue" : "Menunggu"}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      {booking.events && booking.events.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-200" />

              <div className="space-y-4">
                {booking.events.map((event, index) => {
                  const config = eventConfig[event.eventType] || {
                    label: event.eventType,
                    icon: Clock,
                    color: "text-slate-600 bg-slate-100"
                  };
                  const Icon = config.icon;
                  const isLast = index === booking.events!.length - 1;

                  return (
                    <div key={event.id} className="relative flex items-start gap-4 pl-0">
                      <div className={cn(
                        "relative z-10 flex items-center justify-center w-8 h-8 rounded-full",
                        config.color
                      )}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="text-sm font-medium text-slate-900">{config.label}</p>
                        <p className="text-xs text-slate-500">
                          {format(new Date(event.createdAt), "dd MMM yyyy, HH:mm", { locale: id })}
                        </p>
                        {event.message && event.message !== config.label && (
                          <p className="text-sm text-slate-600 mt-1">{event.message}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {booking.status === "PENDING" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Aksi</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-row flex-wrap gap-3">
            <Button onClick={handleConfirm} disabled={loading} className="flex-1">
              <Check className="w-4 h-4 mr-2" />
              Konfirmasi Booking
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-2 border-red-500 text-red-600 hover:bg-red-50"
              onClick={handleReject}
            >
              <X className="w-4 h-4 mr-2" />
              Tolak
            </Button>
          </CardContent>
        </Card>
      )}

      {booking.status === "CONFIRMED" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Aksi</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-row flex-wrap gap-3">
            {!currentTenant ? (
              <>
                <Button onClick={() => setShowCreateTenantModal(true)} className="flex-1">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Buat Tenant
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1 border-2 border-red-500 text-red-600 hover:bg-red-50"
                >
                  <Ban className="w-4 h-4 mr-2" />
                  Batal
                </Button>
                <Link href={`/admin/booking/${booking.id}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    Lihat Detail
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/admin/invoice/${booking.invoices?.[0]?.id || booking.id}" className="flex-1">
                  <Button variant="outline" className="w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    Lihat Invoice
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1 border-2 border-red-500 text-red-600 hover:bg-red-50"
                >
                  <Ban className="w-4 h-4 mr-2" />
                  Batal
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {booking.status === "WAITING_PAYMENT" && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-lg text-orange-700">Belum Lunas</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-row flex-wrap gap-3">
            <Link href="/admin/invoice/${booking.invoices?.[0]?.id || booking.id}" className="flex-1">
              <Button variant="outline" className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                Lihat Invoice
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1 border-2 border-red-500 text-red-600 hover:bg-red-50"
            >
              <Ban className="w-4 h-4 mr-2" />
              Batal
            </Button>
          </CardContent>
        </Card>
      )}

      {booking.status === "CHECKED_IN" && (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardHeader>
            <CardTitle className="text-lg text-emerald-700">Aktif</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-row flex-wrap gap-3">
            <Link href="/admin/invoice/${booking.invoices?.[0]?.id || booking.id}" className="flex-1">
              <Button variant="outline" className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                Lihat Invoice
              </Button>
            </Link>
            <Link href={`/admin/booking/${booking.id}`} className="flex-1">
              <Button variant="outline" className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                Lihat Detail
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {booking.status === "CHECKOUT" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Checkout</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-row flex-wrap gap-3">
            <Link href="/admin/invoice/${booking.invoices?.[0]?.id || booking.id}" className="flex-1">
              <Button variant="outline" className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                Lihat Invoice
              </Button>
            </Link>
            <Link href={`/admin/booking/${booking.id}`} className="flex-1">
              <Button variant="outline" className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                Lihat Detail
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Create Tenant Modal */}
      <CreateTenantModal
        isOpen={showCreateTenantModal}
        onClose={() => setShowCreateTenantModal(false)}
        onSuccess={(tenantId, tenantName) => {
          setCurrentTenant({ id: tenantId, name: tenantName });
          router.refresh();
        }}
        booking={{
          ...booking,
          checkInDate: new Date(booking.checkInDate),
        }}
      />
    </div>
  );
}
