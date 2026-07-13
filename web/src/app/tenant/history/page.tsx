import { getServerSession } from "next-auth";
import { tenantAuthOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { PaymentHistoryClient } from "@/components/tenant/PaymentHistoryClient";

export const dynamic = "force-dynamic";

async function getPaymentHistory(session: any) {
  const tenant = await prisma.tenant.findFirst({
    where: { email: session.user.email, isActive: true },
    include: {
      unit: { include: { property: true } },
      invoices: {
        where: { status: "PAID" },
        include: {
          unit: { include: { property: true } },
        },
        orderBy: { paidAt: "desc" },
      },
    },
  });

  if (!tenant) return null;

  // Calculate totals
  const totalPaid = tenant.invoices.reduce(
    (sum, inv) => sum + Number(inv.totalAmount),
    0
  );

  return {
    tenant: {
      id: tenant.id,
      name: tenant.name,
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
          id: tenant.unit.property.id,
          name: tenant.unit.property.name,
        },
      },
    },
    payments: tenant.invoices.map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      period: inv.period,
      rentAmount: Number(inv.rentAmount),
      electricAmount: Number(inv.electricAmount),
      waterAmount: Number(inv.waterAmount),
      otherAmount: Number(inv.otherAmount),
      totalAmount: Number(inv.totalAmount),
      paidAt: inv.paidAt,
      paymentMethod: inv.paymentMethod,
      unit: {
        id: inv.unit.id,
        unitNumber: inv.unit.unitNumber,
        property: {
          id: inv.unit.property.id,
          name: inv.unit.property.name,
        },
      },
    })),
    totalPaid,
  };
}

export default async function PaymentHistoryPage() {
  const session = await getServerSession(tenantAuthOptions);

  if (!session) {
    redirect("/tenant/login");
  }

  const data = await getPaymentHistory(session);

  if (!data) {
    redirect("/tenant/login");
  }

  return <PaymentHistoryClient tenant={data.tenant} payments={data.payments} totalPaid={data.totalPaid} />;
}
