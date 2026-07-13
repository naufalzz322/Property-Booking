"use client";

import Link from "next/link";
import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: "rooms" | "search" | "booking";
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

const icons = {
  rooms: Home,
  search: Search,
  booking: Home,
};

function EmptyStateIllustration({ type }: { type: "rooms" | "search" | "booking" }) {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto"
    >
      {/* Background circle */}
      <circle cx="60" cy="60" r="56" fill="#F5F5F4" />

      {/* Building/Rooms illustration */}
      <rect x="35" y="40" width="50" height="40" rx="4" fill="#D6D3D1" />
      <rect x="40" y="45" width="12" height="10" rx="1" fill="#A8A29E" />
      <rect x="54" y="45" width="12" height="10" rx="1" fill="#A8A29E" />
      <rect x="68" y="45" width="12" height="10" rx="1" fill="#A8A29E" />
      <rect x="40" y="60" width="12" height="10" rx="1" fill="#A8A29E" />
      <rect x="54" y="60" width="12" height="10" rx="1" fill="#A8A29E" />
      <rect x="68" y="60" width="12" height="10" rx="1" fill="#A8A29E" />

      {/* Door */}
      <rect x="53" y="70" width="14" height="10" rx="1" fill="#78716C" />

      {/* Roof */}
      <path d="M30 42L60 28L90 42" stroke="#D6D3D1" strokeWidth="4" strokeLinecap="round" />

      {/* Question/Empty mark */}
      {type === "search" && (
        <g>
          <circle cx="85" cy="35" r="12" fill="#FEF3C7" />
          <text x="85" y="40" textAnchor="middle" fill="#D97706" fontSize="14" fontWeight="bold">?</text>
        </g>
      )}

      {/* Checkmark for booking success */}
      {type === "booking" && (
        <g>
          <circle cx="85" cy="35" r="12" fill="#D1FAE5" />
          <path d="M80 35L83 38L90 31" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}
    </svg>
  );
}

export function EmptyState({ icon = "rooms", title, description, action }: EmptyStateProps) {
  const Icon = icons[icon];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <EmptyStateIllustration type={icon} />

      <h3 className="mt-6 text-lg font-semibold text-stone-900">{title}</h3>

      {description && (
        <p className="mt-2 text-sm text-stone-500 max-w-sm">{description}</p>
      )}

      {action && (
        <div className="mt-6">
          {action.href ? (
            <Link href={action.href}>
              <Button className="bg-amber-500 hover:bg-amber-600">
                <Icon className="w-4 h-4 mr-2" />
                {action.label}
              </Button>
            </Link>
          ) : (
            <Button onClick={action.onClick} className="bg-amber-500 hover:bg-amber-600">
              <Icon className="w-4 h-4 mr-2" />
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export function NoRoomsAvailable() {
  return (
    <EmptyState
      icon="rooms"
      title="Tidak Ada Kamar Tersedia"
      description="Saat ini semua kamar sedang booked atau dalam perbaikan. Silakan cek kembali nanti."
      action={{
        label: "Hubungi Kami via WhatsApp",
        href: "https://wa.me/6281234567890",
      }}
    />
  );
}

export function NoSearchResults({ query }: { query: string }) {
  return (
    <EmptyState
      icon="search"
      title="Tidak Ditemukan"
      description={`Tidak ada kamar yang sesuai dengan "${query}". Coba kata kunci lain atau lihat semua kamar.`}
      action={{
        label: "Lihat Semua Kamar",
        href: "/kamar",
      }}
    />
  );
}
