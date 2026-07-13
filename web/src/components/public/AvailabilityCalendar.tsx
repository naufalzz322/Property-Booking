"use client";

import { useState, useEffect, useCallback } from "react";
import { format, addMonths, subMonths, isToday, isBefore, startOfDay, isSameDay } from "date-fns";
import { id } from "date-fns/locale";
import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BookedDate {
  date: string;
  status: "booked" | "checked_in";
  bookingNumber: string;
}

interface AvailabilityCalendarProps {
  unitId: string;
  selectedDate?: Date | null;
  onDateSelect?: (date: Date) => void;
  minDate?: Date;
  className?: string;
}

export function AvailabilityCalendar({
  unitId,
  selectedDate,
  onDateSelect,
  minDate = new Date(),
  className,
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookedDates, setBookedDates] = useState<BookedDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookedDates = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      const res = await fetch(`/api/availability/${unitId}?year=${year}&month=${month}`);

      if (!res.ok) {
        throw new Error("Failed to fetch availability");
      }

      const data = await res.json();
      setBookedDates(data.bookedDates || []);
    } catch (err) {
      setError("Gagal memuat ketersediaan");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [unitId, currentMonth]);

  useEffect(() => {
    // Don't fetch if unitId is empty
    if (!unitId) {
      setBookedDates([]);
      setLoading(false);
      return;
    }
    fetchBookedDates();
  }, [fetchBookedDates]);

  const goToPreviousMonth = () => {
    const prevMonth = subMonths(currentMonth, 1);
    const today = startOfDay(new Date());
    // Allow going to previous month only if the last day of prevMonth is >= today
    const lastDayOfPrevMonth = new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0);
    if (lastDayOfPrevMonth >= today) {
      setCurrentMonth(prevMonth);
    }
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const isDateBooked = (date: Date): BookedDate | null => {
    // Normalize date to YYYY-MM-DD in local timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    return bookedDates.find((b) => b.date === dateStr) || null;
  };

  const isDateDisabled = (date: Date): boolean => {
    // Past dates (before minDate)
    if (isBefore(startOfDay(date), startOfDay(minDate))) return true;
    // Date is booked - but we'll show it differently with colors
    return false;
  };

  const handleDateClick = (date: Date) => {
    // Don't allow clicking on past dates or booked dates
    if (!isDateDisabled(date) && !isDateBooked(date)) {
      onDateSelect?.(date);
    }
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const days: Array<{ date: Date | null; isCurrentMonth: boolean }> = [];

    // Add empty slots for days before the first day of month
    const startDayOfWeek = firstDayOfMonth.getDay();
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ date: null, isCurrentMonth: false });
    }

    // Add days of current month
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      days.push({ date: new Date(year, month, day), isCurrentMonth: true });
    }

    return days;
  };

  const days = generateCalendarDays();
  const weekDays = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  const bookedCount = bookedDates.length;
  const availableCount = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate() - bookedCount;

  return (
    <div className={cn("bg-white rounded-lg p-3 border border-stone-200", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-semibold text-stone-900">
            {format(currentMonth, "MMMM yyyy", { locale: id })}
          </h3>
          <p className="text-[10px] text-stone-500">
            {bookedCount} hari terbooking
          </p>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPreviousMonth}
            disabled={loading}
            className="h-6 w-6"
          >
            <ChevronLeft className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNextMonth}
            disabled={loading}
            className="h-6 w-6"
          >
            <ChevronRight className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-3 mb-2 text-[10px]">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded bg-stone-100 border border-stone-300" />
          <span className="text-stone-600">Tersedia</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded bg-amber-100 border border-amber-300" />
          <span className="text-stone-600">Terbooking</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded bg-blue-100 border border-blue-300" />
          <span className="text-stone-600">Ditempati</span>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg mb-4">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Calendar grid */}
      {!loading && (
        <>
          {/* Week days header */}
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-[10px] font-medium text-stone-500 py-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {days.map((dayData, index) => {
              if (!dayData.date) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const { date } = dayData;
              const booked = isDateBooked(date);
              const today = isToday(date);
              const disabled = isDateDisabled(date);
              const selected = selectedDate && isSameDay(date, selectedDate);

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => handleDateClick(date)}
                  className={cn(
                    "aspect-square rounded text-xs font-medium transition-all relative flex items-center justify-center",
                    disabled
                      ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                      : booked
                      ? booked.status === "checked_in"
                        ? "bg-blue-100 text-blue-700 cursor-not-allowed"
                        : "bg-amber-100 text-amber-700 cursor-not-allowed"
                      : today
                      ? "bg-amber-50 text-amber-700 cursor-pointer hover:bg-amber-100 ring-1 ring-amber-500"
                      : "bg-stone-50 text-stone-700 cursor-pointer hover:bg-amber-50",
                    selected && !disabled && !booked && "bg-amber-500 text-white hover:bg-amber-600"
                  )}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
