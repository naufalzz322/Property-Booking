import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get("q")?.trim() || "";

    if (q.length < 2) {
      return NextResponse.json({ error: "Query too short" }, { status: 400 });
    }

    const query = `%${q}%`;
    const limit = 5;

    // Search bookings
    const bookings = await prisma.booking.findMany({
      where: {
        OR: [
          { bookingNumber: { contains: q } },
          { guestName: { contains: q } },
          { guestEmail: { contains: q } },
          { guestPhone: { contains: q } },
        ],
      },
      include: {
        unit: { select: { unitNumber: true, name: true } },
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    // Search tenants
    const tenants = await prisma.tenant.findMany({
      where: {
        OR: [
          { name: { contains: q } },
          { email: { contains: q } },
          { phone: { contains: q } },
        ],
      },
      include: {
        unit: { select: { unitNumber: true, name: true } },
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    // Search invoices
    const invoices = await prisma.invoice.findMany({
      where: {
        OR: [
          { invoiceNumber: { contains: q } },
        ],
      },
      include: {
        tenant: { select: { name: true } },
        unit: { select: { unitNumber: true } },
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    // Search units
    const units = await prisma.unit.findMany({
      where: {
        OR: [
          { unitNumber: { contains: q } },
          { name: { contains: q } },
          { slug: { contains: q } },
        ],
      },
      include: {
        property: { select: { name: true } },
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const results = {
      bookings: bookings.map((b) => ({
        id: b.id,
        type: "booking",
        title: b.guestName,
        subtitle: `${b.bookingNumber} • ${b.unit.unitNumber}`,
        status: b.status,
        href: `/admin/booking/${b.id}`,
      })),
      tenants: tenants.map((t) => ({
        id: t.id,
        type: "tenant",
        title: t.name,
        subtitle: `${t.email} • ${t.unit.unitNumber}`,
        status: t.isActive ? "active" : "inactive",
        href: `/admin/tenant`,
      })),
      invoices: invoices.map((i) => ({
        id: i.id,
        type: "invoice",
        title: i.invoiceNumber,
        subtitle: `${i.tenant.name} • ${i.unit.unitNumber}`,
        status: i.status,
        href: `/admin/invoice`,
      })),
      units: units.map((u) => ({
        id: u.id,
        type: "unit",
        title: `${u.unitNumber} - ${u.name}`,
        subtitle: u.property.name,
        status: u.status,
        href: `/admin/unit`,
      })),
    };

    // Count totals
    const totalCount = {
      bookings: await prisma.booking.count({
        where: {
          OR: [
            { bookingNumber: { contains: q } },
            { guestName: { contains: q } },
            { guestEmail: { contains: q } },
            { guestPhone: { contains: q } },
          ],
        },
      }),
      tenants: await prisma.tenant.count({
        where: {
          OR: [
            { name: { contains: q } },
            { email: { contains: q } },
            { phone: { contains: q } },
          ],
        },
      }),
      invoices: await prisma.invoice.count({
        where: {
          invoiceNumber: { contains: q },
        },
      }),
      units: await prisma.unit.count({
        where: {
          OR: [
            { unitNumber: { contains: q } },
            { name: { contains: q } },
            { slug: { contains: q } },
          ],
        },
      }),
    };

    return NextResponse.json({
      query: q,
      results,
      totalCount,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
