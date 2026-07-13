"use client";

import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";

interface PaymentTimelineItemProps {
  payment: {
    id: string;
    invoiceNumber: string;
    period: string;
    totalAmount: number;
    paidAt: Date | null;
    paymentMethod: string | null;
  };
  isLast?: boolean;
}

function formatPeriod(period: string): string {
  const [year, month] = period.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return format(date, "MMMM yyyy", { locale: id });
}

export function PaymentTimelineItem({ payment, isLast = false }: PaymentTimelineItemProps) {
  return (
    <div className="flex gap-4">
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center z-10">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
        </div>
        {!isLast && (
          <div className="w-0.5 h-full min-h-[60px] bg-emerald-200" />
        )}
      </div>

      {/* Content */}
      <Link href={`/tenant/invoice/${payment.id}`} className="flex-1 pb-6">
        <div className="bg-white rounded-2xl border border-emerald-100 p-4 hover:shadow-md hover:border-emerald-200 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-slate-900">{formatPeriod(payment.period)}</h4>
              <p className="text-xs text-slate-500 mt-1">{payment.invoiceNumber}</p>
              {payment.paidAt && (
                <p className="text-xs text-slate-400 mt-1">
                  {format(new Date(payment.paidAt), "dd MMMM yyyy", { locale: id })}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-emerald-600">
                {formatCurrency(payment.totalAmount)}
              </p>
              {payment.paymentMethod && (
                <span className="text-xs text-slate-500">{payment.paymentMethod}</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
