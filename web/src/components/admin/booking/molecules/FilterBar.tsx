"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BOOKING_STATUS_OPTIONS } from "@/lib/filterOptions";

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filterStatus: string;
  onStatusChange: (value: string) => void;
  onClearFilters: () => void;
  placeholder?: string;
}

export function FilterBar({
  search,
  onSearchChange,
  filterStatus,
  onStatusChange,
  onClearFilters,
  placeholder = "Cari nama, telepon, atau nomor booking...",
}: FilterBarProps) {
  const hasFilters = search !== "" || filterStatus !== "ALL";

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10 h-10 bg-white border-slate-200 rounded-lg focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
        />
        {search && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center transition-colors"
          >
            <X className="w-3 h-3 text-slate-500" />
          </button>
        )}
      </div>

      {/* Status Filter */}
      <Select value={filterStatus} onValueChange={(v) => v && onStatusChange(v)}>
        <SelectTrigger className="w-full sm:w-44 h-10 bg-white border-slate-200 rounded-lg">
          <SelectValue>
            {BOOKING_STATUS_OPTIONS.find((o) => o.value === filterStatus)?.label || "Status"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {BOOKING_STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="h-10 px-3 text-slate-500 hover:text-slate-700 hover:bg-slate-100"
        >
          Clear
        </Button>
      )}
    </div>
  );
}
