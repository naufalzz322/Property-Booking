"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format, addMonths, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { Home, Check, Calendar, ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AvailabilityCalendar } from "@/components/public/AvailabilityCalendar";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface BookedDate {
  date: string;
  status: "booked" | "checked_in";
  bookingNumber: string;
  durationMonths?: number;
  durationNights?: number;
}

interface Unit {
  id: string;
  slug: string;
  name: string;
  unitNumber: string;
  type: string;
  pricePerMonth: number | null;
  pricePerNight: number | null;
  facilities: string[];
  photos: string[];
  description: string | null;
  status?: string;
  property: { name: string };
}

const typeLabels: Record<string, string> = {
  KOS_BULANAN: "Kos Bulanan",
  KOS_HARIAN: "Kos Harian",
  GUEST_HOUSE: "Guest House",
  VILLA: "Villa",
};

const monthlyDurations = [
  { value: 1, label: "1 Bulan" },
  { value: 3, label: "3 Bulan" },
  { value: 6, label: "6 Bulan" },
  { value: 12, label: "12 Bulan" },
];

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

function validatePhone(phone: string): boolean {
  // Indonesian phone number validation
  const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
}

function formatPhone(phone: string): string {
  // Format phone number for display
  let formatted = phone.replace(/\D/g, "");
  if (formatted.startsWith("62")) {
    formatted = "62" + formatted.slice(2);
  } else if (formatted.startsWith("0")) {
    formatted = formatted;
  }
  return formatted;
}

interface BookingFormProps {
  unit: Unit;
  bookedDates?: BookedDate[];
}

export function BookingForm({ unit, bookedDates = [] }: BookingFormProps) {
  const router = useRouter();
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isMonthly = String(unit.type) === "KOS_BULANAN";
  const durations = isMonthly ? monthlyDurations : nightlyDurations;
  const defaultDuration = isMonthly ? 1 : 1;

  // Initialize date on client only to avoid hydration mismatch
  const [formData, setFormData] = useState({
    guestName: "",
    guestPhone: "",
    guestEmail: "",
    checkInDate: "",
    durationMonths: defaultDuration,
    durationNights: defaultDuration,
    notes: "",
  });

  // Set initial date after mount
  useEffect(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    setFormData((prev) => ({ ...prev, checkInDate: today }));
  }, []);

  const price = unit.pricePerMonth || unit.pricePerNight || 0;
  const duration = isMonthly ? formData.durationMonths : formData.durationNights;
  const totalPrice = price * duration;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.guestName.trim()) {
      newErrors.guestName = "Nama lengkap wajib diisi";
    } else if (formData.guestName.trim().length < 3) {
      newErrors.guestName = "Nama minimal 3 karakter";
    }

    // Phone validation
    if (!formData.guestPhone.trim()) {
      newErrors.guestPhone = "Nomor HP wajib diisi";
    } else if (!validatePhone(formData.guestPhone)) {
      newErrors.guestPhone = "Format nomor HP tidak valid (contoh: 081234567890)";
    }

    // Email validation
    if (!formData.guestEmail.trim()) {
      newErrors.guestEmail = "Email wajib diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.guestEmail)) {
      newErrors.guestEmail = "Format email tidak valid";
    }

    // Date validation
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

    if (!validateForm()) {
      showError("Mohon perbaiki kesalahan pada form");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitId: unit.id,
          ...formData,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        success("Booking berhasil! Kami akan segera menghubungi Anda.");
        router.push(`/booking/confirm?booking=${data.booking.bookingNumber}`);
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

  const handleDateSelect = (date: Date) => {
    setFormData({ ...formData, checkInDate: format(date, "yyyy-MM-dd") });
    setShowCalendar(false);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const selectedDateObj = formData.checkInDate ? parseISO(formData.checkInDate) : new Date();

  return (
    <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
      {/* Form */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Form Pemesanan</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="guestName">
                  Nama Lengkap <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="guestName"
                  value={formData.guestName}
                  onChange={(e) => handleInputChange("guestName", e.target.value)}
                  placeholder="Masukkan nama lengkap Anda"
                  className={cn(
                    errors.guestName && "border-red-500 focus:border-red-500"
                  )}
                />
                {errors.guestName && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.guestName}
                  </p>
                )}
              </div>

              {/* Phone + Email */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guestPhone">
                    No. HP / WhatsApp <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="guestPhone"
                    type="tel"
                    value={formData.guestPhone}
                    onChange={(e) => handleInputChange("guestPhone", e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    className={cn(
                      errors.guestPhone && "border-red-500 focus:border-red-500"
                    )}
                  />
                  {errors.guestPhone && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.guestPhone}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guestEmail">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="guestEmail"
                    type="email"
                    value={formData.guestEmail}
                    onChange={(e) => handleInputChange("guestEmail", e.target.value)}
                    placeholder="email@contoh.com"
                    className={cn(
                      errors.guestEmail && "border-red-500 focus:border-red-500"
                    )}
                  />
                  {errors.guestEmail && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.guestEmail}
                    </p>
                  )}
                </div>
              </div>

              {/* Date + Duration */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    Tanggal Check-in <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={formData.checkInDate}
                      onChange={(e) => handleInputChange("checkInDate", e.target.value)}
                      min={format(new Date(), "yyyy-MM-dd")}
                      className={cn(
                        errors.checkInDate && "border-red-500 focus:border-red-500"
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCalendar(!showCalendar)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-2 text-stone-500 hover:text-stone-700"
                    >
                      <Calendar className="w-4 h-4" />
                    </Button>
                  </div>
                  {showCalendar && (
                    <Dialog open={showCalendar} onOpenChange={setShowCalendar}>
                      <DialogContent className="sm:max-w-[320px] p-4">
                        <DialogHeader className="pb-2 space-y-0">
                          <DialogTitle className="text-base">Pilih Tanggal Check-in</DialogTitle>
                        </DialogHeader>
                        <AvailabilityCalendar
                          unitId={unit.id}
                          selectedDate={selectedDateObj}
                          onDateSelect={handleDateSelect}
                          minDate={new Date()}
                        />
                      </DialogContent>
                    </Dialog>
                  )}
                  {errors.checkInDate && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.checkInDate}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Durasi Sewa</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {durations.map((d) => (
                      <button
                        key={d.value}
                        type="button"
                        onClick={() => handleInputChange(isMonthly ? "durationMonths" : "durationNights", d.value)}
                        className={cn(
                          "py-2 px-2 text-sm font-medium rounded-lg border transition-all",
                          (isMonthly ? formData.durationMonths : formData.durationNights) === d.value
                            ? "bg-amber-500 text-white border-amber-500 shadow-md"
                            : "bg-white text-stone-700 border-stone-300 hover:border-amber-500 hover:bg-amber-50"
                        )}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Catatan (opsional)</Label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Permintaan khusus, pertanyaan, dll."
                  rows={3}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-shadow resize-none"
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Mengirim...
                  </span>
                ) : (
                  "Kirim Permintaan Booking"
                )}
              </Button>

              <p className="text-xs text-stone-500 text-center">
                Dengan mengirim formulir ini, Anda menyetujui terms & conditions kami.
                Tim kami akan menghubungi Anda untuk konfirmasi.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <div className="lg:col-span-1">
        <Card className="sticky top-20">
          <CardHeader>
            <CardTitle>Ringkasan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Room preview */}
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-gradient-to-br from-stone-200 to-stone-300 rounded-lg flex items-center justify-center flex-shrink-0">
                <Home className="w-8 h-8 text-stone-400" />
              </div>
              <div>
                <p className="font-semibold text-stone-900">
                  {unit.name}
                </p>
                <p className="text-sm text-stone-500">
                  Unit {unit.unitNumber} • {typeLabels[unit.type] || unit.type}
                </p>
              </div>
            </div>

            {/* Summary details */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">Harga/{isMonthly ? "bulan" : "malam"}</span>
                <span className="font-medium">{formatCurrency(price)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">Durasi</span>
                <span className="font-medium">
                  {duration} {isMonthly ? "bulan" : "hari"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">Check-in</span>
                <span className="font-medium">
                  {format(selectedDateObj, "dd MMM yyyy", { locale: id })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">Estimasi {isMonthly ? "keluar" : "berakhir"}</span>
                <span className="font-medium">
                  {isMonthly
                    ? format(addMonths(selectedDateObj, formData.durationMonths), "dd MMM yyyy", { locale: id })
                    : format(new Date(selectedDateObj.getTime() + (formData.durationNights - 1) * 24 * 60 * 60 * 1000), "dd MMM yyyy", { locale: id })
                  }
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex justify-between">
                <span className="font-semibold text-stone-900">Total</span>
                <span className="text-xl font-bold text-amber-600">
                  {formatCurrency(totalPrice)}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                * Belum termasuk listrik, air, dan biaya lainnya
              </p>
            </div>

            {/* Facilities */}
            <div className="border-t pt-4">
              <p className="text-sm font-medium text-stone-700 mb-2">Fasilitas:</p>
              <div className="flex flex-wrap gap-2">
                {unit.facilities.slice(0, 6).map((f) => (
                  <span
                    key={f}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-stone-100 text-stone-600 text-xs rounded-full"
                  >
                    <Check className="w-3 h-3 text-amber-500" />
                    {f}
                  </span>
                ))}
                {unit.facilities.length > 6 && (
                  <span className="inline-flex items-center px-2 py-1 bg-stone-100 text-stone-600 text-xs rounded-full">
                    +{unit.facilities.length - 6} more
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
