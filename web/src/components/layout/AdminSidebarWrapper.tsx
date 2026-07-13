import { AdminSidebar } from "./AdminSidebar";
import { getPropertyName } from "@/lib/property";

export async function AdminSidebarWrapper() {
  const propertyName = await getPropertyName();
  return <AdminSidebar propertyName={propertyName} />;
}
