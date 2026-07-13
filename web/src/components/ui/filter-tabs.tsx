"use client";

import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface FilterTabsProps extends HTMLAttributes<HTMLDivElement> {
  tabs: { value: string; label: string; count?: number }[];
  activeTab: string;
  onTabChange: (value: string) => void;
}

export function FilterTabs({
  tabs,
  activeTab,
  onTabChange,
  className,
  ...props
}: FilterTabsProps) {
  return (
    <div
      className={cn(
        "flex gap-2 p-1 bg-slate-100 rounded-xl",
        className
      )}
      {...props}
    >
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onTabChange(tab.value)}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
            activeTab === tab.value
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          )}
        >
          <span>{tab.label}</span>
          {tab.count !== undefined && (
            <span
              className={cn(
                "px-1.5 py-0.5 rounded-full text-xs",
                activeTab === tab.value
                  ? "bg-amber-100 text-amber-700"
                  : "bg-slate-200 text-slate-600"
              )}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
