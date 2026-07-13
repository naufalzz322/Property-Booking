import { getServerSession } from "next-auth";
import { tenantAuthOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { TenantDashboard } from "@/components/tenant/TenantDashboard";

export const dynamic = "force-dynamic";

async function getTenantData(session: any) {
  const tenant = await prisma.tenant.findFirst({
    where: { email: session.user.email, isActive: true },
    include: {
      unit: { include: { property: true } },
      invoices: { orderBy: { period: "desc" }, take: 5 },
    },
  });

  if (!tenant) return null;

  // Convert Decimal to number and exclude sensitive fields
  return {
    id: tenant.id,
    name: tenant.name,
    email: tenant.email,
    phone: tenant.phone,
    isActive: tenant.isActive,
    contractStart: tenant.contractStart,
    contractEnd: tenant.contractEnd,
    createdAt: tenant.createdAt,
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
    invoices: tenant.invoices.map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      period: inv.period,
      rentAmount: Number(inv.rentAmount),
      electricAmount: Number(inv.electricAmount),
      waterAmount: Number(inv.waterAmount),
      otherAmount: Number(inv.otherAmount),
      totalAmount: Number(inv.totalAmount),
      dueDate: inv.dueDate,
      status: inv.status,
      paidAt: inv.paidAt,
      createdAt: inv.createdAt,
    })),
  };
}

export default async function TenantDashboardPage() {
  const session = await getServerSession(tenantAuthOptions);

  if (!session) {
    redirect("/tenant/login");
  }

  const tenant = await getTenantData(session);

  if (!tenant) {
    redirect("/tenant/login");
  }

  return <TenantDashboard tenant={tenant} />;
}
