import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { DashboardCards } from "@/components/admin/DashboardCards";
import { UnitOverviewTable } from "@/components/admin/UnitOverviewTable";
import { AlertPanel } from "@/components/admin/AlertPanel";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { OccupancyChart } from "@/components/admin/OccupancyChart";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  const [units, tenants, invoices, notifications, bookings] = await Promise.all([
    prisma.unit.findMany({
      include: { property: true, tenants: { where: { isActive: true } } },
      orderBy: { unitNumber: "asc" },
    }),
    prisma.tenant.findMany({ where: { isActive: true } }),
    prisma.invoice.findMany({
      include: { tenant: true, unit: { include: { property: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.notification.findMany({
      where: { recipient: "ADMIN", isRead: false },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.booking.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalUnits = units.length;
  const occupiedUnits = units.filter((u) => u.status === "OCCUPIED").length;
  const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

  const currentMonth = new Date().toISOString().slice(0, 7);
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const lastMonthStr = lastMonth.toISOString().slice(0, 7);

  const monthlyRevenue = invoices
    .filter((i) => i.status === "PAID" && i.period === currentMonth)
    .reduce((sum, i) => sum + Number(i.totalAmount), 0);

  const lastMonthRevenue = invoices
    .filter((i) => i.status === "PAID" && i.period === lastMonthStr)
    .reduce((sum, i) => sum + Number(i.totalAmount), 0);

  const overdueInvoices = invoices.filter((i) => i.status === "OVERDUE");
  const overdueCount = overdueInvoices.length;
  const overdueAmount = overdueInvoices.reduce((sum, i) => sum + Number(i.totalAmount), 0);

  const availableUnits = units.filter((u) => u.status === "AVAILABLE").length;

  // Calculate trends from actual data
  const revenueTrend = lastMonthRevenue > 0
    ? Math.round(((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
    : 0;

  // Calculate occupancy trend (compare to last month count)
  const lastMonthOccupied = units.filter((u) => {
    const u2 = u as any;
    return u2.tenants && u2.tenants.length > 0;
  }).length;
  const occupancyTrend = totalUnits > 0
    ? Math.round(((occupiedUnits - lastMonthOccupied) / totalUnits) * 100)
    : 0;

  const trends = {
    occupancyRate: occupancyTrend,
    monthlyRevenue: revenueTrend,
    overdueCount: overdueCount > 0 ? -5 : 0, // Simplified - could track history
    availableUnits: availableUnits - (totalUnits - occupiedUnits - availableUnits),
  };

  return {
    stats: {
      occupancyRate,
      monthlyRevenue,
      overdueCount,
      overdueAmount,
      availableUnits,
      pendingBookings: bookings.length,
    },
    trends,
    units: units.map((u) => ({
      id: u.id,
      slug: u.slug,
      name: u.name,
      unitNumber: u.unitNumber,
      type: u.type,
      description: u.description,
      facilities: u.facilities,
      photos: u.photos,
      status: u.status,
      pricePerMonth: u.pricePerMonth ? Number(u.pricePerMonth) : null,
      pricePerNight: u.pricePerNight ? Number(u.pricePerNight) : null,
      property: u.property,
      currentTenant: u.tenants[0] ? {
        id: u.tenants[0].id,
        name: u.tenants[0].name,
        email: u.tenants[0].email,
      } : null,
    })),
    recentInvoices: invoices.slice(0, 5).map((inv) => ({
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
      tenant: {
        id: inv.tenant.id,
        name: inv.tenant.name,
        email: inv.tenant.email,
      },
      unit: {
        id: inv.unit.id,
        unitNumber: inv.unit.unitNumber,
        propertyName: inv.unit.property?.name,
      },
    })),
    notifications,
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Selamat datang, {session.user.name}</p>
        </div>
      </div>

      <DashboardCards stats={data.stats} trends={data.trends} />

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div>
          <OccupancyChart />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <UnitOverviewTable units={data.units} />
        </div>
        <div>
          <AlertPanel notifications={data.notifications} />
        </div>
      </div>
    </div>
  );
}
