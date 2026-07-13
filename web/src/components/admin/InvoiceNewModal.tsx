"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import {
  Loader2,
  Calculator,
  Search,
  ChevronDown,
  X,
} from "lucide-react";

interface Tenant {
  id: string;
  name: string;
  phone: string;
  unit: {
    unitNumber: string;
    name?: string | null;
    pricePerMonth: number | null;
    property: { name: string };
  };
}

interface InvoiceNewModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenants: Tenant[];
}

const months = [
  { value: "01", label: "Januari" },
  { value: "02", label: "Februari" },
  { value: "03", label: "Maret" },
  { value: "04", label: "April" },
  { value: "05", label: "Mei" },
  { value: "06", label: "Juni" },
  { value: "07", label: "Juli" },
  { value: "08", label: "Agustus" },
  { value: "09", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

// Searchable Tenant Select Component
function SearchableTenantSelect({
  tenants,
  value,
  onChange,
}: {
  tenants: Tenant[];
  value: string;
  onChange: (id: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedTenant = tenants.find((t) => t.id === value);

  const filteredTenants = useMemo(() => {
    if (!search) return tenants;
    const lower = search.toLowerCase();
    return tenants.filter(
      (t) =>
        t.name.toLowerCase().includes(lower) ||
        t.unit.name?.toLowerCase().includes(lower) ||
        t.unit.unitNumber.toLowerCase().includes(lower) ||
        t.unit.property.name.toLowerCase().includes(lower)
    );
  }, [tenants, search]);

  const displayText = selectedTenant
    ? `${selectedTenant.name} - Unit ${selectedTenant.unit.name || selectedTenant.unit.unitNumber}`
    : "Pilih tenant...";

  return (
    <div className="relative">
      <div
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="w-full flex items-center justify-between h-10 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm hover:bg-slate-50 transition-colors cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        tabIndex={0}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              className="p-1 hover:bg-slate-100 rounded flex-shrink-0"
            >
              <X className="w-3 h-3 text-slate-400" />
            </button>
          )}
          <span className={`truncate ${selectedTenant ? "text-slate-900" : "text-slate-400"}`}>
            {displayText}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 ml-2 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
            {/* Search Input */}
            <div className="p-2 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari tenant..."
                  className="pl-10 pr-3 h-9"
                  autoFocus
                />
              </div>
            </div>

            {/* Options List */}
            <div className="max-h-60 overflow-y-auto">
              {filteredTenants.length === 0 ? (
                <div className="px-3 py-6 text-center text-sm text-slate-400">
                  Tidak ada tenant ditemukan
                </div>
              ) : (
                filteredTenants.map((tenant) => (
                  <button
                    key={tenant.id}
                    type="button"
                    onClick={() => {
                      onChange(tenant.id);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className="w-full px-3 py-2.5 text-left hover:bg-slate-50 transition-colors"
                  >
                    <p className="text-sm font-medium text-slate-900">
                      {tenant.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      Unit {tenant.unit.name || tenant.unit.unitNumber} - {tenant.unit.property.name}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function InvoiceNewModal({ isOpen, onClose, tenants }: InvoiceNewModalProps) {
  const router = useRouter();
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(false);

  // Form state
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [periodMonth, setPeriodMonth] = useState("");
  const [periodYear, setPeriodYear] = useState(new Date().getFullYear().toString());
  const [rentAmount, setRentAmount] = useState("");
  const [electricPrev, setElectricPrev] = useState("");
  const [electricCurr, setElectricCurr] = useState("");
  const [electricRate, setElectricRate] = useState("1500");
  const [waterPrev, setWaterPrev] = useState("");
  const [waterCurr, setWaterCurr] = useState("");
  const [waterRate, setWaterRate] = useState("5000");
  const [otherAmount, setOtherAmount] = useState("");
  const [otherDescription, setOtherDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [sendNotification, setSendNotification] = useState(true);

  // Calculate amounts
  const electricAmount = electricPrev && electricCurr
    ? Math.max(0, parseInt(electricCurr) - parseInt(electricPrev)) * parseInt(electricRate || "0")
    : 0;
  const waterAmount = waterPrev && waterCurr
    ? Math.max(0, parseInt(waterCurr) - parseInt(waterPrev)) * parseInt(waterRate || "0")
    : 0;
  const other = parseInt(otherAmount) || 0;
  const rent = parseInt(rentAmount) || 0;
  const totalAmount = rent + electricAmount + waterAmount + other;

  // Get selected tenant
  const selectedTenant = tenants.find((t) => t.id === selectedTenantId);

  // Set default due date to 5th of next month
  const getDefaultDueDate = () => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(5);
    return format(nextMonth, "yyyy-MM-dd");
  };

  // Initialize due date
  if (!dueDate && isOpen) {
    setDueDate(getDefaultDueDate());
  }

  // When tenant is selected, prefill rent from contract
  const handleTenantChange = (tenantId: string) => {
    setSelectedTenantId(tenantId);
    const tenant = tenants.find((t) => t.id === tenantId);
    if (tenant?.unit.pricePerMonth) {
      setRentAmount(tenant.unit.pricePerMonth.toString());
    }
  };

  const resetForm = () => {
    setSelectedTenantId("");
    setPeriodMonth("");
    setPeriodYear(new Date().getFullYear().toString());
    setRentAmount("");
    setElectricPrev("");
    setElectricCurr("");
    setElectricRate("1500");
    setWaterPrev("");
    setWaterCurr("");
    setWaterRate("5000");
    setOtherAmount("");
    setOtherDescription("");
    setDueDate("");
    setNotes("");
    setSendNotification(true);
  };

  const handleSubmit = async (action: "save" | "save_send") => {
    if (!selectedTenantId || !periodMonth || !rentAmount || !dueDate) {
      showError("Mohon lengkapi semua field wajib");
      return;
    }

    const period = `${periodYear}-${periodMonth}`;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: selectedTenantId,
          period,
          rentAmount: parseInt(rentAmount),
          electricAmount,
          waterAmount,
          otherAmount: other,
          otherDescription: otherDescription || null,
          dueDate,
          notes: notes || null,
          sendNotification: action === "save_send",
        }),
      });

      const data = await res.json();

      if (res.ok) {
        success(
          action === "save_send"
            ? "Invoice berhasil dibuat dan notifikasi dikirim!"
            : "Invoice berhasil dibuat!"
        );
        onClose();
        resetForm();
        router.refresh();
      } else {
        showError(data.error || "Gagal membuat invoice");
      }
    } catch {
      showError("Terjadi kesalahan saat membuat invoice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        resetForm();
      }
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Buat Tagihan Manual</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tenant Selection with Search */}
          <div className="space-y-2">
            <Label htmlFor="tenant">
              Tenant <span className="text-red-500">*</span>
            </Label>
            <SearchableTenantSelect
              tenants={tenants}
              value={selectedTenantId}
              onChange={handleTenantChange}
            />
          </div>

          {selectedTenant && (
            <div className="p-4 bg-slate-50 rounded-lg text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-500">Unit</p>
                  <p className="font-medium">
                    Unit {selectedTenant.unit.name || selectedTenant.unit.unitNumber}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Harga Sewa/Bulan</p>
                  <p className="font-medium">
                    {selectedTenant.unit.pricePerMonth
                      ? formatCurrency(selectedTenant.unit.pricePerMonth)
                      : "Tidak ada"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Period */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Bulan <span className="text-red-500">*</span>
              </Label>
              <Select value={periodMonth} onValueChange={(v) => v && setPeriodMonth(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih bulan..." />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>
                Tahun <span className="text-red-500">*</span>
              </Label>
              <Select value={periodYear} onValueChange={(v) => v && setPeriodYear(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={(new Date().getFullYear() - 1).toString()}>
                    {new Date().getFullYear() - 1}
                  </SelectItem>
                  <SelectItem value={new Date().getFullYear().toString()}>
                    {new Date().getFullYear()}
                  </SelectItem>
                  <SelectItem value={(new Date().getFullYear() + 1).toString()}>
                    {new Date().getFullYear() + 1}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Amounts */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Calculator className="w-4 h-4" />
              Rincian Tagihan
            </div>

            {/* Rent */}
            <div className="space-y-2">
              <Label htmlFor="rent">
                Sewa <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  Rp
                </span>
                <Input
                  id="rent"
                  type="text"
                  inputMode="numeric"
                  value={rentAmount}
                  onChange={(e) => {
                    // Allow only numbers
                    const val = e.target.value.replace(/\D/g, "");
                    setRentAmount(val);
                  }}
                  className="pl-10"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Electricity */}
            <div className="space-y-3">
              <Label>Listrik (per kWh)</Label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Meter Awal</p>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={electricPrev}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setElectricPrev(val);
                    }}
                    placeholder="0"
                  />
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Meter Akhir</p>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={electricCurr}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setElectricCurr(val);
                    }}
                    placeholder="0"
                  />
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Rate/kWh</p>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={electricRate}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setElectricRate(val);
                    }}
                    placeholder="1500"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <span className="text-sm text-slate-600">
                  = <span className="font-medium text-amber-600">{formatCurrency(electricAmount)}</span>
                </span>
              </div>
            </div>

            {/* Water */}
            <div className="space-y-3">
              <Label>Air (per m³)</Label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Meter Awal</p>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={waterPrev}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setWaterPrev(val);
                    }}
                    placeholder="0"
                  />
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Meter Akhir</p>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={waterCurr}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setWaterCurr(val);
                    }}
                    placeholder="0"
                  />
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Rate/m³</p>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={waterRate}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setWaterRate(val);
                    }}
                    placeholder="5000"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <span className="text-sm text-slate-600">
                  = <span className="font-medium text-amber-600">{formatCurrency(waterAmount)}</span>
                </span>
              </div>
            </div>

            {/* Other */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="other">Lainnya</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    Rp
                  </span>
                  <Input
                    id="other"
                    type="text"
                    inputMode="numeric"
                    value={otherAmount}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setOtherAmount(val);
                    }}
                    className="pl-10"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="otherDesc">Deskripsi</Label>
                <Input
                  id="otherDesc"
                  value={otherDescription}
                  onChange={(e) => setOtherDescription(e.target.value)}
                  placeholder="cth: Parkir"
                />
              </div>
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="dueDate">
              Jatuh Tempo <span className="text-red-500">*</span>
            </Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-48"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Catatan (opsional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan untuk tenant..."
              rows={2}
            />
          </div>

          {/* Preview */}
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-slate-600">Total Tagihan</span>
              <span className="text-xl font-bold text-amber-700">{formatCurrency(totalAmount)}</span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sendNotification}
                onChange={(e) => setSendNotification(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
              />
              <span className="text-sm text-slate-600">
                Kirim notifikasi WA ke tenant
              </span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => { onClose(); resetForm(); }} disabled={loading} className="flex-1">
            Batal
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSubmit("save")}
            disabled={loading || !selectedTenantId || !periodMonth || !rentAmount}
            className="flex-1"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Simpan
          </Button>
          <Button
            onClick={() => handleSubmit("save_send")}
            disabled={loading || !selectedTenantId || !periodMonth || !rentAmount}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Simpan & Kirim
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
