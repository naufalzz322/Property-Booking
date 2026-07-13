import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { InvoiceListPageClient } from "@/components/admin/InvoiceListPageClient";

export const dynamic = "force-dynamic";

async function getInvoices() {
  const invoices = await prisma.invoice.findMany({
    include: {
      tenant: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      unit: {
        select: {
          id: true,
          unitNumber: true,
          property: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

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
    tenant: inv.tenant,
    unit: inv.unit,
  }));
}

async function getActiveTenants() {
  const tenants = await prisma.tenant.findMany({
    where: { isActive: true },
    include: {
      unit: {
        select: {
          unitNumber: true,
          pricePerMonth: true,
          property: {
            select: { name: true },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return tenants.map((t) => ({
    id: t.id,
    name: t.name,
    phone: t.phone,
    unit: {
      unitNumber: t.unit.unitNumber,
      pricePerMonth: t.unit.pricePerMonth ? Number(t.unit.pricePerMonth) : null,
      property: {
        name: t.unit.property.name,
      },
    },
  }));
}

export default async function InvoicesPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const [invoices, tenants] = await Promise.all([getInvoices(), getActiveTenants()]);

  return (
    <InvoiceListPageClient invoices={invoices} tenants={tenants} />
  );
}
