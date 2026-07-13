import { getServerSession } from "next-auth";
import { tenantAuthOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { KontrakClient } from "@/components/tenant/KontrakClient";

export const dynamic = "force-dynamic";

async function getKontrakData(session: any) {
  const tenant = await prisma.tenant.findFirst({
    where: { email: session.user.email, isActive: true },
    include: {
      unit: { include: { property: true } },
    },
  });

  if (!tenant) return null;

  return {
    id: tenant.id,
    name: tenant.name,
    email: tenant.email,
    phone: tenant.phone,
    contractStart: tenant.contractStart,
    contractEnd: tenant.contractEnd,
    unit: {
      id: tenant.unit.id,
      name: tenant.unit.name,
      unitNumber: tenant.unit.unitNumber,
      type: tenant.unit.type,
      pricePerMonth: tenant.unit.pricePerMonth ? Number(tenant.unit.pricePerMonth) : null,
      property: {
        id: tenant.unit.property.id,
        name: tenant.unit.property.name,
      },
    },
  };
}

export default async function KontrakPage() {
  const session = await getServerSession(tenantAuthOptions);

  if (!session) {
    redirect("/tenant/login");
  }

  const data = await getKontrakData(session);

  if (!data) {
    redirect("/tenant/login");
  }

  return <KontrakClient data={data} />;
}
