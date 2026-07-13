"use client";

import { LayoutGrid, CheckCircle, Clock, Wrench, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface UnitStats {
  total: number;
  available: number;
  booked: number;
  occupied: number;
  maintenance: number;
}

interface UnitStatsBarProps {
  stats: UnitStats;
  currentFilter: string;
  onFilterClick: (filter: string) => void;
}

interface StatItemProps {
  count: number;
  label: string;
  icon: React.ElementType;
  color: "slate" | "emerald" | "amber" | "blue" | "purple";
  isActive: boolean;
  filter: string;
  onClick: () => void;
}

function StatItem({ count, label, icon: Icon, color, isActive, onClick }: StatItemProps) {
  const colorClasses = {
    slate: "bg-slate-100 text-slate-600",
    emerald: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    blue: "bg-blue-100 text-blue-700",
    purple: "bg-purple-100 text-purple-700",
  };

  const activeBgClasses = {
    slate: "bg-slate-100 border-slate-300",
    emerald: "bg-emerald-50 border-emerald-300",
    amber: "bg-amber-50 border-amber-300",
    blue: "bg-blue-50 border-blue-300",
    purple: "bg-purple-50 border-purple-300",
  };

  const defaultBgClasses = {
    slate: "bg-white border-slate-200",
    emerald: "bg-white border-slate-200",
    amber: "bg-white border-slate-200",
    blue: "bg-white border-slate-200",
    purple: "bg-white border-slate-200",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-200",
        isActive ? activeBgClasses[color] : defaultBgClasses[color],
        count === 0 && !isActive && "opacity-60",
        !isActive && "hover:border-slate-300"
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

export function UnitStatsBar({
  stats,
  currentFilter,
  onFilterClick,
}: UnitStatsBarProps) {
  const statItems = [
    {
      value: stats.total,
      label: "Total",
      icon: LayoutGrid,
      color: "slate" as const,
      filter: "ALL",
    },
    {
      value: stats.available,
      label: "Tersedia",
      icon: CheckCircle,
      color: "emerald" as const,
      filter: "AVAILABLE",
    },
    {
      value: stats.booked,
      label: "Dipesan",
      icon: Clock,
      color: "amber" as const,
      filter: "BOOKED",
    },
    {
      value: stats.occupied,
      label: "Terisi",
      icon: Home,
      color: "blue" as const,
      filter: "OCCUPIED",
    },
    {
      value: stats.maintenance,
      label: "Maintenance",
      icon: Wrench,
      color: "purple" as const,
      filter: "MAINTENANCE",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {statItems.map((stat) => (
        <StatItem
          key={stat.filter}
          count={stat.value}
          label={stat.label}
          icon={stat.icon}
          color={stat.color}
          isActive={currentFilter === stat.filter}
          onClick={() => onFilterClick(stat.filter)}
          filter={stat.filter}
        />
      ))}
    </div>
  );
}
