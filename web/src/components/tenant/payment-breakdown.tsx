import { formatCurrency } from "@/lib/utils";

interface PaymentBreakdownProps {
  rentAmount: number;
  electricAmount: number;
  waterAmount: number;
  otherAmount: number;
  totalAmount: number;
}

export function PaymentBreakdown({
  rentAmount,
  electricAmount,
  waterAmount,
  otherAmount,
  totalAmount,
}: PaymentBreakdownProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="font-semibold text-slate-900">Rincian Tagihan</h3>
      </div>
      <div className="p-5 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Sewa Kamar</span>
          <span className="text-slate-900 font-medium">{formatCurrency(rentAmount)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Listrik</span>
          <span className="text-slate-900 font-medium">
            {electricAmount > 0 ? formatCurrency(electricAmount) : "-"}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Air</span>
          <span className="text-slate-900 font-medium">
            {waterAmount > 0 ? formatCurrency(waterAmount) : "-"}
          </span>
        </div>

        {otherAmount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Lainnya</span>
            <span className="text-slate-900 font-medium">{formatCurrency(otherAmount)}</span>
          </div>
        )}

        <div className="flex justify-between pt-3 mt-3 border-t border-slate-200">
          <span className="text-base font-semibold text-slate-900">Total</span>
          <span className="text-xl font-bold text-amber-600">{formatCurrency(totalAmount)}</span>
        </div>
      </div>
    </div>
  );
}
