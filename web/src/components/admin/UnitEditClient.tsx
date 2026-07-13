"use client";

import { useState, useRef, useCallback } from "react";

// Format number with thousand separator (Indonesian format with .)
function formatNumber(value: string): string {
  const num = value.replace(/\D/g, "");
  if (!num) return "";
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Parse formatted number back to raw number
function parseFormattedNumber(value: string): string {
  return value.replace(/\./g, "");
}
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Upload,
  X,
  Plus,
  GripVertical,
  CheckCircle,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface Unit {
  id: string;
  slug: string;
  name: string;
  unitNumber: string;
  type: string;
  status: string;
  pricePerMonth: number | null;
  pricePerNight: number | null;
  facilities: string[];
  photos: string[];
  description: string | null;
}

function generateSlug(unitNumber: string): string {
  return unitNumber.toLowerCase().replace(/\s+/g, "-");
}

const typeOptions = [
  { value: "KOS_BULANAN", label: "Kos Bulanan" },
  { value: "KOS_HARIAN", label: "Kos Harian" },
  { value: "GUEST_HOUSE", label: "Guest House" },
  { value: "VILLA", label: "Villa" },
];

const statusOptions = [
  { value: "AVAILABLE", label: "Tersedia", color: "bg-emerald-100 text-emerald-800" },
  { value: "BOOKED", label: "Dipesan", color: "bg-amber-100 text-amber-800" },
  { value: "OCCUPIED", label: "Terisi", color: "bg-blue-100 text-blue-800" },
  { value: "MAINTENANCE", label: "Maintenance", color: "bg-purple-100 text-purple-800" },
];

const predefinedFacilities = [
  "AC",
  "WiFi",
  "Kamar Mandi Dalam",
  "TV",
  "Kipas Angin",
  "Kulkas",
  "Mesin Cuci",
  "Dapur",
  "Balkon",
  "Parkir",
  "CCTV",
  "Akses Kunci Kartu",
  "Water Heater",
  "Lemari Pakaian",
  "Meja Belajar",
  "Kursi",
  "Spring Bed",
  "Kasur",
  "Bantal",
  "Gorden",
];

interface SortablePhotoProps {
  id: string;
  photo: string;
  index: number;
  onRemove: (index: number) => void;
}

function SortablePhoto({ id, photo, index, onRemove }: SortablePhotoProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.8 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative aspect-[4/3] rounded-xl overflow-hidden group bg-slate-100",
        isDragging && "ring-2 ring-amber-500 shadow-lg"
      )}
    >
      <img
        src={photo}
        alt={`Photo ${index + 1}`}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="w-10 h-10 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
      >
        <div className="w-8 h-8 bg-black/50 hover:bg-black/70 rounded-lg flex items-center justify-center">
          <GripVertical className="w-4 h-4 text-white" />
        </div>
      </div>
      {index === 0 && (
        <div className="absolute bottom-2 left-2 px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded">
          Cover
        </div>
      )}
    </div>
  );
}

export function UnitEditClient({
  unit,
}: {
  unit: Unit;
}) {
  const router = useRouter();
  const { success, error: showError } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    unitNumber: unit.unitNumber,
    slug: unit.slug,
    name: unit.name,
    type: unit.type,
    status: unit.status,
    pricePerMonth: unit.pricePerMonth ? formatNumber(unit.pricePerMonth.toString()) : "",
    pricePerNight: unit.pricePerNight ? formatNumber(unit.pricePerNight.toString()) : "",
    description: unit.description || "",
    facilities: unit.facilities,
    photos: unit.photos,
  });
  const [customFacility, setCustomFacility] = useState("");

  // Format price for display (e.g., 2500000 -> 2.500.000)
  const formatPriceDisplay = (value: number | null): string => {
    if (!value) return "";
    return formatNumber(value.toString());
  };

  // Handle price input change
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, field: "pricePerMonth" | "pricePerNight") => {
    const rawValue = parseFormattedNumber(e.target.value);
    const formattedValue = formatNumber(rawValue);
    setFormData((prev) => ({
      ...prev,
      [field]: formattedValue,
    }));
  };

  // DnD Kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end for reordering photos
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setFormData((prev) => {
        const oldIndex = prev.photos.indexOf(active.id as string);
        const newIndex = prev.photos.indexOf(over.id as string);
        return {
          ...prev,
          photos: arrayMove(prev.photos, oldIndex, newIndex),
        };
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Auto-generate slug when unitNumber changes
      if (name === "unitNumber") {
        updated.slug = generateSlug(value);
      }
      return updated;
    });
  };

  const toggleFacility = (facility: string) => {
    setFormData((prev) => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter((f) => f !== facility)
        : [...prev.facilities, facility],
    }));
  };

  const addCustomFacility = () => {
    if (customFacility.trim() && !formData.facilities.includes(customFacility.trim())) {
      setFormData((prev) => ({
        ...prev,
        facilities: [...prev.facilities, customFacility.trim()],
      }));
      setCustomFacility("");
    }
  };

  const removeFacility = (facility: string) => {
    setFormData((prev) => ({
      ...prev,
      facilities: prev.facilities.filter((f) => f !== facility),
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setFormData((prev) => ({
          ...prev,
          photos: [...prev.photos, result],
        }));
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.unitNumber || !formData.name || !formData.type) {
      showError("No. Unit, Nama Unit, dan Tipe wajib diisi");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/units/${unit.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitNumber: formData.unitNumber,
          slug: formData.slug,
          name: formData.name,
          type: formData.type,
          status: formData.status,
          pricePerMonth: formData.pricePerMonth ? Number(parseFormattedNumber(formData.pricePerMonth)) : null,
          pricePerNight: formData.pricePerNight ? Number(parseFormattedNumber(formData.pricePerNight)) : null,
          description: formData.description || null,
          facilities: formData.facilities,
          photos: formData.photos,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        success("Unit berhasil disimpan");
        // Redirect to new slug if changed
        if (data.unit.slug !== unit.slug) {
          router.push(`/admin/unit/${data.unit.slug}`);
        } else {
          router.push(`/admin/unit/${unit.slug}`);
        }
      } else {
        const data = await res.json();
        showError(data.error || "Gagal menyimpan unit");
      }
    } catch {
      showError("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/admin/unit/${unit.slug}`}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Edit Unit</h1>
            <p className="text-slate-500">Unit {unit.unitNumber}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Info Dasar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Unit *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Kamar Deluxe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unitNumber">No. Unit *</Label>
                <Input
                  id="unitNumber"
                  name="unitNumber"
                  value={formData.unitNumber}
                  onChange={handleChange}
                  placeholder="101"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder="unit-101"
                />
                <p className="text-xs text-slate-400">Slug unik untuk URL</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipe *</Label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full h-11 px-3 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                >
                  {typeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full h-11 px-3 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Harga</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pricePerMonth">Harga per Bulan</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                    Rp
                  </span>
                  <Input
                    id="pricePerMonth"
                    name="pricePerMonth"
                    type="text"
                    inputMode="numeric"
                    value={formData.pricePerMonth}
                    onChange={(e) => handlePriceChange(e, "pricePerMonth")}
                    placeholder="2.500.000"
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-slate-400">Untuk Kos Bulanan</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pricePerNight">Harga per Malam</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                    Rp
                  </span>
                  <Input
                    id="pricePerNight"
                    name="pricePerNight"
                    type="text"
                    inputMode="numeric"
                    value={formData.pricePerNight}
                    onChange={(e) => handlePriceChange(e, "pricePerNight")}
                    placeholder="150.000"
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-slate-400">Untuk Kos Harian, Guest House, Villa</p>
              </div>
            </div>
            <p className="text-xs text-amber-600 flex items-center gap-1">
              <span className="w-1 h-1 bg-amber-500 rounded-full" />
              Kosongkan jika tidak berlaku
            </p>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>Deskripsi</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Deskripsi unit..."
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
            />
          </CardContent>
        </Card>

        {/* Facilities */}
        <Card>
          <CardHeader>
            <CardTitle>Fasilitas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {predefinedFacilities.map((facility) => (
                <button
                  key={facility}
                  type="button"
                  onClick={() => toggleFacility(facility)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors text-left",
                    formData.facilities.includes(facility)
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                  )}
                >
                  <div
                    className={cn(
                      "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                      formData.facilities.includes(facility)
                        ? "bg-emerald-500 border-emerald-500"
                        : "border-slate-300"
                    )}
                  >
                    {formData.facilities.includes(facility) && (
                      <CheckCircle className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className="text-sm font-medium">{facility}</span>
                </button>
              ))}
            </div>

            {/* Custom Facilities */}
            {formData.facilities.filter((f) => !predefinedFacilities.includes(f)).length > 0 && (
              <div className="pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-500 mb-2">Fasilitas custom:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.facilities
                    .filter((f) => !predefinedFacilities.includes(f))
                    .map((facility) => (
                      <span
                        key={facility}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 rounded-full text-sm"
                      >
                        {facility}
                        <button
                          type="button"
                          onClick={() => removeFacility(facility)}
                          className="ml-1 hover:text-amber-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                </div>
              </div>
            )}

            {/* Add Custom Facility */}
            <div className="pt-4 border-t border-slate-200">
              <div className="flex gap-2">
                <Input
                  value={customFacility}
                  onChange={(e) => setCustomFacility(e.target.value)}
                  placeholder="Tambah fasilitas custom..."
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomFacility();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addCustomFacility}
                  disabled={!customFacility.trim()}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Photos */}
        <Card>
          <CardHeader>
            <CardTitle>Foto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-500 flex items-center gap-2">
              <span className="w-1 h-1 bg-amber-500 rounded-full" />
              Foto paling kiri akan digunakan sebagai cover utama
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
            />

            {formData.photos.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={formData.photos}
                  strategy={rectSortingStrategy}
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.photos.map((photo, index) => (
                      <SortablePhoto
                        key={photo}
                        id={photo}
                        photo={photo}
                        index={index}
                        onRemove={removePhoto}
                      />
                    ))}
                    {/* Add More Photos Button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-[4/3] rounded-xl border-2 border-dashed border-slate-300 hover:border-amber-400 hover:bg-amber-50 transition-colors flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-amber-600"
                    >
                      <Plus className="w-8 h-8" />
                      <span className="text-sm font-medium">Tambah Foto</span>
                    </button>
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-video rounded-xl border-2 border-dashed border-slate-300 hover:border-amber-400 hover:bg-amber-50 transition-colors flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-amber-600"
              >
                <Upload className="w-12 h-12" />
                <div className="text-center">
                  <p className="font-medium">Klik untuk upload foto</p>
                  <p className="text-sm">PNG, JPG, WEBP up to 5MB</p>
                </div>
              </button>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link href={`/admin/unit/${unit.slug}`}>
            <Button type="button" variant="outline">
              Batal
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={loading}
            className="bg-amber-500 hover:bg-amber-600"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </div>
  );
}
