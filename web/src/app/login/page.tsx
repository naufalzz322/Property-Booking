import { getPropertyName } from "@/lib/property";
import LoginPageClient from "./LoginPageClient";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  let propertyName = "Property Management";
  try {
    propertyName = await getPropertyName();
  } catch {
    // Use default during build
  }
  return <LoginPageClient propertyName={propertyName} />;
}
