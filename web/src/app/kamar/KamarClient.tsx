"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Home, Search, X, LayoutGrid, List, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { NoRoomsAvailable } from "@/components/public/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Unit {
  id: string;
  unitNumber: string;
  name: string;
  type: string;
  slug: string;
  pricePerMonth: number | null;
  pricePerNight: number | null;
  facilities: string[];
  photos: string[];
  description: string | null;
  status: string;
  property: { name: string };
}

interface KamarClientProps {
  units: Unit[];
  availableCount: number;
  propertyName?: string;
}

const typeLabels: Record<string, string> = {
  KOS_BULANAN: "Kos Bulanan",
  KOS_HARIAN: "Kos Harian",
  GUEST_HOUSE: "Guest House",
  VILLA: "Villa",
};

const statusLabels: Record<string, { label: string; class: string; textColor: string }> = {
  AVAILABLE: { label: "Tersedia", class: "bg-green-600/90", textColor: "text-green-600" },
  BOOKED: { label: "Dipesan", class: "bg-amber-500/90", textColor: "text-amber-600" },
  OCCUPIED: { label: "Terisi", class: "bg-red-500/90", textColor: "text-red-600" },
  MAINTENANCE: { label: "Perbaikan", class: "bg-gray-500/90", textColor: "text-gray-600" },
};

const typeFilters = [
  { key: "ALL", label: "Semua" },
  { key: "KOS_BULANAN", label: "Kos Bulanan" },
  { key: "KOS_HARIAN", label: "Kos Harian" },
  { key: "GUEST_HOUSE", label: "Guest House" },
  { key: "VILLA", label: "Villa" },
];

const statusFilters = [
  { key: "ALL", label: "Semua" },
  { key: "AVAILABLE", label: "Tersedia" },
  { key: "BOOKED", label: "Dipesan" },
  { key: "OCCUPIED", label: "Terisi" },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function UnitCardGrid({ unit }: { unit: Unit }) {
  const status = statusLabels[unit.status] || statusLabels.AVAILABLE;

  return (
    <Link
      href={`/kamar/${unit.slug}`}
      className={cn(
        "bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200",
        unit.status !== "AVAILABLE" && "opacity-80"
      )}
    >
      <div className="relative aspect-[4/3] bg-stone-200">
        {unit.photos && unit.photos.length > 0 ? (
          <img
            src={unit.photos[0]}
            alt={`Kamar ${unit.unitNumber}`}
            className={cn(
              "w-full h-full object-cover",
              unit.status !== "AVAILABLE" && "grayscale-[30%]"
            )}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Home className="w-16 h-16 text-stone-400" />
          </div>
        )}
        <span className={cn(
          "absolute top-3 right-3 px-2 py-1 backdrop-blur-sm text-white text-xs font-medium rounded-full shadow-lg",
          status.class
        )}>
          {status.label}
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-stone-500">
            {typeLabels[unit.type] || unit.type}
          </span>
          <span className="text-xs font-medium text-stone-400">
            {unit.property?.name}
          </span>
        </div>
        <h3 className="font-semibold text-stone-900 mb-1">{unit.name}</h3>
        <span className="text-xs text-stone-400">Unit {unit.unitNumber}</span>

        <p className="text-sm text-stone-600 line-clamp-2 mt-3 mb-3">
          {unit.description}
        </p>

        <div className="flex flex-wrap gap-1 mb-4">
          {unit.facilities.slice(0, 3).map((facility, i) => (
            <span
              key={i}
              className="px-2 py-0.5 bg-stone-100 text-stone-600 text-xs rounded-full"
            >
              {facility}
            </span>
          ))}
          {unit.facilities.length > 3 && (
            <span className="px-2 py-0.5 bg-stone-100 text-stone-500 text-xs rounded-full">
              +{unit.facilities.length - 3}
            </span>
          )}
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-xl font-bold text-amber-600">
              {formatCurrency(unit.pricePerMonth || unit.pricePerNight || 0)}
            </p>
            <p className="text-xs text-stone-500">
              /{unit.type === "KOS_BULANAN" ? "bulan" : "malam"}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

function UnitCardList({ unit }: { unit: Unit }) {
  const status = statusLabels[unit.status] || statusLabels.AVAILABLE;

  return (
    <Link
      href={`/kamar/${unit.slug}`}
      className={cn(
        "bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 flex",
        unit.status !== "AVAILABLE" && "opacity-80"
      )}
    >
      <div className="relative w-48 h-32 sm:h-auto sm:w-64 flex-shrink-0 bg-stone-200">
        {unit.photos && unit.photos.length > 0 ? (
          <img
            src={unit.photos[0]}
            alt={`Kamar ${unit.unitNumber}`}
            className={cn(
              "w-full h-full object-cover",
              unit.status !== "AVAILABLE" && "grayscale-[30%]"
            )}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Home className="w-12 h-12 text-stone-400" />
          </div>
        )}
        <span className={cn(
          "absolute top-2 left-2 px-2 py-0.5 backdrop-blur-sm text-white text-xs font-medium rounded-full shadow",
          status.class
        )}>
          {status.label}
        </span>
      </div>

      <div className="flex-1 p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-stone-500">
              {typeLabels[unit.type] || unit.type}
            </span>
            <span className="text-xs font-medium text-stone-400">
              {unit.property?.name}
            </span>
          </div>
          <h3 className="font-semibold text-stone-900 mb-1">{unit.name}</h3>
          <span className="text-xs text-stone-400">Unit {unit.unitNumber}</span>

          <p className="text-sm text-stone-600 line-clamp-1 mt-2 mb-2">
            {unit.description}
          </p>

          <div className="flex flex-wrap gap-1">
            {unit.facilities.slice(0, 5).map((facility, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-stone-100 text-stone-600 text-xs rounded-full"
              >
                {facility}
              </span>
            ))}
            {unit.facilities.length > 5 && (
              <span className="px-2 py-0.5 bg-stone-100 text-stone-500 text-xs rounded-full">
                +{unit.facilities.length - 5}
              </span>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="text-lg font-bold text-amber-600">
              {formatCurrency(unit.pricePerMonth || unit.pricePerNight || 0)}
            </p>
            <p className="text-xs text-stone-500">
              /{unit.type === "KOS_BULANAN" ? "bulan" : "malam"}
            </p>
          </div>
          <Button size="sm" className="bg-amber-500 hover:bg-amber-600">
            Lihat Detail
          </Button>
        </div>
      </div>
    </Link>
  );
}

export function KamarClient({ units, availableCount, propertyName = "Graha Maju" }: KamarClientProps) {
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  const filteredUnits = useMemo(() => {
    let filtered = units;

    // Type filter
    if (typeFilter !== "ALL") {
      filtered = filtered.filter((u) => u.type === typeFilter);
    }

    // Status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((u) => u.status === statusFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.unitNumber.toLowerCase().includes(query) ||
          u.description?.toLowerCase().includes(query) ||
          u.facilities.some((f) => f.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [units, typeFilter, statusFilter, searchQuery]);

  const filteredAvailableCount = filteredUnits.filter((u) => u.status === "AVAILABLE").length;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-stone-900">{propertyName}</span>
            </Link>
            <nav className="flex items-center gap-4" />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-stone-900">Kamar & Unit</h1>
          <p className="mt-2 text-stone-500">
            {filteredAvailableCount > 0 ? (
              <>
                <span className="font-semibold text-green-600">{filteredAvailableCount}</span> kamar tersedia
                {filteredUnits.length !== units.length && ` dari ${units.length} unit`}
              </>
            ) : (
              `${filteredUnits.length} unit ditemukan`
            )}
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <Input
                type="text"
                placeholder="Cari kamar, fasilitas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-stone-100 rounded-full"
                >
                  <X className="w-4 h-4 text-stone-400" />
                </button>
              )}
            </div>

            {/* Filter Toggle (Mobile) */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden gap-2"
            >
              <Filter className="w-4 h-4" />
              Filter
            </Button>

            {/* View Toggle */}
            <div className="flex gap-1 bg-stone-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  viewMode === "grid"
                    ? "bg-white shadow-sm text-amber-600"
                    : "text-stone-500 hover:text-stone-700"
                )}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  viewMode === "list"
                    ? "bg-white shadow-sm text-amber-600"
                    : "text-stone-500 hover:text-stone-700"
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Chips */}
          <div className={cn("mt-4", !showFilters && "hidden sm:block")}>
            {/* Type Filters */}
            <div className="mb-4">
              <p className="text-xs font-medium text-stone-500 mb-2">Tipe</p>
              <div className="flex flex-wrap gap-2">
                {typeFilters.map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setTypeFilter(filter.key)}
                    className={cn(
                      "px-3 py-1.5 text-sm font-medium rounded-full transition-colors",
                      typeFilter === filter.key
                        ? "bg-amber-500 text-white"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    )}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filters */}
            <div>
              <p className="text-xs font-medium text-stone-500 mb-2">Status</p>
              <div className="flex flex-wrap gap-2">
                {statusFilters.map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setStatusFilter(filter.key)}
                    className={cn(
                      "px-3 py-1.5 text-sm font-medium rounded-full transition-colors flex items-center gap-1.5",
                      statusFilter === filter.key
                        ? "bg-amber-500 text-white"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    )}
                  >
                    {filter.key !== "ALL" && (
                      <span
                        className={cn(
                          "w-2 h-2 rounded-full",
                          filter.key === "AVAILABLE" && "bg-green-500",
                          filter.key === "BOOKED" && "bg-amber-500",
                          filter.key === "OCCUPIED" && "bg-red-500",
                          filter.key === "MAINTENANCE" && "bg-gray-500",
                          statusFilter === filter.key ? "bg-white/50" : ""
                        )}
                      />
                    )}
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {(typeFilter !== "ALL" || statusFilter !== "ALL" || searchQuery) && (
              <button
                onClick={() => {
                  setTypeFilter("ALL");
                  setStatusFilter("ALL");
                  setSearchQuery("");
                }}
                className="mt-4 text-sm text-amber-600 hover:text-amber-700 font-medium"
              >
                Reset semua filter
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        {filteredUnits.length > 0 ? (
          <>
            {viewMode === "grid" ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUnits.map((unit) => (
                  <UnitCardGrid key={unit.id} unit={unit} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUnits.map((unit) => (
                  <UnitCardList key={unit.id} unit={unit} />
                ))}
              </div>
            )}
          </>
        ) : (
          <NoRoomsAvailable />
        )}
      </div>
    </div>
  );
}
