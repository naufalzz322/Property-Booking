"use client";

import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface HeroInvoiceCardProps {
  invoice: {
    id: string;
    period: string;
    totalAmount: number;
    status: string;
    dueDate: Date;
  };
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

function getDaysUntilDue(dueDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function HeroInvoiceCard({ invoice }: HeroInvoiceCardProps) {
  const daysUntil = getDaysUntilDue(new Date(invoice.dueDate));
  const isOverdue = invoice.status === "OVERDUE" || daysUntil < 0;
  const isUnpaid = invoice.status === "UNPAID";

  if (!isUnpaid && !isOverdue) {
    return null; // Don't show if already paid
  }

  return (
    <Link href={`/tenant/invoice/${invoice.id}`}>
      <div
        className={cn(
          "rounded-2xl p-6 text-white transition-transform hover:scale-[1.01] active:scale-[0.99]",
          isOverdue
            ? "bg-gradient-to-br from-red-500 to-red-600"
            : "bg-gradient-to-br from-amber-500 to-orange-500"
        )}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-white/80 text-sm">Tagihan {formatPeriod(invoice.period)}</p>
            <p className="text-3xl font-bold mt-1">{formatCurrency(invoice.totalAmount)}</p>
          </div>
          <div className={cn(
            "px-3 py-1 rounded-full text-xs font-semibold",
            isOverdue ? "bg-white/20" : "bg-white/20"
          )}>
            {isOverdue ? "OVERDUE" : "BELUM BAYAR"}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/80">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">
              Jatuh tempo: {format(new Date(invoice.dueDate), "dd MMM yyyy", { locale: id })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/80">
              {isOverdue ? (
                <>Lewat {Math.abs(daysUntil)} hari</>
              ) : daysUntil === 0 ? (
                "Hari ini!"
              ) : (
                <>{daysUntil} hari lagi</>
              )}
            </span>
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>

        <Button
          className={cn(
            "w-full mt-4 font-semibold",
            isOverdue
              ? "bg-white text-red-600 hover:bg-white/90"
              : "bg-white text-amber-600 hover:bg-white/90"
          )}
        >
          Bayar Sekarang →
        </Button>
      </div>
    </Link>
  );
}
