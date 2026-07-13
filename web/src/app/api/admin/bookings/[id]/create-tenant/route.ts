import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { addMonths, format, startOfMonth, endOfMonth } from "date-fns";
import { sendWANotification } from "@/lib/wa";
import { sendTenantAccountEmail, sendInvoiceCreatedEmail } from "@/lib/email";
import { getOwnerPhone, getPropertyName, getPropertyEmail } from "@/lib/property";

async function generateInvoiceNumber(period: string): Promise<string> {
  const [year, month] = period.split("-").map(Number);
  const monthStart = startOfMonth(new Date(year, month - 1));
  const monthEnd = endOfMonth(new Date(year, month - 1));

  const count = await prisma.invoice.count({
    where: {
      createdAt: { gte: monthStart, lte: monthEnd },
    },
  });

  return `INV-${year}-${String(count + 1).padStart(4, "0")}`;
}

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
    include: { unit: { include: { property: true } } },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (booking.status !== "CONFIRMED") {
    return NextResponse.json({ error: "Booking belum dikonfirmasi" }, { status: 400 });
  }

  // Check if tenant already exists
  const existingTenant = await prisma.tenant.findFirst({
    where: { bookingId: id },
  });

  if (existingTenant) {
    return NextResponse.json({ error: "Tenant sudah dibuat" }, { status: 400 });
  }

  const body = await req.json();
  const { name, email, phone, password, contractStart, contractEnd, emergencyName, emergencyPhone } = body;

  // Validate required fields
  if (!name || !email || !phone || !password || !contractStart) {
    return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
  }

  // Check if email already exists
  const existingEmail = await prisma.tenant.findUnique({
    where: { email },
  });

  if (existingEmail) {
    return NextResponse.json({ error: "Email sudah digunakan" }, { status: 400 });
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create tenant
  const tenant = await prisma.tenant.create({
    data: {
      bookingId: id,
      unitId: booking.unitId,
      name,
      email,
      phone,
      passwordHash,
      contractStart: new Date(contractStart),
      contractEnd: contractEnd ? new Date(contractEnd) : null,
      emergencyName: emergencyName || null,
      emergencyPhone: emergencyPhone || null,
      isActive: true,
    },
  });

  // Get unit display name
  const unitName = booking.unit.name || booking.unit.property.name;

  // Create initial invoice (draft - not sent yet)
  const contractStartDate = new Date(contractStart);
  const period = format(contractStartDate, "yyyy-MM");
  const invoiceNumber = await generateInvoiceNumber(period);

  // Due date = contract start date (the day rent begins)
  const dueDate = contractStartDate;

  // Get rent amount from unit - ensure proper number conversion from Decimal
  const rentAmount = Number(booking.unit.pricePerMonth) || 0;

  // For initial invoice, calculate based on booking duration
  const durationMonths = booking.durationMonths || 1;
  const totalAmount = rentAmount * durationMonths; // Initial payment for entire booking period

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      tenantId: tenant.id,
      unitId: booking.unitId,
      bookingId: id,
      period,
      rentAmount,
      electricAmount: 0,
      waterAmount: 0,
      otherAmount: 0,
      totalAmount,
      dueDate,
      status: "UNPAID",
    },
  });

  // Update booking status to WAITING_PAYMENT
  await prisma.booking.update({
    where: { id },
    data: { status: "WAITING_PAYMENT" },
  });

  // Create booking event
  await prisma.bookingEvent.create({
    data: {
      bookingId: id,
      eventType: "TENANT_CREATED",
      message: `Tenant "${name}" berhasil dibuat dengan email ${email}`,
      metadata: {
        tenantId: tenant.id,
        invoiceId: invoice.id,
      },
    },
  });

  // Send WhatsApp notification with login credentials
  const waMessage = `Halo ${name}! Akun tenant Anda sudah dibuat.

📍 Unit: ${unitName} - ${booking.unit.unitNumber}

📧 Email: ${email}
🔐 Password: ${password}

Login di: ${process.env.NEXT_PUBLIC_APP_URL || "https://example.com"}/login

Mohon segera ganti password Anda setelah login.`;

  await sendWANotification(phone, waMessage);

  // Send invoice notification via WhatsApp
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const invoiceWaMessage = `Invoice Bulanan

Halo ${name},

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

  await sendWANotification(phone, invoiceWaMessage);

  // Send email notification with login credentials
  const replyTo = await getPropertyEmail();
  const propertyName = process.env.NEXT_PUBLIC_PROPERTY_NAME || booking.unit.property?.name || "Pyta Property";

  await sendTenantAccountEmail({
    tenantEmail: email,
    tenantName: name,
    password,
    unitName,
    unitNumber: booking.unit.unitNumber,
    replyTo,
  });

  // Send invoice email
  await sendInvoiceCreatedEmail({
    tenantEmail: email,
    tenantName: name,
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
    tenant: {
      id: tenant.id,
      name: tenant.name,
      email: tenant.email,
    },
    invoice: {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      rentAmount: Number(invoice.rentAmount),
      electricAmount: Number(invoice.electricAmount),
      waterAmount: Number(invoice.waterAmount),
      otherAmount: Number(invoice.otherAmount),
      totalAmount: Number(invoice.totalAmount),
      dueDate: invoice.dueDate.toISOString(),
      period: invoice.period,
      status: invoice.status,
    },
    message: "Tenant berhasil dibuat. Status booking diperbarui ke Menunggu Pembayaran.",
    whatsappUrl: `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(
      `Halo ${name}! Akun tenant Anda sudah dibuat.\n\n` +
      `📧 Email: ${email}\n` +
      `🔐 Password: ${password}\n\n` +
      `Silakan login di: ${process.env.NEXT_PUBLIC_APP_URL || "https://example.com"}/login\n\n` +
      `Mohon segera ganti password Anda setelah login.`
    )}`,
  });
}
