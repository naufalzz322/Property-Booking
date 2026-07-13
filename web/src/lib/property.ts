import prisma from "./prisma";
import { PropertySettings, Property, BankAccount } from "@prisma/client";

interface PropertyInfo {
  property: Property | null;
  settings: PropertySettings | null;
  bankAccount: BankAccount | null;
}

// Cache for server-side requests
let cachedInfo: PropertyInfo | null = null;
let cacheTime = 0;
const CACHE_DURATION = 5000; // 5 seconds - short cache for fresh data

export async function getPropertyInfo(): Promise<PropertyInfo> {
  const now = Date.now();

  // Return cached if still valid
  if (cachedInfo && (now - cacheTime) < CACHE_DURATION) {
    return cachedInfo;
  }

  const [property, settings, bankAccount] = await Promise.all([
    prisma.property.findFirst(),
    prisma.propertySettings.findFirst(),
    prisma.bankAccount.findFirst({ where: { isActive: true } }),
  ]);

  cachedInfo = { property, settings, bankAccount };
  cacheTime = now;

  return cachedInfo;
}

// Clear cache (call after updating settings)
export function clearPropertyInfoCache() {
  cachedInfo = null;
  cacheTime = 0;
}

// Get property name
export async function getPropertyName(): Promise<string> {
  const { property } = await getPropertyInfo();
  return property?.name || process.env.NEXT_PUBLIC_PROPERTY_NAME || "Pyta Property";
}

// Get owner WhatsApp
export async function getOwnerPhone(): Promise<string | null> {
  const { settings } = await getPropertyInfo();
  return settings?.whatsappOwner || process.env.OWNER_PHONE || null;
}

// Get owner email
export async function getOwnerEmail(): Promise<string | null> {
  const { settings } = await getPropertyInfo();
  return settings?.emailOwner || process.env.OWNER_EMAIL || null;
}

// Get property email
export async function getPropertyEmail(): Promise<string | null> {
  const { property } = await getPropertyInfo();
  return property?.email || null;
}

// Get booking rules
export async function getBookingRules() {
  const { settings } = await getPropertyInfo();
  return {
    checkInTime: settings?.defaultCheckInTime || "14:00",
    checkOutTime: settings?.defaultCheckOutTime || "12:00",
    minimumStayNights: settings?.minimumStayNights || 1,
    maximumAdvanceBooking: settings?.maximumAdvanceBooking || 90,
    depositPercentage: settings?.depositPercentage || 100,
  };
}

// Get invoice rules
export async function getInvoiceRules() {
  const { settings } = await getPropertyInfo();
  return {
    dueDateDays: settings?.defaultDueDateDays || 7,
    lateFeePercentage: settings?.lateFeePercentage || 2,
    reminderDays: settings?.reminderDays?.split(",").map(Number) || [1, 3, 7],
  };
}

// Get notification settings
export async function getNotificationSettings() {
  const { settings } = await getPropertyInfo();
  return {
    whatsappOwner: settings?.whatsappOwner || null,
    emailOwner: settings?.emailOwner || null,
    notifyNewBooking: settings?.notifyNewBooking ?? true,
    notifyPaymentReceived: settings?.notifyPaymentReceived ?? true,
    notifyOverdue: settings?.notifyOverdue ?? true,
    notifyVacancyReport: settings?.notifyVacancyReport ?? true,
  };
}

// Get all property contact info at once
export async function getPropertyContactInfo(): Promise<{
  phone: string | null;
  email: string | null;
  address: string | null;
  operationalHours: string | null;
}> {
  const { property } = await getPropertyInfo();
  return {
    phone: property?.phone || null,
    email: property?.email || null,
    address: property?.address || null,
    operationalHours: property?.operationalHours || null,
  };
}
