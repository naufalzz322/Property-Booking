"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InvoiceListClient } from "@/components/admin/InvoiceListClient";
import { ExportButton } from "@/components/admin/ExportButton";
import { InvoiceNewModal } from "@/components/admin/InvoiceNewModal";

interface Invoice {
  id: string;
  invoiceNumber: string;
  period: string;
  rentAmount: number;
  electricAmount: number;
  waterAmount: number;
  otherAmount: number;
  totalAmount: number;
  dueDate: Date;
  status: string;
  paidAt: Date | null;
  paymentProofUrl: string | null;
  tenant: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  unit: {
    id: string;
    unitNumber: string;
    name?: string | null;
    property: { id: string; name: string };
  };
}

interface Tenant {
  id: string;
  name: string;
  phone: string;
  unit: {
    unitNumber: string;
    pricePerMonth: number | null;
    property: { name: string };
  };
}

interface InvoiceListPageClientProps {
  invoices: Invoice[];
  tenants: Tenant[];
}

export function InvoiceListPageClient({ invoices, tenants }: InvoiceListPageClientProps) {
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tagihan</h1>
          <p className="text-slate-500">Kelola semua tagihan</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsNewModalOpen(true)}
            className="bg-amber-500 hover:bg-amber-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Buat Tagihan
          </Button>
          <ExportButton type="invoices" />
        </div>
      </div>

      <InvoiceListClient invoices={invoices} />

      <InvoiceNewModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        tenants={tenants}
      />
    </div>
  );
}
