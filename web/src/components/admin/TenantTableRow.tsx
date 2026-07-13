"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Building2,
  MessageCircle,
  CheckCircle,
  Clock,
  AlertTriangle,
  MoreHorizontal,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

interface TenantTableRowProps {
  tenant: Tenant;
}

export function TenantTableRow({ tenant }: TenantTableRowProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Payment stats from invoices
  const paidInvoices = tenant.invoices.filter((inv) => inv.status === "PAID");
  const pendingInvoices = tenant.invoices.filter((inv) => inv.status === "UNPAID");
  const overdueInvoices = tenant.invoices.filter((inv) => inv.status === "OVERDUE");
  const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

  // Contract progress - calculated client-side to avoid hydration mismatch
  const contractStart = new Date(tenant.contractStart);
  const contractEnd = tenant.contractEnd ? new Date(tenant.contractEnd) : null;
  let progress = 100;
  let daysRemaining: number | null = null;

  if (contractEnd && mounted) {
    const today = new Date();
    const totalDays = (contractEnd.getTime() - contractStart.getTime()) / (1000 * 60 * 60 * 24);
    const elapsedDays = (today.getTime() - contractStart.getTime()) / (1000 * 60 * 60 * 24);
    progress = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));
    daysRemaining = Math.ceil((contractEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  return (
    <tr className="group hover:bg-slate-50 transition-colors">
      {/* Avatar + Name */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0",
            getAvatarColor(tenant.name)
          )}>
            {getInitials(tenant.name)}
          </div>
          <div>
            <Link
              href={`/admin/tenant/${tenant.id}`}
              className="font-medium text-slate-900 hover:text-amber-600 transition-colors"
            >
              {tenant.name}
            </Link>
            <div className="text-xs text-slate-500">{tenant.email}</div>
          </div>
        </div>
      </td>

      {/* Unit */}
      <td className="px-4 py-3 hidden md:table-cell">
        <div className="flex items-center gap-1.5 text-sm text-slate-600">
          <Building2 className="w-4 h-4 text-slate-400" />
          <span>{tenant.unit.name || tenant.unit.property.name}</span>
          <span className="text-slate-400">-</span>
          <span className="font-medium">Unit {tenant.unit.unitNumber}</span>
        </div>
      </td>

      {/* Contract Progress */}
      <td className="px-4 py-3 hidden lg:table-cell">
        {contractEnd ? (
          <div className="w-32">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500">{format(contractStart, "dd MMM", { locale: id })}</span>
              <span className={cn(
                daysRemaining !== null && daysRemaining <= 30 ? "text-amber-600 font-medium" : "text-slate-500"
              )}>
                {daysRemaining !== null ? `${daysRemaining}d` : "-"}
              </span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full",
                  progress >= 90 ? "bg-red-500" : progress >= 75 ? "bg-amber-500" : "bg-emerald-500"
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <span className="text-sm text-slate-400">Tanpa batas</span>
        )}
      </td>

      {/* Payment Status */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {totalOverdue > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-medium">
              <AlertTriangle className="w-3 h-3" />
              {formatCurrency(totalOverdue)}
            </span>
          )}
          {paidInvoices.length > 0 && totalOverdue === 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium">
              <CheckCircle className="w-3 h-3" />
              {paidInvoices.length} lunas
            </span>
          )}
          {totalOverdue === 0 && paidInvoices.length === 0 && pendingInvoices.length === 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
              <Clock className="w-3 h-3" />
              Baru
            </span>
          )}
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
            tenant.isActive
              ? "bg-emerald-100 text-emerald-700"
              : "bg-slate-100 text-slate-600"
          )}
        >
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              tenant.isActive ? "bg-emerald-500" : "bg-slate-400"
            )}
          />
          {tenant.isActive ? "Aktif" : "Nonaktif"}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <a
            href={`https://wa.me/${tenant.phone.replace(/\D/g, "")}`}
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
                <Link href={`/admin/tenant/${tenant.id}`} className="flex items-center gap-2 w-full">
                  <Building2 className="w-4 h-4" />
                  Lihat Detail
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                <a
                  href={`https://wa.me/${tenant.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 w-full"
                >
                  <MessageCircle className="w-4 h-4" />
                  Hubungi
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center gap-2 cursor-pointer text-amber-600">
                <Link href={`/admin/tenant/${tenant.id}`} className="flex items-center gap-2 w-full">
                  Edit Tenant
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </td>
    </tr>
  );
}
