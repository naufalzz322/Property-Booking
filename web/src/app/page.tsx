import prisma from "@/lib/prisma";
import LandingPage from "./LandingClient";

export const dynamic = "force-dynamic";

async function getData() {
  try {
    const property = await prisma.property.findFirst({
      include: {
        units: {
          orderBy: [
            { type: "asc" },
            { unitNumber: "asc" },
          ],
        },
      },
    });

    if (!property) {
      return { property: null, units: [] };
    }

    // Convert to plain objects for client component
    const units = property.units.map((u) => ({
      id: u.id,
      name: u.name || `Unit ${u.unitNumber}`,
      unitNumber: u.unitNumber,
      type: u.type,
      slug: u.slug,
      pricePerMonth: u.pricePerMonth ? Number(u.pricePerMonth) : null,
      pricePerNight: u.pricePerNight ? Number(u.pricePerNight) : null,
      facilities: u.facilities,
      photos: u.photos,
      description: u.description,
    }));

    const cleanProperty = {
      id: property.id,
      name: property.name,
      address: property.address,
      description: property.description,
      slug: property.slug,
      latitude: property.latitude || -6.2088,
      longitude: property.longitude || 106.8456,
    };

    return { property: cleanProperty, units };
  } catch (error) {
    console.error("Database error:", error);
    return { property: null, units: [] };
  }
}

export default async function Page() {
  const { property, units } = await getData();
  return <LandingPage property={property} allUnits={units} />;
}
