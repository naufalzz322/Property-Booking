import { getPropertyName } from "@/lib/property";
import TenantLoginPageClient from "./TenantLoginPageClient";

export const dynamic = "force-dynamic";

export default async function TenantLoginPage() {
  let propertyName = "Property Management";
  try {
    propertyName = await getPropertyName();
  } catch {
    // Use default during build
  }
  return <TenantLoginPageClient propertyName={propertyName} />;
}
