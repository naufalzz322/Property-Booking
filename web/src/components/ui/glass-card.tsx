import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "gradient" | "outline";
  gradientColors?: { from: string; to: string };
}

export function GlassCard({
  children,
  className,
  variant = "default",
  gradientColors = { from: "amber-500", to: "orange-500" },
  ...props
}: GlassCardProps) {
  if (variant === "gradient") {
    return (
      <div
        className={cn(
          "rounded-2xl p-5 bg-gradient-to-br shadow-lg",
          gradientColors.from,
          gradientColors.to,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }

  if (variant === "outline") {
    return (
      <div
        className={cn(
          "rounded-2xl border border-slate-200 bg-white shadow-sm",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl bg-white shadow-md border border-slate-100",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
