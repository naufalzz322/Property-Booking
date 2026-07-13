"use client";

import { Home, MapPin } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface Unit {
  id: string;
  name: string;
  unitNumber: string;
  type: string;
  pricePerMonth: number | null;
  property: {
    name: string;
  };
}

interface UnitInfoCardProps {
  unit: Unit;
}

export function UnitInfoCard({ unit }: UnitInfoCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-900 mb-4">Info Unit</h3>

      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Home className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Unit</p>
            <p className="font-medium text-slate-900">
              {unit.name || `Unit ${unit.unitNumber}`}
            </p>
            <p className="text-xs text-slate-500">{unit.type}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 bg-slate-100 rounded-lg">
            <MapPin className="w-4 h-4 text-slate-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Properti</p>
            <p className="font-medium text-slate-900">{unit.property.name}</p>
          </div>
        </div>

        {unit.pricePerMonth && (
          <div className="pt-2 border-t border-slate-100">
            <p className="text-sm text-slate-500">Harga Sewa</p>
            <p className="text-lg font-bold text-amber-600">
              Rp {unit.pricePerMonth.toLocaleString("id-ID")}/bulan
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
