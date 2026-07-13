"use client";

import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DueDateCountdownProps {
  dueDate: Date;
  status: string;
}

export function DueDateCountdown({ dueDate, status }: DueDateCountdownProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const daysDiff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const isOverdue = status === "OVERDUE" || daysDiff < 0;
  const isPaid = status === "PAID";

  if (isPaid) {
    return (
      <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200 text-center">
        <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <CheckCircle className="w-7 h-7 text-emerald-600" />
        </div>
        <p className="font-semibold text-emerald-800">Pembayaran Lunas</p>
        <p className="text-sm text-emerald-600 mt-1">
          Terima kasih atas pembayaran Anda
        </p>
      </div>
    );
  }

  if (isOverdue) {
    return (
      <div className="bg-red-50 rounded-2xl p-5 border border-red-200 text-center">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-7 h-7 text-red-600" />
        </div>
        <p className="text-4xl font-bold text-red-600">{Math.abs(daysDiff)}</p>
        <p className="text-sm text-red-600 mt-1">hari lewat jatuh tempo</p>
        <p className="text-xs text-red-500 mt-2">
          Jatuh tempo: {format(new Date(dueDate), "dd MMMM yyyy", { locale: id })}
        </p>
      </div>
    );
  }

  // Upcoming due date
  const urgencyClass = daysDiff <= 3 ? "bg-amber-50 border-amber-200 text-amber-800" :
                        daysDiff <= 7 ? "bg-orange-50 border-orange-200 text-orange-800" :
                        "bg-blue-50 border-blue-200 text-blue-800";
  const iconClass = daysDiff <= 3 ? "text-amber-600" :
                    daysDiff <= 7 ? "text-orange-600" :
                    "text-blue-600";
  const iconBgClass = daysDiff <= 3 ? "bg-amber-100" :
                      daysDiff <= 7 ? "bg-orange-100" :
                      "bg-blue-100";

  return (
    <div className={cn("rounded-2xl p-5 border text-center", urgencyClass)}>
      <div className={cn("w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3", iconBgClass)}>
        <Clock className={cn("w-7 h-7", iconClass)} />
      </div>
      <p className="text-4xl font-bold">{daysDiff}</p>
      <p className="text-sm mt-1">
        {daysDiff === 0 ? "Jatuh tempo hari ini!" : "hari lagi"}
      </p>
      <p className="text-xs mt-2 opacity-70">
        Jatuh tempo: {format(new Date(dueDate), "dd MMMM yyyy", { locale: id })}
      </p>
    </div>
  );
}
