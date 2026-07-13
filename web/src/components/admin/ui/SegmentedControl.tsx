"use client";

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface SegmentedControlProps {
  options: {
    value: string;
    label: string;
    icon?: LucideIcon;
  }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SegmentedControl({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps) {
  const activeIndex = options.findIndex((opt) => opt.value === value);

  return (
    <div
      className={cn(
        "relative inline-flex items-center bg-slate-100 rounded-xl p-1",
        className
      )}
    >
      {/* Animated background indicator */}
      <div
        className="absolute top-1 bottom-1 bg-white rounded-lg shadow-sm transition-all duration-200 ease-out"
        style={{
          left: `${activeIndex * 50}%`,
          width: "calc(50% - 2px)",
        }}
      />

      {options.map((option) => {
        const Icon = option.icon;
        const isActive = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "relative z-10 flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
              isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
            )}
          >
            {Icon && <Icon className="w-4 h-4" />}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
