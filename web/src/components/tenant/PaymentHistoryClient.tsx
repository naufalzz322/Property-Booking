"use client";

import Link from "next/link";
import { ArrowLeft, TrendingUp, CheckCircle } from "lucide-react";
import { TimelineView } from "./timeline-view";
import { formatCurrency } from "@/lib/utils";

interface Payment {
  id: string;
  invoiceNumber: string;
  period: string;
  totalAmount: number;
  paidAt: Date | null;
  paymentMethod: string | null;
}

interface Tenant {
  id: string;
  name: string;
  unit: {
    unitNumber: string;
    name?: string | null;
    property: {
      name: string;
    };
  };
}

interface PaymentHistoryClientProps {
  tenant: Tenant;
  payments: Payment[];
  totalPaid: number;
}

export function PaymentHistoryClient({
  tenant,
  payments,
  totalPaid,
}: PaymentHistoryClientProps) {
  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-lg mx-auto px-4">
          <div className="flex items-center h-16">
            <Link
              href="/tenant"
              className="p-2 -ml-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <h1 className="flex-1 text-center text-lg font-bold text-slate-900">
              Riwayat Pembayaran
            </h1>
            <div className="w-10" />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Summary Card */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Total Pembayaran</p>
              <p className="text-3xl font-bold mt-1">{formatCurrency(totalPaid)}</p>
              <p className="text-emerald-100 text-sm mt-1">
                {payments.length} transaksi berhasil
              </p>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-7 h-7" />
            </div>
          </div>
        </div>

        {/* Tenant Info */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-amber-600">
                {tenant.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-semibold text-slate-900">{tenant.name}</p>
              <p className="text-sm text-slate-500">
                {tenant.unit.name || tenant.unit.property.name} - Unit {tenant.unit.unitNumber}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Timeline */}
        <TimelineView payments={payments} />
      </main>
    </div>
  );
}
