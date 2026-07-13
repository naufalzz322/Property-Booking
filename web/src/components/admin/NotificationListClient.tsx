"use client";

import { useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Bell, Check, CheckCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  entityId: string;
  entityType: string;
  createdAt: Date;
}

const notificationIcons: Record<string, { bg: string; text: string; icon: string }> = {
  BOOKING_NEW: { bg: "bg-blue-100", text: "text-blue-600", icon: "📋" },
  BOOKING_CONFIRMED: { bg: "bg-indigo-100", text: "text-indigo-600", icon: "✅" },
  PAYMENT_RECEIVED: { bg: "bg-purple-100", text: "text-purple-600", icon: "💳" },
  CHECKIN_READY: { bg: "bg-emerald-100", text: "text-emerald-600", icon: "🏠" },
  OVERDUE_OCCURRED: { bg: "bg-red-100", text: "text-red-600", icon: "⚠️" },
  CONTRACT_EXPIRING: { bg: "bg-orange-100", text: "text-orange-600", icon: "📄" },
  UNIT_MAINTENANCE: { bg: "bg-amber-100", text: "text-amber-600", icon: "🔧" },
};

const typeLabels: Record<string, string> = {
  BOOKING_NEW: "Booking Baru",
  BOOKING_CONFIRMED: "Booking Dikonfirmasi",
  PAYMENT_RECEIVED: "Menunggu Pembayaran",
  CHECKIN_READY: "Siap Check-in",
  OVERDUE_OCCURRED: "Tagihan Overdue",
  CONTRACT_EXPIRING: "Kontrak Akan Berakhir",
  UNIT_MAINTENANCE: "Unit Perbaikan",
};

const typeColors: Record<string, string> = {
  BOOKING_NEW: "bg-blue-50 border-blue-200",
  BOOKING_CONFIRMED: "bg-indigo-50 border-indigo-200",
  PAYMENT_RECEIVED: "bg-purple-50 border-purple-200",
  CHECKIN_READY: "bg-emerald-50 border-emerald-200",
  OVERDUE_OCCURRED: "bg-red-50 border-red-200",
  CONTRACT_EXPIRING: "bg-orange-50 border-orange-200",
  UNIT_MAINTENANCE: "bg-amber-50 border-amber-200",
};

export function NotificationListClient({ notifications }: { notifications: Notification[] }) {
  const [items, setItems] = useState(notifications);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const unreadCount = items.filter((n) => !n.isRead).length;

  const markAsRead = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
      if (res.ok) {
        setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      }
    } catch (error) {
      console.error("Failed to mark as read:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    setMarkingAll(true);
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      if (res.ok) {
        setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifikasi</h1>
          <p className="text-slate-500">
            {unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca` : "Semua notifikasi sudah dibaca"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            disabled={markingAll}
            className="gap-2"
          >
            {markingAll ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCheck className="w-4 h-4" />
            )}
            Tandai semua dibaca
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="mt-4 text-slate-500">Tidak ada notifikasi</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((notif) => {
            const style = notificationIcons[notif.type] || { bg: "bg-slate-100", text: "text-slate-600", icon: "🔔" };
            const borderColor = typeColors[notif.type] || "border-slate-200";

            return (
              <Card
                key={notif.id}
                className={cn(
                  "border-l-4 transition-all",
                  borderColor,
                  !notif.isRead && "border-l-4"
                )}
              >
                <CardContent className="flex items-start justify-between py-4">
                  <div className="flex items-start gap-4">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-lg", style.bg)}>
                      {style.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {notif.title}
                        </Badge>
                        {!notif.isRead && (
                          <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                        )}
                      </div>
                      <p className="mt-1 text-sm text-slate-700">{notif.message}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {format(new Date(notif.createdAt), "dd MMM yyyy, HH:mm", { locale: id })}
                      </p>
                    </div>
                  </div>
                  {!notif.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsRead(notif.id)}
                      disabled={loading}
                      className="gap-1 text-slate-500 hover:text-slate-700"
                    >
                      <Check className="w-4 h-4" />
                      <span className="text-xs">Tandai dibaca</span>
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
