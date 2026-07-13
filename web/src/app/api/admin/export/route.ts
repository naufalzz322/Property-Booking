import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { INVOICE_STATUS_LABELS } from "@/lib/filterOptions";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") || "invoices"; // invoices | tenants
    const format = searchParams.get("format") || "csv";
    const period = searchParams.get("period"); // YYYY-MM

    if (format === "csv") {
      if (type === "invoices") {
        return exportInvoicesCSV(period);
      } else if (type === "tenants") {
        return exportTenantsCSV();
      }
    }

    return NextResponse.json({ error: "Unsupported export format" }, { status: 400 });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function exportInvoicesCSV(period?: string | null) {
  const where: any = {};

  if (period) {
    where.period = period;
  }

  const invoices = await prisma.invoice.findMany({
    where,
    include: {
      tenant: {
        select: {
          name: true,
          email: true,
          phone: true,
        },
      },
      unit: {
        select: {
          unitNumber: true,
          name: true,
          property: {
            select: { name: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Create CSV content
  const headers = [
    "No. Tagihan",
    "Periode",
    "Tenant",
    "Email",
    "HP",
    "Unit",
    "Sewa",
    "Listrik",
    "Air",
    "Lain",
    "Total",
    "Jatuh Tempo",
    "Status",
    "Tanggal Bayar",
    "Metode Bayar",
  ];

  const rows = invoices.map((inv) => [
    inv.invoiceNumber,
    inv.period,
    inv.tenant.name,
    inv.tenant.email,
    inv.tenant.phone,
    `${inv.unit.name || inv.unit.property.name} - ${inv.unit.unitNumber}`,
    Number(inv.rentAmount).toString(),
    Number(inv.electricAmount).toString(),
    Number(inv.waterAmount).toString(),
    Number(inv.otherAmount).toString(),
    Number(inv.totalAmount).toString(),
    new Date(inv.dueDate).toISOString().split("T")[0],
    INVOICE_STATUS_LABELS[inv.status] || inv.status,
    inv.paidAt ? new Date(inv.paidAt).toISOString().split("T")[0] : "",
    inv.paymentMethod || "",
  ]);

  const csvContent = [
    headers.join(";"),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";")
    ),
  ].join("\n");

  // Add UTF-8 BOM for Excel compatibility
  const bom = "﻿";
  const filename = period
    ? `tagihan-${period}.csv`
    : `tagihan-semua-${new Date().toISOString().split("T")[0]}.csv`;

  return new NextResponse(bom + csvContent, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

async function exportTenantsCSV() {
  const tenants = await prisma.tenant.findMany({
    include: {
      unit: {
        select: {
          unitNumber: true,
          name: true,
          type: true,
          pricePerMonth: true,
          property: {
            select: { name: true },
          },
        },
      },
      invoices: {
        where: { status: "PAID" },
        select: { totalAmount: true },
      },
    },
    orderBy: { name: "asc" },
  });

  // Create CSV content
  const headers = [
    "Nama",
    "Email",
    "HP",
    "Unit",
    "Tipe",
    "Harga/Bulan",
    "Kontrak Mulai",
    "Kontrak Berakhir",
    "Status",
    "Total Bayar",
    "Emergency Contact",
    "Emergency HP",
  ];

  const rows = tenants.map((tenant) => [
    tenant.name,
    tenant.email,
    tenant.phone,
    `${tenant.unit.name || tenant.unit.property.name} - ${tenant.unit.unitNumber}`,
    tenant.unit.type,
    Number(tenant.unit.pricePerMonth || 0).toString(),
    new Date(tenant.contractStart).toISOString().split("T")[0],
    tenant.contractEnd ? new Date(tenant.contractEnd).toISOString().split("T")[0] : "",
    tenant.isActive ? "Aktif" : "Tidak Aktif",
    tenant.invoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0).toString(),
    tenant.emergencyName || "",
    tenant.emergencyPhone || "",
  ]);

  const csvContent = [
    headers.join(";"),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";")
    ),
  ].join("\n");

  // Add UTF-8 BOM for Excel compatibility
  const bom = "﻿";
  const filename = `tenant-${new Date().toISOString().split("T")[0]}.csv`;

  return new NextResponse(bom + csvContent, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
