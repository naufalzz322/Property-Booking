"use client";

import Link from "next/link";
import { Phone, Mail, MessageCircle, Building2, Calendar, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { id } from "date-fns/locale";

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
    property: { name: string };
  };
  invoices: { status: string }[];
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
    "bg-violet-100 text-violet-800",
    "bg-blue-100 text-blue-800",
    "bg-emerald-100 text-emerald-800",
    "bg-amber-100 text-amber-800",
    "bg-rose-100 text-rose-800",
    "bg-cyan-100 text-cyan-800",
    "bg-purple-100 text-purple-800",
  ];
  const index = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
}

interface TenantCardProps {
  tenant: Tenant;
}

export function TenantCard({ tenant }: TenantCardProps) {
  // Get payment status from invoices
  const paidThisMonth = tenant.invoices.some(
    (inv) =>
      inv.status === "PAID" &&
      new Date().toISOString().slice(0, 7) === new Date().getFullYear() + "-" + String(new Date().getMonth() + 1).padStart(2, "0")
  );
  const hasOverdue = tenant.invoices.some((inv) => inv.status === "OVERDUE");

  const contractEnd = tenant.contractEnd ? new Date(tenant.contractEnd) : null;
  const daysUntilExpiry = contractEnd
    ? Math.ceil((contractEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;
  const contractExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry > 0;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all duration-200">
      {/* Header with Avatar - Clickable to detail page */}
      <Link
        href={`/admin/tenant/${tenant.id}`}
        className="block p-5"
      >
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0",
              getAvatarColor(tenant.name)
            )}
          >
            {getInitials(tenant.name)}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 group-hover:text-amber-600 transition-colors truncate">
                  {tenant.name}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                  <Building2 className="w-3.5 h-3.5" />
                  <span className="truncate">
                    {tenant.unit.name || tenant.unit.property.name} - Unit {tenant.unit.unitNumber}
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0",
                  tenant.isActive
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-100 text-slate-600"
                )}
              >
                {tenant.isActive ? "Aktif" : "Nonaktif"}
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* Contact Actions */}
      <div className="px-5 pb-4 flex gap-2">
        <a
          href={`https://wa.me/${tenant.phone.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium hover:bg-emerald-100 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          WA
        </a>
        <a
          href={`tel:${tenant.phone}`}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-50 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-100 transition-colors"
        >
          <Phone className="w-4 h-4" />
          Call
        </a>
        <a
          href={`mailto:${tenant.email}`}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-50 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-100 transition-colors"
        >
          <Mail className="w-4 h-4" />
          Email
        </a>
      </div>

      {/* Status Indicators */}
      <div className="px-5 pb-5 flex flex-wrap gap-2">
        {/* Payment Status */}
        <Link
          href={`/admin/tenant/${tenant.id}`}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
            hasOverdue
              ? "bg-red-100 text-red-700 hover:bg-red-200"
              : paidThisMonth
              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
              : "bg-amber-100 text-amber-700 hover:bg-amber-200"
          )}
        >
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              hasOverdue
                ? "bg-red-500"
                : paidThisMonth
                ? "bg-emerald-500"
                : "bg-amber-500"
            )}
          />
          {hasOverdue ? "Ada Overdue" : paidThisMonth ? "Lunas Bulan Ini" : "Belum Bayar"}
        </Link>

        {/* Contract Expiry */}
        {contractExpiringSoon && (
          <Link
            href={`/admin/tenant/${tenant.id}`}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors"
          >
            <Calendar className="w-3 h-3" />
            Kontrak {daysUntilExpiry} hari lagi
          </Link>
        )}
      </div>

      {/* Contract Period */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
        <p className="text-xs text-slate-500">
          Kontrak:{" "}
          <Link
            href={`/admin/tenant/${tenant.id}`}
            className="text-slate-700 font-medium hover:text-amber-600 transition-colors"
          >
            {format(new Date(tenant.contractStart), "dd MMM yyyy", { locale: id })}
            {contractEnd && (
              <>
                {" - "}
                {format(contractEnd, "dd MMM yyyy", { locale: id })}
              </>
            )}
          </Link>
        </p>
      </div>
    </div>
  );
}

interface TenantCardSkeletonProps {
  className?: string;
}

export function TenantCardSkeleton({ className }: TenantCardSkeletonProps) {
  return (
    <div className={cn("bg-white rounded-2xl border border-slate-200 overflow-hidden", className)}>
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-slate-200 rounded-full animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-32 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-48 bg-slate-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
      <div className="px-5 pb-4 flex gap-2">
        <div className="flex-1 h-10 bg-slate-100 rounded-xl animate-pulse" />
        <div className="flex-1 h-10 bg-slate-100 rounded-xl animate-pulse" />
        <div className="flex-1 h-10 bg-slate-100 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}
