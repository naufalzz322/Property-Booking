"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bell, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

const notificationColors: Record<string, string> = {
  BOOKING_NEW: "border-blue-200 bg-blue-50",
  BOOKING_CONFIRMED: "border-indigo-200 bg-indigo-50",
  PAYMENT_RECEIVED: "border-purple-200 bg-purple-50",
  CHECKIN_READY: "border-emerald-200 bg-emerald-50",
  OVERDUE_OCCURRED: "border-red-200 bg-red-50",
  CONTRACT_EXPIRING: "border-orange-200 bg-orange-50",
  UNIT_MAINTENANCE: "border-amber-200 bg-amber-50",
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

export function AlertPanel({ notifications }: { notifications: Notification[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Bell className="w-4 h-4" />
          Notifikasi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {notifications.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">
            Tidak ada notifikasi baru
          </p>
        ) : (
          notifications.map((notif) => (
            <Alert
              key={notif.id}
              className={notificationColors[notif.type] || "border-slate-200 bg-slate-50"}
            >
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="text-sm font-medium">
                {notif.title}
              </AlertTitle>
              <AlertDescription className="text-xs mt-1">
                {notif.message}
              </AlertDescription>
            </Alert>
          ))
        )}
        {notifications.length > 0 && (
          <Link
            href="/admin/notification"
            className="block text-center text-sm text-amber-600 hover:text-amber-700 pt-2"
          >
            Lihat semua notifikasi →
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
