import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendWANotification } from "@/lib/wa";
import { getOwnerPhone } from "@/lib/property";

export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();

  // === Mark overdue invoices ===
  const overdue = await prisma.invoice.updateMany({
    where: {
      status: "UNPAID",
      dueDate: { lt: today },
    },
    data: { status: "OVERDUE" },
  });

  // Get updated overdue invoices for alerts
  const overdueInvoices = await prisma.invoice.findMany({
    where: { status: "OVERDUE" },
    include: { tenant: true },
  });

  // Create alerts and notify
  let alertsCreated = 0;
  let ownerNotified = 0;
  let tenantNotified = 0;

  const ownerPhone = await getOwnerPhone();

  for (const invoice of overdueInvoices) {
    // Create notification for admin
    await prisma.notification.create({
      data: {
        recipient: "ADMIN",
        type: "OVERDUE_OCCURRED",
        title: "Tagihan Overdue",
        message: `Tagihan overdue: ${invoice.tenant.name} - ${invoice.period}`,
        entityId: invoice.id,
        entityType: "INVOICE",
        tenantId: invoice.tenantId,
      },
    });
    alertsCreated++;

    // Notify owner
    if (ownerPhone) {
      const ownerMessage = `Tagihan Overdue

${invoice.tenant.name}
Periode: ${invoice.period}
Jumlah: Rp ${Number(invoice.totalAmount).toLocaleString("id-ID")}
Jatuh tempo: ${invoice.dueDate.toLocaleDateString("id-ID")}

Segera follow up.`;

      await sendWANotification(ownerPhone, ownerMessage);
      ownerNotified++;
    }

    // Notify tenant
    const tenantMessage = `Tagihan Overdue

Halo ${invoice.tenant.name},

Tagihan ${invoice.invoiceNumber} untuk periode ${invoice.period} sudah melewati jatuh tempo.

Jumlah: Rp ${Number(invoice.totalAmount).toLocaleString("id-ID")}
Jatuh tempo: ${invoice.dueDate.toLocaleDateString("id-ID")}

Segera hubungi kami untuk konfirmasi pembayaran.`;

    await sendWANotification(invoice.tenant.phone, tenantMessage);
    tenantNotified++;
  }

  // === Auto-checkout expired tenants ===
  const expiredTenants = await prisma.tenant.findMany({
    where: {
      isActive: true,
      contractEnd: { lt: today },
    },
    include: {
      booking: true,
      unit: true,
    },
  });

  let tenantsCheckedOut = 0;
  let bookingsCompleted = 0;
  let unitsFreed = 0;

  for (const tenant of expiredTenants) {
    // Update tenant to inactive
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: { isActive: false },
    });
    tenantsCheckedOut++;

    // Update booking to CHECKOUT
    if (tenant.booking && tenant.booking.status === "CHECKED_IN") {
      await prisma.booking.update({
        where: { id: tenant.booking.id },
        data: {
          status: "CHECKOUT",
          checkedOutAt: today,
        },
      });
      bookingsCompleted++;
    }

    // Update unit to AVAILABLE
    await prisma.unit.update({
      where: { id: tenant.unitId },
      data: { status: "AVAILABLE" },
    });
    unitsFreed++;

    // Notify owner about checkout
    if (ownerPhone) {
      const checkoutMessage = `Auto-Checkout

Tenant ${tenant.name} kontrak berakhir dan telah di-checkout otomatis.

Unit: ${tenant.unit.name || "Unknown"} - ${tenant.unit.unitNumber}
Unit sekarang tersedia.

Silakan lakukan inspeksi dan подготовка untuk tenant baru.`;

      await sendWANotification(ownerPhone, checkoutMessage);
    }
  }

  return NextResponse.json({
    markedOverdue: overdue.count,
    alertsCreated,
    ownerNotified,
    tenantNotified,
    tenantsCheckedOut,
    bookingsCompleted,
    unitsFreed,
  });
}
