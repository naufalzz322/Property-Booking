import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Re-export status labels for convenience
export {
  INVOICE_STATUS_LABELS,
  BOOKING_STATUS_LABELS,
  TENANT_STATUS_LABELS,
  INVOICE_STATUS_OPTIONS,
  BOOKING_STATUS_OPTIONS,
  TENANT_STATUS_OPTIONS,
  getInvoiceStatusLabel,
  getBookingStatusLabel,
  getTenantStatusLabel,
} from "./filterOptions"
