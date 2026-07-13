import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { subMonths, startOfMonth, endOfMonth, format } from "date-fns";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get("period") || "6"; // months

    const months = parseInt(period);
    const now = new Date();
    const monthLabels: string[] = [];
    const revenueData: number[] = [];
    const invoiceCountData: number[] = [];

    // Get revenue data for the past N months
    for (let i = months - 1; i >= 0; i--) {
      const date = subMonths(now, i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      const monthLabel = format(date, "MMM yyyy");

      const paidInvoices = await prisma.invoice.findMany({
        where: {
          status: "PAID",
          paidAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      });

      const totalRevenue = paidInvoices.reduce(
        (sum, inv) => sum + Number(inv.totalAmount),
        0
      );

      monthLabels.push(monthLabel);
      revenueData.push(totalRevenue);
      invoiceCountData.push(paidInvoices.length);
    }

    // Get occupancy data
    const units = await prisma.unit.findMany();
    const totalUnits = units.length;
    const occupiedUnits = units.filter((u) => u.status === "OCCUPIED").length;
    const bookedUnits = units.filter((u) => u.status === "BOOKED").length;
    const availableUnits = units.filter((u) => u.status === "AVAILABLE").length;
    const maintenanceUnits = units.filter((u) => u.status === "MAINTENANCE").length;

    // Get overdue data
    const overdueInvoices = await prisma.invoice.findMany({
      where: { status: "OVERDUE" },
    });
    const totalOverdueAmount = overdueInvoices.reduce(
      (sum, inv) => sum + Number(inv.totalAmount),
      0
    );

    // Get unit type distribution
    const unitTypeDistribution = await prisma.unit.groupBy({
      by: ["type"],
      _count: { type: true },
    });

    // Get recent transactions
    const recentTransactions = await prisma.invoice.findMany({
      where: { status: "PAID" },
      include: {
        tenant: { select: { name: true } },
        unit: { select: { unitNumber: true } },
      },
      orderBy: { paidAt: "desc" },
      take: 10,
    });

    // Calculate total revenue (all time)
    const allPaidInvoices = await prisma.invoice.findMany({
      where: { status: "PAID" },
    });
    const totalRevenue = allPaidInvoices.reduce(
      (sum, inv) => sum + Number(inv.totalAmount),
      0
    );

    // Calculate average monthly revenue
    const averageMonthlyRevenue = months > 0
      ? revenueData.reduce((a, b) => a + b, 0) / months
      : 0;

    return NextResponse.json({
      revenue: {
        labels: monthLabels,
        data: revenueData,
        counts: invoiceCountData,
        total: totalRevenue,
        average: Math.round(averageMonthlyRevenue),
      },
      occupancy: {
        total: totalUnits,
        occupied: occupiedUnits,
        booked: bookedUnits,
        available: availableUnits,
        maintenance: maintenanceUnits,
        rate: totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0,
      },
      overdue: {
        count: overdueInvoices.length,
        amount: totalOverdueAmount,
      },
      unitTypes: unitTypeDistribution.map((ut) => ({
        type: ut.type,
        count: ut._count.type,
      })),
      recentTransactions: recentTransactions.map((t) => ({
        id: t.id,
        invoiceNumber: t.invoiceNumber,
        amount: Number(t.totalAmount),
        tenantName: t.tenant.name,
        unitNumber: t.unit.unitNumber,
        paidAt: t.paidAt,
        period: t.period,
      })),
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
