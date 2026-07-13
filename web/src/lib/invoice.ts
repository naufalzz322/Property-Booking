import prisma from "./prisma";
import { startOfMonth, endOfMonth } from "date-fns";

export interface InvoiceInput {
  tenantId: string;
  period: string;
  rentAmount: number;
  electricAmount?: number;
  waterAmount?: number;
  otherAmount?: number;
  dueDate: Date;
}

export async function generateMonthlyInvoice(
  tenantId: string,
  period: string
): Promise<{ invoice: any; error?: string }> {
  const existing = await prisma.invoice.findFirst({
    where: { tenantId, period },
  });

  if (existing) {
    return { invoice: existing, error: "Invoice already exists for this period" };
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { unit: true },
  });

  if (!tenant) {
    return { invoice: null, error: "Tenant not found" };
  }

  const [year, month] = period.split("-").map(Number);
  const dueDate = new Date(year, month, 5);

  const count = await prisma.invoice.count({
    where: {
      createdAt: {
        gte: startOfMonth(new Date(year, month - 1, 1)),
        lte: endOfMonth(new Date(year, month - 1, 1)),
      },
    },
  });

  const invoiceNumber = `INV-${year}-${String(count + 1).padStart(4, "0")}`;

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      tenantId,
      unitId: tenant.unitId,
      period,
      rentAmount: tenant.unit.pricePerMonth || 0,
      electricAmount: 0,
      waterAmount: 0,
      otherAmount: 0,
      totalAmount: tenant.unit.pricePerMonth || 0,
      dueDate,
      status: "UNPAID",
    },
  });

  return { invoice };
}
