import { getPropertyName } from "@/lib/property";
import TenantLoginPageClient from "./TenantLoginPageClient";

export default async function TenantLoginPage() {
  const propertyName = await getPropertyName();
  return <TenantLoginPageClient propertyName={propertyName} />;
}
