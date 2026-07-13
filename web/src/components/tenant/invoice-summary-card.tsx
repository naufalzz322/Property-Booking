"use client";

import Link from "next/link";
import { Receipt, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface InvoiceSummaryCardProps {
  unpaidTotal: number;
  paidTotal: number;
  unpaidCount: number;
  paidCount: number;
}

export function InvoiceSummaryCard({
  unpaidTotal,
  paidTotal,
  unpaidCount,
  paidCount,
}: InvoiceSummaryCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <Receipt className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Belum Bayar</p>
            <p className="text-lg font-bold text-amber-600">
              {formatCurrency(unpaidTotal)}
            </p>
            <p className="text-xs text-slate-400">{unpaidCount} tagihan</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Sudah Bayar</p>
            <p className="text-lg font-bold text-emerald-600">
              {formatCurrency(paidTotal)}
            </p>
            <p className="text-xs text-slate-400">{paidCount} tagihan</p>
          </div>
        </div>
      </div>
    </div>
  );
}
