"use client";

import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { UnitBoardCard } from "./UnitBoardCard";

export interface UnitBoardItem {
  id: string;
  name: string;
  unitNumber: string;
  slug: string;
  type: string;
  status: string;
  pricePerMonth: number | null;
  pricePerNight: number | null;
  facilities: string[];
  description: string | null;
  property: { id: string; name: string };
  currentTenant?: { id: string; name: string; contractEnd: string | null } | null;
  currentBooking?: { id: string; guestName: string; checkInDate: string; status: string } | null;
  _count: { bookings: number; invoices: number };
}

interface UnitBoardProps {
  units: UnitBoardItem[];
  onUnitClick: (unit: UnitBoardItem) => void;
}

const columnConfig = [
  {
    status: "AVAILABLE",
    label: "Tersedia",
    color: "emerald",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    headerBg: "bg-emerald-100",
    headerText: "text-emerald-700",
    dotColor: "bg-emerald-500",
  },
  {
    status: "BOOKED",
    label: "Dipesan",
    color: "amber",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    headerBg: "bg-amber-100",
    headerText: "text-amber-700",
    dotColor: "bg-amber-500",
  },
  {
    status: "OCCUPIED",
    label: "Terisi",
    color: "blue",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    headerBg: "bg-blue-100",
    headerText: "text-blue-700",
    dotColor: "bg-blue-500",
  },
  {
    status: "MAINTENANCE",
    label: "Maintenance",
    color: "purple",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    headerBg: "bg-purple-100",
    headerText: "text-purple-700",
    dotColor: "bg-purple-500",
  },
];

export function UnitBoard({ units, onUnitClick }: UnitBoardProps) {
  const getUnitsByStatus = (status: string) =>
    units.filter((u) => u.status === status);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {columnConfig.map((column) => {
        const columnUnits = getUnitsByStatus(column.status);

        return (
          <div
            key={column.status}
            className={cn(
              "rounded-2xl border overflow-hidden",
              column.borderColor
            )}
          >
            {/* Column Header */}
            <div className={cn("px-4 py-3", column.headerBg)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={cn("w-2.5 h-2.5 rounded-full", column.dotColor)} />
                  <h3 className={cn("font-semibold text-sm", column.headerText)}>
                    {column.label}
                  </h3>
                </div>
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-medium",
                    column.bgColor,
                    column.headerText
                  )}
                >
                  {columnUnits.length}
                </span>
              </div>
            </div>

            {/* Column Content */}
            <div className={cn("p-3 space-y-3 h-[200px] overflow-y-auto scrollbar-thin", column.bgColor)}>
              {columnUnits.length > 0 ? (
                columnUnits.map((unit) => (
                  <UnitBoardCard
                    key={unit.id}
                    unit={unit}
                    onClick={() => onUnitClick(unit)}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <Building2 className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">Tidak ada unit</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
