"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookingBoard } from "./booking/BookingBoard";
import { BookingDetailDrawer } from "./booking/BookingDetailDrawer";
import { BookingQuickActions } from "./booking/BookingQuickActions";
import { BookingCard } from "./booking/BookingCard";
import { AdminNewBookingModal } from "./booking/AdminNewBookingModal";
import { CreateTenantModal } from "./booking/CreateTenantModal";
import { useConfirm } from "@/components/ui/confirm-dialog-context";
import { useToast } from "@/components/ui/toast";
import type { Booking } from "./booking/BookingCard";

interface Unit {
  id: string;
  name: string;
  unitNumber: string;
  type: string;
  pricePerMonth: number | null;
  pricePerNight: number | null;
  status: string;
}

interface BookingListClientProps {
  bookings: Booking[];
  units: Unit[];
}

export function BookingListClient({ bookings, units }: BookingListClientProps) {
  const router = useRouter();
  const { confirm } = useConfirm();
  const { success } = useToast();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [showNewBookingModal, setShowNewBookingModal] = useState(false);
  const [showCreateTenantModal, setShowCreateTenantModal] = useState(false);
  const [selectedBookingForTenant, setSelectedBookingForTenant] = useState<Booking | null>(null);

  // Computed stats
  const stats = useMemo(() => {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    const pendingBookings = bookings.filter((b) => b.status === "PENDING");
    const today = new Date().toISOString().split("T")[0];

    return {
      total: bookings.length,
      pending: pendingBookings.length,
      confirmed: bookings.filter((b) => b.status === "CONFIRMED").length,
      paid: bookings.filter((b) => b.status === "WAITING_PAYMENT" || b.status === "PAID").length,
      checkedIn: bookings.filter((b) => b.status === "CHECKED_IN").length,
      completed: bookings.filter((b) => b.status === "CHECKOUT").length,
      todayCheckIn: bookings.filter(
        (b) => b.checkInDate.startsWith(today) && b.status !== "REJECTED" && b.status !== "CANCELLED"
      ).length,
      urgentPending: pendingBookings.filter((b) => {
        const createdAt = new Date(b.createdAt).getTime();
        return now - createdAt > oneDayMs;
      }).length,
    };
  }, [bookings]);

  // Filter logic
  const filteredBookings = useMemo(() => {
    let filtered = bookings;

    // Apply search
    if (search.trim()) {
      const query = search.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.bookingNumber.toLowerCase().includes(query) ||
          b.guestName.toLowerCase().includes(query) ||
          b.guestPhone.includes(query) ||
          b.guestEmail.toLowerCase().includes(query) ||
          (b.unit.name || b.unit.property.name).toLowerCase().includes(query) ||
          b.unit.unitNumber.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (activeFilter === "TODAY") {
      const today = new Date().toISOString().split("T")[0];
      filtered = filtered.filter(
        (b) => b.checkInDate.startsWith(today) && b.status !== "REJECTED" && b.status !== "CANCELLED"
      );
    } else if (activeFilter === "URGENT") {
      const oneDayMs = 24 * 60 * 60 * 1000;
      const now = Date.now();
      filtered = filtered.filter(
        (b) =>
          b.status === "PENDING" && now - new Date(b.createdAt).getTime() > oneDayMs
      );
    } else if (activeFilter !== "ALL") {
      // Handle "Belum Lunas" filter - show both PAID and WAITING_PAYMENT
      if (activeFilter === "PAID") {
        filtered = filtered.filter((b) => b.status === "PAID" || b.status === "WAITING_PAYMENT");
      } else {
        filtered = filtered.filter((b) => b.status === activeFilter);
      }

      // Apply month/year filter for specific status filters
      if ((activeFilter === "PENDING" || activeFilter === "CONFIRMED" || activeFilter === "PAID" || activeFilter === "CHECKED_IN" || activeFilter === "COMPLETED") && (filterMonth || filterYear)) {
        filtered = filtered.filter((b) => {
          const date = new Date(b.createdAt);
          const bookingMonth = (date.getMonth() + 1).toString().padStart(2, "0");
          const bookingYear = date.getFullYear().toString();

          const monthMatch = !filterMonth || bookingMonth === filterMonth;
          const yearMatch = !filterYear || bookingYear === filterYear;

          return monthMatch && yearMatch;
        });
      }
    }

    return filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [bookings, search, activeFilter, filterMonth, filterYear]);

  // Actions
  const handleConfirm = useCallback(
    async (booking: Booking) => {
      const confirmed = await confirm({
        title: "Konfirmasi Booking?",
        description: `Booking dari ${booking.guestName} untuk Unit ${booking.unit.unitNumber} akan dikonfirmasi.`,
        icon: "warning",
        confirmText: "Ya, Konfirmasi",
        onConfirm: async () => {
          const res = await fetch(`/api/admin/bookings/${booking.id}/confirm`, { method: "POST" });
          if (!res.ok) throw new Error("Failed");
          success("Booking berhasil dikonfirmasi");
          router.refresh();
          setSelectedBooking(null);
          setIsSheetOpen(false);
        },
      });
    },
    [router, confirm]
  );

  const handleReject = useCallback(
    async (booking: Booking) => {
      const confirmed = await confirm({
        title: "Tolak Booking?",
        description: `Booking dari ${booking.guestName} akan ditolak. Tindakan ini tidak dapat dibatalkan.`,
        icon: "danger",
        confirmText: "Ya, Tolak",
        destructive: true,
        requireReason: true,
        reasonPlaceholder: "Masukkan alasan penolakan (contoh: Unit tidak tersedia pada tanggal yang diminta, Silakan hubungi kami untuk informasi lebih lanjut)",
        reasonDefaultValue: "Mohon maaf, unit tidak tersedia untuk tanggal yang diminta. Silakan hubungi kami untuk informasi lebih lanjut.",
        onConfirm: async (reason) => {
          const res = await fetch(`/api/admin/bookings/${booking.id}/reject`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reason }),
          });
          if (!res.ok) throw new Error("Failed");
          success("Booking ditolak");
          router.refresh();
          setSelectedBooking(null);
          setIsSheetOpen(false);
        },
      });
    },
    [router, confirm]
  );

  const handleCancel = useCallback(
    async (booking: Booking) => {
      const confirmed = await confirm({
        title: "Batalkan Booking?",
        description: `Booking dari ${booking.guestName} akan dibatalkan. Tindakan ini tidak dapat dikembalikan.`,
        icon: "danger",
        confirmText: "Ya, Batalkan",
        destructive: true,
        requireReason: true,
        reasonPlaceholder: "Masukkan alasan pembatalan...",
        reasonDefaultValue: "Booking dibatalkan oleh pengelola. Silakan hubungi kami untuk informasi lebih lanjut.",
        onConfirm: async (reason) => {
          const res = await fetch(`/api/admin/bookings/${booking.id}/cancel`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reason }),
          });
          if (!res.ok) throw new Error("Failed");
          success("Booking dibatalkan");
          router.refresh();
          setSelectedBooking(null);
          setIsSheetOpen(false);
        },
      });
    },
    [router, confirm]
  );

  const handleCheckIn = useCallback(
    async (booking: Booking) => {
      const confirmed = await confirm({
        title: "Check-in Tamu?",
        description: `Tamu ${booking.guestName} akan di-check-in ke Unit ${booking.unit.unitNumber}.`,
        icon: "warning",
        confirmText: "Ya, Check-in",
        onConfirm: async () => {
          const res = await fetch(`/api/admin/bookings/${booking.id}/checkin`, { method: "POST" });
          if (!res.ok) throw new Error("Failed");
          success("Check-in berhasil");
          router.refresh();
          setSelectedBooking(null);
          setIsSheetOpen(false);
        },
      });
    },
    [router, confirm]
  );

  const handleCardClick = useCallback((booking: Booking) => {
    setSelectedBooking(booking);
    setIsSheetOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsSheetOpen(false);
    setSelectedBooking(null);
  }, []);

  const handleCreateTenant = useCallback((booking: Booking) => {
    setSelectedBookingForTenant(booking);
    setShowCreateTenantModal(true);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-6">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Booking</h1>
              <p className="text-slate-500 mt-1">Kelola permintaan booking penyewa</p>
            </div>
            <Button
              onClick={() => setShowNewBookingModal(true)}
              className="bg-amber-500 hover:bg-amber-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Booking Baru
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-6 py-6 space-y-6">
        {/* Quick Actions & Stats */}
        <BookingQuickActions
          stats={stats}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          filterMonth={filterMonth}
          onMonthChange={setFilterMonth}
          filterYear={filterYear}
          onYearChange={setFilterYear}
        />

        {/* Search */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Cari booking, nama, unit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-10 h-11 bg-white"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>
        </div>

        {/* Results info */}
        {filteredBookings.length > 0 && search && (
          <p className="text-sm text-slate-500">
            Menampilkan {filteredBookings.length} dari {bookings.length} booking
          </p>
        )}

        {/* Kanban Board or Filtered List */}
        {search || activeFilter !== "ALL" ? (
          // Show filtered list when searching or filtering
          filteredBookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredBookings.map((booking) => (
                <div key={booking.id} className="min-h-[300px]">
                  <BookingCard
                    booking={booking}
                    onConfirm={handleConfirm}
                    onReject={handleReject}
                    onCancel={handleCancel}
                    onCheckIn={handleCheckIn}
                    onCreateTenant={handleCreateTenant}
                    onClick={handleCardClick}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-200">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-10 h-10 text-slate-400" />
              </div>
              <p className="text-lg font-semibold text-slate-900">Tidak ada booking ditemukan</p>
              <p className="text-slate-500 mt-1">
                {search ? `Tidak ada hasil untuk "${search}"` : "Coba ubah filter untuk melihat booking lain"}
              </p>
              {(search || activeFilter !== "ALL") && (
                <button
                  onClick={() => {
                    setSearch("");
                    setActiveFilter("ALL");
                  }}
                  className="mt-4 px-4 py-2 text-amber-600 hover:text-amber-700 font-medium"
                >
                  Reset pencarian
                </button>
              )}
            </div>
          )
        ) : (
          // Show Kanban board when no search/filter
          <BookingBoard
            bookings={filteredBookings}
            onConfirm={handleConfirm}
            onReject={handleReject}
            onCancel={handleCancel}
            onCheckIn={handleCheckIn}
            onCreateTenant={handleCreateTenant}
            onCardClick={handleCardClick}
          />
        )}
      </div>

      {/* Detail Drawer */}
      <BookingDetailDrawer
        booking={selectedBooking}
        isOpen={isSheetOpen}
        onClose={closeDrawer}
        onConfirm={handleConfirm}
        onReject={handleReject}
        onCancel={handleCancel}
        onCheckIn={handleCheckIn}
        onCreateTenant={handleCreateTenant}
      />

      {/* Create Tenant Modal */}
      {selectedBookingForTenant && (
        <CreateTenantModal
          isOpen={showCreateTenantModal}
          onClose={() => {
            setShowCreateTenantModal(false);
            setSelectedBookingForTenant(null);
          }}
          onSuccess={() => {
            setShowCreateTenantModal(false);
            setSelectedBookingForTenant(null);
            router.refresh();
          }}
          booking={{
            ...selectedBookingForTenant,
            checkInDate: new Date(selectedBookingForTenant.checkInDate),
          }}
        />
      )}

      {/* New Booking Modal */}
      <AdminNewBookingModal
        isOpen={showNewBookingModal}
        onClose={() => setShowNewBookingModal(false)}
        onSuccess={() => router.refresh()}
        units={units}
      />
    </div>
  );
}
