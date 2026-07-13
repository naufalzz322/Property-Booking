import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { TenantListClient } from "@/components/admin/TenantListClient";

export const dynamic = "force-dynamic";

async function getTenants() {
  const tenants = await prisma.tenant.findMany({
    include: {
      unit: { include: { property: true } },
      booking: { select: { status: true } },
      invoices: { orderBy: { createdAt: "desc" }, take: 3 },
    },
    orderBy: { createdAt: "desc" },
  });

  // Convert Decimal to number for client components
  return tenants.map((t) => ({
    id: t.id,
    name: t.name,
    email: t.email,
    phone: t.phone,
    isActive: t.isActive,
    contractStart: t.contractStart,
    contractEnd: t.contractEnd,
    createdAt: t.createdAt,
    booking: t.booking ? { status: t.booking.status } : undefined,
    unit: {
      id: t.unit.id,
      unitNumber: t.unit.unitNumber,
      type: t.unit.type,
      pricePerMonth: t.unit.pricePerMonth ? Number(t.unit.pricePerMonth) : null,
      pricePerNight: t.unit.pricePerNight ? Number(t.unit.pricePerNight) : null,
      property: {
        id: t.unit.property.id,
        name: t.unit.property.name,
      },
    },
    invoices: t.invoices.map((inv) => ({
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
  }));
}

export default async function TenantsPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const tenants = await getTenants();

  return <TenantListClient tenants={tenants} />;
}
