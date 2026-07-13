"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

interface Unit {
  id: string;
  unitNumber: string;
  type: string;
  slug: string;
  pricePerMonth: number | null;
  pricePerNight: number | null;
  status: string;
  currentTenant: { name: string } | null;
}

const statusColors: Record<string, string> = {
  AVAILABLE: "bg-slate-100 text-slate-700",
  BOOKED: "bg-amber-100 text-amber-800", // Fixed: was amber-700 (2.0:1 contrast)
  OCCUPIED: "bg-blue-100 text-blue-800",
  MAINTENANCE: "bg-purple-100 text-purple-800",
};

const typePriceLabel: Record<string, string> = {
  KOS_BULANAN: "Sewa/bulan",
  KOS_HARIAN: "Sewa/malam",
  GUEST_HOUSE: "Sewa/malam",
  VILLA: "Sewa/malam",
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function getPrice(unit: Unit): { price: number; label: string } | null {
  const isMonthly = unit.type === "KOS_BULANAN";
  const price = isMonthly ? unit.pricePerMonth : unit.pricePerNight;
  const label = typePriceLabel[unit.type] || "Sewa";
  return price ? { price, label } : null;
}

export function UnitOverviewTable({ units }: { units: Unit[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Unit Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Unit</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead>Penghuni</TableHead>
              <TableHead>Harga</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {units.map((unit) => {
              const priceInfo = getPrice(unit);
              return (
                <TableRow key={unit.id}>
                  <TableCell className="font-medium">
                    <Link href={`/admin/unit/${unit.slug}`} className="hover:underline">
                      {unit.unitNumber}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {unit.type.replace("_", " ")}
                  </TableCell>
                  <TableCell>{unit.currentTenant?.name || "-"}</TableCell>
                  <TableCell>
                    {priceInfo ? (
                      <div>
                        <span className="font-medium">{formatCurrency(priceInfo.price)}</span>
                        <span className="text-xs text-slate-400 ml-1">/{priceInfo.label.split("/")[1]}</span>
                      </div>
                    ) : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[unit.status]}>
                      {unit.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
