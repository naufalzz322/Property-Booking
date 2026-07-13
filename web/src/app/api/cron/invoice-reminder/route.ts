import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendWANotification } from "@/lib/wa";
import { sendPaymentReminderEmail } from "@/lib/email";
import { getPropertyEmail } from "@/lib/property";
import { differenceInDays, format } from "date-fns";
import { id } from "date-fns/locale";

export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();

  // Get all unpaid invoices
  const invoices = await prisma.invoice.findMany({
    where: { status: "UNPAID" },
    include: { tenant: true },
  });

  let sent = 0;
  let alertsCreated = 0;

  for (const invoice of invoices) {
    const daysUntilDue = differenceInDays(invoice.dueDate, today);

    // Send WA reminder at H-7 and H-3 (no email - email sent at invoice creation)
    if (daysUntilDue === 7 || daysUntilDue === 3) {
      const dueDateFormatted = format(invoice.dueDate, "dd MMMM yyyy", { locale: id });
      const waMessage = `Reminder Tagihan

Halo ${invoice.tenant.name},

Tagihan bulan ${invoice.period} belum dibayar.

Jumlah: Rp ${Number(invoice.totalAmount).toLocaleString("id-ID")}
Jatuh tempo: ${dueDateFormatted}

Segera lakukan pembayaran dan upload bukti di portal.`;

      await sendWANotification(invoice.tenant.phone, waMessage);
      sent++;

      // Also send email reminder
      try {
        const replyTo = await getPropertyEmail();
        await sendPaymentReminderEmail({
          tenantEmail: invoice.tenant.email,
          tenantName: invoice.tenant.name,
          invoiceNumber: invoice.invoiceNumber,
          period: invoice.period,
          amount: Number(invoice.totalAmount),
          dueDate: dueDateFormatted,
          replyTo,
        });
      } catch (emailError) {
        console.error(`Failed to send reminder email to ${invoice.tenant.email}:`, emailError);
      }

      // Create notification for tenant
      await prisma.notification.create({
        data: {
          recipient: "TENANT",
          type: "PAYMENT_REMINDER",
          title: "Reminder Tagihan",
          message: `Tagihan ${invoice.period} jatuh tempo dalam ${daysUntilDue} hari`,
          entityId: invoice.id,
          entityType: "INVOICE",
          tenantId: invoice.tenantId,
        },
      });
      alertsCreated++;
    }
  }

  return NextResponse.json({
    processed: invoices.length,
    remindersSent: sent,
    alertsCreated,
  });
}
