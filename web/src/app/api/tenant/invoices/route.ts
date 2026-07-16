import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify this is a tenant session (not admin)
    const userRole = (session.user as any).role;
    if (userRole === "ADMIN" || userRole === "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get tenant from session
    const tenant = await prisma.tenant.findFirst({
      where: { email: session.user.email },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const invoices = await prisma.invoice.findMany({
      where: { tenantId: tenant.id },
      include: {
        unit: {
          select: {
            unitNumber: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Convert Decimal to number
    const invoicesData = invoices.map((inv) => ({
      ...inv,
      rentAmount: Number(inv.rentAmount),
      electricAmount: Number(inv.electricAmount),
      waterAmount: Number(inv.waterAmount),
      otherAmount: Number(inv.otherAmount),
      totalAmount: Number(inv.totalAmount),
    }));

    return NextResponse.json({ invoices: invoicesData });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
