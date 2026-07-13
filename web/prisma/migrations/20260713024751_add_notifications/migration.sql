/*
  Warnings:

  - You are about to drop the `Alert` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "NotificationRecipient" AS ENUM ('ADMIN', 'TENANT');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('BOOKING_NEW', 'BOOKING_CONFIRMED', 'PAYMENT_RECEIVED', 'CHECKIN_READY', 'OVERDUE_OCCURRED', 'CONTRACT_EXPIRING', 'UNIT_MAINTENANCE', 'ACCOUNT_SETUP', 'PAYMENT_REMINDER', 'PAYMENT_CONFIRMED', 'CHECKIN_READY_TENANT', 'OVERDUE_NOTICE', 'CONTRACT_EXPIRING_TENANT');

-- DropForeignKey
ALTER TABLE "Alert" DROP CONSTRAINT "Alert_tenantId_fkey";

-- DropTable
DROP TABLE "Alert";

-- DropEnum
DROP TYPE "AlertType";

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "recipient" "NotificationRecipient" NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "tenantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
