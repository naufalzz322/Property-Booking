"use client";

import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CheckCircle, AlertCircle, AlertTriangle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface InvoiceCardProps {
  invoice: {
    id: string;
    invoiceNumber: string;
    period: string;
    totalAmount: number;
    status: string;
    dueDate: Date;
  };
  showProperty?: boolean;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatPeriod(period: string): string {
  const [year, month] = period.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return format(date, "MMMM yyyy", { locale: id });
}

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string; icon: any }> = {
  PAID: { label: "Lunas", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", icon: CheckCircle },
  UNPAID: { label: "Belum Bayar", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", icon: AlertCircle },
  OVERDUE: { label: "Overdue", color: "text-red-700", bg: "bg-red-50", border: "border-red-200", icon: AlertTriangle },
};

export function InvoiceCard({ invoice }: InvoiceCardProps) {
  const config = statusConfig[invoice.status] || statusConfig.UNPAID;
  const StatusIcon = config.icon;
  const isPaid = invoice.status === "PAID";

  // Calculate days until due
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(invoice.dueDate);
  dueDate.setHours(0, 0, 0, 0);
  const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Link href={`/tenant/invoice/${invoice.id}`}>
      <div
        className={cn(
          "bg-white rounded-2xl p-5 border transition-all duration-200",
          "hover:shadow-md hover:border-slate-300",
          "active:scale-[0.99]",
          config.border
        )}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-slate-900">{formatPeriod(invoice.period)}</h3>
            <p className="text-xs text-slate-500">{invoice.invoiceNumber}</p>
          </div>
          <div className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
            config.bg,
            config.color
          )}>
            <StatusIcon className="w-3.5 h-3.5" />
            {config.label}
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className={cn(
              "text-2xl font-bold",
              isPaid ? "text-emerald-600" : invoice.status === "OVERDUE" ? "text-red-600" : "text-slate-900"
            )}>
              {formatCurrency(invoice.totalAmount)}
            </p>
            {!isPaid && (
              <p className="text-xs text-slate-500 mt-1">
                Jatuh tempo: {format(new Date(invoice.dueDate), "dd MMM yyyy", { locale: id })}
                {daysUntil < 0 && (
                  <span className="text-red-600 ml-1">(Lewat {Math.abs(daysUntil)} hari)</span>
                )}
                {daysUntil >= 0 && daysUntil <= 7 && (
                  <span className="text-amber-600 ml-1">({daysUntil} hari lagi)</span>
                )}
              </p>
            )}
            {isPaid && (
              <p className="text-xs text-slate-500 mt-1">
                Dibayar: {format(new Date(invoice.dueDate), "dd MMM yyyy", { locale: id })}
              </p>
            )}
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </div>
      </div>
    </Link>
  );
}
