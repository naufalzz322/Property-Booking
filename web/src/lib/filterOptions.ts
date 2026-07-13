// Centralized filter options for consistency across the app

export const BOOKING_STATUS_OPTIONS = [
  { value: "ALL", label: "Semua Status" },
  { value: "PENDING", label: "Menunggu" },
  { value: "CONFIRMED", label: "Dikonfirmasi" },
  { value: "CHECKED_IN", label: "Aktif" },
  { value: "COMPLETED", label: "Selesai" },
  { value: "REJECTED", label: "Ditolak" },
] as const;

export const INVOICE_STATUS_OPTIONS = [
  { value: "ALL", label: "Semua Status" },
  { value: "UNPAID", label: "Belum Bayar" },
  { value: "PAID", label: "Lunas" },
  { value: "OVERDUE", label: "Overdue" },
] as const;

export const TENANT_STATUS_OPTIONS = [
  { value: "ALL", label: "Semua Status" },
  { value: "ACTIVE", label: "Aktif" },
  { value: "PENDING", label: "Pending" },
  { value: "CHECKED_IN", label: "Checked In" },
  { value: "OVERDUE", label: "Ada Overdue" },
] as const;

// Get label from value
export function getStatusLabel<T extends readonly { value: string; label: string }[]>(
  options: T,
  value: string
): string {
  return options.find((opt) => opt.value === value)?.label ?? value;
}

// Invoice status labels
export const INVOICE_STATUS_LABELS: Record<string, string> = {
  UNPAID: "Belum Bayar",
  PAID: "Lunas",
  OVERDUE: "Overdue",
};

export function getInvoiceStatusLabel(status: string): string {
  return INVOICE_STATUS_LABELS[status] ?? status;
}

// Booking status labels
export const BOOKING_STATUS_LABELS: Record<string, string> = {
  PENDING: "Menunggu",
  CONFIRMED: "Dikonfirmasi",
  WAITING_PAYMENT: "Menunggu Bayar",
  PAID: "Lunas",
  CHECKED_IN: "Aktif",
  CHECKOUT: "Check Out",
  COMPLETED: "Selesai",
  REJECTED: "Ditolak",
  CANCELLED: "Dibatalkan",
};

export function getBookingStatusLabel(status: string): string {
  return BOOKING_STATUS_LABELS[status] ?? status;
}

// Tenant status labels
export const TENANT_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Aktif",
  PENDING: "Pending",
  CHECKED_IN: "Checked In",
  OVERDUE: "Ada Overdue",
  INACTIVE: "Nonaktif",
};

export function getTenantStatusLabel(status: string): string {
  return TENANT_STATUS_LABELS[status] ?? status;
}
