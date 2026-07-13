"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Building2, AlertTriangle, Home } from "lucide-react";
import { TrendBadge } from "./ui/TrendBadge";
import { MiniSparkline } from "./ui/MiniSparkline";
import { cn } from "@/lib/utils";

interface Stats {
  occupancyRate: number;
  monthlyRevenue: number;
  overdueCount: number;
  overdueAmount: number;
  availableUnits: number;
  pendingBookings: number;
}

interface StatsTrend {
  occupancyRate: number;
  monthlyRevenue: number;
  overdueCount: number;
  availableUnits: number;
}

interface AnalyticsData {
  revenue: { data: number[] };
  occupancy: { rate: number };
}

function formatCurrency(amount: number): string {
  if (amount >= 1000000000) {
    return `Rp ${(amount / 1000000000).toFixed(1)}Jt`;
  } else if (amount >= 1000000) {
    return `Rp ${(amount / 1000000).toFixed(0)}Jt`;
  } else if (amount >= 1000) {
    return `Rp ${(amount / 1000).toFixed(0)}Rb`;
  }
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatCurrencyFull(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  iconColor?: string;
  trend?: number;
  sparklineData?: number[];
  sparklineColor?: "amber" | "emerald" | "red" | "blue" | "slate";
  progress?: { value: number; target: number };
  alert?: boolean;
  href?: string;
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = "text-slate-500",
  trend,
  sparklineData,
  sparklineColor = "amber",
  progress,
  alert,
  href,
}: StatCardProps) {
  const content = (
    <Card
      className={cn(
        "transition-all duration-200 hover:shadow-md group",
        alert && "border-red-200 bg-red-50/30"
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
              alert ? "bg-red-100" : "bg-slate-100"
            )}
          >
            <Icon className={cn("w-5 h-5", iconColor, alert && "text-red-600")} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            {trend !== undefined && <TrendBadge value={trend} className="mt-1" />}
          </div>
        </div>
        {sparklineData && <MiniSparkline data={sparklineData} color={sparklineColor} width={80} height={28} />}
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <div className={cn("text-3xl font-bold", alert ? "text-red-600" : "text-slate-900")}>
              {value}
            </div>
            {subtitle && (
              <p className={cn("text-xs mt-1", alert ? "text-red-500" : "text-slate-500")}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Progress bar for occupancy */}
        {progress && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Current</span>
              <span>Target: {progress.target}%</span>
            </div>
            <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  "absolute left-0 top-0 h-full rounded-full transition-all",
                  progress.value >= progress.target ? "bg-emerald-500" : "bg-amber-500"
                )}
                style={{ width: `${Math.min(progress.value, 100)}%` }}
              />
              {/* Target line */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-slate-400"
                style={{ left: `${progress.target}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

export function DashboardCards({
  stats,
  trends,
}: {
  stats: Stats;
  trends?: StatsTrend;
}) {
  const [sparklineData, setSparklineData] = useState<{ revenue: number[]; occupancy: number[] }>({
    revenue: [],
    occupancy: [],
  });

  useEffect(() => {
    fetchSparklineData();
  }, []);

  const fetchSparklineData = async () => {
    try {
      const res = await fetch("/api/admin/analytics?period=6");
      if (res.ok) {
        const data = await res.json();
        setSparklineData({
          revenue: data.revenue?.data || [],
          occupancy: [],
        });
      }
    } catch (error) {
      console.error("Failed to fetch sparkline data:", error);
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Occupancy Rate */}
      <StatCard
        title="Okupansi"
        value={`${stats.occupancyRate}%`}
        subtitle={
          stats.occupancyRate >= 75
            ? "Target tercapai"
            : "Perlu ditingkatkan"
        }
        icon={TrendingUp}
        iconColor="text-emerald-600"
        trend={trends?.occupancyRate ?? 0}
        progress={{ value: stats.occupancyRate, target: 75 }}
        href="/admin/unit"
      />

      {/* Monthly Revenue */}
      <StatCard
        title="Pendapatan Bulan Ini"
        value={formatCurrency(stats.monthlyRevenue)}
        subtitle={
          stats.pendingBookings > 0
            ? `${stats.pendingBookings} booking pending`
            : "On track"
        }
        icon={Building2}
        iconColor="text-amber-600"
        trend={trends?.monthlyRevenue ?? 0}
        sparklineData={sparklineData.revenue}
        sparklineColor="amber"
        href="/admin/invoice"
      />

      {/* Overdue Bills */}
      <StatCard
        title="Tagihan Overdue"
        value={stats.overdueCount}
        subtitle={
          stats.overdueAmount > 0
            ? formatCurrency(stats.overdueAmount)
            : "Tidak ada tunggakan"
        }
        icon={AlertTriangle}
        iconColor="text-red-600"
        trend={trends?.overdueCount ?? -15}
        sparklineColor="red"
        alert={stats.overdueCount > 0}
        href="/admin/invoice?status=OVERDUE"
      />

      {/* Available Units */}
      <StatCard
        title="Unit Kosong"
        value={stats.availableUnits}
        subtitle={
          stats.availableUnits > 0
            ? "Siap disewakan"
            : "Semua terpakai"
        }
        icon={Home}
        iconColor="text-blue-600"
        trend={trends?.availableUnits ?? -2}
        sparklineColor="blue"
        href="/admin/unit?status=AVAILABLE"
      />
    </div>
  );
}
