"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Calendar, Home, Clock, Phone, Mail, MapPin } from "lucide-react";

interface BookingDetail {
  id: string;
  bookingNumber: string;
  unit: {
    unitNumber: string;
    type: string;
    name?: string | null;
    property: {
      name: string;
    };
  };
  guestName: string;
  checkInDate: string;
  durationMonths?: number;
  durationNights?: number;
}

interface PropertyContact {
  propertyName: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  operationalHours: string | null;
}

function BookingConfirmContent() {
  const searchParams = useSearchParams();
  const bookingNumber = searchParams.get("booking") || "";
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [propertyContact, setPropertyContact] = useState<PropertyContact | null>(null);

  useEffect(() => {
    // Fetch booking details
    if (bookingNumber) {
      fetch(`/api/booking/${bookingNumber}`)
        .then((res) => res.json())
        .then((data) => {
          setBooking(data.booking);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }

    // Fetch property contact info
    fetch("/api/property/contact")
      .then((res) => res.json())
      .then(setPropertyContact)
      .catch(() => {});
  }, [bookingNumber]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const typeLabels: Record<string, string> = {
    KOS_BULANAN: "Kos Bulanan",
    KOS_HARIAN: "Kos Harian",
    GUEST_HOUSE: "Guest House",
    VILLA: "Villa",
  };

  return (
    <div className="max-w-md w-full text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-10 h-10 text-green-600" />
      </div>
      <h1 className="text-2xl font-bold text-stone-900">Booking Berhasil!</h1>
      <p className="mt-2 text-stone-600">
        Permintaan booking Anda telah kami terima.
      </p>

      {loading ? (
        <div className="mt-6 text-stone-500">Memuat detail...</div>
      ) : booking ? (
        <div className="mt-6 space-y-4">
          {/* Booking Number */}
          <div className="p-4 bg-white rounded-lg border border-stone-200">
            <p className="text-sm text-stone-500">No. Booking</p>
            <p className="text-xl font-bold text-amber-600">{booking.bookingNumber}</p>
          </div>

          {/* Booking Details */}
          <div className="p-4 bg-white rounded-lg border border-stone-200 text-left space-y-3">
            <div className="flex items-center gap-3">
              <Home className="w-5 h-5 text-stone-400" />
              <div>
                <p className="text-sm text-stone-500">Kamar</p>
                <p className="font-medium">
                  {booking.unit.name || booking.unit.property.name} - Unit {booking.unit.unitNumber}
                </p>
                <p className="text-sm text-stone-500">
                  {typeLabels[booking.unit.type] || booking.unit.type}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-stone-400" />
              <div>
                <p className="text-sm text-stone-500">Tanggal Check-in</p>
                <p className="font-medium">{formatDate(booking.checkInDate)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-stone-400" />
              <div>
                <p className="text-sm text-stone-500">Durasi</p>
                <p className="font-medium">
                  {booking.durationMonths
                    ? `${booking.durationMonths} bulan`
                    : booking.durationNights
                    ? `${booking.durationNights} hari`
                    : "-"}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 p-4 bg-white rounded-lg border border-stone-200">
          <p className="text-sm text-stone-500">No. Booking</p>
          <p className="text-xl font-bold text-amber-600">{bookingNumber || "BK-XXXX-0000"}</p>
        </div>
      )}

      <p className="mt-6 text-sm text-stone-500">
        Tim kami akan menghubungi Anda dalam 1x24 jam untuk konfirmasi.
        Mohon pastikan nomor WhatsApp aktif.
      </p>

      <div className="mt-8 flex flex-col gap-3">
        <Link
          href="/"
          className="px-6 py-3 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-colors"
        >
          Kembali ke Beranda
        </Link>
        <Link
          href="/kamar"
          className="px-6 py-3 border border-stone-300 text-stone-700 font-semibold rounded-lg hover:bg-stone-100 transition-colors"
        >
          Lihat Kamar Lain
        </Link>
      </div>

      {/* Property Contact Info */}
      {propertyContact && (propertyContact.phone || propertyContact.email || propertyContact.address) && (
        <div className="mt-6 p-4 bg-white rounded-lg border border-stone-200 text-left">
          <p className="text-sm font-medium text-stone-700 mb-3">Hubungi Kami</p>
          <div className="space-y-2">
            {propertyContact.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-stone-400" />
                <a href={`tel:${propertyContact.phone}`} className="text-stone-600 hover:text-amber-600">
                  {propertyContact.phone}
                </a>
              </div>
            )}
            {propertyContact.email && (
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-stone-400" />
                <a href={`mailto:${propertyContact.email}`} className="text-stone-600 hover:text-amber-600">
                  {propertyContact.email}
                </a>
              </div>
            )}
            {propertyContact.address && (
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="w-4 h-4 text-stone-400 mt-0.5" />
                <span className="text-stone-600">{propertyContact.address}</span>
              </div>
            )}
            {propertyContact.operationalHours && (
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-4 h-4 text-stone-400" />
                <span className="text-stone-600">{propertyContact.operationalHours}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookingConfirmPage() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <Suspense fallback={<div className="max-w-md w-full text-center">Memuat...</div>}>
        <BookingConfirmContent />
      </Suspense>
    </div>
  );
}
