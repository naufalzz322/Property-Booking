"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BookingRow, Booking } from "../molecules/BookingRow";
import { Calendar } from "lucide-react";

interface BookingTableProps {
  bookings: Booking[];
  onConfirm?: (booking: Booking) => Promise<void>;
  onReject?: (booking: Booking, reason?: string) => Promise<void>;
  onRowClick?: (booking: Booking) => void;
}

export function BookingTable({
  bookings,
  onConfirm,
  onReject,
  onRowClick,
}: BookingTableProps) {
  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-lg border border-slate-200">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <Calendar className="w-8 h-8 text-slate-400" />
        </div>
        <p className="text-slate-600 font-medium">Tidak ada booking ditemukan</p>
        <p className="text-sm text-slate-400 mt-1">
          Coba ubah filter atau kata kunci pencarian
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 hover:bg-slate-50">
              <TableHead className="w-[140px]">No. Booking</TableHead>
              <TableHead>Tamu</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead className="w-[160px]">Check-in</TableHead>
              <TableHead className="w-[120px]">Total</TableHead>
              <TableHead className="w-[130px]">Status</TableHead>
              <TableHead className="w-[100px] text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <BookingRow
                key={booking.id}
                booking={booking}
                onConfirm={onConfirm}
                onReject={onReject}
                onClick={() => onRowClick?.(booking)}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
