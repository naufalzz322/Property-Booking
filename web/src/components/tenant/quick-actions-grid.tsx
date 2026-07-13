"use client";

import { Receipt, History, FileText, UserCircle, MessageCircle } from "lucide-react";
import { QuickAction } from "@/components/ui/quick-action";

interface QuickActionsGridProps {
  unpaidCount?: number;
  overdueCount?: number;
}

export function QuickActionsGrid({ unpaidCount = 0, overdueCount = 0 }: QuickActionsGridProps) {
  // Determine badge for invoices
  let invoiceBadge: string | undefined;
  let invoiceBadgeVariant: "warning" | "danger" = "warning";
  if (overdueCount > 0) {
    invoiceBadge = overdueCount.toString();
    invoiceBadgeVariant = "danger";
  } else if (unpaidCount > 0) {
    invoiceBadge = unpaidCount.toString();
  }

  return (
    <div className="grid grid-cols-4 gap-3">
      <QuickAction
        icon={Receipt}
        label="Tagihan"
        href="/tenant/invoice"
        badge={invoiceBadge}
        badgeVariant={invoiceBadgeVariant}
        size="md"
      />
      <QuickAction
        icon={History}
        label="Riwayat"
        href="/tenant/history"
        size="md"
      />
      <QuickAction
        icon={FileText}
        label="Kontrak"
        href="/tenant/kontrak"
        size="md"
      />
      <QuickAction
        icon={UserCircle}
        label="Akun"
        href="/tenant/account"
        size="md"
      />
    </div>
  );
}

// Alternative compact version with 2 rows of 3
export function QuickActionsGridCompact({ unpaidCount = 0 }: QuickActionsGridProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <QuickAction
        icon={Receipt}
        label="Tagihan"
        href="/tenant/invoice"
        badge={unpaidCount > 0 ? unpaidCount : undefined}
        badgeVariant="warning"
        size="md"
      />
      <QuickAction
        icon={History}
        label="Riwayat"
        href="/tenant/history"
        size="md"
      />
      <QuickAction
        icon={MessageCircle}
        label="Hubungi"
        href="https://wa.me/"
        size="md"
      />
    </div>
  );
}
