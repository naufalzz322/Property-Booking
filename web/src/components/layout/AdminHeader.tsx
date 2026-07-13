"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Menu,
  Search,
  Building2,
  X,
  ChevronRight,
  Home,
  FileText,
  Users,
  Receipt,
  DoorOpen,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AdminSidebar } from "./AdminSidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
}

// Page metadata for breadcrumbs
const pageMeta: Record<string, { title: string; breadcrumb: string[] }> = {
  "/admin/dashboard": { title: "Dashboard", breadcrumb: ["Admin", "Dashboard"] },
  "/admin/booking": {
    title: "Booking",
    breadcrumb: ["Admin", "Operasional", "Booking"],
  },
  "/admin/tenant": {
    title: "Tenant",
    breadcrumb: ["Admin", "Operasional", "Tenant"],
  },
  "/admin/invoice": {
    title: "Tagihan",
    breadcrumb: ["Admin", "Operasional", "Tagihan"],
  },
  "/admin/unit": {
    title: "Unit & Kamar",
    breadcrumb: ["Admin", "Manajemen", "Unit"],
  },
  "/admin/notification": {
    title: "Notifikasi",
    breadcrumb: ["Admin", "Notifikasi"],
  },
  "/admin/settings": {
    title: "Pengaturan",
    breadcrumb: ["Admin", "Pengaturan"],
  },
};

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

  if (diff < 60) return "Baru saja";
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  return `${Math.floor(diff / 86400)} hari lalu`;
}

interface SearchResultItemProps {
  item: {
    id: string;
    type: string;
    title: string;
    subtitle: string;
    status: string;
    href: string;
  };
  onClick: () => void;
}

function SearchResultItem({ item, onClick }: SearchResultItemProps) {
  const getStatusColor = (status: string, type: string) => {
    if (type === "booking") {
      switch (status) {
        case "PENDING": return "bg-amber-100 text-amber-700";
        case "CONFIRMED": return "bg-blue-100 text-blue-700";
        case "WAITING_PAYMENT": return "bg-purple-100 text-purple-700";
        case "PAID": return "bg-emerald-100 text-emerald-700";
        case "CHECKED_IN": return "bg-green-100 text-green-700";
        case "CHECKOUT": return "bg-slate-100 text-slate-600";
        case "REJECTED": return "bg-red-100 text-red-700";
        case "CANCELLED": return "bg-gray-100 text-gray-600";
        default: return "bg-slate-100 text-slate-600";
      }
    }
    if (type === "invoice") {
      switch (status) {
        case "UNPAID": return "bg-amber-100 text-amber-700";
        case "PAID": return "bg-emerald-100 text-emerald-700";
        case "OVERDUE": return "bg-red-100 text-red-700";
        default: return "bg-slate-100 text-slate-600";
      }
    }
    if (type === "tenant") {
      return status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600";
    }
    if (type === "unit") {
      switch (status) {
        case "AVAILABLE": return "bg-emerald-100 text-emerald-700";
        case "BOOKED": return "bg-blue-100 text-blue-700";
        case "OCCUPIED": return "bg-purple-100 text-purple-700";
        case "MAINTENANCE": return "bg-amber-100 text-amber-700";
        default: return "bg-slate-100 text-slate-600";
      }
    }
    return "bg-slate-100 text-slate-600";
  };

  const getStatusLabel = (status: string, type: string) => {
    if (type === "booking") {
      const labels: Record<string, string> = {
        PENDING: "Pending",
        CONFIRMED: "Confirmed",
        WAITING_PAYMENT: "Menunggu Bayar",
        PAID: "Lunas",
        CHECKED_IN: "Aktif",
        CHECKOUT: "Selesai",
        REJECTED: "Ditolak",
        CANCELLED: "Batal",
      };
      return labels[status] || status;
    }
    if (type === "invoice") {
      const labels: Record<string, string> = {
        UNPAID: "Belum Bayar",
        PAID: "Lunas",
        OVERDUE: "Overdue",
      };
      return labels[status] || status;
    }
    if (type === "tenant") {
      return status === "active" ? "Aktif" : "Nonaktif";
    }
    if (type === "unit") {
      const labels: Record<string, string> = {
        AVAILABLE: "Tersedia",
        BOOKED: "Dipesan",
        OCCUPIED: "Terisi",
        MAINTENANCE: "Perbaikan",
      };
      return labels[status] || status;
    }
    return status;
  };

  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-50 last:border-0"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 truncate">{item.title}</p>
        <p className="text-xs text-slate-500 truncate">{item.subtitle}</p>
      </div>
      <div className="flex items-center gap-2 ml-3">
        <span className={cn("text-[10px] font-medium px-2 py-1 rounded-full", getStatusColor(item.status, item.type))}>
          {getStatusLabel(item.status, item.type)}
        </span>
        <ArrowRight className="w-4 h-4 text-slate-300" />
      </div>
    </div>
  );
}

export function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Search function
  const performSearch = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults(null);
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setSearching(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(searchQuery);
      }, 300);
    } else {
      setSearchResults(null);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, performSearch]);

  // Navigate to search result
  const navigateToResult = (href: string) => {
    setShowSearch(false);
    setSearchQuery("");
    setSearchResults(null);
    router.push(href);
  };

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    setLoadingAlerts(true);
    try {
      const res = await fetch("/api/admin/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(
          data.notifications.map((notif: any) => ({
            id: notif.id,
            title: notif.title,
            message: notif.message,
            time: formatTimeAgo(notif.createdAt),
            unread: !notif.isRead,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoadingAlerts(false);
    }
  }, []);

  // Fetch on mount and periodically
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  // Mark single notification as read
  const markAsRead = async (id: string) => {
    try {
      await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
      );
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  // Get page metadata
  const getPageMeta = () => {
    for (const [path, meta] of Object.entries(pageMeta)) {
      if (pathname === path || pathname.startsWith(path + "/")) {
        return meta;
      }
    }
    return { title: "Admin", breadcrumb: ["Admin"] };
  };

  const pageMetaData = getPageMeta();
  const unreadCount = notifications.filter((n) => n.unread).length;

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="flex items-center justify-between px-4 lg:px-6 py-3">
        {/* Left: Mobile menu + Breadcrumbs */}
        <div className="flex items-center gap-4">
          {/* Mobile menu trigger */}
          <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
            <SheetTrigger className="lg:hidden inline-flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100">
              <Menu className="w-5 h-5" />
              <span className="sr-only">Open menu</span>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <AdminSidebar />
            </SheetContent>
          </Sheet>

          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-sm">
            <Link href="/admin/dashboard" className="text-slate-400 hover:text-slate-600 transition-colors">
              <Home className="w-4 h-4" />
            </Link>
            {pageMetaData.breadcrumb.map((crumb, index) => (
              <span key={index} className="flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-slate-300" />
                <span className={cn(
                  index === pageMetaData.breadcrumb.length - 1
                    ? "font-semibold text-slate-900"
                    : "text-slate-400"
                )}>
                  {crumb}
                </span>
              </span>
            ))}
          </nav>
        </div>

        {/* Center: Search (Desktop) */}
        <div ref={searchRef} className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari booking, tenant, unit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSearch(true)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setShowSearch(false);
                  setSearchQuery("");
                  setSearchResults(null);
                }
              }}
              className="w-full pl-10 pr-10 py-2 bg-slate-100 border border-transparent rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-amber-300 focus:ring-2 focus:ring-amber-100 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X className="w-3 h-3 text-slate-400" />
              </button>
            )}

            {/* Search Dropdown */}
            {showSearch && searchQuery.length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50">
                {searching ? (
                  <div className="p-8 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                  </div>
                ) : searchResults ? (
                  <div className="max-h-96 overflow-y-auto">
                    {/* Bookings */}
                    {searchResults.results.bookings.length > 0 && (
                      <div>
                        <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase">
                              <FileText className="w-3.5 h-3.5" /> Booking
                            </div>
                            {searchResults.totalCount.bookings > 5 && (
                              <Link href={`/admin/booking?search=${encodeURIComponent(searchQuery)}`} className="text-xs text-amber-600 hover:text-amber-700">
                                Lihat semua ({searchResults.totalCount.bookings})
                              </Link>
                            )}
                          </div>
                        </div>
                        {searchResults.results.bookings.map((item: any) => (
                          <SearchResultItem key={item.id} item={item} onClick={() => navigateToResult(item.href)} />
                        ))}
                      </div>
                    )}

                    {/* Tenants */}
                    {searchResults.results.tenants.length > 0 && (
                      <div>
                        <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase">
                              <Users className="w-3.5 h-3.5" /> Tenant
                            </div>
                            {searchResults.totalCount.tenants > 5 && (
                              <Link href={`/admin/tenant?search=${encodeURIComponent(searchQuery)}`} className="text-xs text-amber-600 hover:text-amber-700">
                                Lihat semua ({searchResults.totalCount.tenants})
                              </Link>
                            )}
                          </div>
                        </div>
                        {searchResults.results.tenants.map((item: any) => (
                          <SearchResultItem key={item.id} item={item} onClick={() => navigateToResult(item.href)} />
                        ))}
                      </div>
                    )}

                    {/* Invoices */}
                    {searchResults.results.invoices.length > 0 && (
                      <div>
                        <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase">
                              <Receipt className="w-3.5 h-3.5" /> Invoice
                            </div>
                            {searchResults.totalCount.invoices > 5 && (
                              <Link href={`/admin/invoice?search=${encodeURIComponent(searchQuery)}`} className="text-xs text-amber-600 hover:text-amber-700">
                                Lihat semua ({searchResults.totalCount.invoices})
                              </Link>
                            )}
                          </div>
                        </div>
                        {searchResults.results.invoices.map((item: any) => (
                          <SearchResultItem key={item.id} item={item} onClick={() => navigateToResult(item.href)} />
                        ))}
                      </div>
                    )}

                    {/* Units */}
                    {searchResults.results.units.length > 0 && (
                      <div>
                        <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase">
                              <DoorOpen className="w-3.5 h-3.5" /> Unit
                            </div>
                            {searchResults.totalCount.units > 5 && (
                              <Link href={`/admin/unit?search=${encodeURIComponent(searchQuery)}`} className="text-xs text-amber-600 hover:text-amber-700">
                                Lihat semua ({searchResults.totalCount.units})
                              </Link>
                            )}
                          </div>
                        </div>
                        {searchResults.results.units.map((item: any) => (
                          <SearchResultItem key={item.id} item={item} onClick={() => navigateToResult(item.href)} />
                        ))}
                      </div>
                    )}

                    {/* No results */}
                    {searchResults.results.bookings.length === 0 &&
                      searchResults.results.tenants.length === 0 &&
                      searchResults.results.invoices.length === 0 &&
                      searchResults.results.units.length === 0 && (
                        <div className="p-8 text-center">
                          <Search className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                          <p className="text-sm text-slate-500">Tidak ada hasil untuk "{searchQuery}"</p>
                        </div>
                      )}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-slate-500">
                    Ketik minimal 2 karakter untuk mencari
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Search Button (Mobile) */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications) fetchNotifications();
              }}
              className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-900">Notifikasi</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-amber-600 hover:text-amber-700"
                    >
                      Tandai semua dibaca
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {loadingAlerts ? (
                    <div className="p-4 text-center text-sm text-slate-500">
                      Memuat...
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-slate-500">
                      Tidak ada notifikasi
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markAsRead(notif.id)}
                        className={cn(
                          "p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors",
                          notif.unread && "bg-amber-50/50"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          {notif.unread && (
                            <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                          )}
                          <div className={cn(!notif.unread && "ml-5")}>
                            <p className="text-sm font-medium text-slate-900">{notif.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{notif.message}</p>
                            <p className="text-[10px] text-slate-400 mt-1">{notif.time}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <Link
                  href="/admin/notification"
                  onClick={() => setShowNotifications(false)}
                  className="block p-3 text-center text-sm text-amber-600 hover:bg-slate-50 transition-colors border-t border-slate-100"
                >
                  Lihat semua notifikasi
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {showSearch && (
        <div className="md:hidden px-4 pb-3 bg-white border-t border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-amber-300 transition-all"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
}
