import Link from "next/link";
import prisma from "@/lib/prisma";
import { Home } from "lucide-react";
import { KamarClient } from "./KamarClient";
import { getPropertyContactInfo, getPropertyName } from "@/lib/property";
import { PropertyContactCard } from "@/components/public/PropertyContactCard";

export const dynamic = "force-dynamic";

async function getUnits() {
  const units = await prisma.unit.findMany({
    include: { property: true },
    orderBy: [
      { type: "asc" },
      { unitNumber: "asc" },
    ],
  });

  return units.map((u) => ({
    id: u.id,
    slug: u.slug,
    name: u.name || `Unit ${u.unitNumber}`,
    unitNumber: u.unitNumber,
    type: u.type,
    description: u.description,
    facilities: u.facilities,
    photos: u.photos,
    pricePerMonth: u.pricePerMonth ? Number(u.pricePerMonth) : null,
    pricePerNight: u.pricePerNight ? Number(u.pricePerNight) : null,
    property: {
      id: u.property.id,
      name: u.property.name,
    },
  }));
}

export default async function KamarPage() {
  const units = await getUnits();
  const [contactInfo, propertyName] = await Promise.all([
    getPropertyContactInfo(),
    getPropertyName(),
  ]);

  return (
    <>
      <KamarClient units={units} propertyName={propertyName} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-stone-200 mt-8">
        <PropertyContactCard {...contactInfo} variant="compact" />
      </div>
    </>
  );
}
