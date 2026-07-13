import { getServerSession } from "next-auth";
import { tenantAuthOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { AccountClient } from "@/components/tenant/AccountClient";

export const dynamic = "force-dynamic";

async function getTenantData(session: any) {
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
    isActive: tenant.isActive,
    contractStart: tenant.contractStart,
    contractEnd: tenant.contractEnd,
    createdAt: tenant.createdAt,
    emergencyName: tenant.emergencyName,
    emergencyPhone: tenant.emergencyPhone,
    unit: {
      id: tenant.unit.id,
      name: tenant.unit.name,
      unitNumber: tenant.unit.unitNumber,
      type: tenant.unit.type,
      description: tenant.unit.description,
      facilities: tenant.unit.facilities,
      photos: tenant.unit.photos,
      pricePerMonth: tenant.unit.pricePerMonth ? Number(tenant.unit.pricePerMonth) : null,
      pricePerNight: tenant.unit.pricePerNight ? Number(tenant.unit.pricePerNight) : null,
      property: {
        name: tenant.unit.property.name,
        address: tenant.unit.property.address,
      },
    },
  };
}

export default async function AccountPage() {
  const session = await getServerSession(tenantAuthOptions);

  if (!session) {
    redirect("/tenant/login");
  }

  const tenant = await getTenantData(session);

  if (!tenant) {
    redirect("/tenant/login");
  }

  return <AccountClient tenant={tenant} />;
}
