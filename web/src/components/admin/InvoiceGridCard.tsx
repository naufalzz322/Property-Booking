"use client";

import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Receipt,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Clock,
  MessageCircle,
  ChevronRight,
  Calendar,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";

interface Invoice {
  id: string;
  invoiceNumber: string;
  period: string;
  rentAmount: number;
  electricAmount: number;
  waterAmount: number;
  otherAmount: number;
  totalAmount: number;
  dueDate: Date;
  status: string;
  paidAt: Date | null;
  paymentProofUrl: string | null;
  tenant: {
    name: string;
    phone: string;
  };
  unit: {
    unitNumber: string;
    name?: string | null;
    property: { name: string };
  };
}

const statusConfig: Record<string, {
  label: string;
  color: "emerald" | "amber" | "red" | "slate";
  bg: string;
  border: string;
  text: string;
  icon: React.ElementType;
}> = {
  PAID: {
    label: "Lunas",
    color: "emerald",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    icon: CheckCircle,
  },
  UNPAID: {
    label: "Belum Bayar",
    color: "amber",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    icon: Clock,
  },
  OVERDUE: {
    label: "Overdue",
    color: "red",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    icon: AlertTriangle,
  },
};

function formatPeriod(period: string): string {
  const [year, month] = period.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return format(date, "MMMM yyyy", { locale: id });
}

interface InvoiceGridCardProps {
  invoice: Invoice;
}

export function InvoiceGridCard({ invoice }: InvoiceGridCardProps) {
  const config = statusConfig[invoice.status] || statusConfig.UNPAID;
  const StatusIcon = config.icon;
  const isPaid = invoice.status === "PAID";

  // Calculate days until due
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(invoice.dueDate);
  dueDate.setHours(0, 0, 0, 0);
  const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  // Border color based on urgency
  const borderColor = invoice.status === "OVERDUE"
    ? "border-l-4 border-l-red-500"
    : invoice.status === "UNPAID" && daysUntil <= 7
    ? "border-l-4 border-l-amber-500"
    : "";

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-slate-300 transition-all duration-300">
      {/* Header with status */}
      <div className={cn("px-5 pt-5 pb-4", config.bg)}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              invoice.status === "PAID" ? "bg-emerald-100" :
              invoice.status === "OVERDUE" ? "bg-red-100" :
              invoice.status === "UNPAID" ? "bg-amber-100" : "bg-slate-100"
            )}>
              <StatusIcon className={cn("w-5 h-5", config.text)} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-mono">{invoice.invoiceNumber}</p>
              <h3 className="font-semibold text-slate-900">{formatPeriod(invoice.period)}</h3>
            </div>
          </div>
          <span className={cn(
            "px-3 py-1 rounded-full text-xs font-medium",
            config.bg,
            config.text
          )}>
            {config.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className={cn("px-5 py-4", borderColor)}>
        {/* Tenant info */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
            <Building2 className="w-4 h-4 text-amber-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-slate-900 truncate">{invoice.tenant.name}</p>
            <p className="text-xs text-slate-500">
              {invoice.unit.name || invoice.unit.property.name} - Unit {invoice.unit.unitNumber}
            </p>
          </div>
        </div>

        {/* Amount */}
        <div className="mb-4">
          <p className={cn(
            "text-2xl font-bold",
            isPaid ? "text-emerald-600" : invoice.status === "OVERDUE" ? "text-red-600" : "text-slate-900"
          )}>
            {formatCurrency(invoice.totalAmount)}
          </p>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              Jatuh tempo: {format(new Date(invoice.dueDate), "dd MMM yyyy", { locale: id })}
            </span>
          </div>
        </div>

        {/* Due status */}
        {!isPaid && (
          <div className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-xl text-sm",
            invoice.status === "OVERDUE"
              ? "bg-red-100 text-red-700"
              : daysUntil <= 7
              ? "bg-amber-100 text-amber-700"
              : "bg-slate-100 text-slate-600"
          )}>
            {invoice.status === "OVERDUE" ? (
              <>
                <AlertTriangle className="w-4 h-4" />
                <span>Lewat {Math.abs(daysUntil)} hari</span>
              </>
            ) : daysUntil <= 7 ? (
              <>
                <Clock className="w-4 h-4" />
                <span>{daysUntil} hari lagi</span>
              </>
            ) : null}
          </div>
        )}

        {/* Paid info */}
        {isPaid && invoice.paidAt && (
          <div className="flex items-center gap-2 text-sm text-emerald-600">
            <CheckCircle className="w-4 h-4" />
            <span>Lunas pada {format(new Date(invoice.paidAt), "dd MMM yyyy", { locale: id })}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-5 py-4 bg-slate-50 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <a
            href={`https://wa.me/${invoice.tenant.phone.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </a>
          <Link
            href={`/admin/invoice/${invoice.id}`}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-medium transition-colors"
          >
            Detail
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
