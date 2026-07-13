"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { ChevronDown, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export function SidebarDropdown() {
  const { data: session } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
      >
        <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
          <span className="text-sm font-medium text-white">
            {session?.user?.name?.charAt(0).toUpperCase() || "U"}
          </span>
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-medium truncate">{session?.user?.name || "User"}</p>
          <p className="text-xs text-slate-400 truncate">{session?.user?.email || ""}</p>
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-slate-400 transition-transform",
            showDropdown && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-slate-800 rounded-lg shadow-lg border border-slate-700 overflow-hidden">
          <Link
            href="/admin/settings"
            onClick={() => setShowDropdown(false)}
            className="flex items-center gap-3 px-4 py-3 hover:bg-slate-700 transition-colors"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span className="text-sm">Pengaturan</span>
          </Link>
          <div className="border-t border-slate-700" />
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700 transition-colors text-red-400"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Keluar</span>
          </button>
        </div>
      )}
    </div>
  );
}
