"use client";

import { useState, useEffect } from "react";
import { format, addMonths, addDays } from "date-fns";
import { id } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import {
  Check,
  Loader2,
  AlertCircle,
  RefreshCw,
  Info,
  Calendar,
  MessageCircle,
} from "lucide-react";

interface Booking {
  id: string;
  bookingNumber: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  checkInDate: Date;
  durationMonths: number | null;
  durationNights: number | null;
  unit: {
    unitNumber: string;
    name?: string | null;
    property: { name: string };
  };
}

interface CreateTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (tenantId: string, tenantName: string) => void;
  booking: Booking;
}

function generatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export function CreateTenantModal({
  isOpen,
  onClose,
  onSuccess,
  booking,
}: CreateTenantModalProps) {
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate contract end date
  const contractStart = new Date(booking.checkInDate);
  const contractEnd = booking.durationMonths
    ? addMonths(contractStart, booking.durationMonths)
    : booking.durationNights
    ? addDays(contractStart, booking.durationNights)
    : null;

  const [formData, setFormData] = useState({
    name: booking.guestName,
    email: booking.guestEmail,
    phone: booking.guestPhone,
    password: generatePassword(),
    emergencyName: "",
    emergencyPhone: "",
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: booking.guestName,
        email: booking.guestEmail,
        phone: booking.guestPhone,
        password: generatePassword(),
        emergencyName: "",
        emergencyPhone: "",
      });
      setErrors({});
    }
  }, [isOpen, booking]);

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nama wajib diisi";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Nama minimal 3 karakter";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email wajib diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format email tidak valid";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "No. HP wajib diisi";
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = "Format no. HP tidak valid";
    }

    if (!formData.password) {
      newErrors.password = "Password wajib diisi";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password minimal 6 karakter";
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
      const res = await fetch(`/api/admin/bookings/${booking.id}/create-tenant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          contractStart: booking.checkInDate.toISOString(),
          contractEnd: contractEnd?.toISOString() || null,
          emergencyName: formData.emergencyName || undefined,
          emergencyPhone: formData.emergencyPhone || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        success("Tenant berhasil dibuat! Email & WhatsApp terkirim.");
        onSuccess(data.tenant.id, data.tenant.name);
        onClose();
      } else {
        showError(data.error || "Gagal membuat tenant");
      }
    } catch {
      showError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleRegeneratePassword = () => {
    setFormData((prev) => ({ ...prev, password: generatePassword() }));
    clearError("password");
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

  // Calculate duration label
  const durationLabel = booking.durationMonths
    ? `${booking.durationMonths} bulan`
    : booking.durationNights
    ? `${booking.durationNights} malam`
    : "Tanpa batas";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
          <DialogTitle className="text-xl text-slate-900">Buat Tenant</DialogTitle>
          <p className="text-sm text-slate-500">
            {booking.unit.name || booking.unit.property.name} - Unit {booking.unit.unitNumber}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Info Banner */}
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-800">Kontrak Otomatis</p>
              <p className="text-amber-700 mt-1">
                Data kontrak dihitung otomatis dari tanggal check-in dan durasi booking.
              </p>
            </div>
          </div>

          {/* Guest Info Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs flex items-center justify-center font-bold">
                1
              </span>
              Data Tenant
            </h3>

            {/* Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700">
                  Nama Lengkap <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Nama lengkap"
                  className={cn(
                    "h-11",
                    errors.name && "border-red-500 focus:border-red-500"
                  )}
                />
                {errors.name && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="email@contoh.com"
                  className={cn(
                    "h-11",
                    errors.email && "border-red-500 focus:border-red-500"
                  )}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            {/* Phone & Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-slate-700">
                  No. HP <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className={cn(
                    "h-11",
                    errors.phone && "border-red-500 focus:border-red-500"
                  )}
                />
                {errors.phone && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    {errors.phone}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700">
                  Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="text"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className={cn(
                      "h-11 pr-20",
                      errors.password && "border-red-500 focus:border-red-500"
                    )}
                  />
                  <button
                    type="button"
                    onClick={handleRegeneratePassword}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-100 rounded transition-colors"
                    title="Generate password baru"
                  >
                    <RefreshCw className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    {errors.password}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Contract Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs flex items-center justify-center font-bold">
                2
              </span>
              Kontrak
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-700">
                  Tanggal Mulai <span className="text-red-500">*</span>
                </Label>
                <div className="h-11 px-4 flex items-center bg-slate-50 border border-slate-200 rounded-lg text-sm">
                  <Calendar className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
                  <span>{format(contractStart, "dd MMM yyyy", { locale: id })}</span>
                </div>
                <p className="text-xs text-slate-400">Sesuai tanggal check-in</p>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700">
                  Tanggal Selesai <span className="text-red-500">*</span>
                </Label>
                <div className="h-11 px-4 flex items-center bg-slate-50 border border-slate-200 rounded-lg text-sm">
                  <Calendar className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
                  <span>
                    {contractEnd
                      ? format(contractEnd, "dd MMM yyyy", { locale: id })
                      : "Tanpa batas"}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {contractEnd
                    ? `${durationLabel} dari check-in`
                    : "开放式合同"}
                </p>
              </div>
            </div>

            {/* Contract Summary */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <p className="text-sm text-slate-600">
                <span className="font-medium">Kontrak:</span>{" "}
                {format(contractStart, "dd MMM yyyy", { locale: id })} -{" "}
                {contractEnd
                  ? format(contractEnd, "dd MMM yyyy", { locale: id })
                  : "Open"}{" "}
                <span className="text-amber-600 font-medium">({durationLabel})</span>
              </p>
            </div>
          </div>

          {/* Emergency Contact Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs flex items-center justify-center font-bold">
                3
              </span>
              Kontak Darurat{" "}
              <span className="text-xs font-normal text-slate-400">(opsional)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyName" className="text-slate-700">
                  Nama
                </Label>
                <Input
                  id="emergencyName"
                  value={formData.emergencyName}
                  onChange={(e) => handleInputChange("emergencyName", e.target.value)}
                  placeholder="Nama kontak darurat"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyPhone" className="text-slate-700">
                  No. HP
                </Label>
                <Input
                  id="emergencyPhone"
                  type="tel"
                  value={formData.emergencyPhone}
                  onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="h-11"
                />
              </div>
            </div>
          </div>

          {/* Info Note */}
          <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <Info className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-emerald-800">Tenant akan menerima email login</p>
              <p className="text-emerald-700 mt-1">
                Password akan dikirim ke email tenant secara otomatis setelah tenant dibuat.
              </p>
            </div>
          </div>

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
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Simpan & Buat Tenant
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
