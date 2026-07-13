"use client";

import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CheckCircle, AlertCircle } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";

interface StatsRowProps {
  totalInvoices: number;
  paidCount: number;
  unpaidCount: number;
  totalPaid: number;
  nextDueDate?: Date;
  nextDueAmount?: number;
}

function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `Rp ${(amount / 1000000).toFixed(1)}jt`;
  }
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function StatsRow({
  totalInvoices,
  paidCount,
  unpaidCount,
  totalPaid,
  nextDueDate,
  nextDueAmount,
}: StatsRowProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <StatCard
        label="Total Lunas"
        value={paidCount}
        icon={CheckCircle}
        variant="compact"
        className="border-emerald-100 bg-emerald-50/50"
      />
      <StatCard
        label="Belum Bayar"
        value={unpaidCount}
        icon={AlertCircle}
        variant="compact"
        valueColor={unpaidCount > 0 ? "text-amber-600" : "text-slate-900"}
        className="border-amber-100 bg-amber-50/50"
      />
      {totalPaid > 0 && (
        <div className="col-span-2 bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Total Sudah Dibayar</p>
          <p className="text-xl font-bold text-emerald-600 mt-1">
            {formatCurrency(totalPaid)}
          </p>
        </div>
      )}
    </div>
  );
}
