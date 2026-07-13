"use client";

import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CheckCircle, AlertCircle, AlertTriangle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface InvoiceStatusHeaderProps {
  status: string;
  period: string;
  totalAmount: number;
  dueDate: Date;
  paidAt?: Date | null;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatPeriod(period: string): string {
  const [year, month] = period.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return format(date, "MMMM yyyy", { locale: id });
}

const statusConfig: Record<string, {
  label: string;
  sublabel: string;
  gradient: string;
  icon: any;
  badgeBg: string;
}> = {
  PAID: {
    label: "LUNAS",
    sublabel: "Pembayaran telah dikonfirmasi",
    gradient: "from-emerald-500 to-emerald-600",
    icon: CheckCircle,
    badgeBg: "bg-white/20",
  },
  UNPAID: {
    label: "BELUM BAYAR",
    sublabel: "Segera lakukan pembayaran",
    gradient: "from-amber-500 to-orange-500",
    icon: AlertCircle,
    badgeBg: "bg-white/20",
  },
  OVERDUE: {
    label: "OVERDUE",
    sublabel: "Melewati jatuh tempo",
    gradient: "from-red-500 to-red-600",
    icon: AlertTriangle,
    badgeBg: "bg-white/30",
  },
};

export function InvoiceStatusHeader({
  status,
  period,
  totalAmount,
  dueDate,
  paidAt,
}: InvoiceStatusHeaderProps) {
  const config = statusConfig[status] || statusConfig.UNPAID;
  const StatusIcon = config.icon;
  const isPaid = status === "PAID";

  // Calculate days
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const daysDiff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div
      className={cn(
        "rounded-2xl p-6 text-white bg-gradient-to-br",
        config.gradient
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <StatusIcon className="w-5 h-5" />
          <span className="text-sm font-medium opacity-90">{config.label}</span>
        </div>
        <span className={cn("px-3 py-1 rounded-full text-xs font-semibold", config.badgeBg)}>
          {formatPeriod(period)}
        </span>
      </div>

      <div className="text-center mb-4">
        <p className="text-4xl font-bold tracking-tight">{formatCurrency(totalAmount)}</p>
        <p className="text-sm opacity-80 mt-1">{config.sublabel}</p>
      </div>

      <div className={cn(
        "flex items-center justify-center gap-2 pt-4 border-t border-white/20",
        isPaid ? "border-emerald-400/30" : status === "OVERDUE" ? "border-red-400/30" : "border-amber-400/30"
      )}>
        <Clock className="w-4 h-4 opacity-80" />
        <span className="text-sm opacity-80">
          {isPaid && paidAt ? (
            <>Dibayar: {format(new Date(paidAt), "dd MMMM yyyy", { locale: id })}</>
          ) : (
            <>
              Jatuh tempo: {format(new Date(dueDate), "dd MMMM yyyy", { locale: id })}
              {daysDiff < 0 && <span className="ml-2">(Lewat {Math.abs(daysDiff)} hari)</span>}
              {daysDiff >= 0 && daysDiff <= 7 && !isPaid && <span className="ml-2">({daysDiff} hari lagi)</span>}
            </>
          )}
        </span>
      </div>
    </div>
  );
}
