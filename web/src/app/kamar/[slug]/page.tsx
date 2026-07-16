import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Home, Check } from "lucide-react";
import { BookingForm } from "@/components/public/BookingForm";
import { PhotoGallery } from "@/components/public/PhotoGallery";
import { PropertyContactCard } from "@/components/public/PropertyContactCard";
import { getPropertyContactInfo } from "@/lib/property";

export const dynamic = "force-dynamic";

async function getUnit(slug: string) {
  return prisma.unit.findUnique({
    where: { slug },
    include: { property: true },
  });
}

async function getBookedDates(unitId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);

  const bookings = await prisma.booking.findMany({
    where: {
      unitId,
      status: { in: ["CONFIRMED", "CHECKED_IN"] },
      checkInDate: { lte: endOfMonth },
    },
    select: {
      id: true,
      bookingNumber: true,
      checkInDate: true,
      durationMonths: true,
      durationNights: true,
      status: true,
    },
  });

  return bookings;
}

const typeLabels: Record<string, string> = {
  KOS_BULANAN: "Kos Bulanan",
  KOS_HARIAN: "Kos Harian",
  GUEST_HOUSE: "Guest House",
  VILLA: "Villa",
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default async function KamarDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const unit = await getUnit(slug);

  if (!unit) {
    notFound();
  }

  const bookings = await getBookedDates(unit.id);
  const price = Number(unit.pricePerMonth || unit.pricePerNight || 0);
  const contactInfo = await getPropertyContactInfo();

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-stone-900">{unit.name || unit.property.name || "Graha Maju"}</span>
            </Link>
            <Link
              href="/kamar"
              className="text-sm text-stone-600 hover:text-stone-900 transition-colors"
            >
              ← Kembali ke daftar kamar
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Photos + Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Photo Gallery */}
            <PhotoGallery
              photos={unit.photos || []}
              unitNumber={unit.unitNumber}
            />

            {/* Unit Title */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-stone-900">
                {unit.name}
              </h1>
              <p className="mt-1 text-stone-500">Unit {unit.unitNumber} • {unit.name || unit.property.name}</p>
              <p className="mt-4 text-3xl md:text-4xl font-bold text-amber-600">
                {formatCurrency(price)}
                <span className="text-base font-normal text-stone-500">
                  /{unit.type === "KOS_BULANAN" ? "bulan" : "malam"}
                </span>
              </p>
            </div>

            {/* Description */}
            {unit.description && (
              <div>
                <h3 className="font-semibold text-stone-900 mb-2">Deskripsi</h3>
                <p className="text-stone-600">{unit.description}</p>
              </div>
            )}

            {/* Facilities */}
            <div>
              <h3 className="font-semibold text-stone-900 mb-3">Fasilitas</h3>
              <div className="grid grid-cols-2 gap-3">
                {unit.facilities.map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-amber-600" />
                    </div>
                    <span className="text-sm text-stone-700">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <PropertyContactCard {...contactInfo} variant="default" />
          </div>

          {/* Right Column - Booking Form */}
          <div className="lg:col-span-2">
            <BookingForm
                unit={{
                  id: unit.id,
                  slug: unit.slug,
                  name: unit.name,
                  unitNumber: unit.unitNumber,
                  type: unit.type,
                  description: unit.description,
                  facilities: unit.facilities,
                  photos: unit.photos,
                  status: unit.status,
                  pricePerMonth: unit.pricePerMonth ? Number(unit.pricePerMonth) : null,
                  pricePerNight: unit.pricePerNight ? Number(unit.pricePerNight) : null,
                  property: {
                    name: unit.property.name,
                  },
                }}
                bookedDates={bookings.map((b) => ({
                  date: b.checkInDate.toISOString().split("T")[0],
                  status: b.status === "CHECKED_IN" ? "checked_in" : "booked",
                  bookingNumber: b.bookingNumber,
                  durationMonths: b.durationMonths ?? undefined,
                  durationNights: b.durationNights ?? undefined,
                }))}
              />
          </div>
        </div>
      </div>
    </div>
  );
}
