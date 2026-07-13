"use client";

import Link from "next/link";
import { Building2, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface Unit {
  id: string;
  name: string;
  unitNumber: string;
  slug: string;
  type: string;
  status: string;
  pricePerMonth: number | null;
  pricePerNight: number | null;
  facilities: string[];
  property: { id: string; name: string };
  currentTenant?: { id: string; name: string; contractEnd: string | null } | null;
  currentBooking?: { id: string; guestName: string; checkInDate: string; status: string } | null;
  _count: { bookings: number; invoices: number };
}

const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  AVAILABLE: { label: "Tersedia", color: "text-green-800", bg: "bg-green-100", dot: "bg-green-500" },
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

interface UnitCardProps {
  unit: Unit;
}

export function UnitCard({ unit }: UnitCardProps) {
  const status = statusConfig[unit.status] || statusConfig.AVAILABLE;
  const price = unit.pricePerMonth || unit.pricePerNight || 0;
  const priceUnit = unit.type === "KOS_BULANAN" ? "/bulan" : "/malam";

  return (
    <Link
      href={`/admin/unit/${unit.slug}`}
      className="group block bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all duration-200"
    >
      {/* Image Placeholder */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden">
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", status.bg, status.color)}>
            <span className={cn("w-1.5 h-1.5 rounded-full", status.dot)} />
            {status.label}
          </span>
        </div>

        {/* Type Badge */}
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-slate-700">
            {typeLabels[unit.type] || unit.type}
          </span>
        </div>

        {/* Current Info Overlay */}
        {unit.status === "OCCUPIED" && unit.currentTenant && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
            <p className="text-white text-sm font-medium truncate">
              {unit.currentTenant.name}
            </p>
          </div>
        )}

        {unit.status === "BOOKED" && unit.currentBooking && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-amber-600/80 to-transparent p-3">
            <p className="text-white text-sm font-medium truncate">
              {unit.currentBooking.guestName}
            </p>
          </div>
        )}

        {/* Placeholder Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-white/50 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Home className="w-8 h-8 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 group-hover:text-amber-600 transition-colors">
              {unit.name || unit.property.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5 text-sm text-slate-500">
              <Building2 className="w-3.5 h-3.5" />
              <span>Unit {unit.unitNumber}</span>
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="mb-4">
          <p className="text-2xl font-bold text-slate-900">
            {price > 0 ? formatCurrency(price) : "Harga N/A"}
          </p>
          {price > 0 && <p className="text-sm text-slate-500">{priceUnit}</p>}
        </div>

        {/* Facilities Preview */}
        {unit.facilities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {unit.facilities.slice(0, 3).map((facility, index) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full"
              >
                {facility}
              </span>
            ))}
            {unit.facilities.length > 3 && (
              <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-full">
                +{unit.facilities.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 pt-3 border-t border-slate-100">
          <div className="text-center flex-1">
            <p className="text-lg font-semibold text-slate-900">{unit._count.bookings}</p>
            <p className="text-xs text-slate-500">Bookings</p>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="text-center flex-1">
            <p className="text-lg font-semibold text-slate-900">{unit._count.invoices}</p>
            <p className="text-xs text-slate-500">Invoices</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

interface UnitCardSkeletonProps {
  className?: string;
}

export function UnitCardSkeleton({ className }: UnitCardSkeletonProps) {
  return (
    <div className={cn("bg-white rounded-2xl border border-slate-200 overflow-hidden", className)}>
      <div className="aspect-[4/3] bg-slate-200 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-5 w-24 bg-slate-200 rounded animate-pulse" />
        <div className="h-8 w-32 bg-slate-200 rounded animate-pulse" />
        <div className="flex gap-2">
          <div className="h-5 w-16 bg-slate-200 rounded-full animate-pulse" />
          <div className="h-5 w-16 bg-slate-200 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}
