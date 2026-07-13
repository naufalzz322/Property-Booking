import { getServerSession } from "next-auth";
import { tenantAuthOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { InvoiceListClient } from "@/components/tenant/InvoiceListClient";

export const dynamic = "force-dynamic";

async function getTenantInvoices(session: any) {
  const tenant = await prisma.tenant.findFirst({
    where: { email: session.user.email },
  });

  if (!tenant) return [];

  const invoices = await prisma.invoice.findMany({
    where: { tenantId: tenant.id },
    include: { unit: { include: { property: true } } },
    orderBy: { period: "desc" },
  });

  // Convert Decimal to number
  return invoices.map((inv) => ({
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
    paymentMethod: inv.paymentMethod,
    paymentProofUrl: inv.paymentProofUrl,
    notes: inv.notes,
    createdAt: inv.createdAt,
    unit: {
      id: inv.unit.id,
      unitNumber: inv.unit.unitNumber,
      property: {
        name: inv.unit.property.name,
      },
    },
  }));
}

export default async function TenantInvoicePage() {
  const session = await getServerSession(tenantAuthOptions);

  if (!session) {
    redirect("/tenant/login");
  }

  const invoices = await getTenantInvoices(session);

  return <InvoiceListClient invoices={invoices} />;
}
