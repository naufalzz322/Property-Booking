"use client";

import { useState } from "react";
import { TenantStatsBar } from "./ui/TenantStatsBar";
import { TenantFilterBar } from "./ui/TenantFilterBar";
import { TenantGridCard } from "./TenantGridCard";
import { TenantTableRow } from "./TenantTableRow";
import { AdminEmptyState } from "./ui/AdminEmptyState";
import { cn } from "@/lib/utils";

interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  contractStart: Date;
  contractEnd: Date | null;
  isActive: boolean;
  booking?: {
    status: string;
  };
  unit: {
    unitNumber: string;
    property: { name: string };
  };
  invoices: { status: string }[];
}

export function TenantListClient({ tenants }: { tenants: Tenant[] }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Calculate stats
  const totalCount = tenants.length;
  const activeCount = tenants.filter((t) => t.isActive).length;
  // Pending = isActive but booking status is not CHECKED_IN (waiting payment or confirmed)
  const pendingCount = tenants.filter((t) => {
    if (!t.isActive) return false;
    const bookingStatus = t.booking?.status;
    return !bookingStatus || bookingStatus === "WAITING_PAYMENT" || bookingStatus === "PAID" || bookingStatus === "CONFIRMED";
  }).length;
  const overdueCount = tenants.filter((t) =>
    t.invoices.some((inv) => inv.status === "OVERDUE")
  ).length;

  // Filter tenants
  const filteredTenants = tenants.filter((tenant) => {
    // Search filter
    const matchesSearch =
      tenant.name.toLowerCase().includes(search.toLowerCase()) ||
      tenant.email.toLowerCase().includes(search.toLowerCase()) ||
      tenant.phone.includes(search);

    // Status filter
    const bookingStatus = tenant.booking?.status;
    const matchesStatus =
      filterStatus === "ALL" ||
      (filterStatus === "ACTIVE" && tenant.isActive) ||
      (filterStatus === "PENDING" && tenant.isActive && (!bookingStatus || bookingStatus === "WAITING_PAYMENT" || bookingStatus === "PAID" || bookingStatus === "CONFIRMED")) ||
      (filterStatus === "CHECKED_IN" && tenant.isActive && bookingStatus === "CHECKED_IN") ||
      (filterStatus === "OVERDUE" && tenant.invoices.some((inv) => inv.status === "OVERDUE"));

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tenant</h1>
          <p className="text-slate-500">
            Kelola data tenant dan kontrak
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      <TenantStatsBar
        totalCount={totalCount}
        activeCount={activeCount}
        pendingCount={pendingCount}
        overdueCount={overdueCount}
        currentFilter={filterStatus}
        onFilterClick={setFilterStatus}
      />

      {/* Filter Bar */}
      <TenantFilterBar
        search={search}
        onSearchChange={setSearch}
        statusFilter={filterStatus}
        onStatusChange={setFilterStatus}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        resultCount={filteredTenants.length}
      />

      {/* Results */}
      {filteredTenants.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTenants.map((tenant) => (
              <TenantGridCard key={tenant.id} tenant={tenant} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Tenant
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">
                      Unit
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">
                      Kontrak
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Tagihan
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTenants.map((tenant) => (
                    <TenantTableRow key={tenant.id} tenant={tenant} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200">
          <AdminEmptyState
            icon="tenants"
            title={
              search
                ? `Tidak ada tenant untuk "${search}"`
                : "Belum ada tenant"
            }
            description={
              search
                ? "Coba kata kunci lain atau lihat semua tenant"
                : "Tenant dibuat otomatis dari booking yang dikonfirmasi"
            }
          />
        </div>
      )}
    </div>
  );
}
