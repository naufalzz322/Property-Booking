import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { v4 as uuid } from "uuid";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const units = await prisma.unit.findMany({
    include: { property: true },
    orderBy: [{ property: { name: "asc" } }, { unitNumber: "asc" }],
  });

  return NextResponse.json({ units });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { propertyId, unitNumber, type, pricePerMonth, pricePerNight, facilities, description, photos } = body;

  // If no propertyId provided, use first available property
  let finalPropertyId = propertyId;
  if (!finalPropertyId) {
    const firstProperty = await prisma.property.findFirst({ orderBy: { name: "asc" } });
    if (!firstProperty) {
      return NextResponse.json({ error: "Tidak ada properti tersedia" }, { status: 400 });
    }
    finalPropertyId = firstProperty.id;
  }

  if (!unitNumber || !type) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const slug = `${finalPropertyId}-${unitNumber}-${uuid().slice(0, 4)}`;

  try {
    const unit = await prisma.unit.create({
      data: {
        propertyId: finalPropertyId,
        name: unitNumber, // Use unitNumber as default name
        unitNumber,
        type: type as any, // Type cast for validation
        slug,
        pricePerMonth: pricePerMonth ? Number(pricePerMonth) : null,
        pricePerNight: pricePerNight ? Number(pricePerNight) : null,
        facilities: facilities || [],
        description,
        photos: photos || [],
        status: "AVAILABLE",
      },
    });

    return NextResponse.json({ unit }, { status: 201 });
  } catch (error) {
    console.error("Failed to create unit:", error);
    return NextResponse.json({ error: "Failed to create unit" }, { status: 500 });
  }
}
