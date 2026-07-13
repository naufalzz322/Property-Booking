"use client";

import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CheckCircle, AlertCircle, AlertTriangle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecentInvoicesListProps {
  invoices: {
    id: string;
    invoiceNumber: string;
    period: string;
    totalAmount: number;
    status: string;
    dueDate: Date;
  }[];
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
  return format(date, "MMM yyyy", { locale: id });
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  PAID: { label: "Lunas", color: "text-emerald-600", bg: "bg-emerald-100", icon: CheckCircle },
  UNPAID: { label: "Belum", color: "text-amber-600", bg: "bg-amber-100", icon: AlertCircle },
  OVERDUE: { label: "Overdue", color: "text-red-600", bg: "bg-red-100", icon: AlertTriangle },
};

export function RecentInvoicesList({ invoices }: RecentInvoicesListProps) {
  if (invoices.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-center">
        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <CheckCircle className="w-6 h-6 text-slate-400" />
        </div>
        <p className="text-slate-500 text-sm">Belum ada tagihan</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Tagihan Terbaru</h3>
        <Link href="/tenant/invoice" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
          Lihat semua →
        </Link>
      </div>
      <div className="divide-y divide-slate-100">
        {invoices.slice(0, 5).map((invoice) => {
          const config = statusConfig[invoice.status] || statusConfig.UNPAID;
          const StatusIcon = config.icon;
          const isPaid = invoice.status === "PAID";

          return (
            <Link
              key={invoice.id}
              href={`/tenant/invoice/${invoice.id}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", config.bg)}>
                  <StatusIcon className={cn("w-5 h-5", config.color)} />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{formatPeriod(invoice.period)}</p>
                  <p className="text-xs text-slate-500">{invoice.invoiceNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className={cn(
                    "font-semibold",
                    isPaid ? "text-emerald-600" : invoice.status === "OVERDUE" ? "text-red-600" : "text-slate-900"
                  )}>
                    {formatCurrency(invoice.totalAmount)}
                  </p>
                  <span className={cn("text-xs", config.color)}>{config.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
