"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  Receipt,
  Building2,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Home,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useConfirm } from "@/components/ui/confirm-dialog-context";

// Navigation sections
const navigationSections = [
  {
    title: "",
    items: [
      { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Operasional",
    items: [
      { name: "Booking", href: "/admin/booking", icon: CalendarCheck },
      { name: "Tenant", href: "/admin/tenant", icon: Users },
      { name: "Tagihan", href: "/admin/invoice", icon: Receipt },
    ],
  },
  {
    title: "Manajemen",
    items: [
      { name: "Unit", href: "/admin/unit", icon: Building2 },
      { name: "Notifikasi", href: "/admin/notification", icon: Bell },
    ],
  },
];

interface AdminSidebarProps {
  propertyName?: string;
}

export function AdminSidebar({ propertyName = "Graha Maju" }: AdminSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { confirm } = useConfirm();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Active item check
  const isActive = (href: string) => {
    if (!pathname) return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <aside
      className={cn(
        "flex flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white h-screen sticky top-0 transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-slate-700/50">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Home className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <h1 className="font-bold text-lg leading-tight">{propertyName}</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                Property Admin
              </p>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-6 overflow-y-auto">
        {navigationSections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            {/* Section Title */}
            {!collapsed && section.title && (
              <p className="px-3 mb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                {section.title}
              </p>
            )}

            {/* Section Items */}
            <div className="space-y-1">
              {section.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                      active
                        ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25"
                        : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                    )}
                  >
                    {/* Active indicator */}
                    {active && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/30 rounded-r-full" />
                    )}

                    <Icon
                      className={cn(
                        "w-5 h-5 flex-shrink-0 transition-transform duration-200",
                        active ? "" : "group-hover:scale-110"
                      )}
                    />

                    {!collapsed && (
                      <span className="font-medium text-sm">{item.name}</span>
                    )}

                    {!collapsed && active && (
                      <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer - Settings & User */}
      <div className="p-3 border-t border-slate-700/50 space-y-2">
        {/* Settings Link */}
        <Link
          href="/admin/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all",
            isActive("/admin/settings")
              ? "bg-slate-700/50 text-white"
              : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
          )}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm">Pengaturan</span>}
        </Link>

        {/* User Profile */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all",
              showUserMenu ? "bg-slate-700/50" : "hover:bg-slate-800/50"
            )}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-white">
                {session?.user?.name?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium truncate">
                    {session?.user?.name || "User"}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate capitalize">
                    {session?.user?.role?.toLowerCase() || "admin"}
                  </p>
                </div>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-slate-400 transition-transform",
                    showUserMenu && "rotate-180"
                  )}
                />
              </>
            )}
          </button>

          {/* User Dropdown Menu */}
          {showUserMenu && !collapsed && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-slate-800 rounded-xl shadow-xl border border-slate-700 overflow-hidden">
              <div className="p-3 border-b border-slate-700">
                <p className="text-xs text-slate-400">Signed in as</p>
                <p className="text-sm font-medium truncate">{session?.user?.email}</p>
              </div>
              <div className="p-1">
                <button
                  onClick={async () => {
                    const confirmed = await confirm({
                      title: "Keluar dari Dashboard?",
                      description: "Anda harus login kembali untuk mengakses dashboard admin.",
                      icon: "warning",
                      confirmText: "Keluar",
                      destructive: true,
                      onConfirm: () => signOut({ callbackUrl: "/login" }),
                    });
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Keluar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Collapsed user avatar only */}
        {collapsed && (
          <button
            onClick={async () => {
              const confirmed = await confirm({
                title: "Keluar dari Dashboard?",
                description: "Anda harus login kembali untuk mengakses dashboard admin.",
                icon: "warning",
                confirmText: "Keluar",
                destructive: true,
                onConfirm: () => signOut({ callbackUrl: "/login" }),
              });
            }}
            className="w-full flex items-center justify-center p-2.5 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
            title="Keluar"
          >
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>
    </aside>
  );
}
