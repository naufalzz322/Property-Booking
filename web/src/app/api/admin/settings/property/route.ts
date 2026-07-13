import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { clearPropertyInfoCache } from "@/lib/property";

export const dynamic = "force-dynamic";

// GET - Get property info
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const property = await prisma.property.findFirst();

    return NextResponse.json({ property });
  } catch (error) {
    console.error("Error fetching property:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT - Update property info
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, address, description, phone, email, operationalHours, photos } = body;

    if (!name || !address) {
      return NextResponse.json(
        { error: "Nama dan alamat wajib diisi" },
        { status: 400 }
      );
    }

    const property = await prisma.property.findFirst();
    if (!property) {
      return NextResponse.json({ error: "Properti tidak ditemukan" }, { status: 404 });
    }

    const updated = await prisma.property.update({
      where: { id: property.id },
      data: {
        name,
        address,
        description: description || null,
        phone: phone || null,
        email: email || null,
        operationalHours: operationalHours || null,
        photos: photos || [],
      },
    });

    // Clear cache so new values are reflected immediately
    clearPropertyInfoCache();

    return NextResponse.json({ property: updated });
  } catch (error) {
    console.error("Error updating property:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
