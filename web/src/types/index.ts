export type UnitType = "KOS_BULANAN" | "KOS_HARIAN" | "GUEST_HOUSE" | "VILLA";
export type UnitStatus = "AVAILABLE" | "BOOKED" | "OCCUPIED" | "MAINTENANCE";
export type BookingStatus = "PENDING" | "CONFIRMED" | "WAITING_PAYMENT" | "PAID" | "CHECKED_IN" | "CHECKOUT" | "REJECTED" | "CANCELLED";
export type InvoiceStatus = "UNPAID" | "PAID" | "OVERDUE";
export type AlertType = "UNIT_VACANT" | "PAYMENT_OVERDUE" | "CONTRACT_EXPIRING";

export interface Property {
  id: string;
  name: string;
  slug: string;
  address: string;
  description?: string;
  photos: string[];
  createdAt: Date;
}

export interface Unit {
  id: string;
  propertyId: string;
  property?: Property;
  unitNumber: string;
  type: UnitType;
  slug: string;
  pricePerMonth?: number;
  pricePerNight?: number;
  facilities: string[];
  photos: string[];
  description?: string;
  status: UnitStatus;
  createdAt: Date;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  unitId: string;
  unit?: Unit;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  checkInDate: Date;
  durationMonths?: number;
  durationNights?: number;
  notes?: string;
  status: BookingStatus;
  rejectionReason?: string;
  confirmedAt?: Date;
  checkedInAt?: Date;
  checkedOutAt?: Date;
  createdAt: Date;
}

export interface Tenant {
  id: string;
  bookingId: string;
  unitId: string;
  unit?: Unit;
  name: string;
  email: string;
  phone: string;
  contractStart: Date;
  contractEnd?: Date;
  emergencyName?: string;
  emergencyPhone?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  tenantId: string;
  tenant?: Tenant;
  unitId: string;
  unit?: Unit;
  period: string;
  rentAmount: number;
  electricAmount: number;
  waterAmount: number;
  otherAmount: number;
  totalAmount: number;
  dueDate: Date;
  status: InvoiceStatus;
  paidAt?: Date;
  paymentMethod?: string;
  paymentProofUrl?: string;
  notes?: string;
  createdAt: Date;
}

export interface Alert {
  id: string;
  type: AlertType;
  entityId: string;
  entityType: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export interface BookingFormData {
  unitId: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  checkInDate: string;
  durationMonths?: number;
  durationNights?: number;
  notes?: string;
}

export interface InvoiceFormData {
  tenantId: string;
  period: string;
  rentAmount: number;
  electricAmount?: number;
  waterAmount?: number;
  otherAmount?: number;
  dueDate: string;
}
