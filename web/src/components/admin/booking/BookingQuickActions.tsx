"use client";

import { AlertCircle, CheckCircle2, Calendar, List, CheckCircle, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { BOOKING_STATUS_OPTIONS } from "@/lib/filterOptions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  paid: number;
  checkedIn: number;
  completed: number;
  todayCheckIn: number;
  urgentPending: number; // Older than 24h
}

interface BookingQuickActionsProps {
  stats: BookingStats;
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
  filterMonth?: string;
  onMonthChange?: (month: string) => void;
  filterYear?: string;
  onYearChange?: (year: string) => void;
}

// Map filter keys to labels from centralized options
const filterConfig = [
  { key: "ALL", icon: List, color: "slate" },
  { key: "PENDING", icon: AlertCircle, color: "amber", highlight: true },
  { key: "CONFIRMED", icon: CheckCircle2, color: "blue" },
  { key: "PAID", icon: Wallet, color: "violet" },
  { key: "CHECKED_IN", icon: Calendar, color: "emerald" },
  { key: "COMPLETED", icon: CheckCircle, color: "slate" },
];

// Get label from centralized options
function getFilterLabel(key: string): string {
  const option = BOOKING_STATUS_OPTIONS.find((o) => o.value === key);
  return option?.label ?? key;
}

const colorClasses = {
  amber: {
    active: "bg-amber-50 border-amber-300 text-amber-700",
    default: "bg-amber-50 border-amber-200 text-amber-600 hover:border-amber-300",
    icon: "text-amber-600",
  },
  blue: {
    active: "bg-blue-50 border-blue-300 text-blue-700",
    default: "bg-blue-50 border-blue-200 text-blue-600 hover:border-blue-300",
    icon: "text-blue-600",
  },
  violet: {
    active: "bg-violet-50 border-violet-300 text-violet-700",
    default: "bg-violet-50 border-violet-200 text-violet-600 hover:border-violet-300",
    icon: "text-violet-600",
  },
  emerald: {
    active: "bg-emerald-50 border-emerald-300 text-emerald-700",
    default: "bg-emerald-50 border-emerald-200 text-emerald-600 hover:border-emerald-300",
    icon: "text-emerald-600",
  },
  slate: {
    active: "bg-slate-100 border-slate-300 text-slate-900",
    default: "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50",
    icon: "text-slate-600",
  },
};

const months = [
  { value: "01", label: "Januari" },
  { value: "02", label: "Februari" },
  { value: "03", label: "Maret" },
  { value: "04", label: "April" },
  { value: "05", label: "Mei" },
  { value: "06", label: "Juni" },
  { value: "07", label: "Juli" },
  { value: "08", label: "Agustus" },
  { value: "09", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
];

function getMonthLabel(value: string): string {
  return months.find((m) => m.value === value)?.label || "Semua Bulan";
}

export function BookingQuickActions({
  stats,
  activeFilter = "ALL",
  onFilterChange,
  filterMonth,
  onMonthChange,
  filterYear,
  onYearChange,
}: BookingQuickActionsProps) {
  const getValue = (key: string): number => {
    switch (key) {
      case "ALL":
        return stats.total;
      case "PENDING":
        return stats.pending;
      case "CONFIRMED":
        return stats.confirmed;
      case "PAID":
        return stats.paid;
      case "CHECKED_IN":
        return stats.checkedIn;
      case "COMPLETED":
        return stats.completed;
      default:
        return 0;
    }
  };

  return (
    <div className="space-y-4">
      {/* Urgent Banner - Only show if there are urgent pending */}
      {stats.urgentPending > 0 && (
        <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-amber-800">
                {stats.urgentPending} booking butuh perhatian
              </p>
              <p className="text-sm text-amber-600">
                Booking lebih dari 24 jam belum diproses
              </p>
            </div>
          </div>
          <button
            onClick={() => onFilterChange?.("URGENT")}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-xl transition-colors"
          >
            Lihat Semua
          </button>
        </div>
      )}

      {/* Stats Tabs */}
      <div className="flex flex-wrap gap-2">
        {filterConfig.map((filter) => {
          const Icon = filter.icon;
          const value = getValue(filter.key);
          const isActive = activeFilter === filter.key;
          const colors = colorClasses[filter.color as keyof typeof colorClasses];
          const isHighlight = filter.highlight && value > 0;
          const label = getFilterLabel(filter.key);

          return (
            <button
              key={filter.key}
              onClick={() => onFilterChange?.(filter.key)}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 border",
                isActive
                  ? colors.active
                  : isHighlight
                  ? colors.default
                  : colors.default
              )}
            >
              <Icon className={cn("w-4 h-4", isActive || isHighlight ? colors.icon : "text-slate-400")} />
              <span className="font-bold">{value}</span>
              <span className="hidden sm:inline">{label}</span>
              {isHighlight && value > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Month/Year Filter - Show for status filters */}
      {(activeFilter === "PENDING" || activeFilter === "CONFIRMED" || activeFilter === "PAID" || activeFilter === "CHECKED_IN" || activeFilter === "COMPLETED") && (
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
          <span className="text-sm text-slate-500">Filter periode:</span>
          <div className="flex items-center gap-2">
            {/* Month Select */}
            <Select
              value={filterMonth || "ALL"}
              onValueChange={(v) => onMonthChange?.(v === "ALL" ? "" : (v || ""))}
            >
              <SelectTrigger className="w-36 h-9 bg-white border-slate-200 text-sm">
                <SelectValue placeholder="Bulan">
                  {filterMonth ? getMonthLabel(filterMonth) : "Semua Bulan"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Bulan</SelectItem>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Year Select */}
            <Select
              value={filterYear || new Date().getFullYear().toString()}
              onValueChange={(v) => onYearChange?.(v || new Date().getFullYear().toString())}
            >
              <SelectTrigger className="w-28 h-9 bg-white border-slate-200 text-sm">
                <SelectValue placeholder="Tahun">
                  {filterYear || new Date().getFullYear().toString()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={(new Date().getFullYear() - 1).toString()}>
                  {new Date().getFullYear() - 1}
                </SelectItem>
                <SelectItem value={new Date().getFullYear().toString()}>
                  {new Date().getFullYear()}
                </SelectItem>
                <SelectItem value={(new Date().getFullYear() + 1).toString()}>
                  {new Date().getFullYear() + 1}
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Period Filter */}
            {(filterMonth || filterYear) && (
              <button
                onClick={() => {
                  onMonthChange?.("");
                  onYearChange?.("");
                }}
                className="text-sm text-slate-500 hover:text-slate-700 underline"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
