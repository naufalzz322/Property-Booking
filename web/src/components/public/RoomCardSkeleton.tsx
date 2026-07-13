"use client";

import { cn } from "@/lib/utils";

interface RoomCardSkeletonProps {
  className?: string;
}

export function RoomCardSkeleton({ className }: RoomCardSkeletonProps) {
  return (
    <div className={cn("bg-white rounded-xl overflow-hidden shadow-sm animate-pulse", className)}>
      {/* Image placeholder */}
      <div className="aspect-[4/3] bg-stone-200" />

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex justify-between">
          <div className="h-4 w-20 bg-stone-200 rounded" />
          <div className="h-4 w-16 bg-stone-200 rounded" />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <div className="h-4 w-full bg-stone-200 rounded" />
          <div className="h-4 w-3/4 bg-stone-200 rounded" />
        </div>

        {/* Facilities */}
        <div className="flex gap-2">
          <div className="h-6 w-16 bg-stone-200 rounded-full" />
          <div className="h-6 w-16 bg-stone-200 rounded-full" />
          <div className="h-6 w-16 bg-stone-200 rounded-full" />
        </div>

        {/* Price */}
        <div className="pt-2">
          <div className="h-8 w-28 bg-stone-200 rounded" />
        </div>
      </div>
    </div>
  );
}

interface RoomGridSkeletonProps {
  count?: number;
  className?: string;
}

export function RoomGridSkeleton({ count = 3, className }: RoomGridSkeletonProps) {
  return (
    <div className={cn("grid md:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <RoomCardSkeleton key={i} />
      ))}
    </div>
  );
}
