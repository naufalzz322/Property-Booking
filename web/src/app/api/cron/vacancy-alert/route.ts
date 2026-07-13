import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendWANotification } from "@/lib/wa";
import { getOwnerPhone, getOwnerEmail, getPropertyName, getNotificationSettings, getPropertyEmail } from "@/lib/property";
import { sendVacancyReportEmail } from "@/lib/email";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ownerPhone = await getOwnerPhone();

  // Get available units
  const availableUnits = await prisma.unit.findMany({
    where: { status: "AVAILABLE" },
    include: { property: true },
  });

  // Get tenants with expiring contracts (within 30 days)
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const expiringTenants = await prisma.tenant.findMany({
    where: {
      isActive: true,
      contractEnd: {
        gte: new Date(),
        lte: thirtyDaysFromNow,
      },
    },
    include: { unit: { include: { property: true } } },
  });

  // Create notifications for vacant units
  let notificationsCreated = 0;
  for (const unit of availableUnits) {
    await prisma.notification.create({
      data: {
        recipient: "ADMIN",
        type: "UNIT_MAINTENANCE",
        title: "Unit Kosong",
        message: `Unit ${unit.unitNumber} kosong dan belum disewakan`,
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

  // Send summary to owner
  if (ownerPhone && (availableUnits.length > 0 || expiringTenants.length > 0)) {
    const message = `Laporan Mingguan

${availableUnits.length} unit kosong:
${availableUnits.map((u) => `- ${u.name || u.property.name} - Unit ${u.unitNumber}`).join("\n")}

${expiringTenants.length} kontrak akan habis:
${expiringTenants.map((t) => `- ${t.name} - Unit ${t.unit.unitNumber} (${t.unit.name || t.unit.property.name})`).join("\n")}`;

    await sendWANotification(ownerPhone, message);
  }

  // Send email report to owner (if enabled)
  const notifySettings = await getNotificationSettings();
  if (notifySettings.notifyVacancyReport && notifySettings.emailOwner) {
    const propertyName = await getPropertyName();

    const vacantUnitsData = availableUnits.map((u) => ({
      unitNumber: u.unitNumber,
      unitName: u.name || u.property.name,
      type: u.type,
    }));

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
        vacantUnits: vacantUnitsData,
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
    vacantUnits: availableUnits.length,
    expiringContracts: expiringTenants.length,
    notificationsCreated,
    emailSent,
  });
}
