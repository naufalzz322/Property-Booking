"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format, parseISO, differenceInDays } from "date-fns";
import { id } from "date-fns/locale";
import {
  ArrowLeft,
  Building2,
  Home,
  Calendar,
  CreditCard,
  Edit2,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  Image as ImageIcon,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { SegmentedControl } from "@/components/admin/ui/SegmentedControl";
import { PhotoGrid } from "@/components/admin/ui/PhotoGrid";

interface UnitDetail {
  id: string;
  slug: string;
  name: string;
  unitNumber: string;
  type: string;
  status: string;
  pricePerMonth: number | null;
  pricePerNight: number | null;
  facilities: string[];
  photos: string[];
  description: string | null;
  createdAt: string;
  property: { id: string; name: string };
  currentTenant: {
    id: string;
    name: string;
    phone: string;
    contractStart: string;
    contractEnd: string | null;
    isActive: boolean;
  } | null;
  bookings: {
    id: string;
    bookingNumber: string;
    guestName: string;
    checkInDate: string;
    status: string;
  }[];
  invoices: {
    id: string;
    invoiceNumber: string;
    period: string;
    totalAmount: number;
    status: string;
    dueDate: string;
  }[];
  _count: { bookings: number; invoices: number };
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  AVAILABLE: { label: "Tersedia", color: "text-emerald-800", bg: "bg-emerald-100", dot: "bg-emerald-500" },
  BOOKED: { label: "Dipesan", color: "text-amber-800", bg: "bg-amber-100", dot: "bg-amber-500" },
  OCCUPIED: { label: "Terisi", color: "text-blue-800", bg: "bg-blue-100", dot: "bg-blue-500" },
  MAINTENANCE: { label: "Maintenance", color: "text-purple-800", bg: "bg-purple-100", dot: "bg-purple-500" },
};

const typeLabels: Record<string, string> = {
  KOS_BULANAN: "Kos Bulanan",
  KOS_HARIAN: "Kos Harian",
  GUEST_HOUSE: "Guest House",
  VILLA: "Villa",
};

const bookingStatusConfig: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: "Pending", color: "text-amber-800", bg: "bg-amber-100" },
  CONFIRMED: { label: "Dikonfirmasi", color: "text-blue-800", bg: "bg-blue-100" },
  PAID: { label: "Lunas", color: "text-emerald-800", bg: "bg-emerald-100" },
  CHECKED_IN: { label: "Check-in", color: "text-indigo-800", bg: "bg-indigo-100" },
  COMPLETED: { label: "Checkout", color: "text-slate-800", bg: "bg-slate-100" },
  REJECTED: { label: "Ditolak", color: "text-red-800", bg: "bg-red-100" },
  CANCELLED: { label: "Batal", color: "text-slate-600", bg: "bg-slate-100" },
};

const invoiceStatusConfig: Record<string, { label: string; color: string; bg: string }> = {
  UNPAID: { label: "Pending", color: "text-amber-800", bg: "bg-amber-100" },
  PAID: { label: "Lunas", color: "text-emerald-800", bg: "bg-emerald-100" },
  OVERDUE: { label: "Overdue", color: "text-red-800", bg: "bg-red-100" },
};

function getDaysRemaining(endDate: string | null): string | null {
  if (!endDate) return null;
  const end = parseISO(endDate);
  const today = new Date();
  const days = differenceInDays(end, today);
  if (days < 0) return "Expired";
  if (days === 0) return "Hari ini";
  if (days === 1) return "1 hari lagi";
  if (days <= 30) return `${days} hari`;
  const months = Math.floor(days / 30);
  return `${months} bulan`;
}

export function UnitDetailClient({ unit }: { unit: UnitDetail }) {
  const router = useRouter();
  const { success, error: showError } = useToast();
  const [activeTab, setActiveTab] = useState<"overview" | "photos" | "facilities">("overview");
  const [deletingPhoto, setDeletingPhoto] = useState<string | null>(null);

  const status = statusConfig[unit.status] || statusConfig.AVAILABLE;
  const price = unit.pricePerMonth || unit.pricePerNight || 0;
  const priceUnit = unit.type === "KOS_BULANAN" ? "/bulan" : "/malam";

  const contractEndDays = unit.currentTenant?.contractEnd
    ? differenceInDays(parseISO(unit.currentTenant.contractEnd), new Date())
    : null;
  const isExpiringSoon = contractEndDays !== null && contractEndDays <= 30 && contractEndDays >= 0;

  const tabs = [
    { value: "overview", label: "Overview" },
    { value: "photos", label: `Foto (${unit.photos.length})` },
    { value: "facilities", label: `Fasilitas (${unit.facilities.length})` },
  ];

  const handleDeletePhoto = async (photoUrl: string) => {
    if (!confirm("Hapus foto ini?")) return;

    setDeletingPhoto(photoUrl);
    try {
      const res = await fetch(`/api/admin/units/${unit.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photos: unit.photos.filter((p) => p !== photoUrl),
        }),
      });

      if (res.ok) {
        success("Foto berhasil dihapus");
        router.refresh();
      } else {
        const data = await res.json();
        showError(data.error || "Gagal menghapus foto");
      }
    } catch {
      showError("Terjadi kesalahan");
    } finally {
      setDeletingPhoto(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/unit" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {unit.name || `Unit ${unit.unitNumber}`}
              </h1>
              <p className="text-slate-500">
                {unit.property.name} • Unit {unit.unitNumber}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={cn("text-sm px-3 py-1", status.bg, status.color)}>
            <span className={cn("w-2 h-2 rounded-full mr-1.5", status.dot)} />
            {status.label}
          </Badge>
          <a
            href={`/kamar/${unit.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
            Preview
          </a>
          <Link href={`/admin/unit/${unit.slug}/edit`}>
            <Button size="sm" className="bg-amber-500 hover:bg-amber-600">
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Price Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <span className="text-lg font-bold text-emerald-600">Rp</span>
              </div>
              <div>
                <p className="text-sm text-slate-500">Harga</p>
                <p className="font-semibold text-slate-900">
                  {price > 0 ? (
                    <>
                      {formatCurrency(price)}
                      <span className="text-sm font-normal text-slate-500"> {priceUnit}</span>
                    </>
                  ) : (
                    <span className="text-slate-400">Belum diatur</span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Type Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Tipe</p>
                <p className="font-semibold text-slate-900">{typeLabels[unit.type] || unit.type}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bookings Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Calendar className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Bookings</p>
                <p className="font-semibold text-slate-900">{unit._count.bookings}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoices Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <CreditCard className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Invoices</p>
                <p className="font-semibold text-slate-900">{unit._count.invoices}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 px-4">
          <SegmentedControl
            options={tabs}
            value={activeTab}
            onChange={(tab) => setActiveTab(tab as typeof activeTab)}
          />
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Current Tenant (if occupied) */}
              {unit.status === "OCCUPIED" && unit.currentTenant && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Tenant Saat Ini</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-lg font-bold text-blue-600">
                            {unit.currentTenant.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{unit.currentTenant.name}</p>
                          <p className="text-sm text-blue-600 flex items-center gap-1 mt-1">
                            <Clock className="w-4 h-4" />
                            Kontrak {unit.currentTenant.contractEnd
                              ? `berakhir ${getDaysRemaining(unit.currentTenant.contractEnd)}`
                              : "tanpa batas"}
                          </p>
                        </div>
                      </div>
                      {isExpiringSoon && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 rounded-lg">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          <span className="text-xs font-medium text-amber-700">Expiring</span>
                        </div>
                      )}
                    </div>
                    <Link href={`/admin/tenant/${unit.currentTenant.id}`}>
                      <Button variant="outline" className="w-full mt-4 h-10">
                        Lihat Detail Tenant
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              {/* Unit Info */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Info Unit</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm text-slate-500 mb-1">Nama Unit</p>
                    <p className="font-medium text-slate-900">{unit.name}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm text-slate-500 mb-1">Unit Number</p>
                    <p className="font-medium text-slate-900">{unit.unitNumber}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm text-slate-500 mb-1">Tipe</p>
                    <p className="font-medium text-slate-900">{typeLabels[unit.type] || unit.type}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm text-slate-500 mb-1">Dibuat</p>
                    <p className="font-medium text-slate-900">
                      {format(parseISO(unit.createdAt), "dd MMMM yyyy", { locale: id })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {unit.description && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Deskripsi</h3>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-slate-600 leading-relaxed">{unit.description}</p>
                  </div>
                </div>
              )}

              {/* Recent Bookings */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Booking Terakhir</h3>
                {unit.bookings.length > 0 ? (
                  <div className="space-y-3">
                    {unit.bookings.map((booking) => {
                      const status = bookingStatusConfig[booking.status] || bookingStatusConfig.PENDING;
                      return (
                        <Link
                          key={booking.id}
                          href={`/admin/booking/${booking.id}`}
                          className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                              <Calendar className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{booking.bookingNumber}</p>
                              <p className="text-sm text-slate-500">
                                {booking.guestName} • Check-in{" "}
                                {format(parseISO(booking.checkInDate), "dd MMM yyyy", { locale: id })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={cn("text-xs", status.bg, status.color)}>
                              {status.label}
                            </Badge>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-slate-50 rounded-xl">
                    <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">Belum ada booking</p>
                  </div>
                )}
              </div>

              {/* Recent Invoices */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Invoice Terakhir</h3>
                {unit.invoices.length > 0 ? (
                  <div className="space-y-3">
                    {unit.invoices.map((invoice) => {
                      const status = invoiceStatusConfig[invoice.status] || invoiceStatusConfig.UNPAID;
                      return (
                        <Link
                          key={invoice.id}
                          href={`/admin/invoice/${invoice.id}`}
                          className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center",
                              invoice.status === "PAID"
                                ? "bg-emerald-100"
                                : invoice.status === "OVERDUE"
                                ? "bg-red-100"
                                : "bg-amber-100"
                            )}>
                              {invoice.status === "PAID" ? (
                                <CheckCircle className="w-5 h-5 text-emerald-600" />
                              ) : invoice.status === "OVERDUE" ? (
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                              ) : (
                                <Clock className="w-5 h-5 text-amber-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{invoice.invoiceNumber}</p>
                              <p className="text-sm text-slate-500">
                                {invoice.period} • Jatuh tempo{" "}
                                {format(parseISO(invoice.dueDate), "dd MMM", { locale: id })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-slate-900">{formatCurrency(invoice.totalAmount)}</p>
                            <Badge className={cn("text-xs", status.bg, status.color)}>
                              {status.label}
                            </Badge>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-slate-50 rounded-xl">
                    <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">Belum ada invoice</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Photos Tab */}
          {activeTab === "photos" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Foto Unit</h3>
                <a
                  href={`/kamar/${unit.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700"
                >
                  <ExternalLink className="w-4 h-4" />
                  Lihat di halaman publik
                </a>
              </div>
              {unit.photos.length > 0 ? (
                <PhotoGrid
                  photos={unit.photos}
                  onDelete={handleDeletePhoto}
                  deletingPhoto={deletingPhoto}
                />
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-xl">
                  <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 mb-2">Belum ada foto</p>
                  <Link href={`/admin/unit/${unit.slug}/edit`}>
                    <Button variant="outline" size="sm">
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Tambah Foto
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Facilities Tab */}
          {activeTab === "facilities" && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Fasilitas Unit</h3>
              {unit.facilities.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {unit.facilities.map((facility, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl"
                    >
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      </div>
                      <span className="font-medium text-slate-700">{facility}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-xl">
                  <Home className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 mb-2">Belum ada fasilitas</p>
                  <Link href={`/admin/unit/${unit.slug}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit2 className="w-4 h-4 mr-2" />
                      Tambah Fasilitas
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
