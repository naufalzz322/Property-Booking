"use client";

import { format, differenceInDays, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { Home, User, Calendar, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UnitBoardItem } from "./UnitBoard";

interface UnitBoardCardProps {
  unit: UnitBoardItem;
  onClick: () => void;
}

const typeLabels: Record<string, string> = {
  KOS_BULANAN: "Kos Bulanan",
  KOS_HARIAN: "Kos Harian",
  GUEST_HOUSE: "Guest House",
  VILLA: "Villa",
};

function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `Rp ${(amount / 1000000).toFixed(1)}jt`;
  }
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function getDaysRemaining(endDate: string | null): string | null {
  if (!endDate) return null;
  const end = parseISO(endDate);
  const today = new Date();
  const days = differenceInDays(end, today);
  if (days < 0) return "Expired";
  if (days === 0) return "Hari ini";
  if (days === 1) return "1 hari lagi";
  if (days <= 30) return `${days} hari lagi`;
  const months = Math.floor(days / 30);
  return `${months} bulan lagi`;
}

export function UnitBoardCard({ unit, onClick }: UnitBoardCardProps) {
  const isExpiringSoon =
    unit.currentTenant?.contractEnd &&
    differenceInDays(parseISO(unit.currentTenant.contractEnd), new Date()) <= 30;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full min-w-0 text-left bg-white rounded-lg border p-2 transition-all duration-150",
        "hover:shadow-md hover:border-slate-300",
        "focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1",
        unit.status === "AVAILABLE" && "border-slate-200",
        unit.status === "BOOKED" && "border-amber-200",
        unit.status === "OCCUPIED" && "border-blue-200",
        unit.status === "MAINTENANCE" && "border-purple-200"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 min-w-0">
        <div className="min-w-0 flex-1">
          <h4 className="font-medium text-slate-900 text-xs leading-tight truncate">
            {unit.name || unit.property.name}
          </h4>
          <p className="text-[10px] text-slate-500 truncate">Unit {unit.unitNumber}</p>
        </div>
        <span className="flex-shrink-0 text-[9px] px-1 py-0.5 bg-slate-100 text-slate-600 rounded font-medium whitespace-nowrap">
          {typeLabels[unit.type]?.split(" ")[0] || unit.type}
        </span>
      </div>

      {/* Price */}
      {unit.pricePerMonth && unit.type === "KOS_BULANAN" && (
        <p className="text-sm font-bold text-slate-700 mt-1">
          {formatCurrency(unit.pricePerMonth)}
          <span className="text-[10px] font-normal text-slate-500">/bln</span>
        </p>
      )}
      {unit.pricePerNight && unit.type !== "KOS_BULANAN" && (
        <p className="text-sm font-bold text-slate-700 mt-1">
          {formatCurrency(unit.pricePerNight)}
          <span className="text-[10px] font-normal text-slate-500">/mlm</span>
        </p>
      )}

      {unit.status === "BOOKED" && unit.currentBooking && (
        <div className="flex items-center gap-1 text-[10px] text-slate-600 mt-1">
          <User className="w-3 h-3" />
          <span className="truncate">{unit.currentBooking.guestName}</span>
        </div>
      )}

      {unit.status === "OCCUPIED" && unit.currentTenant && (
        <div className="flex items-center gap-1 text-[10px] text-slate-600 mt-1">
          <User className="w-3 h-3" />
          <span className="truncate">{unit.currentTenant.name}</span>
        </div>
      )}

      {unit.status === "MAINTENANCE" && (
        <p className="text-[10px] text-purple-600 mt-1">Sedang perbaikan</p>
      )}
    </button>
  );
}
