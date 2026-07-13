"use client";

import { ContractCard } from "./contract-card";
import { UnitInfoCard } from "./unit-info-card";
import Link from "next/link";
import { ArrowLeft, Home, Receipt, History, FileText, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface KontrakData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  contractStart: Date;
  contractEnd: Date | null;
  unit: {
    id: string;
    name: string;
    unitNumber: string;
    type: string;
    pricePerMonth: number | null;
    property: {
      id: string;
      name: string;
    };
  };
}

interface KontrakClientProps {
  data: KontrakData;
}

export function KontrakClient({ data }: KontrakClientProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-4">
            <Link
              href="/tenant"
              className="p-2 -ml-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <h1 className="text-lg font-semibold text-slate-900">Kontrak Sewa</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 py-6 pb-24">
        <div className="space-y-4">
          {/* Contract Card */}
          <ContractCard
            contractStart={new Date(data.contractStart)}
            contractEnd={data.contractEnd ? new Date(data.contractEnd) : null}
          />

          {/* Unit Info */}
          <UnitInfoCard unit={data.unit} />
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-50">
        <div className="max-w-lg mx-auto flex">
          <Link
            href="/tenant"
            className="flex-1 flex flex-col items-center py-3 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <Home className="w-5 h-5" />
            <span className="text-xs mt-1">Beranda</span>
          </Link>
          <Link
            href="/tenant/invoice"
            className="flex-1 flex flex-col items-center py-3 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <Receipt className="w-5 h-5" />
            <span className="text-xs mt-1">Tagihan</span>
          </Link>
          <Link
            href="/tenant/history"
            className="flex-1 flex flex-col items-center py-3 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <History className="w-5 h-5" />
            <span className="text-xs mt-1">Riwayat</span>
          </Link>
          <Link
            href="/tenant/kontrak"
            className="flex-1 flex flex-col items-center py-3 text-amber-600"
          >
            <FileText className="w-5 h-5" />
            <span className="text-xs mt-1 font-medium">Kontrak</span>
          </Link>
          <Link
            href="/tenant/account"
            className="flex-1 flex flex-col items-center py-3 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <UserCircle className="w-5 h-5" />
            <span className="text-xs mt-1">Akun</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
