import { getServerSession } from "next-auth";
import { tenantAuthOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { TenantAlertsClient } from "@/components/tenant/TenantAlertsClient";

export const dynamic = "force-dynamic";

async function getTenantAlerts(session: any) {
  const tenant = await prisma.tenant.findFirst({
    where: { email: session.user.email },
  });

  if (!tenant) return [];

  const notifications = await prisma.notification.findMany({
    where: {
      tenantId: tenant.id,
    },
    orderBy: { createdAt: "desc" },
  });

  return notifications;
}

export default async function TenantAlertsPage() {
  const session = await getServerSession(tenantAuthOptions);

  if (!session) {
    redirect("/tenant/login");
  }

  const notifications = await getTenantAlerts(session);

  return <TenantAlertsClient alerts={notifications} />;
}
