import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { startOfMonth, endOfMonth } from "date-fns";
import { sendWANotification } from "@/lib/wa";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: any = {};

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: "insensitive" } },
        { tenant: { name: { contains: search, mode: "insensitive" } } },
        { unit: { unitNumber: { contains: search } } },
      ];
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        unit: {
          select: {
            id: true,
            unitNumber: true,
            property: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Convert Decimal to number
    const invoicesData = invoices.map((inv) => ({
      ...inv,
      rentAmount: Number(inv.rentAmount),
      electricAmount: Number(inv.electricAmount),
      waterAmount: Number(inv.waterAmount),
      otherAmount: Number(inv.otherAmount),
      totalAmount: Number(inv.totalAmount),
    }));

    return NextResponse.json({ invoices: invoicesData });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create manual invoice
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      tenantId,
      period,
      rentAmount,
      electricAmount = 0,
      waterAmount = 0,
      otherAmount = 0,
      otherDescription,
      dueDate,
      notes,
      sendNotification = false,
    } = body;

    // Validate required fields
    if (!tenantId || !period || !rentAmount || !dueDate) {
      return NextResponse.json(
        { error: "Tenant, periode, sewa, dan jatuh tempo wajib diisi" },
        { status: 400 }
      );
    }

    // Validate period format (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(period)) {
      return NextResponse.json(
        { error: "Format periode tidak valid. Gunakan YYYY-MM" },
        { status: 400 }
      );
    }

    // Check if invoice already exists for this tenant + period
    const existing = await prisma.invoice.findFirst({
      where: { tenantId, period },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Invoice sudah ada untuk periode ${period}. Gunakan menu edit untuk mengubah.` },
        { status: 409 }
      );
    }

    // Get tenant with unit info
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { unit: true },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant tidak ditemukan" }, { status: 404 });
    }

    // Generate invoice number
    const [year, month] = period.split("-").map(Number);
    const invoiceCount = await prisma.invoice.count({
      where: {
        createdAt: {
          gte: startOfMonth(new Date(year, month - 1, 1)),
          lte: endOfMonth(new Date(year, month - 1, 1)),
        },
      },
    });
    const invoiceNumber = `INV-${year}-${String(invoiceCount + 1).padStart(4, "0")}`;

    // Create invoice
    const totalAmount = Number(rentAmount) + Number(electricAmount) + Number(waterAmount) + Number(otherAmount);

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        tenantId,
        unitId: tenant.unitId,
        period,
        rentAmount,
        electricAmount,
        waterAmount,
        otherAmount,
        otherDescription,
        totalAmount,
        dueDate: new Date(dueDate),
        status: "UNPAID",
        notes,
      },
    });

    // Create notification for admin
    await prisma.notification.create({
      data: {
        recipient: "ADMIN",
        type: "PAYMENT_REMINDER", // Reusing for invoice created
        title: "Invoice Baru Dibuat",
        message: `Invoice ${invoiceNumber} untuk ${tenant.name} periode ${period} telah dibuat`,
        entityId: invoice.id,
        entityType: "INVOICE",
        tenantId,
      },
    });

    // Send notification if requested
    if (sendNotification) {
      const propertyName = process.env.NEXT_PUBLIC_PROPERTY_NAME || "Graha Maju";
      const dueDateFormatted = format(new Date(dueDate), "dd MMMM yyyy", { locale: idLocale });
      const unitDisplayName = tenant.unit.name || propertyName;

      // Create notification for tenant
      await prisma.notification.create({
        data: {
          recipient: "TENANT",
          type: "PAYMENT_REMINDER",
          title: "Tagihan Baru",
          message: `Tagihan bulan ${period} telah dibuat. Total: Rp ${totalAmount.toLocaleString("id-ID")}`,
          entityId: invoice.id,
          entityType: "INVOICE",
          tenantId,
        },
      });

      // Send WA notification
      const waMessage = `Tagihan Baru

Halo ${tenant.name},

Tagihan bulan ${period} telah dibuat.

Detail:
- Unit: ${unitDisplayName} - ${tenant.unit.unitNumber}
- Sewa: Rp ${Number(rentAmount).toLocaleString("id-ID")}
- Listrik: Rp ${Number(electricAmount).toLocaleString("id-ID")}
- Air: Rp ${Number(waterAmount).toLocaleString("id-ID")}
- Lainnya: Rp ${Number(otherAmount).toLocaleString("id-ID")}
- Total: Rp ${totalAmount.toLocaleString("id-ID")}

Jatuh tempo: ${dueDateFormatted}

Segera lakukan pembayaran sebelum jatuh tempo.`;

      await sendWANotification(tenant.phone, waMessage);
    }

    return NextResponse.json({
      success: true,
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        period: invoice.period,
        totalAmount,
        dueDate: invoice.dueDate,
        status: invoice.status,
      },
    });
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
