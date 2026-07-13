import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendInvoiceCreatedEmail } from "@/lib/email";
import { sendWANotification } from "@/lib/wa";
import { getPropertyEmail } from "@/lib/property";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      unit: { include: { property: true } },
      tenant: true,
    },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  // Status should already be WAITING_PAYMENT after tenant creation
  // This endpoint allows resending invoice notification or updating invoice amounts
  if (!["CONFIRMED", "WAITING_PAYMENT"].includes(booking.status)) {
    return NextResponse.json({ error: "Booking status tidak valid untuk mengirim invoice" }, { status: 400 });
  }

  if (!booking.tenant) {
    return NextResponse.json({ error: "Tenant belum dibuat" }, { status: 400 });
  }

  const body = await req.json();
  const { invoiceId, rentAmount, electricAmount, waterAmount, otherAmount, dueDate } = body;

  // If invoiceId provided, update that invoice; otherwise find the booking's invoice
  let invoice;
  if (invoiceId) {
    invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) {
      return NextResponse.json({ error: "Invoice tidak ditemukan" }, { status: 404 });
    }

    // Calculate total
    const total = (rentAmount ?? Number(invoice.rentAmount)) +
      (electricAmount ?? Number(invoice.electricAmount)) +
      (waterAmount ?? Number(invoice.waterAmount)) +
      (otherAmount ?? Number(invoice.otherAmount));

    // Update invoice with new amounts
    invoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        rentAmount: rentAmount ?? invoice.rentAmount,
        electricAmount: electricAmount ?? invoice.electricAmount,
        waterAmount: waterAmount ?? invoice.waterAmount,
        otherAmount: otherAmount ?? invoice.otherAmount,
        totalAmount: total,
        dueDate: dueDate ? new Date(dueDate) : invoice.dueDate,
      },
    });
  } else {
    // Find existing invoice for this booking
    invoice = await prisma.invoice.findFirst({
      where: { bookingId: id },
      orderBy: { createdAt: "desc" },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice tidak ditemukan" }, { status: 404 });
    }
  }

  // Update booking status to WAITING_PAYMENT if still CONFIRMED
  if (booking.status === "CONFIRMED") {
    await prisma.booking.update({
      where: { id },
      data: { status: "WAITING_PAYMENT" },
    });
  }

  // Create booking event for invoice sent
  await prisma.bookingEvent.create({
    data: {
      bookingId: id,
      eventType: "INVOICE_SENT",
      message: `Invoice ${invoice.invoiceNumber} dikirim ke tenant`,
      metadata: {
        invoiceId: invoice.id,
        totalAmount: Number(invoice.totalAmount),
      },
    },
  });

  // Get unit display name
  const unitName = booking.unit.name || booking.unit.property.name;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Send invoice notification via WhatsApp
  const waMessage = `Invoice Bulanan

Halo ${booking.tenant.name},

Berikut invoice untuk periode ${invoice.period}:

📍 Unit: ${unitName} - ${booking.unit.unitNumber}
💰 Total: ${formatCurrency(Number(invoice.totalAmount))}
📅 Jatuh Tempo: ${invoice.dueDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}

Rincian:
• Sewa: ${formatCurrency(Number(invoice.rentAmount))}
• Listrik: ${formatCurrency(Number(invoice.electricAmount))}
• Air: ${formatCurrency(Number(invoice.waterAmount))}
• Lainnya: ${formatCurrency(Number(invoice.otherAmount))}

Silakan lakukan pembayaran dan upload bukti transfer di portal tenant.

Terima kasih!`;

  await sendWANotification(booking.tenant.phone, waMessage);

  // Send email notification
  const propertyName = process.env.NEXT_PUBLIC_PROPERTY_NAME || "Pyta Property";
  const replyTo = await getPropertyEmail();

  await sendInvoiceCreatedEmail({
    tenantEmail: booking.tenant.email,
    tenantName: booking.tenant.name,
    invoiceNumber: invoice.invoiceNumber,
    period: invoice.period,
    rentAmount: Number(invoice.rentAmount),
    electricAmount: Number(invoice.electricAmount),
    waterAmount: Number(invoice.waterAmount),
    otherAmount: Number(invoice.otherAmount),
    totalAmount: Number(invoice.totalAmount),
    dueDate: invoice.dueDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
    unitNumber: booking.unit.unitNumber,
    unitName: booking.unit.name || undefined,
    propertyName,
    replyTo,
  });

  return NextResponse.json({
    success: true,
    message: "Invoice berhasil dikirim",
    invoice: {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      rentAmount: Number(invoice.rentAmount),
      electricAmount: Number(invoice.electricAmount),
      waterAmount: Number(invoice.waterAmount),
      otherAmount: Number(invoice.otherAmount),
      totalAmount: Number(invoice.totalAmount),
      dueDate: invoice.dueDate.toISOString(),
    },
  });
}
