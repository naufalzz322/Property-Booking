"use client";

import Link from "next/link";
import { Users, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { TENANT_STATUS_OPTIONS } from "@/lib/filterOptions";

interface TenantStatsBarProps {
  totalCount: number;
  activeCount: number;
  pendingCount: number;
  overdueCount: number;
  currentFilter: string;
  onFilterClick: (filter: string) => void;
}

interface StatItemProps {
  count: number;
  label: string;
  icon: React.ElementType;
  color: "slate" | "emerald" | "amber" | "red";
  isActive: boolean;
  onClick: () => void;
}

function StatItem({ count, label, icon: Icon, color, isActive, onClick }: StatItemProps) {
  const colorClasses = {
    slate: "bg-slate-100 text-slate-600",
    emerald: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
  };

  const activeBgClasses = {
    slate: "bg-slate-50 border-slate-200",
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
        count === 0 && !isActive && "opacity-60"
      )}
    >
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", colorClasses[color])}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-left">
        <p className="text-xl font-bold text-slate-900">{count}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </button>
  );
}

export function TenantStatsBar({
  totalCount,
  activeCount,
  pendingCount,
  overdueCount,
  currentFilter,
  onFilterClick,
}: TenantStatsBarProps) {
  // Get labels from centralized options
  const allLabel = TENANT_STATUS_OPTIONS.find((o) => o.value === "ALL")?.label ?? "Total";
  const aktifLabel = TENANT_STATUS_OPTIONS.find((o) => o.value === "ACTIVE")?.label ?? "Aktif";
  const pendingLabel = TENANT_STATUS_OPTIONS.find((o) => o.value === "PENDING")?.label ?? "Pending";
  const overdueLabel = TENANT_STATUS_OPTIONS.find((o) => o.value === "OVERDUE")?.label ?? "Ada Overdue";

  const stats = [
    {
      value: totalCount,
      label: allLabel,
      icon: Users,
      color: "slate" as const,
      filter: "ALL",
    },
    {
      value: activeCount,
      label: aktifLabel,
      icon: CheckCircle,
      color: "emerald" as const,
      filter: "ACTIVE",
    },
    {
      value: pendingCount,
      label: pendingLabel,
      icon: Clock,
      color: "amber" as const,
      filter: "PENDING",
    },
    {
      value: overdueCount,
      label: overdueLabel,
      icon: AlertTriangle,
      color: "red" as const,
      filter: "OVERDUE",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <StatItem
          key={stat.filter}
          count={stat.value}
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
