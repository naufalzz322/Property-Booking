"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Home as HomeIcon, Wifi, Car, Video, Shield, Phone, MapPin, Clock, ChevronDown, ArrowUp, Search, X } from "lucide-react";
import { RoomCardSkeleton, RoomGridSkeleton } from "@/components/public/RoomCardSkeleton";
import { NoRoomsAvailable } from "@/components/public/EmptyState";

// Dynamic import for map to avoid SSR issues
const PropertyMap = dynamic(() => import("@/components/public/PropertyMap"), {
  ssr: false,
  loading: () => (
    <div className="h-80 bg-stone-200 rounded-xl flex items-center justify-center">
      <div className="text-stone-500">Memuat peta...</div>
    </div>
  ),
});

const HERO_IMAGE = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1920&q=80";

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
  switch (type) {
    case "KOS_BULANAN":
      return "bulan";
    default:
      return "malam";
  }
}

function RoomCard({ unit }: { unit: any }) {
  const price = unit.pricePerMonth || unit.pricePerNight || 0;
  const priceUnit = getPriceUnit(unit.type);

  return (
    <Link
      href={`/kamar/${unit.slug}`}
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
    >
      <div className="relative aspect-[4/3] bg-stone-200">
        {unit.photos && unit.photos.length > 0 ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={unit.photos[0]}
            alt={unit.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <HomeIcon className="w-16 h-16 text-stone-400" />
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-stone-500">
            {typeLabels[unit.type] || unit.type}
          </span>
        </div>
        <h3 className="font-semibold text-stone-900 mt-1">{unit.name}</h3>
        <p className="text-xs text-stone-400 mt-0.5">Unit {unit.unitNumber}</p>
        <p className="mt-2 text-sm text-stone-600 line-clamp-2">
          {unit.description}
        </p>
        <div className="mt-3 flex flex-wrap gap-1">
          {unit.facilities.slice(0, 3).map((facility: string, i: number) => (
            <span
              key={i}
              className="px-2 py-0.5 bg-stone-100 text-stone-600 text-xs rounded-full"
            >
              {facility}
            </span>
          ))}
          {unit.facilities.length > 3 && (
            <span className="px-2 py-0.5 bg-stone-100 text-stone-500 text-xs rounded-full">
              +{unit.facilities.length - 3}
            </span>
          )}
        </div>
        <div className="mt-4">
          <p className="text-2xl font-bold text-amber-600">
            {formatCurrency(price)}
          </p>
          <p className="text-sm text-stone-500">/{priceUnit}</p>
        </div>
      </div>
    </Link>
  );
}

interface Unit {
  id: string;
  unitNumber: string;
  type: string;
  slug: string;
  pricePerMonth: number | null;
  pricePerNight: number | null;
  facilities: string[];
  photos: string[];
  description: string | null;
}

interface Property {
  id: string;
  name: string | null;
  address: string | null;
  description: string | null;
  slug: string;
  latitude?: number;
  longitude?: number;
}

export default function LandingPage({ property, allUnits }: { property: Property | null; allUnits: Unit[] }) {
  const [visibleCount, setVisibleCount] = useState(3);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const visibleUnits = allUnits.slice(0, visibleCount);
  const hasMore = visibleCount < allUnits.length;

  // Filter units based on search
  const filteredUnits = searchQuery.trim()
    ? allUnits.filter(unit =>
        unit.unitNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        unit.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        unit.facilities.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : allUnits;

  const displayedUnits = searchQuery.trim() ? filteredUnits : visibleUnits;
  const showSearchResults = searchQuery.trim().length > 0;
  const hasMoreSearch = showSearchResults ? false : hasMore;

  // Back to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    // Simulate loading state for search
    if (value.trim()) {
      setIsSearching(true);
      setTimeout(() => setIsSearching(false), 300);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const facilities = [
    { icon: Wifi, name: "WiFi 100Mbps", desc: "Internet cepat 24/7" },
    { icon: Car, name: "Parkir Mobil", desc: "Area parkir aman" },
    { icon: Video, name: "CCTV 24 Jam", desc: "Keamanan terjamin" },
    { icon: Shield, name: "Akses Kartu", desc: "Akses aman & privat" },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                <HomeIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-stone-900">
                {property?.name || "Graha Maju"}
              </span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="#fasilitas" className="text-stone-600 hover:text-stone-900">
                Fasilitas
              </Link>
              <Link href="#kamar" className="text-stone-600 hover:text-stone-900">
                Kamar
              </Link>
              <Link href="#lokasi" className="text-stone-600 hover:text-stone-900">
                Lokasi
              </Link>
              <Link
                href="#pesan-sekarang"
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
              >
                Pesan Sekarang
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-stone-900 text-white overflow-hidden" style={{ minHeight: "500px" }}>
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={HERO_IMAGE}
            alt="Modern apartment interior"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900 via-stone-900/90 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
              Kenyamanan Rumah,
              <br />
              <span className="text-amber-400">Fleksibilitas Tinggal</span>
            </h1>
            <p className="mt-6 text-lg text-stone-300">
              Properti eksklusif dengan fasilitas lengkap di lokasi strategis Jakarta.
              Lingkungan aman, nyaman, dan modern.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href="/kamar"
                className="px-8 py-4 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-colors text-center"
              >
                Lihat Kamar Tersedia
              </Link>
              <Link
                href="#pesan-sekarang"
                className="px-8 py-4 border border-stone-500 text-white font-semibold rounded-lg hover:bg-stone-800 transition-colors text-center"
              >
                Pesan Sekarang
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Facilities */}
      <section id="fasilitas" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900">Fasilitas Unggulan</h2>
            <p className="mt-2 text-stone-500">Semua yang Anda butuhkan untuk tinggal nyaman</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {facilities.map((f) => (
              <div
                key={f.name}
                className="p-6 bg-stone-50 rounded-xl text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                  <f.icon className="w-7 h-7 text-amber-600" />
                </div>
                <h3 className="mt-4 font-semibold text-stone-900">{f.name}</h3>
                <p className="mt-1 text-sm text-stone-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rooms */}
      <section id="kamar" className="py-16 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-stone-900">Kamar & Unit</h2>
            <p className="mt-2 text-stone-500">
              {allUnits.length} kamar tersedia
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
                type="text"
                placeholder="Cari kamar, fasilitas..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-12 pr-10 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-shadow"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-stone-100 rounded-full transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4 text-stone-400" />
                </button>
              )}
            </div>
          </div>

          {/* Results info */}
          {showSearchResults && (
            <div className="text-center mb-6">
              <p className="text-stone-600">
                {isSearching ? (
                  "Mencari..."
                ) : filteredUnits.length > 0 ? (
                  <>
                    <span className="font-semibold text-amber-600">{filteredUnits.length}</span> kamar ditemukan
                    untuk "{searchQuery}"
                  </>
                ) : (
                  `Tidak ada kamar untuk "${searchQuery}"`
                )}
              </p>
            </div>
          )}

          {/* Room Grid */}
          {isSearching ? (
            <RoomGridSkeleton count={3} />
          ) : allUnits.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedUnits.map((unit) => (
                  <RoomCard key={unit.id} unit={unit} />
                ))}
              </div>

              {/* No search results */}
              {showSearchResults && filteredUnits.length === 0 && (
                <div className="mt-8">
                  <NoRoomsAvailable />
                </div>
              )}

              {/* Load More */}
              {!showSearchResults && hasMore && (
                <div className="mt-8 text-center">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 3)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-stone-300 text-stone-700 font-semibold rounded-lg hover:bg-stone-50 hover:border-stone-400 transition-colors"
                  >
                    <span>Lihat Kamar Lainnya</span>
                    <ChevronDown className="w-5 h-5" />
                  </button>
                  <p className="mt-2 text-sm text-stone-500">
                    Menampilkan {visibleCount} dari {allUnits.length} kamar
                  </p>
                </div>
              )}
            </>
          ) : (
            <NoRoomsAvailable />
          )}

          <div className="mt-8 text-center">
            <Link
              href="/kamar"
              className="inline-flex items-center text-amber-600 font-semibold hover:text-amber-700"
            >
              Lihat Semua Kamar →
            </Link>
          </div>
        </div>
      </section>

      {/* Location */}
      <section id="lokasi" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Text Info */}
            <div>
              <h2 className="text-3xl font-bold text-stone-900">Lokasi Strategis</h2>
              <p className="mt-4 text-stone-600">
                {property?.address || "Jl. Sudirman No. 45, Jakarta Selatan"}
              </p>
              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-stone-900">Akses Mudah</h4>
                    <p className="text-sm text-stone-500">Dekat jalan utama dan transportasi umum</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-stone-900">Dekat Fasilitas</h4>
                    <p className="text-sm text-stone-500">
                      Mall, restoran, dan pusat kesehatan dalam radius 5 menit
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Map */}
            <div className="h-80 lg:h-[400px] rounded-xl overflow-hidden shadow-lg">
              <PropertyMap
                lat={property?.latitude || -6.2088}
                lng={property?.longitude || 106.8456}
                address={property?.address || "Jl. Sudirman No. 45, Jakarta Selatan"}
                name={property?.name || "Graha Maju"}
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="pesan-sekarang" className="py-16 bg-amber-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">Hubungi Kami</h2>
          <p className="mt-4 text-amber-100">
            Pesan via website atau hubungi langsung via WhatsApp
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/kamar"
              className="px-8 py-4 bg-white text-amber-600 font-semibold rounded-lg hover:bg-stone-100 transition-colors"
            >
              Pesan via Website
            </Link>
            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 border border-white text-white font-semibold rounded-lg hover:bg-amber-600 transition-colors inline-flex items-center justify-center gap-2"
            >
              <Phone className="w-5 h-5" />
              Hubungi via WA
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-stone-900 text-stone-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>© 2026 {property?.name || "Graha Maju"}. All rights reserved.</p>
        </div>
      </footer>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          aria-label="Kembali ke atas"
          className="fixed bottom-6 right-6 w-12 h-12 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-50"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
