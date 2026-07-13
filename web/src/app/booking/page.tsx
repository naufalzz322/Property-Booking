import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Home, Calendar } from "lucide-react";
import { getPropertyName } from "@/lib/property";

export const dynamic = "force-dynamic";

async function getUnits() {
  const units = await prisma.unit.findMany({
    where: { status: "AVAILABLE" },
    include: { property: true },
    orderBy: [{ type: "asc" }, { pricePerMonth: "asc" }],
  });

  return units.map((u) => ({
    id: u.id,
    slug: u.slug,
    name: u.name,
    unitNumber: u.unitNumber,
    type: u.type,
    description: u.description,
    facilities: u.facilities,
    photos: u.photos,
    status: u.status,
    pricePerMonth: u.pricePerMonth ? Number(u.pricePerMonth) : null,
    pricePerNight: u.pricePerNight ? Number(u.pricePerNight) : null,
  }));
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

function getPriceUnit(type: string): string {
  return type === "KOS_BULANAN" ? "bulan" : "malam";
}

export default async function BookingPage() {
  const units = await getUnits();
  const propertyName = await getPropertyName();

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
              <span className="text-xl font-bold text-stone-900">{propertyName}</span>
            </Link>
            <nav className="flex items-center gap-4" />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-stone-900">Pesan Kamar</h1>
          <p className="mt-2 text-stone-500">
            Pilih kamar yang tersedia untuk melakukan pemesanan
          </p>
        </div>

        {units.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {units.map((unit) => (
              <Link
                key={unit.id}
                href={`/kamar/${unit.slug}`}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="relative aspect-[4/3] bg-stone-200">
                  {unit.photos && unit.photos.length > 0 ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={unit.photos[0]}
                      alt={`Kamar ${unit.unitNumber}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Home className="w-16 h-16 text-stone-400" />
                    </div>
                  )}
                  <span className="absolute top-3 right-3 px-2 py-1 bg-green-600/90 backdrop-blur-sm text-white text-xs font-medium rounded-full shadow-lg">
                    Tersedia
                  </span>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-stone-500">
                      {typeLabels[unit.type] || unit.type}
                    </span>
                    <span className="text-xs font-medium text-stone-400">
                      Unit {unit.unitNumber}
                    </span>
                  </div>
                  {unit.description && (
                    <p className="mt-2 text-sm text-stone-600 line-clamp-2">
                      {unit.description}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {unit.facilities.slice(0, 3).map((facility, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-stone-100 text-stone-600 text-xs rounded-full"
                      >
                        {facility}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold text-amber-600">
                      {formatCurrency(unit.pricePerMonth || unit.pricePerNight || 0)}
                    </p>
                    <p className="text-sm text-stone-500">
                      /{getPriceUnit(unit.type)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-stone-200 rounded-full flex items-center justify-center mx-auto">
              <Home className="w-10 h-10 text-stone-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-stone-900">
              Tidak Ada Kamar Tersedia
            </h3>
            <p className="mt-2 text-stone-500">
              Saat ini semua kamar sedang terisi. Silakan hubungi kami untuk informasi lebih lanjut.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
