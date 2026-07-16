import { PrismaClient, UnitStatus, UnitType, BookingStatus, InvoiceStatus, NotificationRecipient, NotificationType, UserRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Room photos from Unsplash
const ROOM_PHOTOS = {
  standard: [
    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
    "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&q=80",
  ],
  deluxe: [
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80",
  ],
  premium: [
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
    "https://images.unsplash.com/photo-1620626011761-996317702786?w=800&q=80",
  ],
  suite: [
    "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80",
    "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=80",
  ],
  villa: [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
  ],
};

// Helper: Date utilities
function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function monthsAgo(months: number, day: number = 1): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  d.setDate(day);
  return d;
}

function monthsFromNow(months: number, day: number = 1): Date {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  d.setDate(day);
  return d;
}

// Helper: Generate booking number
function generateBookingNumber(sequence: number): string {
  const now = new Date();
  const yearShort = String(now.getFullYear()).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const dateStr = `${yearShort}${month}${day}`;
  const seq = String(sequence).padStart(4, "0");
  return `BK-${dateStr}-${seq}`;
}

// Helper: Generate invoice number
function generateInvoiceNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `INV${dateStr}${random}`;
}

// Helper: Format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

async function main() {
  console.log("\n🗑️  Clearing existing data...\n");

  await prisma.notification.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.bookingEvent.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.property.deleteMany();
  await prisma.bankAccount.deleteMany();
  await prisma.user.deleteMany();

  console.log("🌱 Starting seed...\n");

  // ============================================
  // 1. USERS
  // ============================================
  console.log("👤 Creating users...\n");

  const hashedPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@grahamaju.com",
      name: "Admin Graha Maju",
      role: UserRole.ADMIN,
      password: hashedPassword,
    },
  });

  const owner = await prisma.user.create({
    data: {
      email: "owner@grahamaju.com",
      name: "Owner Graha Maju",
      role: UserRole.OWNER,
      password: await bcrypt.hash("owner123", 10),
    },
  });

  console.log(`   ✅ ${admin.name} - ${admin.email}`);
  console.log(`   ✅ ${owner.name} - ${owner.email}\n`);

  // ============================================
  // 2. BANK ACCOUNTS
  // ============================================
  console.log("🏦 Creating bank accounts...\n");

  const bankAccounts = await Promise.all([
    prisma.bankAccount.create({
      data: {
        bankName: "Bank Central Asia (BCA)",
        accountName: "PT Graha Maju Property",
        accountNumber: "1234567890",
        isActive: true,
      },
    }),
    prisma.bankAccount.create({
      data: {
        bankName: "Bank Mandiri",
        accountName: "PT Graha Maju Property",
        accountNumber: "9876543210",
        isActive: true,
      },
    }),
    prisma.bankAccount.create({
      data: {
        bankName: "Bank Negara Indonesia (BNI)",
        accountName: "PT Graha Maju Property",
        accountNumber: "1111222233",
        isActive: false,
      },
    }),
  ]);

  bankAccounts.forEach((acc) => {
    const status = acc.isActive ? "✅" : "❌";
    console.log(`   ${status} ${acc.bankName} - ${acc.accountNumber}`);
  });
  console.log();

  // ============================================
  // 3. PROPERTY
  // ============================================
  console.log("🏢 Creating property...\n");

  const property = await prisma.property.create({
    data: {
      name: "Graha Maju",
      slug: "graha-maju",
      address: "Jl. Sudirman No. 45, Jakarta Selatan",
      description: "Kost eksklusif dengan fasilitas lengkap di lokasi strategis Jakarta.",
      photos: [
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80",
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80",
      ],
      latitude: -6.2088,
      longitude: 106.8456,
    },
  });

  console.log(`   ✅ ${property.name} - ${property.address}\n`);

  // ============================================
  // 4. UNITS
  // ============================================
  console.log("🚪 Creating units...\n");

  const unitsData = [
    // KOS BULANAN
    { name: "Kamar Anggrek", unitNumber: "KOS-101", type: UnitType.KOS_BULANAN, pricePerMonth: 1200000, pricePerNight: null, facilities: ["AC", "WiFi", "Kamar Mandi Dalam"], status: UnitStatus.OCCUPIED, photos: ROOM_PHOTOS.standard },
    { name: "Kamar Melati", unitNumber: "KOS-102", type: UnitType.KOS_BULANAN, pricePerMonth: 1200000, pricePerNight: null, facilities: ["AC", "WiFi", "Kamar Mandi Dalam"], status: UnitStatus.OCCUPIED, photos: ROOM_PHOTOS.standard },
    { name: "Kamar Dahlia", unitNumber: "KOS-103", type: UnitType.KOS_BULANAN, pricePerMonth: 1500000, pricePerNight: null, facilities: ["AC", "WiFi", "Kamar Mandi Dalam", "TV LED"], status: UnitStatus.AVAILABLE, photos: ROOM_PHOTOS.deluxe },
    { name: "Kamar Mawar", unitNumber: "KOS-104", type: UnitType.KOS_BULANAN, pricePerMonth: 1800000, pricePerNight: null, facilities: ["AC", "WiFi", "Kamar Mandi Dalam", "TV LED", "Kulkas Mini"], status: UnitStatus.OCCUPIED, photos: ROOM_PHOTOS.deluxe },
    { name: "Kamar Bougenville", unitNumber: "KOS-201", type: UnitType.KOS_BULANAN, pricePerMonth: 2000000, pricePerNight: null, facilities: ["AC", "WiFi", "Kamar Mandi Dalam", "TV LED", "Balkon"], status: UnitStatus.BOOKED, photos: ROOM_PHOTOS.premium },
    { name: "Suite Lavender", unitNumber: "KOS-202", type: UnitType.KOS_BULANAN, pricePerMonth: 2500000, pricePerNight: null, facilities: ["AC", "WiFi", "Kamar Mandi Dalam", "TV LED", "Bathtub"], status: UnitStatus.MAINTENANCE, photos: ROOM_PHOTOS.premium },
    { name: "Kamar Orchid", unitNumber: "KOS-203", type: UnitType.KOS_BULANAN, pricePerMonth: 1600000, pricePerNight: null, facilities: ["AC", "WiFi", "Kamar Mandi Dalam", "TV LED"], status: UnitStatus.BOOKED, photos: ROOM_PHOTOS.deluxe },
    { name: "Kamar Jasmine", unitNumber: "KOS-204", type: UnitType.KOS_BULANAN, pricePerMonth: 2200000, pricePerNight: null, facilities: ["AC", "WiFi", "Kamar Mandi Dalam", "TV LED", "Kulkas", "Sofa"], status: UnitStatus.AVAILABLE, photos: ROOM_PHOTOS.premium },

    // KOS HARIAN
    { name: "Kost Harian Melati", unitNumber: "KDH-01", type: UnitType.KOS_HARIAN, pricePerMonth: null, pricePerNight: 150000, facilities: ["AC", "WiFi", "Kamar Mandi Dalam", "TV LED"], status: UnitStatus.AVAILABLE, photos: ROOM_PHOTOS.standard },
    { name: "Kost Harian Mawar", unitNumber: "KDH-02", type: UnitType.KOS_HARIAN, pricePerMonth: null, pricePerNight: 200000, facilities: ["AC", "WiFi", "Kamar Mandi Dalam", "TV LED", "Shower Hangat"], status: UnitStatus.AVAILABLE, photos: ROOM_PHOTOS.deluxe },
    { name: "Kost Harian Tulip", unitNumber: "KDH-03", type: UnitType.KOS_HARIAN, pricePerMonth: null, pricePerNight: 250000, facilities: ["AC", "WiFi", "Kamar Mandi Dalam", "TV LED", "Kulkas Mini"], status: UnitStatus.AVAILABLE, photos: ROOM_PHOTOS.suite },
    { name: "Kost Harian Edelweiss", unitNumber: "KDH-04", type: UnitType.KOS_HARIAN, pricePerMonth: null, pricePerNight: 175000, facilities: ["AC", "WiFi", "Kamar Mandi Dalam", "TV LED"], status: UnitStatus.OCCUPIED, photos: ROOM_PHOTOS.standard },

    // GUEST HOUSE
    { name: "Guest House Kenanga", unitNumber: "GH-01", type: UnitType.GUEST_HOUSE, pricePerMonth: null, pricePerNight: 350000, facilities: ["AC", "WiFi", "Kamar Mandi Dalam", "TV LED", "Kulkas", "Dapur Bersama"], status: UnitStatus.AVAILABLE, photos: ROOM_PHOTOS.suite },
    { name: "Guest House Sakura", unitNumber: "GH-02", type: UnitType.GUEST_HOUSE, pricePerMonth: null, pricePerNight: 500000, facilities: ["AC", "WiFi", "Kamar Mandi Dalam", "TV LED", "Kulkas", "Dapur Private", "Balkon"], status: UnitStatus.BOOKED, photos: ROOM_PHOTOS.suite },
    { name: "Guest House Dahlia", unitNumber: "GH-03", type: UnitType.GUEST_HOUSE, pricePerMonth: null, pricePerNight: 400000, facilities: ["AC", "WiFi", "Kamar Mandi Dalam", "TV LED", "Kulkas", "Dapur Bersama"], status: UnitStatus.AVAILABLE, photos: ROOM_PHOTOS.suite },
    { name: "Guest House Magnolia", unitNumber: "GH-04", type: UnitType.GUEST_HOUSE, pricePerMonth: null, pricePerNight: 600000, facilities: ["AC", "WiFi", "Kamar Mandi Dalam", "TV LED", "Kulkas", "Dapur Private", "Ruang Tamu"], status: UnitStatus.BOOKED, photos: ROOM_PHOTOS.suite },

    // VILLA
    { name: "Villa Jasmine", unitNumber: "VILLA-01", type: UnitType.VILLA, pricePerMonth: null, pricePerNight: 1200000, facilities: ["AC", "WiFi", "Kamar Mandi Dalam", "TV LED", "Kulkas", "Dapur Full", "Halaman Pribadi", "Parkir"], status: UnitStatus.AVAILABLE, photos: ROOM_PHOTOS.villa },
    { name: "Villa Orchid", unitNumber: "VILLA-02", type: UnitType.VILLA, pricePerMonth: null, pricePerNight: 1500000, facilities: ["AC", "WiFi", "Kamar Mandi 2", "TV LED", "Kulkas", "Dapur Full", "Halaman Pribadi", "Kolam Renang"], status: UnitStatus.AVAILABLE, photos: ROOM_PHOTOS.villa },
  ];

  const createdUnits: Record<string, { id: string; unitNumber: string; type: string; pricePerMonth: number | null; pricePerNight: number | null }> = {};

  for (const unitData of unitsData) {
    const slug = unitData.unitNumber.toLowerCase().replace(/\s+/g, "-");
    const unit = await prisma.unit.create({
      data: {
        propertyId: property.id,
        name: unitData.name,
        unitNumber: unitData.unitNumber,
        type: unitData.type,
        slug,
        pricePerMonth: unitData.pricePerMonth,
        pricePerNight: unitData.pricePerNight,
        facilities: unitData.facilities,
        photos: unitData.photos,
        status: unitData.status,
      },
    });
    createdUnits[unit.unitNumber] = {
      id: unit.id,
      unitNumber: unit.unitNumber,
      type: unit.type,
      pricePerMonth: unitData.pricePerMonth,
      pricePerNight: unitData.pricePerNight,
    };
    console.log(`   ✅ ${unit.unitNumber} (${unit.type}) - ${unit.status}`);
  }

  console.log();

  // ============================================
  // 5. BOOKINGS - All 7 statuses + REJECTED/CANCELLED
  // ============================================
  console.log("📝 Creating bookings (all statuses)...\n");

  const tenantPassword = await bcrypt.hash("tenant123", 10);
  const createdBookings: Record<string, { id: string; unitId: string; bookingNumber: string; status: string; guestEmail: string }> = {};
  const createdTenants: Record<string, { id: string; email: string; name: string; unitId: string }> = {};

  // PENDING bookings (3) - waiting admin confirmation
  const pendingBookings = [
    { seq: 1, unitNumber: "GH-02", guestName: "Budi Santoso", guestPhone: "081234567890", guestEmail: "budi.santoso@email.com", checkInDate: daysFromNow(7), durationMonths: null, durationNights: 3, notes: "Liburan keluarga", createdAt: daysAgo(3) },
    { seq: 2, unitNumber: "VILLA-01", guestName: "Siti Rahayu", guestPhone: "085678901234", guestEmail: "siti.rahayu@email.com", checkInDate: daysFromNow(14), durationMonths: null, durationNights: 2, notes: "Anniversary weekend", createdAt: new Date() },
    { seq: 3, unitNumber: "KOS-103", guestName: "Ahmad Fauzi", guestPhone: "082112345678", guestEmail: "ahmad.fauzi@email.com", checkInDate: monthsFromNow(1, 1), durationMonths: 6, durationNights: null, notes: "Pindah kerja", createdAt: daysAgo(1) },
  ];

  // CONFIRMED bookings (2) - confirmed but no tenant created yet
  const confirmedBookings = [
    { seq: 4, unitNumber: "VILLA-02", guestName: "Rudi Hartono", guestPhone: "087712345678", guestEmail: "rudi.hartono@email.com", checkInDate: daysFromNow(20), durationMonths: null, durationNights: 2, notes: "Office retreat", createdAt: daysAgo(3), confirmedAt: daysAgo(1) },
    { seq: 5, unitNumber: "KDH-01", guestName: "Dewi Lestari", guestPhone: "083245678901", guestEmail: "dewi.lestari@email.com", checkInDate: daysFromNow(3), durationMonths: null, durationNights: 5, notes: "Transit bisnis", createdAt: daysAgo(2), confirmedAt: daysAgo(1) },
  ];

  // WAITING_PAYMENT bookings (2) - tenant created, invoice sent, waiting payment
  // These have TENANT_CREATED event, meaning status should be WAITING_PAYMENT
  const waitingPaymentBookings = [
    { seq: 6, unitNumber: "KOS-201", guestName: "Farhan Aziz", guestPhone: "086123456789", guestEmail: "farhan.aziz@email.com", checkInDate: daysFromNow(3), durationMonths: 3, durationNights: null, notes: "Kontrak 3 bulan", createdAt: daysAgo(5), confirmedAt: daysAgo(4), status: BookingStatus.WAITING_PAYMENT },
    { seq: 7, unitNumber: "KOS-203", guestName: "Maya Sari", guestPhone: "089123456789", guestEmail: "maya.sari@email.com", checkInDate: daysFromNow(7), durationMonths: 6, durationNights: null, notes: "Karyawan baru", createdAt: daysAgo(5), confirmedAt: daysAgo(3), status: BookingStatus.WAITING_PAYMENT },
  ];

  // PAID bookings (2) - payment received, ready for check-in
  const paidBookings = [
    { seq: 8, unitNumber: "GH-04", guestName: "Hendra Wijaya", guestPhone: "085123456789", guestEmail: "hendra.wijaya@email.com", checkInDate: daysFromNow(2), durationMonths: null, durationNights: 4, notes: "Family gathering", createdAt: daysAgo(10), confirmedAt: daysAgo(8), paidAt: daysAgo(2) },
    { seq: 9, unitNumber: "GH-03", guestName: "Lisa Permata", guestPhone: "081345678901", guestEmail: "lisa.permata@email.com", checkInDate: daysFromNow(5), durationMonths: null, durationNights: 3, notes: "Staycation", createdAt: daysAgo(7), confirmedAt: daysAgo(5), paidAt: daysAgo(1) },
  ];

  // CHECKED_IN bookings (3) - currently staying
  const checkedInBookings = [
    { seq: 10, unitNumber: "KOS-101", guestName: "Rizky Ramadhan", guestPhone: "081987654321", guestEmail: "rizky.ramadhan@email.com", checkInDate: monthsAgo(3, 1), durationMonths: 12, durationNights: null, notes: "Kontrak tahunan", createdAt: monthsAgo(3, 5), confirmedAt: monthsAgo(3, 3), checkedInAt: monthsAgo(3, 1) },
    { seq: 11, unitNumber: "KOS-102", guestName: "Putri Wulandari", guestPhone: "082123456789", guestEmail: "putri.wulandari@email.com", checkInDate: monthsAgo(2, 1), durationMonths: 6, durationNights: null, notes: "Mahasiswa", createdAt: monthsAgo(2, 5), confirmedAt: monthsAgo(2, 3), checkedInAt: monthsAgo(2, 1) },
    { seq: 12, unitNumber: "KDH-04", guestName: "Galang Ramadhan", guestPhone: "088765432109", guestEmail: "galang.ramadhan@email.com", checkInDate: daysAgo(3), durationMonths: null, durationNights: 7, notes: "Proyek mingguan", createdAt: daysAgo(10), confirmedAt: daysAgo(8), checkedInAt: daysAgo(3) },
  ];

  // CHECKOUT bookings (2) - already completed
  const checkoutBookings = [
    { seq: 13, unitNumber: "VILLA-01", guestName: "Diana Kusuma", guestPhone: "081298765432", guestEmail: "diana.kusuma@email.com", checkInDate: monthsAgo(1, 5), durationMonths: null, durationNights: 3, notes: "Family reunion", createdAt: monthsAgo(1, 7), confirmedAt: monthsAgo(1, 5), checkedInAt: monthsAgo(1, 5), checkedOutAt: monthsAgo(1, 8) },
    { seq: 14, unitNumber: "GH-01", guestName: "Bambang Hermawan", guestPhone: "081345678901", guestEmail: "bambang.hermawan@email.com", checkInDate: monthsAgo(1, 10), durationMonths: null, durationNights: 4, notes: "Kunjungan kantor", createdAt: monthsAgo(1, 12), confirmedAt: monthsAgo(1, 10), checkedInAt: monthsAgo(1, 10), checkedOutAt: monthsAgo(1, 14) },
  ];

  // REJECTED bookings (1) - rejected by admin
  const rejectedBookings = [
    { seq: 15, unitNumber: "KDH-02", guestName: "Andi Wijaya", guestPhone: "085678901234", guestEmail: "andi.wijaya@email.com", checkInDate: daysFromNow(2), durationMonths: null, durationNights: 10, notes: "Long stay harian", createdAt: daysAgo(5), rejectionReason: "Unit sedang dalam perbaikan" },
  ];

  // CANCELLED bookings (1) - cancelled by guest
  const cancelledBookings = [
    { seq: 16, unitNumber: "KDH-03", guestName: "Rina Susanti", guestPhone: "081234567891", guestEmail: "rina.susanti@email.com", checkInDate: daysFromNow(5), durationMonths: null, durationNights: 3, notes: "Cancel plan", createdAt: daysAgo(10), cancellationReason: "Rencana berubah" },
  ];

  // Create all bookings
  const allBookingData = [
    ...pendingBookings,
    ...confirmedBookings,
    ...waitingPaymentBookings,
    ...paidBookings,
    ...checkedInBookings,
    ...checkoutBookings,
    ...rejectedBookings,
    ...cancelledBookings,
  ];

  for (const bookingData of allBookingData) {
    const unit = createdUnits[bookingData.unitNumber];
    const bookingNumber = generateBookingNumber(bookingData.seq);

    // Determine status from data or explicit status field
    let status: BookingStatus = BookingStatus.PENDING;
    if ((bookingData as any).status) {
      status = (bookingData as any).status as BookingStatus;
    } else if ((bookingData as any).rejectionReason) {
      status = BookingStatus.REJECTED;
    } else if ((bookingData as any).cancellationReason) {
      status = BookingStatus.CANCELLED;
    } else if ((bookingData as any).checkedOutAt) {
      status = BookingStatus.CHECKOUT;
    } else if ((bookingData as any).checkedInAt) {
      status = BookingStatus.CHECKED_IN;
    } else if ((bookingData as any).paidAt) {
      status = BookingStatus.PAID;
    } else if ((bookingData as any).confirmedAt) {
      status = BookingStatus.CONFIRMED;
    }

    const booking = await prisma.booking.create({
      data: {
        bookingNumber,
        unitId: unit.id,
        guestName: bookingData.guestName,
        guestPhone: bookingData.guestPhone,
        guestEmail: bookingData.guestEmail,
        checkInDate: bookingData.checkInDate,
        durationMonths: bookingData.durationMonths,
        durationNights: bookingData.durationNights,
        notes: bookingData.notes,
        status,
        confirmedAt: (bookingData as any).confirmedAt || null,
        checkedInAt: (bookingData as any).checkedInAt || null,
        checkedOutAt: (bookingData as any).checkedOutAt || null,
        rejectionReason: (bookingData as any).rejectionReason || null,
        createdAt: bookingData.createdAt,
      },
    });

    createdBookings[booking.bookingNumber] = {
      id: booking.id,
      unitId: booking.unitId,
      bookingNumber: booking.bookingNumber,
      status: booking.status,
      guestEmail: booking.guestEmail,
    };

    const statusIcons: Record<string, string> = {
      PENDING: "⏳",
      CONFIRMED: "✅",
      WAITING_PAYMENT: "📋",
      PAID: "💳",
      CHECKED_IN: "🏠",
      CHECKOUT: "🏁",
      REJECTED: "❌",
      CANCELLED: "🚫",
    };
    console.log(`   ${statusIcons[booking.status]} ${booking.bookingNumber} - ${booking.guestName} (${booking.status})`);
  }

  console.log();

  // ============================================
  // 6. TENANTS (for WAITING_PAYMENT, PAID, CHECKED_IN)
  // ============================================
  console.log("👥 Creating tenants...\n");

  // Tenants for WAITING_PAYMENT status
  const waitingPaymentTenants = [
    { name: "Farhan Aziz", email: "farhan.aziz@email.com", phone: "086123456789", bookingSeq: 6, unitNumber: "KOS-201", contractStart: daysFromNow(3), contractEnd: monthsFromNow(3, 3) },
    { name: "Maya Sari", email: "maya.sari@email.com", phone: "089123456789", bookingSeq: 7, unitNumber: "KOS-203", contractStart: daysFromNow(7), contractEnd: monthsFromNow(6, 7) },
  ];

  // Tenants for PAID status (payment received, ready for check-in)
  const paidTenants = [
    { name: "Hendra Wijaya", email: "hendra.wijaya@email.com", phone: "085123456789", bookingSeq: 8, unitNumber: "GH-04", contractStart: daysFromNow(2), contractEnd: daysFromNow(6) },
    { name: "Lisa Permata", email: "lisa.permata@email.com", phone: "081345678901", bookingSeq: 9, unitNumber: "GH-03", contractStart: daysFromNow(5), contractEnd: daysFromNow(8) },
  ];

  // Tenants for CHECKED_IN status
  const checkedInTenants = [
    { name: "Rizky Ramadhan", email: "rizky.ramadhan@email.com", phone: "081987654321", bookingSeq: 10, unitNumber: "KOS-101", contractStart: monthsAgo(3, 1), contractEnd: monthsFromNow(9, 1) },
    { name: "Putri Wulandari", email: "putri.wulandari@email.com", phone: "082123456789", bookingSeq: 11, unitNumber: "KOS-102", contractStart: monthsAgo(2, 1), contractEnd: monthsFromNow(4, 1) },
    { name: "Galang Ramadhan", email: "galang.ramadhan@email.com", phone: "088765432109", bookingSeq: 12, unitNumber: "KDH-04", contractStart: daysAgo(3), contractEnd: daysFromNow(1) }, // ends tomorrow for demo
  ];

  const allTenantsData = [...waitingPaymentTenants, ...paidTenants, ...checkedInTenants];

  for (const tenantData of allTenantsData) {
    const booking = Object.values(createdBookings).find((b) => b.bookingNumber.includes(`-${String(tenantData.bookingSeq).padStart(4, "0")}`));

    const tenant = await prisma.tenant.create({
      data: {
        bookingId: booking?.id || "",
        unitId: createdUnits[tenantData.unitNumber].id,
        name: tenantData.name,
        email: tenantData.email,
        passwordHash: tenantPassword,
        phone: tenantData.phone,
        contractStart: tenantData.contractStart,
        contractEnd: tenantData.contractEnd,
        emergencyName: "Emergency Contact",
        emergencyPhone: "081234567890",
        isActive: true,
      },
    });

    createdTenants[tenant.email] = { id: tenant.id, email: tenant.email, name: tenant.name, unitId: tenant.unitId };

    const bookingStatus = booking?.status || "UNKNOWN";
    console.log(`   👤 ${tenant.name} - ${tenantData.unitNumber} (${bookingStatus})`);
  }

  console.log();

  // ============================================
  // 7. INVOICES - All InvoiceStatus values
  // ============================================
  console.log("💰 Creating invoices...\n");

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const invoicesData = [
    // ===== UNPAID invoices =====
    // WAITING_PAYMENT booking invoices (created when tenant is created)
    {
      invoiceNumber: generateInvoiceNumber(),
      tenantEmail: "farhan.aziz@email.com",
      unitNumber: "KOS-201",
      period: `${currentYear}-${String(currentMonth).padStart(2, "0")}`,
      rentAmount: 2000000 * 3, // 3 months
      electricAmount: 0,
      waterAmount: 0,
      otherAmount: 500000, // Deposit
      totalAmount: 2000000 * 3 + 500000,
      dueDate: daysFromNow(3), // Due = contract start date
      status: InvoiceStatus.UNPAID,
      paidAt: null,
      paymentMethod: null,
      isInitialInvoice: true,
    },
    {
      invoiceNumber: generateInvoiceNumber(),
      tenantEmail: "maya.sari@email.com",
      unitNumber: "KOS-203",
      period: `${currentYear}-${String(currentMonth).padStart(2, "0")}`,
      rentAmount: 1600000 * 6, // 6 months
      electricAmount: 0,
      waterAmount: 0,
      otherAmount: 400000, // Deposit
      totalAmount: 1600000 * 6 + 400000,
      dueDate: daysFromNow(7), // Due = contract start date
      status: InvoiceStatus.UNPAID,
      paidAt: null,
      paymentMethod: null,
      isInitialInvoice: true,
    },

    // ===== PAID invoices =====
    // PAID booking initial invoices
    {
      invoiceNumber: generateInvoiceNumber(),
      tenantEmail: "hendra.wijaya@email.com",
      unitNumber: "GH-04",
      period: `${currentYear}-${String(currentMonth).padStart(2, "0")}`,
      rentAmount: 600000 * 4, // 4 nights
      electricAmount: 0,
      waterAmount: 0,
      otherAmount: 100000, // Service fee
      totalAmount: 600000 * 4 + 100000,
      dueDate: daysFromNow(2),
      status: InvoiceStatus.PAID,
      paidAt: daysAgo(2),
      paymentMethod: "Transfer BCA",
      isInitialInvoice: true,
    },
    {
      invoiceNumber: generateInvoiceNumber(),
      tenantEmail: "lisa.permata@email.com",
      unitNumber: "GH-03",
      period: `${currentYear}-${String(currentMonth).padStart(2, "0")}`,
      rentAmount: 400000 * 3, // 3 nights
      electricAmount: 0,
      waterAmount: 0,
      otherAmount: 50000, // Cleaning fee
      totalAmount: 400000 * 3 + 50000,
      dueDate: daysFromNow(5),
      status: InvoiceStatus.PAID,
      paidAt: daysAgo(1),
      paymentMethod: "Transfer Mandiri",
      isInitialInvoice: true,
    },

    // CHECKED_IN tenant monthly invoices - CURRENT month
    {
      invoiceNumber: generateInvoiceNumber(),
      tenantEmail: "rizky.ramadhan@email.com",
      unitNumber: "KOS-101",
      period: `${currentYear}-${String(currentMonth).padStart(2, "0")}`,
      rentAmount: 1200000,
      electricAmount: 175000,
      waterAmount: 50000,
      otherAmount: 0,
      totalAmount: 1425000,
      dueDate: new Date(currentYear, new Date().getMonth(), 5),
      status: InvoiceStatus.PAID,
      paidAt: new Date(currentYear, new Date().getMonth(), 3),
      paymentMethod: "Transfer BCA",
      isInitialInvoice: false,
    },
    {
      invoiceNumber: generateInvoiceNumber(),
      tenantEmail: "putri.wulandari@email.com",
      unitNumber: "KOS-102",
      period: `${currentYear}-${String(currentMonth).padStart(2, "0")}`,
      rentAmount: 1200000,
      electricAmount: 250000,
      waterAmount: 75000,
      otherAmount: 0,
      totalAmount: 1525000,
      dueDate: new Date(currentYear, new Date().getMonth(), 5),
      status: InvoiceStatus.PAID,
      paidAt: new Date(currentYear, new Date().getMonth(), 2),
      paymentMethod: "Transfer BCA",
      isInitialInvoice: false,
    },
    {
      invoiceNumber: generateInvoiceNumber(),
      tenantEmail: "galang.ramadhan@email.com",
      unitNumber: "KDH-04",
      period: `${currentYear}-${String(currentMonth).padStart(2, "0")}`,
      rentAmount: 175000 * 7, // 7 nights
      electricAmount: 0,
      waterAmount: 0,
      otherAmount: 50000, // Cleaning fee
      totalAmount: 175000 * 7 + 50000,
      dueDate: daysAgo(3),
      status: InvoiceStatus.PAID,
      paidAt: daysAgo(4),
      paymentMethod: "Transfer BCA",
      isInitialInvoice: false,
    },

    // ===== OVERDUE invoices =====
    // Current month - overdue
    {
      invoiceNumber: generateInvoiceNumber(),
      tenantEmail: "rizky.ramadhan@email.com",
      unitNumber: "KOS-101",
      period: `${currentYear}-${String(currentMonth).padStart(2, "0")}`,
      rentAmount: 1200000,
      electricAmount: 200000,
      waterAmount: 50000,
      otherAmount: 0,
      totalAmount: 1450000,
      dueDate: new Date(currentYear, new Date().getMonth(), 5),
      status: InvoiceStatus.OVERDUE,
      paidAt: null,
      paymentMethod: null,
      isInitialInvoice: false,
    },
    {
      invoiceNumber: generateInvoiceNumber(),
      tenantEmail: "putri.wulandari@email.com",
      unitNumber: "KOS-102",
      period: `${currentYear}-${String(currentMonth).padStart(2, "0")}`,
      rentAmount: 1200000,
      electricAmount: 300000,
      waterAmount: 100000,
      otherAmount: 0,
      totalAmount: 1600000,
      dueDate: new Date(currentYear, new Date().getMonth(), 5),
      status: InvoiceStatus.OVERDUE,
      paidAt: null,
      paymentMethod: null,
      isInitialInvoice: false,
    },

    // ===== Previous month invoices - PAID =====
    {
      invoiceNumber: generateInvoiceNumber(),
      tenantEmail: "rizky.ramadhan@email.com",
      unitNumber: "KOS-101",
      period: `${currentYear}-${String(currentMonth - 2 <= 0 ? 12 + (currentMonth - 2) : currentMonth - 2).padStart(2, "0")}`,
      rentAmount: 1200000,
      electricAmount: 180000,
      waterAmount: 50000,
      otherAmount: 0,
      totalAmount: 1430000,
      dueDate: new Date(currentYear, new Date().getMonth() - 2, 5),
      status: InvoiceStatus.PAID,
      paidAt: new Date(currentYear, new Date().getMonth() - 2, 3),
      paymentMethod: "Transfer BCA",
      isInitialInvoice: false,
    },
    {
      invoiceNumber: generateInvoiceNumber(),
      tenantEmail: "putri.wulandari@email.com",
      unitNumber: "KOS-102",
      period: `${currentYear}-${String(currentMonth - 1 <= 0 ? 12 : currentMonth - 1).padStart(2, "0")}`,
      rentAmount: 1200000,
      electricAmount: 220000,
      waterAmount: 60000,
      otherAmount: 0,
      totalAmount: 1480000,
      dueDate: new Date(currentYear, new Date().getMonth() - 1, 5),
      status: InvoiceStatus.PAID,
      paidAt: new Date(currentYear, new Date().getMonth() - 1, 4),
      paymentMethod: "Transfer Mandiri",
      isInitialInvoice: false,
    },
  ];

  for (const invoiceData of invoicesData) {
    const tenant = createdTenants[invoiceData.tenantEmail];
    const unit = createdUnits[invoiceData.unitNumber];
    if (!tenant || !unit) continue;

    await prisma.invoice.create({
      data: {
        invoiceNumber: invoiceData.invoiceNumber,
        tenantId: tenant.id,
        unitId: unit.id,
        period: invoiceData.period,
        rentAmount: invoiceData.rentAmount,
        electricAmount: invoiceData.electricAmount,
        waterAmount: invoiceData.waterAmount,
        otherAmount: invoiceData.otherAmount,
        totalAmount: invoiceData.totalAmount,
        dueDate: invoiceData.dueDate,
        status: invoiceData.status,
        paidAt: invoiceData.paidAt,
        paymentMethod: invoiceData.paymentMethod,
        notes: (invoiceData as any).notes || null,
      },
    });

    const statusIcons: Record<string, string> = {
      UNPAID: "⏳",
      PAID: "✅",
      OVERDUE: "⚠️",
    };
    const typeLabel = invoiceData.isInitialInvoice ? " (Initial)" : "";
    console.log(`   ${statusIcons[invoiceData.status]} ${invoiceData.invoiceNumber} - ${formatCurrency(invoiceData.totalAmount)} (${invoiceData.status})${typeLabel}`);
  }

  console.log();

  // ============================================
  // 8. BOOKING EVENTS
  // ============================================
  console.log("📋 Creating booking events...\n");

  const eventsData = [
    // Confirmed bookings events
    { bookingSeq: 4, eventType: "CREATED", message: "Booking dibuat oleh Rudi Hartono" },
    { bookingSeq: 4, eventType: "CONFIRMED", message: "Booking dikonfirmasi oleh admin" },
    { bookingSeq: 5, eventType: "CREATED", message: "Booking dibuat oleh Dewi Lestari" },
    { bookingSeq: 5, eventType: "CONFIRMED", message: "Booking dikonfirmasi oleh admin" },

    // Waiting payment bookings
    { bookingSeq: 6, eventType: "CREATED", message: "Booking dibuat oleh Farhan Aziz" },
    { bookingSeq: 6, eventType: "CONFIRMED", message: "Booking dikonfirmasi oleh admin" },
    { bookingSeq: 6, eventType: "TENANT_CREATED", message: 'Tenant "Farhan Aziz" berhasil dibuat' },
    { bookingSeq: 7, eventType: "CREATED", message: "Booking dibuat oleh Maya Sari" },
    { bookingSeq: 7, eventType: "CONFIRMED", message: "Booking dikonfirmasi oleh admin" },
    { bookingSeq: 7, eventType: "TENANT_CREATED", message: 'Tenant "Maya Sari" berhasil dibuat' },

    // Paid bookings
    { bookingSeq: 8, eventType: "CREATED", message: "Booking dibuat oleh Hendra Wijaya" },
    { bookingSeq: 8, eventType: "CONFIRMED", message: "Booking dikonfirmasi oleh admin" },
    { bookingSeq: 8, eventType: "TENANT_CREATED", message: 'Tenant "Hendra Wijaya" berhasil dibuat' },
    { bookingSeq: 8, eventType: "PAID", message: "Pembayaran lunas" },
    { bookingSeq: 9, eventType: "CREATED", message: "Booking dibuat oleh Lisa Permata" },
    { bookingSeq: 9, eventType: "CONFIRMED", message: "Booking dikonfirmasi oleh admin" },
    { bookingSeq: 9, eventType: "TENANT_CREATED", message: 'Tenant "Lisa Permata" berhasil dibuat' },
    { bookingSeq: 9, eventType: "PAID", message: "Pembayaran lunas" },

    // Checked in bookings
    { bookingSeq: 10, eventType: "CREATED", message: "Booking dibuat oleh Rizky Ramadhan" },
    { bookingSeq: 10, eventType: "CONFIRMED", message: "Booking dikonfirmasi" },
    { bookingSeq: 10, eventType: "TENANT_CREATED", message: 'Tenant "Rizky Ramadhan" berhasil dibuat' },
    { bookingSeq: 10, eventType: "PAID", message: "Pembayaran lunas" },
    { bookingSeq: 10, eventType: "CHECKED_IN", message: "Tamu check-in" },
    { bookingSeq: 11, eventType: "CREATED", message: "Booking dibuat oleh Putri Wulandari" },
    { bookingSeq: 11, eventType: "CONFIRMED", message: "Booking dikonfirmasi" },
    { bookingSeq: 11, eventType: "TENANT_CREATED", message: 'Tenant "Putri Wulandari" berhasil dibuat' },
    { bookingSeq: 11, eventType: "PAID", message: "Pembayaran lunas" },
    { bookingSeq: 11, eventType: "CHECKED_IN", message: "Tamu check-in" },
    { bookingSeq: 12, eventType: "CREATED", message: "Booking dibuat oleh Galang Ramadhan" },
    { bookingSeq: 12, eventType: "CONFIRMED", message: "Booking dikonfirmasi" },
    { bookingSeq: 12, eventType: "TENANT_CREATED", message: 'Tenant "Galang Ramadhan" berhasil dibuat' },
    { bookingSeq: 12, eventType: "PAID", message: "Pembayaran lunas" },
    { bookingSeq: 12, eventType: "CHECKED_IN", message: "Tamu check-in" },

    // Checkout bookings
    { bookingSeq: 13, eventType: "CREATED", message: "Booking dibuat" },
    { bookingSeq: 13, eventType: "CONFIRMED", message: "Booking dikonfirmasi" },
    { bookingSeq: 13, eventType: "PAID", message: "Pembayaran lunas" },
    { bookingSeq: 13, eventType: "CHECKED_IN", message: "Tamu check-in" },
    { bookingSeq: 13, eventType: "CHECKOUT", message: "Tamu check-out" },

    // Rejected booking
    { bookingSeq: 15, eventType: "CREATED", message: "Booking dibuat oleh Andi Wijaya" },
    { bookingSeq: 15, eventType: "REJECTED", message: "Booking ditolak: Unit sedang dalam perbaikan" },

    // Cancelled booking
    { bookingSeq: 16, eventType: "CREATED", message: "Booking dibuat oleh Rina Susanti" },
    { bookingSeq: 16, eventType: "CANCELLED", message: "Booking dibatalkan oleh tamu: Rencana berubah" },
  ];

  for (const eventData of eventsData) {
    const booking = Object.values(createdBookings).find((b) => b.bookingNumber.includes(`-${String(eventData.bookingSeq).padStart(4, "0")}`));
    if (!booking) continue;

    await prisma.bookingEvent.create({
      data: {
        bookingId: booking.id,
        eventType: eventData.eventType,
        message: eventData.message,
      },
    });
    console.log(`   📌 ${booking.bookingNumber}: ${eventData.eventType}`);
  }

  console.log();

  // ============================================
  // 9. NOTIFICATIONS - Admin and Tenant
  // ============================================
  console.log("🔔 Creating notifications...\n");

  // Helper functions
  const getUnitId = (unitNumber: string) => createdUnits[unitNumber]?.id || "";
  const getTenantId = (email: string) => createdTenants[email]?.id || "";
  const getBookingId = (seq: number) => Object.values(createdBookings).find((b) => b.bookingNumber.includes(`-${String(seq).padStart(4, "0")}`))?.id || "";

  // === ADMIN NOTIFICATIONS ===
  const adminNotifications = [
    // Booking Baru - PENDING bookings
    {
      title: "Booking Baru",
      message: "Budi Santoso (GH-02) membuat booking baru. Perlu konfirmasi.",
      type: NotificationType.BOOKING_NEW,
      entityId: getBookingId(1),
      entityType: "Booking",
      isRead: false,
    },
    {
      title: "Booking Baru",
      message: "Siti Rahayu (VILLA-01) membuat booking baru. Perlu konfirmasi.",
      type: NotificationType.BOOKING_NEW,
      entityId: getBookingId(2),
      entityType: "Booking",
      isRead: false,
    },
    {
      title: "Booking Baru",
      message: "Ahmad Fauzi (KOS-103) membuat booking baru. Perlu konfirmasi.",
      type: NotificationType.BOOKING_NEW,
      entityId: getBookingId(3),
      entityType: "Booking",
      isRead: true,
    },

    // Booking Dikonfirmasi - CONFIRMED bookings
    {
      title: "Booking Dikonfirmasi",
      message: "Rudi Hartono (VILLA-02) sudah dikonfirmasi.Buat tenant account untuk melanjutkan.",
      type: NotificationType.BOOKING_CONFIRMED,
      entityId: getBookingId(4),
      entityType: "Booking",
      isRead: false,
    },
    {
      title: "Booking Dikonfirmasi",
      message: "Dewi Lestari (KDH-01) sudah dikonfirmasi.Buat tenant account untuk melanjutkan.",
      type: NotificationType.BOOKING_CONFIRMED,
      entityId: getBookingId(5),
      entityType: "Booking",
      isRead: true,
    },

    // Menunggu Pembayaran
    {
      title: "Menunggu Pembayaran",
      message: "Farhan Aziz (KOS-201) belum melakukan pembayaran. Due date: 3 hari lagi.",
      type: NotificationType.PAYMENT_RECEIVED,
      entityId: getBookingId(6),
      entityType: "Booking",
      isRead: false,
    },
    {
      title: "Menunggu Pembayaran",
      message: "Maya Sari (KOS-203) belum melakukan pembayaran. Due date: 7 hari lagi.",
      type: NotificationType.PAYMENT_RECEIVED,
      entityId: getBookingId(7),
      entityType: "Booking",
      isRead: false,
    },

    // Siap Check-in - PAID bookings
    {
      title: "Siap Check-in",
      message: "Hendra Wijaya (GH-04) sudah lunas. Siap check-in dalam 2 hari.",
      type: NotificationType.CHECKIN_READY,
      entityId: getBookingId(8),
      entityType: "Booking",
      isRead: false,
    },
    {
      title: "Siap Check-in",
      message: "Lisa Permata (GH-03) sudah lunas. Siap check-in dalam 5 hari.",
      type: NotificationType.CHECKIN_READY,
      entityId: getBookingId(9),
      entityType: "Booking",
      isRead: false,
    },

    // Tagihan Overdue
    {
      title: "Tagihan Overdue",
      message: "Rizky Ramadhan (KOS-101) memiliki tagihan overdue Rp 1.450.000.",
      type: NotificationType.OVERDUE_OCCURRED,
      entityId: getTenantId("rizky.ramadhan@email.com"),
      entityType: "Tenant",
      isRead: false,
    },
    {
      title: "Tagihan Overdue",
      message: "Putri Wulandari (KOS-102) memiliki tagihan overdue Rp 1.600.000.",
      type: NotificationType.OVERDUE_OCCURRED,
      entityId: getTenantId("putri.wulandari@email.com"),
      entityType: "Tenant",
      isRead: false,
    },

    // Kontrak Akan Berakhir
    {
      title: "Kontrak Akan Berakhir",
      message: "Kontrak Galang Ramadhan (KDH-04) akan berakhir besok.",
      type: NotificationType.CONTRACT_EXPIRING,
      entityId: getTenantId("galang.ramadhan@email.com"),
      entityType: "Tenant",
      isRead: false,
    },

    // Unit Perbaikan
    {
      title: "Unit Perbaikan",
      message: "KOS-202 sedang dalam perbaikan. Estimasi selesai: 1 minggu.",
      type: NotificationType.UNIT_MAINTENANCE,
      entityId: getUnitId("KOS-202"),
      entityType: "Unit",
      isRead: true,
    },
  ];

  // === TENANT NOTIFICATIONS ===
  const tenantNotifications = [
    // Farhan Aziz (WAITING_PAYMENT)
    {
      title: "Akun Tenant Dibuat",
      message: "Akun Anda telah dibuat. Lakukan pembayaran untuk mengaktifkan akun tenant.",
      type: NotificationType.ACCOUNT_SETUP,
      entityId: getBookingId(6),
      entityType: "Booking",
      tenantId: getTenantId("farhan.aziz@email.com"),
      isRead: false,
    },
    {
      title: "Pengingat Pembayaran",
      message: "Tagihan pertama Anda untuk KOS-201 (3 bulan) sebesar Rp 6.500.000 belum dibayar.",
      type: NotificationType.PAYMENT_REMINDER,
      entityId: getTenantId("farhan.aziz@email.com"),
      entityType: "Tenant",
      tenantId: getTenantId("farhan.aziz@email.com"),
      isRead: false,
    },

    // Maya Sari (WAITING_PAYMENT)
    {
      title: "Akun Tenant Dibuat",
      message: "Akun Anda telah dibuat. Lakukan pembayaran untuk mengaktifkan akun tenant.",
      type: NotificationType.ACCOUNT_SETUP,
      entityId: getBookingId(7),
      entityType: "Booking",
      tenantId: getTenantId("maya.sari@email.com"),
      isRead: false,
    },
    {
      title: "Pengingat Pembayaran",
      message: "Tagihan pertama Anda untuk KOS-203 (6 bulan) sebesar Rp 10.000.000 belum dibayar.",
      type: NotificationType.PAYMENT_REMINDER,
      entityId: getTenantId("maya.sari@email.com"),
      entityType: "Tenant",
      tenantId: getTenantId("maya.sari@email.com"),
      isRead: false,
    },

    // Rizky Ramadhan (CHECKED_IN) - overdue invoice
    {
      title: "Tagihan Overdue",
      message: "Tagihan bulanan Anda sebesar Rp 1.450.000 sudah melewati jatuh tempo.",
      type: NotificationType.OVERDUE_NOTICE,
      entityId: getTenantId("rizky.ramadhan@email.com"),
      entityType: "Tenant",
      tenantId: getTenantId("rizky.ramadhan@email.com"),
      isRead: false,
    },

    // Putri Wulandari (CHECKED_IN) - overdue invoice
    {
      title: "Tagihan Overdue",
      message: "Tagihan bulanan Anda sebesar Rp 1.600.000 sudah melewati jatuh tempo.",
      type: NotificationType.OVERDUE_NOTICE,
      entityId: getTenantId("putri.wulandari@email.com"),
      entityType: "Tenant",
      tenantId: getTenantId("putri.wulandari@email.com"),
      isRead: false,
    },

    // Galang Ramadhan (CHECKED_IN) - contract expiring tomorrow
    {
      title: "Kontrak Akan Berakhir",
      message: "Kontrak Anda akan berakhir besok. Hubungi admin untuk perpanjangan atau check-out.",
      type: NotificationType.CONTRACT_EXPIRING_TENANT,
      entityId: getTenantId("galang.ramadhan@email.com"),
      entityType: "Tenant",
      tenantId: getTenantId("galang.ramadhan@email.com"),
      isRead: false,
    },
  ];

  // Create Admin Notifications
  let adminCount = 0;
  for (const notif of adminNotifications) {
    if (!notif.entityId) continue;

    await prisma.notification.create({
      data: {
        recipient: NotificationRecipient.ADMIN,
        title: notif.title,
        message: notif.message,
        type: notif.type,
        entityId: notif.entityId,
        entityType: notif.entityType,
        isRead: notif.isRead,
      },
    });
    adminCount++;

    const icon = notif.isRead ? "📋" : "🔴";
    const shortMsg = notif.message.length > 45 ? notif.message.substring(0, 45) + "..." : notif.message;
    console.log(`   ${icon} [ADMIN] ${notif.title}: ${shortMsg}`);
  }

  // Create Tenant Notifications
  let tenantCount = 0;
  for (const notif of tenantNotifications) {
    if (!notif.entityId) continue;

    await prisma.notification.create({
      data: {
        recipient: NotificationRecipient.TENANT,
        title: notif.title,
        message: notif.message,
        type: notif.type,
        entityId: notif.entityId,
        entityType: notif.entityType,
        tenantId: notif.tenantId,
        isRead: notif.isRead,
      },
    });
    tenantCount++;

    const icon = notif.isRead ? "📋" : "🔴";
    const shortEmail = notif.tenantId ? Object.values(createdTenants).find(t => t.id === notif.tenantId)?.email.split("@")[0] : "";
    const shortMsg = notif.message.length > 40 ? notif.message.substring(0, 40) + "..." : notif.message;
    console.log(`   ${icon} [${shortEmail}] ${notif.title}: ${shortMsg}`);
  }

  console.log(`\n   ✅ Admin notifications: ${adminCount}`);
  console.log(`   ✅ Tenant notifications: ${tenantCount}`);
  console.log();

  // ============================================
  // 10. PROPERTY SETTINGS - Default settings
  // ============================================
  console.log("⚙️  Creating property settings...\n");

  await prisma.propertySettings.create({
    data: {
      defaultCheckInTime: "14:00",
      defaultCheckOutTime: "12:00",
      minimumStayNights: 1,
      maximumAdvanceBooking: 90,
      depositPercentage: 100,
      defaultDueDateDays: 7,
      lateFeePercentage: 2,
      whatsappOwner: "6281234567890",
      emailOwner: "owner@grahamaju.com",
      notifyNewBooking: true,
      notifyPaymentReceived: true,
      notifyOverdue: true,
      notifyVacancyReport: true,
      reminderDays: "1,3,7",
    },
  });
  console.log("   ✅ Property settings created\n");

  // ============================================
  // SUMMARY
  // ============================================
  console.log("═".repeat(60));
  console.log("🎉 SEED COMPLETED SUCCESSFULLY!");
  console.log("═".repeat(60));

  // Count stats
  const bookingStats = {
    PENDING: Object.values(createdBookings).filter((b) => b.status === "PENDING").length,
    CONFIRMED: Object.values(createdBookings).filter((b) => b.status === "CONFIRMED").length,
    WAITING_PAYMENT: Object.values(createdBookings).filter((b) => b.status === "WAITING_PAYMENT").length,
    PAID: Object.values(createdBookings).filter((b) => b.status === "PAID").length,
    CHECKED_IN: Object.values(createdBookings).filter((b) => b.status === "CHECKED_IN").length,
    CHECKOUT: Object.values(createdBookings).filter((b) => b.status === "CHECKOUT").length,
    REJECTED: Object.values(createdBookings).filter((b) => b.status === "REJECTED").length,
    CANCELLED: Object.values(createdBookings).filter((b) => b.status === "CANCELLED").length,
  };

  console.log("\n📊 DATA SUMMARY");
  console.log("─".repeat(60));
  console.log(`\n🏢 Property: ${property.name}`);
  console.log(`🚪 Units: ${unitsData.length} total`);
  console.log(`   • KOS_BULANAN: ${unitsData.filter((u) => u.type === UnitType.KOS_BULANAN).length}`);
  console.log(`   • KOS_HARIAN: ${unitsData.filter((u) => u.type === UnitType.KOS_HARIAN).length}`);
  console.log(`   • GUEST_HOUSE: ${unitsData.filter((u) => u.type === UnitType.GUEST_HOUSE).length}`);
  console.log(`   • VILLA: ${unitsData.filter((u) => u.type === UnitType.VILLA).length}`);

  console.log("\n📝 Bookings: 16 total");
  console.log("─".repeat(40));
  console.log(`   ⏳ PENDING: ${bookingStats.PENDING} (needs confirmation)`);
  console.log(`   ✅ CONFIRMED: ${bookingStats.CONFIRMED} (needs tenant creation)`);
  console.log(`   📋 WAITING_PAYMENT: ${bookingStats.WAITING_PAYMENT} (awaiting payment)`);
  console.log(`   💳 PAID: ${bookingStats.PAID} (ready for check-in)`);
  console.log(`   🏠 CHECKED_IN: ${bookingStats.CHECKED_IN} (currently staying)`);
  console.log(`   🏁 CHECKOUT: ${bookingStats.CHECKOUT} (completed)`);
  console.log(`   ❌ REJECTED: ${bookingStats.REJECTED}`);
  console.log(`   🚫 CANCELLED: ${bookingStats.CANCELLED}`);

  console.log("\n👥 Tenants: 7 total");
  console.log(`   • WAITING_PAYMENT: 2`);
  console.log(`   • PAID (ready check-in): 2`);
  console.log(`   • CHECKED_IN: 3`);

  console.log("\n💰 Invoices: 12 total");
  console.log(`   • UNPAID: 2`);
  console.log(`   • PAID: 9`);
  console.log(`   • OVERDUE: 2`);
  console.log(`   • Initial invoices: 4`);
  console.log(`   • Monthly invoices: 8`);

  console.log("\n🔔 Notifications: 21 total");
  console.log(`   • Admin notifications: ${adminCount}`);
  console.log(`   • Tenant notifications: ${tenantCount}`);

  console.log("\n" + "═".repeat(60));
  console.log("🔑 LOGIN CREDENTIALS");
  console.log("═".repeat(60));
  console.log("\n👤 Admin:    admin@grahamaju.com / admin123");
  console.log("👤 Owner:    owner@grahamaju.com / owner123");
  console.log("\n👥 Tenant (all use password: tenant123)");
  console.log("   • farhan.aziz@email.com (KOS-201) - WAITING_PAYMENT");
  console.log("   • maya.sari@email.com (KOS-203) - WAITING_PAYMENT");
  console.log("   • hendra.wijaya@email.com (GH-04) - PAID");
  console.log("   • lisa.permata@email.com (GH-03) - PAID");
  console.log("   • rizky.ramadhan@email.com (KOS-101) - CHECKED_IN");
  console.log("   • putri.wulandari@email.com (KOS-102) - CHECKED_IN");
  console.log("   • galang.ramadhan@email.com (KDH-04) - CHECKED_IN");
  console.log("\n" + "═".repeat(60));
}

main()
  .catch((e) => {
    console.error("\n❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
