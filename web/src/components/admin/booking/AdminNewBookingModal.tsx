"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { format, parseISO } from "date-fns";
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
import { cn } from "@/lib/utils";
import {
  Check,
  Loader2,
  AlertCircle,
  Info,
  Search,
  ChevronDown,
  X,
  Calendar,
} from "lucide-react";
import { AvailabilityCalendar } from "@/components/public/AvailabilityCalendar";

interface Unit {
  id: string;
  name: string;
  unitNumber: string;
  type: string;
  pricePerMonth: number | null;
  pricePerNight: number | null;
  status: string;
}

const monthlyDurations = [
  { value: 1, label: "1 Bulan" },
  { value: 3, label: "3 Bulan" },
  { value: 6, label: "6 Bulan" },
  { value: 12, label: "12 Bulan" },
];

const typeLabels: Record<string, string> = {
  KOS_BULANAN: "Kos Bulanan",
  KOS_HARIAN: "Kos Harian",
  GUEST_HOUSE: "Guest House",
  VILLA: "Villa",
};

const nightlyDurations = [
  { value: 1, label: "1 Malam" },
  { value: 2, label: "2 Malam" },
  { value: 3, label: "3 Malam" },
  { value: 7, label: "1 Minggu" },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

interface AdminNewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  units: Unit[];
}

export function AdminNewBookingModal({
  isOpen,
  onClose,
  onSuccess,
  units,
}: AdminNewBookingModalProps) {
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [unitSearchOpen, setUnitSearchOpen] = useState(false);
  const [unitSearchQuery, setUnitSearchQuery] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    guestName: "",
    guestPhone: "",
    guestEmail: "",
    checkInDate: format(new Date(), "yyyy-MM-dd"),
    durationMonths: 1,
    durationNights: 1,
    notes: "",
  });

  // Get available units only
  const availableUnits = units.filter((u) => u.status === "AVAILABLE");
  const selectedUnit = availableUnits.find((u) => u.id === selectedUnitId);

  // Filter units by search query
  const filteredUnits = availableUnits.filter((unit) => {
    const query = unitSearchQuery.toLowerCase();
    return (
      unit.name.toLowerCase().includes(query) ||
      unit.unitNumber.toLowerCase().includes(query)
    );
  });

  // Determine booking type
  const isMonthly = selectedUnit?.type === "KOS_BULANAN";
  const durations = isMonthly ? monthlyDurations : nightlyDurations;
  const price = selectedUnit?.pricePerMonth || selectedUnit?.pricePerNight || 0;
  const duration = isMonthly ? formData.durationMonths : formData.durationNights;
  const totalPrice = price * duration;

  // Focus search input when dropdown opens
  useEffect(() => {
    if (unitSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [unitSearchOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUnitSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        guestName: "",
        guestPhone: "",
        guestEmail: "",
        checkInDate: format(new Date(), "yyyy-MM-dd"),
        durationMonths: 1,
        durationNights: 1,
        notes: "",
      });
      setSelectedUnitId("");
      setErrors({});
      setUnitSearchQuery("");
      setUnitSearchOpen(false);
      setShowCalendar(false);
    }
  }, [isOpen]);

  // Handle calendar date selection
  const handleDateSelect = (date: Date) => {
    handleInputChange("checkInDate", format(date, "yyyy-MM-dd"));
    setShowCalendar(false);
    clearError("checkInDate");
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedUnitId) {
      newErrors.unit = "Pilih unit/kamar terlebih dahulu";
    }

    if (!formData.guestName.trim()) {
      newErrors.guestName = "Nama lengkap wajib diisi";
    } else if (formData.guestName.trim().length < 3) {
      newErrors.guestName = "Nama minimal 3 karakter";
    }

    if (!formData.guestPhone.trim()) {
      newErrors.guestPhone = "Nomor HP wajib diisi";
    } else if (!validatePhone(formData.guestPhone)) {
      newErrors.guestPhone = "Format nomor HP tidak valid";
    }

    if (!formData.guestEmail.trim()) {
      newErrors.guestEmail = "Email wajib diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.guestEmail)) {
      newErrors.guestEmail = "Format email tidak valid";
    }

    const selectedDate = new Date(formData.checkInDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      newErrors.checkInDate = "Tanggal check-in tidak boleh tanggal lalu";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !selectedUnit) {
      showError("Mohon perbaiki kesalahan pada form");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitId: selectedUnit.id,
          guestName: formData.guestName,
          guestPhone: formData.guestPhone,
          guestEmail: formData.guestEmail,
          checkInDate: formData.checkInDate,
          durationMonths: isMonthly ? formData.durationMonths : null,
          durationNights: !isMonthly ? formData.durationNights : null,
          notes: formData.notes,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        success(`Booking ${data.booking.bookingNumber} berhasil dibuat!`);
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        showError(data.error || "Gagal membuat booking");
      }
    } catch {
      showError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const selectUnit = (unit: Unit) => {
    setSelectedUnitId(unit.id);
    setUnitSearchOpen(false);
    setUnitSearchQuery("");
    clearError("unit");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
          <DialogTitle className="text-xl text-slate-900">Booking Baru</DialogTitle>
          <p className="text-sm text-slate-500">Tambah reservasi unit baru</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-6">
          {/* Unit Selection with Search */}
          <div className="space-y-3">
            <Label className="text-slate-700 font-medium">
              Pilih Unit <span className="text-red-500">*</span>
            </Label>

            {/* Custom Dropdown */}
            <div className="relative" ref={dropdownRef}>
              {/* Trigger */}
              <button
                type="button"
                onClick={() => setUnitSearchOpen(!unitSearchOpen)}
                className={cn(
                  "w-full h-11 px-4 flex items-center justify-between rounded-lg border bg-white text-sm cursor-pointer transition-colors",
                  errors.unit
                    ? "border-red-500"
                    : "border-slate-200 hover:border-slate-300",
                  !selectedUnit && "text-slate-400"
                )}
              >
                <span>
                  {selectedUnit
                    ? `${selectedUnit.name || `Unit ${selectedUnit.unitNumber}`} — ${formatCurrency(selectedUnit.pricePerMonth || selectedUnit.pricePerNight || 0)}/${selectedUnit.type === "KOS_BULANAN" ? "bulan" : "malam"}`
                    : "-- Pilih Unit --"}
                </span>
                <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", unitSearchOpen && "rotate-180")} />
              </button>

              {/* Dropdown */}
              {unitSearchOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white rounded-lg border border-slate-200 shadow-lg overflow-hidden">
                  {/* Search */}
                  <div className="p-2 border-b border-slate-100">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        ref={searchInputRef}
                        placeholder="Cari unit..."
                        value={unitSearchQuery}
                        onChange={(e) => setUnitSearchQuery(e.target.value)}
                        className="pl-12 pr-10 h-10"
                      />
                      {unitSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setUnitSearchQuery("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded"
                        >
                          <X className="w-3 h-3 text-slate-400" />
                        </button>
                      )}
                    </div>
                  </div>
                  {/* List */}
                  <div className="h-72 overflow-y-auto">
                    {filteredUnits.length > 0 ? (
                      filteredUnits.map((unit) => (
                        <button
                          key={unit.id}
                          type="button"
                          onClick={() => selectUnit(unit)}
                          className={cn(
                            "w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors flex items-center justify-between gap-4",
                            selectedUnitId === unit.id && "bg-amber-50"
                          )}
                        >
                          <div>
                            <p className="font-medium text-slate-900">
                              {unit.name || `Unit ${unit.unitNumber}`}
                            </p>
                            <p className="text-sm text-slate-500">
                              {typeLabels[unit.type] || unit.type}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-slate-900">
                              {formatCurrency(unit.pricePerMonth || unit.pricePerNight || 0)}
                            </p>
                            <p className="text-xs text-slate-500">
                              /{unit.type === "KOS_BULANAN" ? "bulan" : "malam"}
                            </p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center text-slate-500">
                        <p className="text-sm">Tidak ada unit ditemukan</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {errors.unit && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                {errors.unit}
              </p>
            )}
            {availableUnits.length === 0 && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <p className="text-xs text-amber-800">Tidak ada unit tersedia saat ini</p>
              </div>
            )}
          </div>

          {/* Guest Name */}
          <div className="space-y-3">
            <Label htmlFor="guestName" className="text-slate-700 font-medium">
              Nama Lengkap <span className="text-red-500">*</span>
            </Label>
            <Input
              id="guestName"
              value={formData.guestName}
              onChange={(e) => handleInputChange("guestName", e.target.value)}
              placeholder="Masukkan nama lengkap"
              className={cn(
                "h-11",
                errors.guestName && "border-red-500 focus:border-red-500"
              )}
            />
            {errors.guestName && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                {errors.guestName}
              </p>
            )}
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label htmlFor="guestPhone" className="text-slate-700 font-medium">
                No. HP <span className="text-red-500">*</span>
              </Label>
              <Input
                id="guestPhone"
                type="tel"
                value={formData.guestPhone}
                onChange={(e) => handleInputChange("guestPhone", e.target.value)}
                placeholder="08xxxxxxxxxx"
                className={cn(
                  "h-11",
                  errors.guestPhone && "border-red-500 focus:border-red-500"
                )}
              />
              {errors.guestPhone && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  {errors.guestPhone}
                </p>
              )}
            </div>
            <div className="space-y-3">
              <Label htmlFor="guestEmail" className="text-slate-700 font-medium">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="guestEmail"
                type="email"
                value={formData.guestEmail}
                onChange={(e) => handleInputChange("guestEmail", e.target.value)}
                placeholder="email@contoh.com"
                className={cn(
                  "h-11",
                  errors.guestEmail && "border-red-500 focus:border-red-500"
                )}
              />
              {errors.guestEmail && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  {errors.guestEmail}
                </p>
              )}
            </div>
          </div>

          {/* Check-in Date & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label htmlFor="checkInDate" className="text-slate-700 font-medium">
                Check-in <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <div
                  className={cn(
                    "h-11 rounded-lg border bg-white pr-10 flex items-center cursor-pointer",
                    errors.checkInDate ? "border-red-500" : "border-slate-200"
                  )}
                >
                  <input
                    id="checkInDate"
                    type="text"
                    readOnly
                    value={formData.checkInDate ? format(parseISO(formData.checkInDate), "dd MMM yyyy") : ""}
                    placeholder="Pilih tanggal"
                    onClick={() => setShowCalendar(true)}
                    className="w-full h-full px-4 bg-transparent focus:outline-none cursor-pointer"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowCalendar(true)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-100 rounded transition-colors z-10"
                >
                  <Calendar className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Calendar Modal */}
              <Dialog open={showCalendar} onOpenChange={setShowCalendar}>
                <DialogContent className="sm:max-w-[400px] p-4">
                  <DialogHeader className="pb-2 space-y-0">
                    <DialogTitle className="text-base">Pilih Tanggal Check-in</DialogTitle>
                    {selectedUnit ? (
                      <p className="text-xs text-slate-500">{selectedUnit.name || `Unit ${selectedUnit.unitNumber}`}</p>
                    ) : (
                      <p className="text-xs text-amber-600">Pilih unit terlebih dahulu</p>
                    )}
                  </DialogHeader>
                  {selectedUnit ? (
                    <AvailabilityCalendar
                      unitId={selectedUnit.id}
                      selectedDate={formData.checkInDate ? parseISO(formData.checkInDate) : new Date()}
                      onDateSelect={handleDateSelect}
                      minDate={new Date()}
                    />
                  ) : (
                    <div className="py-8 text-center text-slate-500 text-sm">
                      Silakan pilih unit terlebih dahulu untuk melihat ketersediaan
                    </div>
                  )}
                </DialogContent>
              </Dialog>
              {errors.checkInDate && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  {errors.checkInDate}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Label className="text-slate-700 font-medium">
                Durasi <span className="text-red-500">*</span>
              </Label>
              <Select
                value={String(isMonthly ? formData.durationMonths : formData.durationNights)}
                onValueChange={(val) =>
                  handleInputChange(isMonthly ? "durationMonths" : "durationNights", Number(val))
                }
              >
                <SelectTrigger className="h-11">
                  <SelectValue>
                    {durations.find((d) => d.value === (isMonthly ? formData.durationMonths : formData.durationNights))?.label}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {durations.map((d) => (
                    <SelectItem key={d.value} value={String(d.value)}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-3">
            <Label htmlFor="notes" className="text-slate-700 font-medium">
              Catatan (opsional)
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Permintaan khusus, preferensi kamar, dll."
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Price Summary */}
          {selectedUnit && (
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-5 text-white">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-300 text-sm">Ringkasan Harga</span>
                <span className="text-xs px-2 py-1 bg-white/10 rounded-full">
                  {selectedUnit.name || `Unit ${selectedUnit.unitNumber}`}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">
                    {formatCurrency(price)} × {duration} {isMonthly ? "bulan" : "malam"}
                  </span>
                  <span className="text-white">{formatCurrency(totalPrice)}</span>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between items-center">
                  <span className="text-slate-200 font-medium">Total</span>
                  <span className="text-2xl font-bold text-amber-400">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12 border-slate-200 text-slate-600 hover:bg-slate-50"
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="flex-1 h-12 bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/25"
              disabled={loading || availableUnits.length === 0}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Buat Booking
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
