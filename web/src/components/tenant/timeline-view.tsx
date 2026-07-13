"use client";

import { PaymentTimelineItem } from "./payment-timeline-item";
import { EmptyState } from "@/components/ui/empty-state";
import { Receipt } from "lucide-react";

interface Payment {
  id: string;
  invoiceNumber: string;
  period: string;
  totalAmount: number;
  paidAt: Date | null;
  paymentMethod: string | null;
}

interface TimelineViewProps {
  payments: Payment[];
}

export function TimelineView({ payments }: TimelineViewProps) {
  if (payments.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200">
        <EmptyState
          icon={Receipt}
          title="Belum ada riwayat"
          description="Riwayat pembayaran akan muncul di sini setelah Anda melakukan pembayaran."
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="space-y-0">
        {payments.map((payment, index) => (
          <PaymentTimelineItem
            key={payment.id}
            payment={payment}
            isLast={index === payments.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
