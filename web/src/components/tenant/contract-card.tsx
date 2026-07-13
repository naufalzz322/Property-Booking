"use client";

import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContractCardProps {
  contractStart: Date;
  contractEnd: Date | null;
}

export function ContractCard({ contractStart, contractEnd }: ContractCardProps) {
  const start = new Date(contractStart);
  const end = contractEnd ? new Date(contractEnd) : null;

  // Calculate progress
  let progress = 100;
  let daysRemaining: number | null = null;
  let isExpiringSoon = false;

  if (end) {
    const today = new Date();
    const totalDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    const elapsedDays = (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    progress = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));
    daysRemaining = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    isExpiringSoon = daysRemaining <= 30 && daysRemaining > 0;
  }

  return (
    <div className={cn(
      "bg-white rounded-2xl border p-5",
      isExpiringSoon ? "border-amber-200 bg-amber-50/30" : "border-slate-200"
    )}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900">Kontrak Sewa</h3>
        {isExpiringSoon && (
          <div className="flex items-center gap-1 text-amber-600">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs font-medium">Akan Berakhir</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* Date Range */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <Calendar className="w-4 h-4" />
            <span>Periode Kontrak</span>
          </div>
          <span className="font-medium text-slate-900">
            {format(start, "dd MMM yyyy", { locale: id })}
            {end && ` - ${format(end, "dd MMM yyyy", { locale: id })}`}
          </span>
        </div>

        {/* Progress Bar */}
        {end && (
          <>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-500">
                <span>{Math.round(progress)}% Terlewat</span>
                <span>{Math.round(100 - progress)}% Tersisa</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    progress >= 90 ? "bg-red-500" :
                    progress >= 75 ? "bg-amber-500" :
                    "bg-emerald-500"
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Days Remaining */}
            <div className="text-center pt-2">
              {daysRemaining !== null && daysRemaining > 0 && (
                <p className={cn(
                  "text-2xl font-bold",
                  isExpiringSoon ? "text-amber-600" : "text-slate-900"
                )}>
                  {daysRemaining}
                </p>
              )}
              <p className={cn(
                "text-xs",
                isExpiringSoon ? "text-amber-600" : "text-slate-500"
              )}>
                {daysRemaining !== null && daysRemaining > 0
                  ? "hari tersisa"
                  : daysRemaining === 0
                  ? "Berakhir hari ini"
                  : "Kontrak telah berakhir"}
              </p>
            </div>
          </>
        )}

        {!end && (
          <div className="text-center py-4">
            <p className="text-2xl font-bold text-emerald-600">∞</p>
            <p className="text-xs text-slate-500">Tanpa Batas Waktu</p>
          </div>
        )}
      </div>
    </div>
  );
}
