import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface LoadingSkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "card" | "avatar" | "button" | "line";
  width?: string;
  height?: string;
}

export function LoadingSkeleton({
  variant = "text",
  width,
  height,
  className,
  ...props
}: LoadingSkeletonProps) {
  const baseClass = "animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%]";

  const variants = {
    text: "h-4 rounded",
    card: "h-32 rounded-2xl",
    avatar: "w-12 h-12 rounded-full",
    button: "h-10 rounded-xl",
    line: "h-3 rounded",
  };

  return (
    <div
      className={cn(baseClass, variants[variant], className)}
      style={{
        width: width,
        height: height,
      }}
      {...props}
    />
  );
}

// Convenience component for dashboard skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <LoadingSkeleton variant="text" width="120px" className="mb-2" />
          <LoadingSkeleton variant="line" width="180px" />
        </div>
        <LoadingSkeleton variant="avatar" />
      </div>

      {/* Hero card skeleton */}
      <LoadingSkeleton variant="card" height="180px" />

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 gap-4">
        <LoadingSkeleton variant="card" height="80px" />
        <LoadingSkeleton variant="card" height="80px" />
      </div>

      {/* Quick actions skeleton */}
      <div className="grid grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <LoadingSkeleton key={i} variant="card" height="90px" />
        ))}
      </div>

      {/* List skeleton */}
      <div className="space-y-3">
        <LoadingSkeleton variant="text" width="100px" className="mb-2" />
        {[1, 2, 3].map((i) => (
          <LoadingSkeleton key={i} variant="card" height="70px" />
        ))}
      </div>
    </div>
  );
}

// Invoice list skeleton
export function InvoiceListSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {/* Filter tabs skeleton */}
      <div className="flex gap-2">
        <LoadingSkeleton variant="button" width="80px" />
        <LoadingSkeleton variant="button" width="80px" />
        <LoadingSkeleton variant="button" width="80px" />
      </div>

      {/* Summary skeleton */}
      <LoadingSkeleton variant="card" height="60px" />

      {/* Invoice list skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <LoadingSkeleton key={i} variant="card" height="80px" />
        ))}
      </div>
    </div>
  );
}
