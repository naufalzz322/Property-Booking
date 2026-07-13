"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Bell, X, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

interface Alert {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: Date;
}

interface NotificationPanelProps {
  className?: string;
}

export function NotificationPanel({ className }: NotificationPanelProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tenant/notifications");
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.notifications || []);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAllAsRead = async () => {
    try {
      await fetch("/api/tenant/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      fetchAlerts();
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  // Fetch on mount and periodically
  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = alerts.length;
  const hasUnread = unreadCount > 0;

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "PAYMENT_REMINDER":
      case "PAYMENT_CONFIRMED":
        return "💳";
      case "CONTRACT_EXPIRING_TENANT":
        return "📄";
      case "CHECKIN_READY_TENANT":
        return "🏠";
      case "ACCOUNT_SETUP":
        return "👤";
      case "OVERDUE_NOTICE":
        return "⚠️";
      default:
        return "🔔";
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case "OVERDUE_NOTICE":
        return "bg-red-50 border-red-200";
      case "PAYMENT_REMINDER":
        return "bg-amber-50 border-amber-200";
      case "CONTRACT_EXPIRING_TENANT":
        return "bg-orange-50 border-orange-200";
      case "PAYMENT_CONFIRMED":
        return "bg-emerald-50 border-emerald-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  return (
    <div ref={panelRef} className={cn("relative", className)}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchAlerts();
        }}
        className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {hasUnread && (
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50">
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">Notifikasi</h3>
            <div className="flex items-center gap-2">
              {hasUnread && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700"
                >
                  <CheckCheck className="w-3 h-3" />
                  Tandai dibaca
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-slate-100 rounded transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-sm text-slate-500">
                Memuat...
              </div>
            ) : alerts.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-500">
                Tidak ada notifikasi baru
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    "p-4 border-b border-slate-50 transition-colors",
                    getAlertColor(alert.type)
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg">{getAlertIcon(alert.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">{alert.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{alert.message}</p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {formatDistanceToNow(new Date(alert.createdAt), {
                          addSuffix: true,
                          locale: id,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {alerts.length > 0 && (
            <div className="p-3 text-center border-t border-slate-100">
              <p className="text-xs text-slate-500">
                {unreadCount} notifikasi baru
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
