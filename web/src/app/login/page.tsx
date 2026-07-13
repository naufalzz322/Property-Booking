import { getPropertyName } from "@/lib/property";
import LoginPageClient from "./LoginPageClient";

export default async function LoginPage() {
  const propertyName = await getPropertyName();
  return <LoginPageClient propertyName={propertyName} />;
}
