"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Receipt } from "lucide-react";
import { InvoiceCard } from "./invoice-card";
import { FilterTabs } from "@/components/ui/filter-tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
  unit: { unitNumber: string };
}

export function InvoiceListClient({ invoices }: { invoices: Invoice[] }) {
  const [filter, setFilter] = useState<"all" | "unpaid" | "paid">("all");

  const unpaidInvoices = invoices.filter((i) => i.status === "UNPAID" || i.status === "OVERDUE");
  const paidInvoices = invoices.filter((i) => i.status === "PAID");

  const filteredInvoices = invoices.filter((inv) => {
    if (filter === "unpaid") return inv.status === "UNPAID" || inv.status === "OVERDUE";
    if (filter === "paid") return inv.status === "PAID";
    return true;
  });

  const tabs = [
    { value: "all", label: "Semua", count: invoices.length },
    { value: "unpaid", label: "Belum Bayar", count: unpaidInvoices.length },
    { value: "paid", label: "Lunas", count: paidInvoices.length },
  ];

  const totalUnpaid = unpaidInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

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
              Tagihan Saya
            </h1>
            <div className="w-10" />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Filter Tabs */}
        <FilterTabs
          tabs={tabs}
          activeTab={filter}
          onTabChange={(v) => setFilter(v as typeof filter)}
        />

        {/* Summary Card */}
        {unpaidInvoices.length > 0 && (
          <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Total Belum Bayar</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(totalUnpaid)}</p>
                <p className="text-white/70 text-xs mt-1">
                  {unpaidInvoices.length} tagihan
                </p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Receipt className="w-6 h-6" />
              </div>
            </div>
          </div>
        )}

        {/* Invoice List */}
        {filteredInvoices.length > 0 ? (
          <div className="space-y-4">
            {filteredInvoices.map((invoice) => (
              <InvoiceCard key={invoice.id} invoice={invoice} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200">
            <EmptyState
              icon={Receipt}
              title="Tidak ada tagihan"
              description={
                filter === "all"
                  ? "Belum ada tagihan untuk saat ini"
                  : filter === "unpaid"
                  ? "Semua tagihan sudah lunas"
                  : "Belum ada tagihan lunas"
              }
            />
          </div>
        )}
      </main>
    </div>
  );
}
