"use client";

import { cn } from "@/lib/utils";

interface TrendBadgeProps {
  value: number; // percentage change
  className?: string;
}

export function TrendBadge({ value, className }: TrendBadgeProps) {
  const isPositive = value >= 0;
  const isNeutral = value === 0;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-xs font-medium",
        isNeutral
          ? "bg-slate-100 text-slate-600"
          : isPositive
          ? "bg-emerald-100 text-emerald-700"
          : "bg-red-100 text-red-700",
        className
      )}
    >
      <svg
        className={cn("w-3 h-3", !isPositive && "rotate-180")}
        viewBox="0 0 12 12"
        fill="none"
      >
        <path
          d="M6 2L10 6L8 6L8 10L4 10L4 6L2 6L6 2Z"
          fill="currentColor"
        />
      </svg>
      {isPositive ? "+" : ""}
      {value.toFixed(1)}%
    </span>
  );
}
