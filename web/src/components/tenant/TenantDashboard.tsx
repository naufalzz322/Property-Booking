"use client";

import Link from "next/link";
import { Home, Receipt, History, FileText, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { WelcomeHeader } from "./welcome-header";
import { HeroInvoiceCard } from "./hero-invoice-card";
import { QuickActionsGrid } from "./quick-actions-grid";
import { StatsRow } from "./stats-row";
import { RecentInvoicesList } from "./recent-invoices-list";
import { AlertBanner } from "@/components/ui/alert-banner";

interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  contractStart: Date;
  contractEnd: Date | null;
  unit: {
    unitNumber: string;
    name?: string | null;
    pricePerMonth: number | null;
    property: { name: string; address: string };
  };
  invoices: {
    id: string;
    invoiceNumber: string;
    period: string;
    totalAmount: number;
    status: string;
    dueDate: Date;
    paidAt: Date | null;
  }[];
}

interface TenantDashboardProps {
  tenant: Tenant;
}

function getDaysUntil(dueDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getContractDaysRemaining(contractEnd: Date | null): number | null {
  if (!contractEnd) return null;
  return getDaysUntil(contractEnd);
}

export function TenantDashboard({ tenant }: TenantDashboardProps) {
  const unitInfo = `${tenant.unit.name || tenant.unit.property.name} - Unit ${tenant.unit.unitNumber}`;

  // Calculate invoice stats
  const unpaidInvoices = tenant.invoices.filter(
    (i) => i.status === "UNPAID" || i.status === "OVERDUE"
  );
  const paidInvoices = tenant.invoices.filter(
    (i) => i.status === "PAID"
  );
  const totalPaid = paidInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const overdueCount = tenant.invoices.filter((i) => i.status === "OVERDUE").length;

  // Find current/upcoming invoice
  const currentInvoice = unpaidInvoices[0];

  // Check for alerts
  const hasOverdue = overdueCount > 0;
  const contractDaysRemaining = getContractDaysRemaining(
    tenant.contractEnd ? new Date(tenant.contractEnd) : null
  );
  const contractExpiringSoon = contractDaysRemaining !== null && contractDaysRemaining <= 30 && contractDaysRemaining > 0;

  // Has notification indicator
  const hasNotification = hasOverdue || contractExpiringSoon;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Content */}
      <main className="max-w-lg mx-auto px-4 py-6 pb-24">
        {/* Welcome Header */}
        <div className="mb-6">
          <WelcomeHeader
            name={tenant.name}
            unitInfo={unitInfo}
          />
        </div>

        {/* Alerts */}
        {hasOverdue && (
          <div className="mb-4">
            <AlertBanner
              type="danger"
              title="Tagihan Overdue!"
              description={`Ada ${overdueCount} tagihan yang sudah melewati jatuh tempo.`}
              action={{
                label: "Lihat Tagihan",
                onClick: () => window.location.href = "/tenant/invoice",
              }}
            />
          </div>
        )}

        {contractExpiringSoon && (
          <div className="mb-4">
            <AlertBanner
              type="warning"
              title="Kontrak Akan Berakhir"
              description={`Kontrak Anda akan berakhir dalam ${contractDaysRemaining} hari.`}
              action={{
                label: "Hubungi Owner",
                onClick: () => window.location.href = "/tenant/account",
              }}
            />
          </div>
        )}

        {/* Hero Invoice Card */}
        {currentInvoice && (
          <div className="mb-6">
            <HeroInvoiceCard invoice={currentInvoice} />
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-6">
          <QuickActionsGrid
            unpaidCount={unpaidInvoices.length}
            overdueCount={overdueCount}
          />
        </div>

        {/* Stats */}
        <div className="mb-6">
          <StatsRow
            totalInvoices={tenant.invoices.length}
            paidCount={paidInvoices.length}
            unpaidCount={unpaidInvoices.length}
            totalPaid={totalPaid}
          />
        </div>

        {/* Recent Invoices */}
        <div>
          <RecentInvoicesList invoices={tenant.invoices} />
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-50">
        <div className="max-w-lg mx-auto flex">
          <Link
            href="/tenant"
            className="flex-1 flex flex-col items-center py-3 text-amber-600"
          >
            <Home className="w-5 h-5" />
            <span className="text-xs mt-1 font-medium">Beranda</span>
          </Link>
          <Link
            href="/tenant/invoice"
            className={cn(
              "flex-1 flex flex-col items-center py-3 transition-colors",
              unpaidInvoices.length > 0 ? "text-amber-600" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <div className="relative">
              <Receipt className="w-5 h-5" />
              {unpaidInvoices.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center">
                  {unpaidInvoices.length > 9 ? "9+" : unpaidInvoices.length}
                </span>
              )}
            </div>
            <span className="text-xs mt-1">Tagihan</span>
          </Link>
          <Link
            href="/tenant/history"
            className="flex-1 flex flex-col items-center py-3 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <History className="w-5 h-5" />
            <span className="text-xs mt-1">Riwayat</span>
          </Link>
          <Link
            href="/tenant/kontrak"
            className="flex-1 flex flex-col items-center py-3 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <FileText className="w-5 h-5" />
            <span className="text-xs mt-1">Kontrak</span>
          </Link>
          <Link
            href="/tenant/account"
            className="flex-1 flex flex-col items-center py-3 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <UserCircle className="w-5 h-5" />
            <span className="text-xs mt-1">Akun</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
