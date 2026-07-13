"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Building2,
  Calendar,
  MessageCircle,
  ChevronRight,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, TENANT_STATUS_LABELS } from "@/lib/utils";

interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  contractStart: Date;
  contractEnd: Date | null;
  isActive: boolean;
  unit: {
    unitNumber: string;
    name?: string | null;
    pricePerMonth?: number | null;
    pricePerNight?: number | null;
    property: { name: string };
  };
  invoices: {
    id?: string;
    status: string;
    totalAmount?: number;
  }[];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string): string {
  const colors = [
    "bg-violet-100 text-violet-700",
    "bg-blue-100 text-blue-700",
    "bg-emerald-100 text-emerald-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
    "bg-cyan-100 text-cyan-700",
    "bg-purple-100 text-purple-700",
  ];
  const index = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
}

interface TenantGridCardProps {
  tenant: Tenant;
}

export function TenantGridCard({ tenant }: TenantGridCardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Payment stats from invoices
  const paidInvoices = tenant.invoices.filter((inv) => inv.status === "PAID");
  const pendingInvoices = tenant.invoices.filter((inv) => inv.status === "UNPAID");
  const overdueInvoices = tenant.invoices.filter((inv) => inv.status === "OVERDUE");
  const totalPending = pendingInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

  // Contract progress - calculated client-side to avoid hydration mismatch
  const contractStart = new Date(tenant.contractStart);
  const contractEnd = tenant.contractEnd ? new Date(tenant.contractEnd) : null;
  let progress = 100;
  let daysRemaining: number | null = null;
  let isExpiringSoon = false;

  if (contractEnd && mounted) {
    const today = new Date();
    const totalDays = (contractEnd.getTime() - contractStart.getTime()) / (1000 * 60 * 60 * 24);
    const elapsedDays = (today.getTime() - contractStart.getTime()) / (1000 * 60 * 60 * 24);
    progress = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));
    daysRemaining = Math.ceil((contractEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    isExpiringSoon = daysRemaining <= 30 && daysRemaining > 0;
  }

  return (
    <div className="group bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col h-full">
      {/* Gradient Header */}
      <div
        className={cn(
          "h-2 bg-gradient-to-r from-slate-100 to-slate-200",
          tenant.isActive && "from-emerald-100 to-emerald-50",
          overdueInvoices.length > 0 && "from-red-50 to-amber-50"
        )}
      />

      {/* Main Content - Flex grows to fill */}
      <div className="p-5 flex flex-col flex-1">
        {/* TOP: Profile + Unit */}
        <div className="flex items-start gap-4 mb-4">
          {/* Avatar with status ring */}
          <div className="relative flex-shrink-0">
            <div
              className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold",
                getAvatarColor(tenant.name)
              )}
            >
              {getInitials(tenant.name)}
            </div>
            {/* Status ring */}
            <div
              className={cn(
                "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white",
                tenant.isActive ? "bg-emerald-500" : "bg-slate-400"
              )}
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors truncate">
              {tenant.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-500">
              <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">
                {tenant.unit.name || tenant.unit.property.name} - Unit {tenant.unit.unitNumber}
              </span>
            </div>
          </div>

          {/* Menu button */}
          <Link
            href={`/admin/tenant/${tenant.id}`}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors flex-shrink-0"
          >
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>

        {/* MIDDLE: Contract Section - Always same height */}
        <div className="min-h-[80px] mb-4">
          {contractEnd ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Kontrak</span>
                </div>
                {isExpiringSoon && (
                  <span className="text-xs text-amber-600 font-medium">
                    {daysRemaining} hari lagi
                  </span>
                )}
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    progress >= 90
                      ? "bg-red-500"
                      : progress >= 75
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between mt-1.5 text-xs text-slate-400">
                <span>{format(contractStart, "dd MMM yyyy", { locale: id })}</span>
                <span>{format(contractEnd, "dd MMM yyyy", { locale: id })}</span>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs text-amber-700 text-center">
                  ⚠️ Tenant belum check-in
                </p>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM: Tagihan + Actions - Pushed to bottom */}
        <div className="mt-auto space-y-4">
          {/* Tagihan */}
          <div>
            <div className="text-xs text-slate-500 mb-2">Tagihan</div>
            <div className="grid grid-cols-3 gap-2">
              {/* Paid */}
              <div
                className={cn(
                  "rounded-xl p-2 text-center",
                  paidInvoices.length > 0 ? "bg-emerald-50" : "bg-slate-50"
                )}
              >
                <CheckCircle className={cn(
                  "w-4 h-4 mx-auto mb-1",
                  paidInvoices.length > 0 ? "text-emerald-600" : "text-slate-400"
                )} />
                <p className={cn(
                  "text-sm font-bold",
                  paidInvoices.length > 0 ? "text-emerald-700" : "text-slate-400"
                )}>
                  {paidInvoices.length}
                </p>
                <p className="text-[10px] text-slate-500">Lunas</p>
              </div>

              {/* Pending */}
              <div
                className={cn(
                  "rounded-xl p-2 text-center",
                  totalPending > 0 ? "bg-amber-50" : "bg-slate-50"
                )}
              >
                <Clock className={cn(
                  "w-4 h-4 mx-auto mb-1",
                  totalPending > 0 ? "text-amber-600" : "text-slate-400"
                )} />
                <p className={cn(
                  "text-sm font-bold",
                  totalPending > 0 ? "text-amber-700" : "text-slate-400"
                )}>
                  {totalPending > 0 ? formatCurrency(totalPending) : "0"}
                </p>
                <p className="text-[10px] text-slate-500">Pending</p>
              </div>

              {/* Overdue */}
              <div
                className={cn(
                  "rounded-xl p-2 text-center",
                  totalOverdue > 0 ? "bg-red-50" : "bg-slate-50"
                )}
              >
                <AlertTriangle className={cn(
                  "w-4 h-4 mx-auto mb-1",
                  totalOverdue > 0 ? "text-red-600" : "text-slate-400"
                )} />
                <p className={cn(
                  "text-sm font-bold",
                  totalOverdue > 0 ? "text-red-700" : "text-slate-400"
                )}>
                  {totalOverdue > 0 ? formatCurrency(totalOverdue) : "0"}
                </p>
                <p className="text-[10px] text-slate-500">Overdue</p>
              </div>
            </div>
          </div>

          {/* WhatsApp Button */}
          <a
            href={`https://wa.me/${tenant.phone.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-medium text-sm transition-all duration-200",
              "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm hover:shadow-md"
            )}
          >
            <MessageCircle className="w-4 h-4" />
            Hubungi via WhatsApp
          </a>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <Link
              href={`/admin/tenant/${tenant.id}`}
              className="text-sm text-amber-600 hover:text-amber-700 font-medium"
            >
              Lihat Detail →
            </Link>
            <span
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-medium",
                tenant.isActive
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-100 text-slate-600"
              )}
            >
              {tenant.isActive ? TENANT_STATUS_LABELS.ACTIVE : TENANT_STATUS_LABELS.INACTIVE}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
