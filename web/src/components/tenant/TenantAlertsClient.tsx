"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bell, AlertTriangle, Calendar, CreditCard } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

interface TenantAlertsClientProps {
  alerts: NotificationItem[];
}

const notificationConfig: Record<string, {
  bg: string;
  border: string;
  icon: any;
  iconColor: string;
}> = {
  PAYMENT_REMINDER: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: CreditCard,
    iconColor: "text-amber-600",
  },
  PAYMENT_CONFIRMED: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: CreditCard,
    iconColor: "text-emerald-600",
  },
  OVERDUE_NOTICE: {
    bg: "bg-red-50",
    border: "border-red-200",
    icon: AlertTriangle,
    iconColor: "text-red-600",
  },
  CONTRACT_EXPIRING_TENANT: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: Calendar,
    iconColor: "text-amber-600",
  },
  CHECKIN_READY_TENANT: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: Calendar,
    iconColor: "text-emerald-600",
  },
  ACCOUNT_SETUP: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: Bell,
    iconColor: "text-blue-600",
  },
};

export function TenantAlertsClient({ alerts }: TenantAlertsClientProps) {
  const unreadCount = alerts.filter((a) => !a.isRead).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-4">
            <Link
              href="/tenant"
              className="p-2 -ml-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">Notifikasi</h1>
              {unreadCount > 0 && (
                <p className="text-sm text-slate-500">{unreadCount} belum dibaca</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 py-6 pb-24">
        {alerts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-lg font-medium text-slate-900 mb-2">Tidak ada notifikasi</h2>
            <p className="text-sm text-slate-500">
              Notifikasi akan muncul di sini ketika ada informasi penting
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((notification) => {
              const config = notificationConfig[notification.type] || {
                bg: "bg-slate-50",
                border: "border-slate-200",
                icon: Bell,
                iconColor: "text-slate-600",
              };
              const Icon = config.icon;

              return (
                <div
                  key={notification.id}
                  className={cn(
                    "rounded-xl border p-4 transition-all",
                    config.bg,
                    config.border,
                    !notification.isRead && "ring-2 ring-amber-200"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      notification.isRead ? "bg-white/50" : "bg-white"
                    )}>
                      <Icon className={cn("w-5 h-5", config.iconColor)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">
                        {notification.title}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-slate-400 mt-2">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                          locale: id,
                        })}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <span className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
