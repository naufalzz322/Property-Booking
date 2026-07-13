"use client";

import { Receipt, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import { INVOICE_STATUS_OPTIONS } from "@/lib/filterOptions";

interface InvoiceStatsBarProps {
  totalAmount: number;
  paidAmount: number;
  paidCount: number;
  unpaidAmount: number;
  unpaidCount: number;
  overdueAmount: number;
  overdueCount: number;
  currentFilter: string;
  onFilterClick: (filter: string) => void;
}

interface StatItemProps {
  amount: number;
  count: number;
  label: string;
  icon: React.ElementType;
  color: "slate" | "emerald" | "amber" | "red";
  isActive: boolean;
  onClick: () => void;
}

function StatItem({ amount, count, label, icon: Icon, color, isActive, onClick }: StatItemProps) {
  const colorClasses = {
    slate: "bg-slate-100 text-slate-600",
    emerald: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
  };

  const activeBgClasses = {
    slate: "bg-slate-50 border-slate-300",
    emerald: "bg-emerald-50 border-emerald-200",
    amber: "bg-amber-50 border-amber-200",
    red: "bg-red-50 border-red-200",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-200",
        isActive ? activeBgClasses[color] : "bg-white border-slate-200 hover:border-slate-300",
        (count === 0 && !isActive) && "opacity-60"
      )}
    >
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", colorClasses[color])}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-left min-w-0">
        <p className="text-lg font-bold text-slate-900 truncate">{formatCurrency(amount)}</p>
        <p className="text-xs text-slate-500">
          {count} {label}
        </p>
      </div>
    </button>
  );
}

export function InvoiceStatsBar({
  totalAmount,
  paidAmount,
  paidCount,
  unpaidAmount,
  unpaidCount,
  overdueAmount,
  overdueCount,
  currentFilter,
  onFilterClick,
}: InvoiceStatsBarProps) {
  // Get labels from centralized options
  const allLabel = INVOICE_STATUS_OPTIONS.find((o) => o.value === "ALL")?.label ?? "Total";
  const paidLabel = INVOICE_STATUS_OPTIONS.find((o) => o.value === "PAID")?.label ?? "Lunas";
  const unpaidLabel = INVOICE_STATUS_OPTIONS.find((o) => o.value === "UNPAID")?.label ?? "Belum Bayar";
  const overdueLabel = INVOICE_STATUS_OPTIONS.find((o) => o.value === "OVERDUE")?.label ?? "Overdue";

  const stats = [
    {
      amount: totalAmount,
      count: paidCount + unpaidCount,
      label: allLabel,
      icon: Receipt,
      color: "slate" as const,
      filter: "ALL",
    },
    {
      amount: paidAmount,
      count: paidCount,
      label: paidLabel,
      icon: CheckCircle,
      color: "emerald" as const,
      filter: "PAID",
    },
    {
      amount: unpaidAmount,
      count: unpaidCount,
      label: unpaidLabel,
      icon: Clock,
      color: "amber" as const,
      filter: "UNPAID",
    },
    {
      amount: overdueAmount,
      count: overdueCount,
      label: overdueLabel,
      icon: AlertTriangle,
      color: "red" as const,
      filter: "OVERDUE",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <StatItem
          key={stat.filter}
          amount={stat.amount}
          count={stat.count}
          label={stat.label}
          icon={stat.icon}
          color={stat.color}
          isActive={currentFilter === stat.filter}
          onClick={() => onFilterClick(stat.filter)}
        />
      ))}
    </div>
  );
}
