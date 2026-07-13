import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { HTMLAttributes } from "react";

interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: { value: number; positive: boolean };
  variant?: "default" | "compact";
  valueColor?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  variant = "default",
  valueColor = "text-slate-900",
  className,
  ...props
}: StatCardProps) {
  if (variant === "compact") {
    return (
      <div
        className={cn(
          "bg-white rounded-xl p-4 border border-slate-100 shadow-sm",
          className
        )}
        {...props}
      >
        <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
        <p className={cn("text-xl font-bold mt-1", valueColor)}>{value}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-white rounded-2xl p-5 border border-slate-100 shadow-sm",
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className={cn("text-2xl font-bold mt-1", valueColor)}>{value}</p>
          {trend && (
            <p
              className={cn(
                "text-xs mt-1",
                trend.positive ? "text-emerald-600" : "text-red-600"
              )}
            >
              {trend.positive ? "↑" : "↓"} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <Icon className="w-5 h-5 text-amber-600" />
          </div>
        )}
      </div>
    </div>
  );
}
