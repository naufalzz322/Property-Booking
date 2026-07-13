import { NextResponse } from "next/server";
import { getPropertyContactInfo, getPropertyName } from "@/lib/property";

export const dynamic = "force-dynamic";

export async function GET() {
  const [contactInfo, propertyName] = await Promise.all([
    getPropertyContactInfo(),
    getPropertyName(),
  ]);

  return NextResponse.json({
    propertyName,
    ...contactInfo,
  });
}
