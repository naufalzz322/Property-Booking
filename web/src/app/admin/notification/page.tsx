import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { NotificationListClient } from "@/components/admin/NotificationListClient";

export const dynamic = "force-dynamic";

async function getNotifications() {
  return prisma.notification.findMany({
    where: { recipient: "ADMIN" },
    orderBy: { createdAt: "desc" },
  });
}

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const notifications = await getNotifications();

  return <NotificationListClient notifications={notifications} />;
}
