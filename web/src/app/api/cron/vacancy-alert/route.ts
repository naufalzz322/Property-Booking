import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendWANotification } from "@/lib/wa";
import { getOwnerPhone, getPropertyName, getNotificationSettings, getPropertyEmail } from "@/lib/property";
import { sendVacancyReportEmail } from "@/lib/email";
import { format, addDays } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ownerPhone = await getOwnerPhone();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get available units with their next upcoming booking
  const availableUnits = await prisma.unit.findMany({
    where: { status: "AVAILABLE" },
    include: {
      property: true,
      bookings: {
        where: {
          status: { in: ["CONFIRMED", "CHECKED_IN"] },
          checkInDate: { gte: today },
        },
        orderBy: { checkInDate: "asc" },
        take: 1,
      },
    },
  });

  // Categorize units: truly vacant vs coming soon
  const trulyVacant = availableUnits.filter((u) => u.bookings.length === 0);
  const comingVacant = availableUnits.filter((u) => u.bookings.length > 0);

  // Get tenants with expiring contracts (within 30 days)
  const thirtyDaysFromNow = addDays(today, 30);

  const expiringTenants = await prisma.tenant.findMany({
    where: {
      isActive: true,
      contractEnd: {
        gte: today,
        lte: thirtyDaysFromNow,
      },
    },
    include: { unit: { include: { property: true } } },
  });

  // Create notifications for truly vacant units (not occupied, no upcoming booking)
  let notificationsCreated = 0;
  for (const unit of trulyVacant) {
    await prisma.notification.create({
      data: {
        recipient: "ADMIN",
        type: "UNIT_MAINTENANCE",
        title: "Unit Kosong",
        message: `Unit ${unit.unitNumber} kosong dan siap disewakan`,
        entityId: unit.id,
        entityType: "UNIT",
      },
    });
    notificationsCreated++;
  }

  // Create notifications for units with upcoming bookings
  for (const unit of comingVacant) {
    const nextBooking = unit.bookings[0];
    const daysUntil = Math.ceil(
      (new Date(nextBooking.checkInDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    await prisma.notification.create({
      data: {
        recipient: "ADMIN",
        type: "UNIT_MAINTENANCE",
        title: "Unit Akan Terisi",
        message: `Unit ${unit.unitNumber} akan terisi ${daysUntil} hari lagi (${format(nextBooking.checkInDate, "dd MMM", { locale: idLocale })})`,
        entityId: unit.id,
        entityType: "UNIT",
      },
    });
    notificationsCreated++;
  }

  // Create notifications for expiring contracts
  for (const tenant of expiringTenants) {
    if (tenant.contractEnd) {
      await prisma.notification.create({
        data: {
          recipient: "ADMIN",
          type: "CONTRACT_EXPIRING",
          title: "Kontrak Akan Habis",
          message: `Kontrak ${tenant.name} (Unit ${tenant.unit.unitNumber}) akan habis dalam 30 hari`,
          entityId: tenant.id,
          entityType: "TENANT",
          tenantId: tenant.id,
        },
      });
      notificationsCreated++;

      // Create notification for tenant
      await prisma.notification.create({
        data: {
          recipient: "TENANT",
          type: "CONTRACT_EXPIRING_TENANT",
          title: "Kontrak Akan Habis",
          message: `Kontrak sewa Anda akan habis dalam waktu dekat. Mohon hubungi kami untuk perpanjangan.`,
          entityId: tenant.id,
          entityType: "TENANT",
          tenantId: tenant.id,
        },
      });
      notificationsCreated++;

      // Notify tenant
      const unitDisplayName = tenant.unit.name || tenant.unit.property?.name;
      const message = `Kontrak Akan Habis

Halo ${tenant.name},

Kontrak sewa Unit ${tenant.unit.unitNumber} (${unitDisplayName}) Anda akan habis dalam waktu dekat.

Mohon hubungi kami untuk perpanjangan kontrak.

Terima kasih.`;

      await sendWANotification(tenant.phone, message);
    }
  }

  let emailSent = 0;

  // Send summary to owner via WhatsApp
  if (ownerPhone && (availableUnits.length > 0 || expiringTenants.length > 0)) {
    const trulyVacantList = trulyVacant
      .map((u) => `- ${u.name || u.property.name} - Unit ${u.unitNumber}`)
      .join("\n") || "(tidak ada)";

    const comingVacantList = comingVacant
      .map((u) => {
        const nextBooking = u.bookings[0];
        const nextDate = format(nextBooking.checkInDate, "dd MMM", { locale: idLocale });
        return `- ${u.name || u.property.name} - Unit ${u.unitNumber} (booking: ${nextDate})`;
      })
      .join("\n") || "(tidak ada)";

    const message = `Laporan Mingguan

📋 ${trulyVacant.length} Unit Kosong (Siap Sewa):
${trulyVacantList}

📅 ${comingVacant.length} Unit Akan Terisi:
${comingVacantList}

⚠️ ${expiringTenants.length} kontrak akan habis:
${expiringTenants
  .map((t) => `- ${t.name} - Unit ${t.unit.unitNumber}`)
  .join("\n") || "(tidak ada)"}`;

    await sendWANotification(ownerPhone, message);
  }

  // Send email report to owner (if enabled)
  const notifySettings = await getNotificationSettings();
  if (notifySettings.notifyVacancyReport && notifySettings.emailOwner) {
    const propertyName = await getPropertyName();

    const trulyVacantData = trulyVacant.map((u) => ({
      unitNumber: u.unitNumber,
      unitName: u.name || u.property.name,
      type: u.type,
      status: "ready" as const,
      nextCheckIn: null,
    }));

    const comingVacantData = comingVacant.map((u) => {
      const nextBooking = u.bookings[0];
      return {
        unitNumber: u.unitNumber,
        unitName: u.name || u.property.name,
        type: u.type,
        status: "upcoming" as const,
        nextCheckIn: format(nextBooking.checkInDate, "dd MMM yyyy", { locale: idLocale }),
      };
    });

    const expiringContractsData = expiringTenants.map((t) => ({
      tenantName: t.name,
      unitNumber: t.unit.unitNumber,
      unitName: t.unit.name || "",
      endDate: t.contractEnd ? format(t.contractEnd, "dd MMM yyyy", { locale: idLocale }) : "-",
    }));

    try {
      const replyTo = await getPropertyEmail();
      await sendVacancyReportEmail({
        ownerEmail: notifySettings.emailOwner,
        propertyName,
        vacantUnits: [...trulyVacantData, ...comingVacantData],
        expiringContracts: expiringContractsData,
        replyTo,
      });
      emailSent++;
      console.log(`[VacancyAlert] Email report sent to ${notifySettings.emailOwner}`);
    } catch (emailError) {
      console.error("[VacancyAlert] Failed to send email report:", emailError);
    }
  }

  return NextResponse.json({
    summary: {
      trulyVacant: trulyVacant.length,
      comingVacant: comingVacant.length,
      expiringContracts: expiringTenants.length,
    },
    vacantUnits: availableUnits.length,
    expiringContracts: expiringTenants.length,
    notificationsCreated,
    emailSent,
  });
}
