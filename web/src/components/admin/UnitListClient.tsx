"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { Plus, Search, X, LayoutGrid, List, Kanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UnitStatsBar } from "./ui/UnitStatsBar";
import { UnitBoard } from "./booking/UnitBoard";
import { UnitCard } from "./UnitCard";
import { UnitDetailDrawer } from "./booking/UnitDetailDrawer";
import { AdminEmptyState } from "./ui/AdminEmptyState";
import { cn } from "@/lib/utils";
import type { UnitBoardItem } from "./booking/UnitBoard";

interface Unit {
  id: string;
  name: string;
  unitNumber: string;
  slug: string;
  type: string;
  status: string;
  pricePerMonth: number | null;
  pricePerNight: number | null;
  facilities: string[];
  description: string | null;
  photos: string[];
  property: { id: string; name: string };
  currentTenant?: { id: string; name: string; contractEnd: string | null } | null;
  currentBooking?: { id: string; guestName: string; checkInDate: string; status: string } | null;
  _count: { bookings: number; invoices: number };
}

type ViewMode = "board" | "grid" | "list";

const typeOptions = [
  { value: "ALL", label: "Semua Tipe" },
  { value: "KOS_BULANAN", label: "Kos Bulanan" },
  { value: "KOS_HARIAN", label: "Kos Harian" },
  { value: "GUEST_HOUSE", label: "Guest House" },
  { value: "VILLA", label: "Villa" },
];

export function UnitListClient({
  units,
}: {
  units: Unit[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<ViewMode>("board");
  const [selectedUnit, setSelectedUnit] = useState<UnitBoardItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Calculate stats
  const stats = useMemo(() => ({
    total: units.length,
    available: units.filter((u) => u.status === "AVAILABLE").length,
    booked: units.filter((u) => u.status === "BOOKED").length,
    occupied: units.filter((u) => u.status === "OCCUPIED").length,
    maintenance: units.filter((u) => u.status === "MAINTENANCE").length,
  }), [units]);

  // Filter units
  const filteredUnits = useMemo(() => {
    return units.filter((unit) => {
      const matchesSearch =
        unit.unitNumber.toLowerCase().includes(search.toLowerCase()) ||
        (unit.name || unit.property.name).toLowerCase().includes(search.toLowerCase());
      const matchesStatus = filterStatus === "ALL" || unit.status === filterStatus;
      const matchesType = filterType === "ALL" || unit.type === filterType;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [units, search, filterStatus, filterType]);

  const handleUnitClick = (unit: UnitBoardItem) => {
    const fullUnit = units.find((u) => u.id === unit.id);
    if (fullUnit) {
      setSelectedUnit(fullUnit as unknown as UnitBoardItem);
      setIsDrawerOpen(true);
    }
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedUnit(null);
  };

  const resetFilters = () => {
    setSearch("");
    setFilterStatus("ALL");
    setFilterType("ALL");
  };

  // Switch to grid view when status filter is clicked
  const handleStatusFilterClick = (status: string) => {
    setFilterStatus(status);
    if (status !== "ALL") {
      setViewMode("grid");
    }
  };

  const hasActiveFilters = search || filterStatus !== "ALL" || filterType !== "ALL";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Unit & Kamar</h1>
          <p className="text-slate-500">
            {filteredUnits.length} unit ditemukan
          </p>
        </div>
        <Button
          onClick={() => router.push("/admin/unit/new")}
          className="bg-amber-500 hover:bg-amber-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Unit
        </Button>
      </div>

      {/* Stats Bar */}
      <UnitStatsBar
        stats={stats}
        currentFilter={filterStatus}
        onFilterClick={handleStatusFilterClick}
      />

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Cari unit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-10 h-11 bg-white"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>

        {/* Type Filter */}
        <Select value={filterType} onValueChange={(v) => v && setFilterType(v)}>
          <SelectTrigger className="w-full lg:w-44 h-11 bg-white">
            <SelectValue>
              {typeOptions.find((t) => t.value === filterType)?.label || "Tipe"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {typeOptions.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* View Toggle */}
        <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setViewMode("board")}
            className={cn(
              "p-2.5 transition-colors",
              viewMode === "board"
                ? "bg-amber-50 text-amber-600"
                : "text-slate-400 hover:text-slate-600"
            )}
            title="Board View"
          >
            <Kanban className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "p-2.5 transition-colors",
              viewMode === "grid"
                ? "bg-amber-50 text-amber-600"
                : "text-slate-400 hover:text-slate-600"
            )}
            title="Grid View"
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "p-2.5 transition-colors",
              viewMode === "list"
                ? "bg-amber-50 text-amber-600"
                : "text-slate-400 hover:text-slate-600"
            )}
            title="List View"
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Results */}
      {filteredUnits.length > 0 ? (
        <>
          {/* Board View */}
          {viewMode === "board" && (
            <div className="px-6">
              <UnitBoard
                units={filteredUnits as unknown as UnitBoardItem[]}
                onUnitClick={handleUnitClick}
              />
            </div>
          )}

          {/* Grid View */}
          {viewMode === "grid" && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredUnits.map((unit) => (
                <UnitCard key={unit.id} unit={unit} />
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === "list" && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Unit
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">
                      Properti
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">
                      Tipe
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Harga
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
                  {filteredUnits.map((unit) => (
                    <tr key={unit.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-medium text-slate-900">
                          {unit.name || unit.property.name}
                        </span>
                        <p className="text-xs text-slate-500">Unit {unit.unitNumber}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600 hidden md:table-cell">
                        {unit.property.name}
                      </td>
                      <td className="px-4 py-3 text-slate-600 hidden lg:table-cell">
                        {unit.type === "KOS_BULANAN"
                          ? "Kos Bulanan"
                          : unit.type === "KOS_HARIAN"
                          ? "Kos Harian"
                          : unit.type}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {unit.pricePerMonth
                          ? `Rp ${unit.pricePerMonth.toLocaleString("id-ID")}`
                          : unit.pricePerNight
                          ? `Rp ${unit.pricePerNight.toLocaleString("id-ID")}/malam`
                          : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            unit.status === "AVAILABLE"
                              ? "bg-green-100 text-green-800"
                              : unit.status === "BOOKED"
                              ? "bg-amber-100 text-amber-800"
                              : unit.status === "OCCUPIED"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {unit.status === "AVAILABLE"
                            ? "Tersedia"
                            : unit.status === "BOOKED"
                            ? "Dipesan"
                            : unit.status === "OCCUPIED"
                            ? "Terisi"
                            : "Maintenance"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleUnitClick(unit as unknown as UnitBoardItem)}
                          className="text-amber-600 hover:text-amber-700 text-sm font-medium"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200">
          <AdminEmptyState
            icon="units"
            title={
              hasActiveFilters
                ? `Tidak ada unit untuk filter tersebut`
                : "Belum ada unit"
            }
            description={
              hasActiveFilters
                ? "Coba ubah filter atau lihat semua unit"
                : "Mulai dengan menambahkan unit pertama Anda"
            }
            action={{
              label: hasActiveFilters ? "Reset Filter" : "Tambah Unit",
              onClick: hasActiveFilters ? resetFilters : () => router.push("/admin/unit/new"),
            }}
          />
        </div>
      )}

      {/* Unit Detail Drawer */}
      <UnitDetailDrawer
        unit={selectedUnit}
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
      />
    </div>
  );
}
