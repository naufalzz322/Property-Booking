"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Loader2, Plus, X } from "lucide-react";

interface UnitNewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UnitNewModal({ isOpen, onClose }: UnitNewModalProps) {
  const router = useRouter();
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    unitNumber: "",
    name: "",
    type: "KOS_BULANAN" as "KOS_BULANAN" | "KOS_HARIAN" | "GUEST_HOUSE" | "VILLA",
    pricePerMonth: "",
    pricePerNight: "",
    facilities: [] as string[],
    description: "",
  });
  const [facilityInput, setFacilityInput] = useState("");

  const typeLabels: Record<string, string> = {
    KOS_BULANAN: "Kos Bulanan",
    KOS_HARIAN: "Kos Harian",
    GUEST_HOUSE: "Guest House",
    VILLA: "Villa",
  };

  const handleAddFacility = () => {
    if (facilityInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        facilities: [...prev.facilities, facilityInput.trim()],
      }));
      setFacilityInput("");
    }
  };

  const handleRemoveFacility = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      facilities: prev.facilities.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    if (!formData.unitNumber || !formData.name) {
      showError("No. Unit dan Nama Unit wajib diisi");
      return;
    }

    const typeRequiresMonthly = formData.type === "KOS_BULANAN" || formData.type === "GUEST_HOUSE" || formData.type === "VILLA";
    const typeRequiresNightly = formData.type === "KOS_HARIAN";

    if (typeRequiresMonthly && !formData.pricePerMonth) {
      showError("Harga per bulan wajib diisi untuk tipe ini");
      return;
    }
    if (typeRequiresNightly && !formData.pricePerNight) {
      showError("Harga per malam wajib diisi untuk Kos Harian");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/units", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitNumber: formData.unitNumber,
          name: formData.name || null,
          type: formData.type,
          pricePerMonth: formData.pricePerMonth ? parseInt(formData.pricePerMonth) : null,
          pricePerNight: formData.pricePerNight ? parseInt(formData.pricePerNight) : null,
          facilities: formData.facilities,
          description: formData.description || null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        success("Unit berhasil dibuat!");
        onClose();
        setFormData({
          unitNumber: "",
          name: "",
          type: "KOS_BULANAN",
          pricePerMonth: "",
          pricePerNight: "",
          facilities: [],
          description: "",
        });
        router.refresh();
      } else {
        showError(data.error || "Gagal membuat unit");
      }
    } catch {
      showError("Terjadi kesalahan saat membuat unit");
    } finally {
      setLoading(false);
    }
  };

  const isMonthlyType = formData.type === "KOS_BULANAN" || formData.type === "GUEST_HOUSE" || formData.type === "VILLA";
  const isNightlyType = formData.type === "KOS_HARIAN";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Unit Baru</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Unit Number */}
          <div className="space-y-2">
            <Label>
              No. Unit <span className="text-red-500">*</span>
            </Label>
            <Input
              value={formData.unitNumber}
              onChange={(e) => setFormData((prev) => ({ ...prev, unitNumber: e.target.value }))}
              placeholder="cth: 101, A1, Lt-2"
            />
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label>
              Nama Unit <span className="text-red-500">*</span>
            </Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="cth: Kamar Deluxe, Suite 2"
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label>
              Tipe <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.type}
              onValueChange={(v) => v && setFormData((prev) => ({ ...prev, type: v as any }))}
            >
              <SelectTrigger>
                <SelectValue>{typeLabels[formData.type]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(typeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-4">
            {isMonthlyType && (
              <div className="space-y-2">
                <Label>Harga/Bulan</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    Rp
                  </span>
                  <Input
                    type="number"
                    value={formData.pricePerMonth}
                    onChange={(e) => setFormData((prev) => ({ ...prev, pricePerMonth: e.target.value }))}
                    className="pl-10"
                    placeholder="0"
                  />
                </div>
              </div>
            )}
            {isNightlyType && (
              <div className="space-y-2">
                <Label>Harga/Malam</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    Rp
                  </span>
                  <Input
                    type="number"
                    value={formData.pricePerNight}
                    onChange={(e) => setFormData((prev) => ({ ...prev, pricePerNight: e.target.value }))}
                    className="pl-10"
                    placeholder="0"
                  />
                </div>
              </div>
            )}
            {isMonthlyType && (
              <div className="space-y-2">
                <Label>Harga/Malam (Opsional)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    Rp
                  </span>
                  <Input
                    type="number"
                    value={formData.pricePerNight}
                    onChange={(e) => setFormData((prev) => ({ ...prev, pricePerNight: e.target.value }))}
                    className="pl-10"
                    placeholder="Opsional"
                  />
                </div>
              </div>
            )}
            {isNightlyType && (
              <div className="space-y-2">
                <Label>Harga/Bulan (Opsional)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    Rp
                  </span>
                  <Input
                    type="number"
                    value={formData.pricePerMonth}
                    onChange={(e) => setFormData((prev) => ({ ...prev, pricePerMonth: e.target.value }))}
                    className="pl-10"
                    placeholder="Opsional"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Facilities */}
          <div className="space-y-2">
            <Label>Fasilitas</Label>
            <div className="flex gap-2">
              <Input
                value={facilityInput}
                onChange={(e) => setFacilityInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddFacility())}
                placeholder="cth: AC, WiFi, Kamar Mandi Dalam"
              />
              <Button type="button" variant="outline" onClick={handleAddFacility} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formData.facilities.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.facilities.map((facility, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 text-sm rounded-lg"
                  >
                    {facility}
                    <button
                      type="button"
                      onClick={() => handleRemoveFacility(index)}
                      className="hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Deskripsi</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Deskripsi tambahan..."
              rows={3}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={loading} className="flex-1">
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="flex-1 bg-amber-500 hover:bg-amber-600">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Simpan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
