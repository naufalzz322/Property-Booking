import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { UnitEditClient } from "@/components/admin/UnitEditClient";

export const dynamic = "force-dynamic";

async function getUnit(slug: string) {
  const unit = await prisma.unit.findUnique({
    where: { slug },
    include: { property: true },
  });

  return unit;
}

export default async function UnitEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const { slug } = await params;
  const unit = await getUnit(slug);

  if (!unit) {
    notFound();
  }

  // Serialize unit data
  const unitForClient = {
    ...unit,
    pricePerMonth: unit.pricePerMonth ? Number(unit.pricePerMonth) : null,
    pricePerNight: unit.pricePerNight ? Number(unit.pricePerNight) : null,
    createdAt: unit.createdAt.toISOString(),
  };

  return <UnitEditClient unit={unitForClient} />;
}
