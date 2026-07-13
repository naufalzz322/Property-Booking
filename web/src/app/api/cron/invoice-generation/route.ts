import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateMonthlyInvoice } from "@/lib/invoice";
import { sendWANotification } from "@/lib/wa";
import { sendInvoiceCreatedEmail } from "@/lib/email";
import { getOwnerPhone, getPropertyName, getPropertyEmail } from "@/lib/property";
import { format, subMonths } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Determine the period to invoice (previous month by default)
  const url = new URL(req.url);
  const periodParam = url.searchParams.get("period"); // e.g., "2026-06"

  let period: string;
  if (periodParam) {
    period = periodParam;
  } else {
    // Default to previous month
    const prevMonth = subMonths(new Date(), 1);
    const year = prevMonth.getFullYear();
    const month = String(prevMonth.getMonth() + 1).padStart(2, "0");
    period = `${year}-${month}`;
  }

  const propertyName = process.env.NEXT_PUBLIC_PROPERTY_NAME || "Graha Maju";
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Get active tenants
  const tenants = await prisma.tenant.findMany({
    where: { isActive: true },
    include: { unit: true },
  });

  let created = 0;
  let skipped = 0;
  let errors = 0;
  let waSent = 0;
  let emailSent = 0;

  // Get bank account for email
  const bankAccount = await prisma.bankAccount.findFirst({
    where: { isActive: true },
  });

  for (const tenant of tenants) {
    try {
      // Generate invoice
      const result = await generateMonthlyInvoice(tenant.id, period);

      if (result.error) {
        // Invoice already exists for this period
        skipped++;
        continue;
      }

      const invoice = result.invoice;
      created++;

      // Format due date
      const dueDateFormatted = format(invoice.dueDate, "dd MMMM yyyy", { locale: idLocale });

      // Send WhatsApp notification
      const unitDisplayName = tenant.unit.name || propertyName;
      const waMessage = `Tagihan Baru

Halo ${tenant.name},

Tagihan bulan ${period} telah dibuat.

Detail:
- Unit: ${unitDisplayName} - ${tenant.unit.unitNumber}
- Sewa: Rp ${Number(invoice.rentAmount).toLocaleString("id-ID")}
- Listrik: Rp ${Number(invoice.electricAmount).toLocaleString("id-ID")}
- Air: Rp ${Number(invoice.waterAmount).toLocaleString("id-ID")}
- Lainnya: Rp ${Number(invoice.otherAmount).toLocaleString("id-ID")}
- Total: Rp ${Number(invoice.totalAmount).toLocaleString("id-ID")}

Jatuh tempo: ${dueDateFormatted}

Segera lakukan pembayaran sebelum jatuh tempo.`;

      try {
        await sendWANotification(tenant.phone, waMessage);
        waSent++;
      } catch (waError) {
        console.error(`Failed to send WA to ${tenant.phone}:`, waError);
      }

      // Send email notification
      try {
        const unitDisplayName = tenant.unit.name || propertyName;
        const replyTo = await getPropertyEmail();
        await sendInvoiceCreatedEmail({
          tenantEmail: tenant.email,
          tenantName: tenant.name,
          invoiceNumber: invoice.invoiceNumber,
          period: invoice.period,
          rentAmount: Number(invoice.rentAmount),
          electricAmount: Number(invoice.electricAmount),
          waterAmount: Number(invoice.waterAmount),
          otherAmount: Number(invoice.otherAmount),
          totalAmount: Number(invoice.totalAmount),
          dueDate: dueDateFormatted,
          unitNumber: tenant.unit.unitNumber,
          unitName: unitDisplayName,
          propertyName: propertyName,
          bankName: bankAccount?.bankName,
          accountName: bankAccount?.accountName,
          accountNumber: bankAccount?.accountNumber,
          replyTo,
        });
        emailSent++;
      } catch (emailError) {
        console.error(`Failed to send email to ${tenant.email}:`, emailError);
      }

    } catch (error) {
      console.error(`Error processing tenant ${tenant.id}:`, error);
      errors++;
    }
  }

  return NextResponse.json({
    period,
    totalTenants: tenants.length,
    invoicesCreated: created,
    invoicesSkipped: skipped,
    errors,
    notifications: {
      waSent,
      emailSent,
    },
  });
}
