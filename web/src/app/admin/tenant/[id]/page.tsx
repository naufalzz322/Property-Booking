import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { TenantDetailClient } from "@/components/admin/TenantDetailClient";

export const dynamic = "force-dynamic";

async function getTenant(id: string) {
  const tenant = await prisma.tenant.findUnique({
    where: { id },
    include: {
      unit: { include: { property: true } },
      booking: true,
      invoices: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return tenant;
}

export default async function TenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const { id } = await params;
  const tenant = await getTenant(id);

  if (!tenant) {
    notFound();
  }

  // Convert Decimal to number for client component
  const tenantForClient = {
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
      slug: tenant.unit.slug,
      unitNumber: tenant.unit.unitNumber,
      name: tenant.unit.name,
      type: tenant.unit.type,
      pricePerMonth: tenant.unit.pricePerMonth ? Number(tenant.unit.pricePerMonth) : null,
      pricePerNight: tenant.unit.pricePerNight ? Number(tenant.unit.pricePerNight) : null,
      property: {
        name: tenant.unit.property.name,
      },
    },
    booking: tenant.booking,
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

  return <TenantDetailClient tenant={tenantForClient} />;
}
