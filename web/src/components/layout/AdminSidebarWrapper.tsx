import { AdminSidebar } from "./AdminSidebar";
import { getPropertyName } from "@/lib/property";

export async function AdminSidebarWrapper() {
  let propertyName = "Property Management";
  try {
    propertyName = await getPropertyName();
  } catch {
    // Use default during build
  }
  return <AdminSidebar propertyName={propertyName} />;
}
