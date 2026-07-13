"use client";

import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format, parseISO, differenceInDays } from "date-fns";
import { id } from "date-fns/locale";
import {
  Building2,
  MapPin,
  Home,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  ChevronRight,
  Edit,
  AlertTriangle,
  CheckCircle,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { UnitBoardItem } from "./UnitBoard";

interface UnitDetailDrawerProps {
  unit: UnitBoardItem | null;
  isOpen: boolean;
  onClose: () => void;
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

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

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

export function UnitDetailDrawer({ unit, isOpen, onClose }: UnitDetailDrawerProps) {
  if (!unit) return null;

  const status = statusConfig[unit.status] || statusConfig.AVAILABLE;
  const price = unit.pricePerMonth || unit.pricePerNight || 0;
  const priceUnit = unit.type === "KOS_BULANAN" ? "/bulan" : "/malam";

  const contractEndDays = unit.currentTenant?.contractEnd
    ? differenceInDays(parseISO(unit.currentTenant.contractEnd), new Date())
    : null;
  const isExpiringSoon = contractEndDays !== null && contractEndDays <= 30 && contractEndDays >= 0;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <Home className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {unit.name || unit.property.name}
                </h2>
                <p className="text-sm text-slate-500">Unit {unit.unitNumber}</p>
              </div>
            </div>
            <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium", status.bg, status.color)}>
              <span className={cn("w-2 h-2 rounded-full", status.dot)} />
              {status.label}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Unit Info */}
          <section className="space-y-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Detail Unit
            </h3>
            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
              <div className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-slate-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-500">Properti</p>
                  <p className="font-medium text-slate-900">{unit.property.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                  <Home className="w-5 h-5 text-slate-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-500">Tipe</p>
                  <p className="font-medium text-slate-900">{typeLabels[unit.type] || unit.type}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <span className="text-lg font-bold text-emerald-600">Rp</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-500">Harga</p>
                  <p className="font-medium text-slate-900">
                    {price > 0 ? `${formatCurrency(price)} ${priceUnit}` : "Belum diatur"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Facilities */}
          {unit.facilities.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Fasilitas
              </h3>
              <div className="flex flex-wrap gap-2">
                {unit.facilities.map((facility, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-slate-100 text-slate-700 text-sm rounded-lg"
                  >
                    {facility}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Current Tenant */}
          {unit.status === "OCCUPIED" && unit.currentTenant && (
            <section className="space-y-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Tenant Saat Ini
              </h3>
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{unit.currentTenant.name}</p>
                    <p className="text-sm text-blue-600 flex items-center gap-1 mt-1">
                      <Clock className="w-4 h-4" />
                      {unit.currentTenant.contractEnd
                        ? `Kontrak berakhir ${getDaysRemaining(unit.currentTenant.contractEnd)}`
                        : "Tanpa batas"}
                    </p>
                  </div>
                  {isExpiringSoon && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-medium text-amber-700">Expiring</span>
                    </div>
                  )}
                </div>
                <Link href={`/admin/tenant/${unit.currentTenant.id}`}>
                  <Button variant="outline" className="w-full h-10">
                    <FileText className="w-4 h-4 mr-2" />
                    Lihat Detail Tenant
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </Button>
                </Link>
              </div>
            </section>
          )}

          {/* Current Booking */}
          {unit.status === "BOOKED" && unit.currentBooking && (
            <section className="space-y-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Booking Aktif
              </h3>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{unit.currentBooking.guestName}</p>
                    <p className="text-sm text-amber-600 flex items-center gap-1 mt-1">
                      <Calendar className="w-4 h-4" />
                      Check-in{" "}
                      {format(parseISO(unit.currentBooking.checkInDate), "dd MMMM yyyy", {
                        locale: id,
                      })}
                    </p>
                  </div>
                </div>
                <Link href={`/admin/booking/${unit.currentBooking.id}`}>
                  <Button variant="outline" className="w-full h-10">
                    <FileText className="w-4 h-4 mr-2" />
                    Lihat Detail Booking
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </Button>
                </Link>
              </div>
            </section>
          )}

          {/* Maintenance Info */}
          {unit.status === "MAINTENANCE" && (
            <section className="space-y-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Status
              </h3>
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <Wrench className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Sedang Perbaikan</p>
                    <p className="text-sm text-purple-600">
                      Unit sedang dalam proses perawatan
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Available Info */}
          {unit.status === "AVAILABLE" && (
            <section className="space-y-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Status
              </h3>
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Tersedia</p>
                    <p className="text-sm text-emerald-600">
                      Unit siap untuk booking
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Stats */}
          <section className="space-y-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Statistik
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-slate-900">{unit._count.bookings}</p>
                <p className="text-sm text-slate-500">Total Bookings</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-slate-900">{unit._count.invoices}</p>
                <p className="text-sm text-slate-500">Total Invoices</p>
              </div>
            </div>
          </section>

          {/* Description */}
          {unit.description && (
            <section className="space-y-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Deskripsi
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {unit.description}
              </p>
            </section>
          )}
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4">
          <div className="flex gap-3">
            <a
              href={`/kamar/${unit.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Preview
            </a>
            <Link href={`/admin/unit/${unit.slug}`} className="flex-1">
              <Button className="w-full h-12 !bg-amber-500 hover:!bg-amber-600 text-white">
                <Edit className="w-5 h-5 mr-2" />
                Detail
              </Button>
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
