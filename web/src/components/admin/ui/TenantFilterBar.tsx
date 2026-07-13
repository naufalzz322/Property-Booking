"use client";

import { Search, X, LayoutGrid, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SegmentedControl } from "./SegmentedControl";
import { TENANT_STATUS_OPTIONS } from "@/lib/filterOptions";
import { cn } from "@/lib/utils";

interface TenantFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  resultCount: number;
  className?: string;
}

export function TenantFilterBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  viewMode,
  onViewModeChange,
  resultCount,
  className,
}: TenantFilterBarProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row gap-3", className)}>
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Cari nama, email, atau telepon..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10 h-11 bg-white rounded-xl border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
        />
        {search && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        )}
      </div>

      {/* Status Filter */}
      <Select value={statusFilter} onValueChange={(v) => v && onStatusChange(v)}>
        <SelectTrigger className="w-full sm:w-44 h-11 bg-white rounded-xl border-slate-200">
          <SelectValue>
            {TENANT_STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label || "Status"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {TENANT_STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* View Toggle */}
      <SegmentedControl
        options={[
          { value: "grid", label: "Grid", icon: LayoutGrid },
          { value: "list", label: "List", icon: List },
        ]}
        value={viewMode}
        onChange={(v) => onViewModeChange(v as "grid" | "list")}
        className="w-full sm:w-auto"
      />
    </div>
  );
}
