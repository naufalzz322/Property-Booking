"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AdminEmptyStateProps {
  icon?: "bookings" | "tenants" | "units" | "invoices" | "alerts" | "search";
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

function EmptyStateIllustration({ type }: { type: "bookings" | "tenants" | "units" | "invoices" | "alerts" | "search" }) {
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
      <circle cx="60" cy="60" r="56" fill="#F1F5F9" />

      {/* Different illustrations based on type */}
      {type === "bookings" && (
        <>
          <rect x="30" y="35" width="60" height="50" rx="4" fill="#CBD5E1" />
          <rect x="36" y="45" width="48" height="6" rx="2" fill="#94A3B8" />
          <rect x="36" y="55" width="36" height="6" rx="2" fill="#94A3B8" />
          <rect x="36" y="65" width="24" height="6" rx="2" fill="#94A3B8" />
          <circle cx="75" cy="75" r="15" fill="#F59E0B" />
          <path d="M75 68V82M68 75H82" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        </>
      )}

      {type === "tenants" && (
        <>
          <circle cx="60" cy="45" r="18" fill="#CBD5E1" />
          <circle cx="60" cy="45" r="8" fill="#94A3B8" />
          <path d="M35 85C35 70 45 60 60 60C75 60 85 70 85 85" stroke="#CBD5E1" strokeWidth="4" strokeLinecap="round" />
          <circle cx="90" cy="35" r="12" fill="#10B981" />
          <path d="M86 35L89 38L94 32" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}

      {type === "units" && (
        <>
          <rect x="35" y="40" width="50" height="40" rx="4" fill="#CBD5E1" />
          <rect x="42" y="48" width="14" height="10" rx="2" fill="#94A3B8" />
          <rect x="60" y="48" width="14" height="10" rx="2" fill="#94A3B8" />
          <rect x="42" y="62" width="14" height="10" rx="2" fill="#94A3B8" />
          <rect x="60" y="62" width="14" height="10" rx="2" fill="#94A3B8" />
          <circle cx="90" cy="35" r="12" fill="#F59E0B" />
          <path d="M86 35L90 39L94 31" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}

      {type === "invoices" && (
        <>
          <rect x="30" y="35" width="60" height="50" rx="4" fill="#CBD5E1" />
          <rect x="40" y="45" width="30" height="4" rx="1" fill="#94A3B8" />
          <rect x="40" y="53" width="40" height="3" rx="1" fill="#94A3B8" />
          <rect x="40" y="60" width="35" height="3" rx="1" fill="#94A3B8" />
          <rect x="40" y="70" width="40" height="8" rx="2" fill="#10B981" />
          <circle cx="85" cy="30" r="10" fill="#EF4444" />
          <path d="M82 27L88 33M88 27L82 33" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}

      {type === "alerts" && (
        <>
          <path d="M60 30L90 85H30L60 30Z" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2" />
          <line x1="60" y1="50" x2="60" y2="65" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
          <circle cx="60" cy="72" r="2.5" fill="#F59E0B" />
          <circle cx="85" cy="35" r="10" fill="#EF4444" />
          <path d="M82 32L88 38M88 32L82 38" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </>
      )}

      {type === "search" && (
        <>
          <circle cx="55" cy="55" r="22" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="3" />
          <line x1="72" y1="72" x2="88" y2="88" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />
          <circle cx="95" cy="40" r="10" fill="#EF4444" />
          <path d="M91 36L99 44M99 36L91 44" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

export function AdminEmptyState({
  icon = "search",
  title,
  description,
  action,
  className,
}: AdminEmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-4 text-center", className)}>
      <EmptyStateIllustration type={icon} />

      <h3 className="mt-6 text-lg font-semibold text-slate-900">{title}</h3>

      {description && (
        <p className="mt-2 text-sm text-slate-500 max-w-sm">{description}</p>
      )}

      {action && (
        <div className="mt-6">
          {action.href ? (
            <Link href={action.href}>
              <Button className="bg-amber-500 hover:bg-amber-600">
                {action.label}
              </Button>
            </Link>
          ) : (
            <Button onClick={action.onClick} className="bg-amber-500 hover:bg-amber-600">
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
