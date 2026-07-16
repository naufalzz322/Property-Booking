"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  CheckCircle,
  AlertTriangle,
  Clock,
  MessageCircle,
  Eye,
  MoreHorizontal,
} from "lucide-react";
import { InvoiceStatsBar } from "./ui/InvoiceStatsBar";
import { InvoiceFilterBar } from "./ui/InvoiceFilterBar";
import { InvoiceGridCard } from "./InvoiceGridCard";
import { AdminEmptyState } from "./ui/AdminEmptyState";
import { INVOICE_STATUS_LABELS, getInvoiceStatusLabel } from "@/lib/filterOptions";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

const statusColors: Record<string, string> = {
  UNPAID: "bg-amber-100 text-amber-800",
  PAID: "bg-emerald-100 text-emerald-800",
  OVERDUE: "bg-red-100 text-red-800",
  WAIVED: "bg-slate-100 text-slate-700",
};

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  PAID: { label: "Lunas", color: "text-emerald-600", icon: CheckCircle },
  UNPAID: { label: "Belum Bayar", color: "text-amber-600", icon: Clock },
  OVERDUE: { label: "Overdue", color: "text-red-600", icon: AlertTriangle },
  WAIVED: { label: "Dibebaskan", color: "text-slate-600", icon: Clock },
};

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

export function InvoiceListClient({ invoices }: { invoices: Invoice[] }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Calculate stats
  const paidInvoices = invoices.filter((i) => i.status === "PAID");
  const unpaidInvoices = invoices.filter((i) => i.status === "UNPAID");
  const overdueInvoices = invoices.filter((i) => i.status === "OVERDUE");

  const totalAmount = invoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const paidAmount = paidInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const unpaidAmount = unpaidInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const overdueAmount = overdueInvoices.reduce((sum, i) => sum + i.totalAmount, 0);

  // Filter invoices
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      invoice.tenant.name.toLowerCase().includes(search.toLowerCase()) ||
      invoice.unit.unitNumber.includes(search) ||
      (invoice.unit.name || invoice.unit.property.name).toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "ALL" || invoice.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <InvoiceStatsBar
        totalAmount={totalAmount}
        paidAmount={paidAmount}
        paidCount={paidInvoices.length}
        unpaidAmount={unpaidAmount}
        unpaidCount={unpaidInvoices.length}
        overdueAmount={overdueAmount}
        overdueCount={overdueInvoices.length}
        currentFilter={filterStatus}
        onFilterClick={setFilterStatus}
      />

      {/* Filter Bar */}
      <InvoiceFilterBar
        search={search}
        onSearchChange={setSearch}
        statusFilter={filterStatus}
        onStatusChange={setFilterStatus}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        resultCount={filteredInvoices.length}
      />

      {/* Results */}
      {filteredInvoices.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInvoices.map((invoice) => (
              <InvoiceGridCard key={invoice.id} invoice={invoice} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead className="hidden md:table-cell">Tenant</TableHead>
                    <TableHead className="hidden lg:table-cell">Unit</TableHead>
                    <TableHead>Periode</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => {
                    const config = statusConfig[invoice.status] || statusConfig.UNPAID;
                    const StatusIcon = config.icon;
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const dueDate = new Date(invoice.dueDate);
                    dueDate.setHours(0, 0, 0, 0);
                    const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                    return (
                      <TableRow key={invoice.id} className="group">
                        <TableCell>
                          <span className="font-mono text-xs text-slate-500">{invoice.invoiceNumber}</span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900">{invoice.tenant.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <span className="text-slate-600">
                            {invoice.unit.name || invoice.unit.property.name} - Unit {invoice.unit.unitNumber}
                          </span>
                        </TableCell>
                        <TableCell>{formatPeriod(invoice.period)}</TableCell>
                        <TableCell>
                          <span className={cn(
                            "font-semibold",
                            invoice.status === "PAID" ? "text-emerald-600" :
                            invoice.status === "OVERDUE" ? "text-red-600" : "text-slate-900"
                          )}>
                            {formatCurrency(invoice.totalAmount)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                                statusColors[invoice.status]
                              )}
                            >
                              <StatusIcon className="w-3.5 h-3.5" />
                              {config.label}
                            </span>
                            {invoice.status === "OVERDUE" && (
                              <span className="text-xs text-red-600">
                                {Math.abs(daysUntil)} hari
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <a
                              href={`https://wa.me/${invoice.tenant.phone.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Hubungi WhatsApp"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>
                            <DropdownMenu>
                              <DropdownMenuTrigger className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                                <MoreHorizontal className="w-4 h-4" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                                  <Link href={`/admin/invoice/${invoice.id}`} className="flex items-center gap-2 w-full">
                                    <Eye className="w-4 h-4" />
                                    Lihat Detail
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                                  <a
                                    href={`https://wa.me/${invoice.tenant.phone.replace(/\D/g, "")}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 w-full"
                                  >
                                    <MessageCircle className="w-4 h-4" />
                                    Hubungi
                                  </a>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200">
          <AdminEmptyState
            icon="invoices"
            title={search ? `Tidak ada tagihan untuk "${search}"` : "Belum ada tagihan"}
            description={
              search
                ? "Coba kata kunci lain atau lihat semua tagihan"
                : "Tagihan akan muncul setelah ada tenant aktif"
            }
            action={
              search
                ? { label: "Reset Pencarian", onClick: () => setSearch("") }
                : undefined
            }
          />
        </div>
      )}
    </div>
  );
}
