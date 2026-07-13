# AGENT.md — Property Booking & Management Platform
**Segmen 04 · Properti & Akomodasi**

---

## 1. Stack

```
Framework:     Next.js 14 (App Router)
Database:      PostgreSQL via Supabase
ORM:          Prisma
Auth:         NextAuth.js (admin + tenant)
Storage:      Supabase Storage (photos, payment proofs)
Styling:      Tailwind CSS v3 + shadcn/ui
WA Notif:     Fonnte API
Scheduler:    Vercel Cron Jobs
Deploy:       Vercel + Supabase
```

---

## 2. Folder Structure

```
/
├── app/
│   ├── (public)/                    → public pages (no auth)
│   │   ├── layout.tsx
│   │   ├── page.tsx               → landing page
│   │   ├── kamar/
│   │   │   ├── page.tsx         → room list
│   │   │   └── [slug]/page.tsx  → room detail
│   │   └── booking/
│   │       ├── page.tsx           → booking form
│   │       └── confirm/page.tsx  → post-booking
│   │
│   ├── (admin)/                    → admin panel
│   │   ├── layout.tsx
│   │   ├── page.tsx              → dashboard
│   │   ├── unit/
│   │   │   ├── page.tsx         → unit list
│   │   │   └── [id]/page.tsx   → edit unit
│   │   ├── booking/
│   │   │   ├── page.tsx         → booking list
│   │   │   └── [id]/page.tsx   → booking detail
│   │   ├── tenant/
│   │   │   ├── page.tsx         → tenant list
│   │   │   └── [id]/page.tsx   → tenant detail
│   │   ├── invoice/
│   │   │   ├── page.tsx         → invoice list
│   │   │   └── [id]/page.tsx   → invoice detail
│   │   ├── alert/
│   │   │   └── page.tsx         → alerts
│   │   └── pengaturan/
│   │       └── page.tsx         → settings
│   │
│   ├── (tenant)/                  → tenant portal
│   │   ├── layout.tsx
│   │   ├── page.tsx              → dashboard
│   │   ├── tagihan/
│   │   │   ├── page.tsx         → invoice list
│   │   │   └── [id]/page.tsx   → invoice detail
│   │   ├── riwayat/
│   │   │   └── page.tsx         → payment history
│   │   └── akun/
│   │       └── page.tsx         → account settings
│   │
│   ├── (auth)/                   → auth pages
│   │   ├── login/page.tsx
│   │   └── layout.tsx
│   │
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── booking/route.ts       → public booking
│       ├── admin/
│       │   ├── bookings/route.ts
│       │   ├── bookings/[id]/route.ts
│       │   ├── bookings/[id]/confirm/route.ts
│       │   ├── bookings/[id]/reject/route.ts
│       │   ├── bookings/[id]/checkin/route.ts
│       │   ├── units/route.ts
│       │   ├── units/[id]/route.ts
│       │   ├── invoices/route.ts
│       │   ├── invoices/[id]/route.ts
│       │   └── invoices/[id]/confirm/route.ts
│       ├── tenant/
│       │   ├── invoices/route.ts
│       │   └── upload-proof/route.ts
│       ├── notify/wa/route.ts
│       ├── upload/route.ts
│       └── cron/
│           ├── invoice-reminder/route.ts
│           ├── overdue-check/route.ts
│           └── vacancy-alert/route.ts
│
├── components/
│   ├── ui/                        → shadcn/ui components
│   ├── public/
│   │   ├── Navbar.tsx
│   │   ├── HeroSection.tsx
│   │   ├── RoomCard.tsx
│   │   ├── RoomGallery.tsx
│   │   ├── AvailabilityCalendar.tsx
│   │   └── BookingForm.tsx
│   ├── admin/
│   │   ├── DashboardCards.tsx
│   │   ├── UnitTable.tsx
│   │   ├── BookingTable.tsx
│   │   ├── TenantTable.tsx
│   │   ├── InvoiceTable.tsx
│   │   ├── AlertPanel.tsx
│   │   └── UnitForm.tsx
│   ├── tenant/
│   │   ├── InvoiceCard.tsx
│   │   ├── InvoiceList.tsx
│   │   └── PaymentHistory.tsx
│   └── layout/
│       ├── Sidebar.tsx
│       ├── TenantNav.tsx
│       └── MobileMenu.tsx
│
├── lib/
│   ├── prisma.ts
│   ├── auth.ts                    → NextAuth config
│   ├── supabase.ts               → Storage client
│   ├── wa.ts                     → Fonnte wrapper
│   ├── booking.ts                → Availability logic
│   ├── invoice.ts                → Invoice calculations
│   └── cron.ts                   → Cron job helpers
│
├── types/
│   └── index.ts
│
└── prisma/
    └── schema.prisma
```

---

## 3. Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String    @id @default(cuid())
  email     String    @unique
  name      String
  role      UserRole
  password  String
  createdAt DateTime  @default(now())
}

enum UserRole {
  ADMIN
  OWNER
}

model Property {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  address     String
  description String?
  photos      String[]
  units       Unit[]
  createdAt   DateTime @default(now())
}

model Unit {
  id           String        @id @default(cuid())
  propertyId   String
  property     Property      @relation(fields: [propertyId], references: [id])
  unitNumber   String
  type         UnitType
  slug         String        @unique
  pricePerMonth Decimal?
  pricePerNight Decimal?
  facilities   String[]
  photos       String[]
  description  String?
  status       UnitStatus    @default(AVAILABLE)
  bookings     Booking[]
  tenants      Tenant[]
  invoices     Invoice[]
  createdAt    DateTime      @default(now())
}

enum UnitType {
  KOS_BULANAN
  KOS_HARIAN
  GUEST_HOUSE
  VILLA
}

enum UnitStatus {
  AVAILABLE
  BOOKED
  OCCUPIED
  MAINTENANCE
}

model Booking {
  id              String        @id @default(cuid())
  bookingNumber   String        @unique
  unitId          String
  unit            Unit          @relation(fields: [unitId], references: [id])
  guestName       String
  guestPhone      String
  guestEmail      String
  checkInDate     DateTime
  durationMonths  Int?
  durationNights  Int?
  notes           String?
  status          BookingStatus @default(PENDING)
  rejectionReason String?
  confirmedAt     DateTime?
  checkedInAt     DateTime?
  checkedOutAt    DateTime?
  tenant          Tenant?
  createdAt       DateTime      @default(now())
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CHECKED_IN
  COMPLETED
  REJECTED
  CANCELLED
}

model Tenant {
  id              String    @id @default(cuid())
  bookingId      String    @unique
  booking        Booking   @relation(fields: [bookingId], references: [id])
  unitId         String
  unit           Unit     @relation(fields: [unitId], references: [id])
  name           String
  email          String   @unique
  passwordHash   String
  phone          String
  contractStart   DateTime
  contractEnd     DateTime?
  emergencyName   String?
  emergencyPhone  String?
  isActive        Boolean  @default(true)
  invoices        Invoice[]
  createdAt       DateTime @default(now())
}

model Invoice {
  id              String        @id @default(cuid())
  invoiceNumber  String        @unique
  tenantId       String
  tenant         Tenant        @relation(fields: [tenantId], references: [id])
  unitId         String
  unit           Unit          @relation(fields: [unitId], references: [id])
  period         String
  rentAmount     Decimal
  electricAmount Decimal       @default(0)
  waterAmount    Decimal       @default(0)
  otherAmount    Decimal       @default(0)
  totalAmount    Decimal
  dueDate        DateTime
  status         InvoiceStatus @default(UNPAID)
  paidAt         DateTime?
  paymentMethod  String?
  paymentProofUrl String?
  notes          String?
  createdAt      DateTime      @default(now())
}

enum InvoiceStatus {
  UNPAID
  PAID
  OVERDUE
  WAIVED
}

model Alert {
  id         String    @id @default(cuid())
  type       AlertType
  entityId   String
  entityType String
  message    String
  isRead     Boolean   @default(false)
  createdAt  DateTime  @default(now())
}

enum AlertType {
  UNIT_VACANT
  PAYMENT_OVERDUE
  CONTRACT_EXPIRING
}
```

---

## 4. Availability Check Logic (`/lib/booking.ts`)

```typescript
import prisma from './prisma';
import { addMonths, addDays, format, isWithinInterval } from 'date-fns';

export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Check if a unit is available for a given date range
 */
export async function isUnitAvailable(
  unitId: string,
  checkIn: Date,
  durationMonths?: number,
  durationNights?: number
): Promise<{ available: boolean; conflictingBookings?: string[] }> {
  // Calculate end date
  let checkOut: Date;
  if (durationMonths) {
    checkOut = addMonths(checkIn, durationMonths);
  } else if (durationNights) {
    checkOut = addDays(checkIn, durationNights);
  } else {
    throw new Error('Must provide either durationMonths or durationNights');
  }

  const range: DateRange = { start: checkIn, end: checkOut };

  // Find conflicting bookings
  const conflicting = await prisma.booking.findMany({
    where: {
      unitId,
      status: { in: ['CONFIRMED', 'CHECKED_IN'] },
      OR: [
        // New check-in overlaps existing booking
        {
          checkInDate: { lte: checkIn },
          // Need to check if the existing booking's end is after new check-in
          // This is simplified - in real app you'd track check-out
        },
      ],
    },
  });

  // More accurate overlap check
  const allBookings = await prisma.booking.findMany({
    where: {
      unitId,
      status: { in: ['CONFIRMED', 'CHECKED_IN'] },
    },
  });

  const overlaps = allBookings.filter((booking) => {
    const existingStart = new Date(booking.checkInDate);
    let existingEnd: Date;

    if (booking.durationMonths) {
      existingEnd = addMonths(existingStart, booking.durationMonths);
    } else if (booking.durationNights) {
      existingEnd = addDays(existingStart, booking.durationNights);
    } else {
      return false;
    }

    // Check overlap
    return (
      (checkIn >= existingStart && checkIn < existingEnd) ||
      (checkOut > existingStart && checkOut <= existingEnd) ||
      (checkIn <= existingStart && checkOut >= existingEnd)
    );
  });

  return {
    available: overlaps.length === 0,
    conflictingBookings: overlaps.map((b) => b.bookingNumber),
  };
}

/**
 * Get all booked dates for a unit (for calendar display)
 */
export async function getBookedDates(
  unitId: string,
  year: number,
  month: number
): Promise<Array<{ date: string; status: 'booked' | 'checked_in' }>> {
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0);

  const bookings = await prisma.booking.findMany({
    where: {
      unitId,
      status: { in: ['CONFIRMED', 'CHECKED_IN'] },
      checkInDate: { lte: endOfMonth },
    },
  });

  const bookedDates: Array<{ date: string; status: 'booked' | 'checked_in' }> = [];

  for (const booking of bookings) {
    const checkIn = new Date(booking.checkInDate);
    let checkOut: Date;

    if (booking.durationMonths) {
      checkOut = addMonths(checkIn, booking.durationMonths);
    } else if (booking.durationNights) {
      checkOut = addDays(checkIn, booking.durationNights);
    } else {
      continue;
    }

    // Generate all dates in range
    let current = new Date(Math.max(checkIn.getTime(), startOfMonth.getTime()));
    const end = new Date(Math.min(checkOut.getTime(), endOfMonth.getTime()));

    while (current <= end) {
      bookedDates.push({
        date: format(current, 'yyyy-MM-dd'),
        status: booking.status === 'CHECKED_IN' ? 'checked_in' : 'booked',
      });
      current = addDays(current, 1);
    }
  }

  return bookedDates;
}
```

---

## 5. Invoice Generation (`/lib/invoice.ts`)

```typescript
import prisma from './prisma';
import { addMonths, startOfMonth, endOfMonth } from 'date-fns';

export interface InvoiceInput {
  tenantId: string;
  period: string; // "YYYY-MM"
  rentAmount: number;
  electricAmount?: number;
  waterAmount?: number;
  otherAmount?: number;
  dueDate: Date;
}

export async function generateMonthlyInvoice(
  tenantId: string,
  period: string
): Promise<{ invoice: any; error?: string }> {
  // Check if invoice already exists
  const existing = await prisma.invoice.findFirst({
    where: { tenantId, period },
  });

  if (existing) {
    return { invoice: existing, error: 'Invoice already exists for this period' };
  }

  // Get tenant and unit
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { unit: true },
  });

  if (!tenant) {
    return { invoice: null, error: 'Tenant not found' };
  }

  // Calculate due date (5th of next month)
  const [year, month] = period.split('-').map(Number);
  const dueDate = new Date(year, month, 5); // 5th of the month

  // Generate invoice number
  const count = await prisma.invoice.count({
    where: {
      createdAt: {
        gte: startOfMonth(new Date(year, month - 1, 1)),
        lte: endOfMonth(new Date(year, month - 1, 1)),
      },
    },
  });

  const invoiceNumber = `INV-${year}-${String(count + 1).padStart(4, '0')}`;

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      tenantId,
      unitId: tenant.unitId,
      period,
      rentAmount: tenant.unit.pricePerMonth || 0,
      electricAmount: 0,
      waterAmount: 0,
      otherAmount: 0,
      totalAmount: tenant.unit.pricePerMonth || 0,
      dueDate,
      status: 'UNPAID',
    },
  });

  return { invoice };
}
```

---

## 6. Cron Jobs

### `/api/cron/invoice-reminder/route.ts`

```typescript
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendWANotification } from '@/lib/wa';
import { differenceInDays } from 'date-fns';

export async function GET(req: Request) {
  const today = new Date();

  // Get all unpaid invoices
  const invoices = await prisma.invoice.findMany({
    where: { status: 'UNPAID' },
    include: { tenant: true },
  });

  for (const invoice of invoices) {
    const daysUntilDue = differenceInDays(invoice.dueDate, today);

    // Send reminder at H-7 and H-3
    if (daysUntilDue === 7 || daysUntilDue === 3) {
      const message = `📢 Reminder Tagihan

Halo ${invoice.tenant.name},

Tagihan bulan ${invoice.period} belum dibayar.

Jumlah: Rp ${invoice.totalAmount.toString()}
Jatuh tempo: ${invoice.dueDate.toLocaleDateString('id-ID')}

Segera lakukan pembayaran dan upload bukti di portal.`;

      await sendWANotification(invoice.tenant.phone, message);
    }
  }

  return NextResponse.json({ processed: invoices.length });
}
```

### `/api/cron/overdue-check/route.ts`

```typescript
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendWANotification } from '@/lib/wa';

export async function GET(req: Request) {
  const today = new Date();

  // Mark overdue invoices
  const overdue = await prisma.invoice.updateMany({
    where: {
      status: 'UNPAID',
      dueDate: { lt: today },
    },
    data: { status: 'OVERDUE' },
  });

  // Get updated overdue invoices for alerts
  const overdueInvoices = await prisma.invoice.findMany({
    where: { status: 'OVERDUE' },
    include: { tenant: true },
  });

  // Create alerts and notify
  for (const invoice of overdueInvoices) {
    // Create alert
    await prisma.alert.create({
      data: {
        type: 'PAYMENT_OVERDUE',
        entityId: invoice.id,
        entityType: 'INVOICE',
        message: `Tagihan overdue: ${invoice.tenant.name} - ${invoice.period}`,
      },
    });

    // Notify owner
    const ownerPhone = process.env.OWNER_PHONE!;
    const message = `⚠️ Tagihan Overdue

${invoice.tenant.name}
Periode: ${invoice.period}
Jumlah: Rp ${invoice.totalAmount.toString()}
Jatuh tempo: ${invoice.dueDate.toLocaleDateString('id-ID')}

Segera follow up.`;

    await sendWANotification(ownerPhone, message);
  }

  return NextResponse.json({
    markedOverdue: overdue.count,
    alertsCreated: overdueInvoices.length,
  });
}
```

### `/api/cron/vacancy-alert/route.ts`

```typescript
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendWANotification } from '@/lib/wa';
import { differenceInDays } from 'date-fns';

export async function GET(req: Request) {
  const today = new Date();
  const ownerPhone = process.env.OWNER_PHONE!;

  // Get available units
  const availableUnits = await prisma.unit.findMany({
    where: { status: 'AVAILABLE' },
    include: { property: true },
  });

  // For simplicity, we track last status change
  // In production, you'd have a lastStatusChangeAt field

  // This is a simplified version - real implementation would track
  // how long each unit has been vacant

  // Find units that have been available > 30 days
  // (This requires tracking when status last changed)

  const vacantLongTerm = availableUnits.filter((unit) => {
    // In real app: check unit.vacantSince < today - 30 days
    // For now, we'll just send all available units
    return true;
  });

  if (vacantLongTerm.length > 0) {
    const message = `🏠 Unit Kosong Alert

${vacantLongTerm.length} unit masih kosong:

${vacantLongTerm
  .map((u) => `• ${u.property.name} - ${u.unitNumber}`)
  .join('\n')}

Pertimbangkan untuk evaluasi harga atau promosi.`;

    await sendWANotification(ownerPhone, message);
  }

  return NextResponse.json({
    vacantUnits: vacantLongTerm.length,
  });
}
```

---

## 7. Supabase Storage

### Bucket Setup

```typescript
// Bucket: unit-photos (public)
const BUCKET_UNIT_PHOTOS = 'unit-photos';

// Bucket: payment-proofs (private)
const BUCKET_PAYMENT_PROOFS = 'payment-proofs';

// Bucket: receipts (private)
const BUCKET_RECEIPTS = 'receipts';
```

### Upload Handler

```typescript
// /api/upload/route.ts
import { createClient } from '@supabase/supabase-js';
import { v4 as uuid } from 'uuid';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const bucket = formData.get('bucket') as string;
  const folder = formData.get('folder') as string;

  const ext = file.name.split('.').pop();
  const path = `${folder}/${uuid()}.${ext}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return Response.json({ url: urlData.publicUrl });
}
```

---

## 8. Seed Data

```typescript
const demoProperty = {
  name: "Kos Eksklusif Graha Maju",
  slug: "graha-maju",
  address: "Jl. Graha Maju No. 1, Sidoarjo",
};

const demoUnits = [
  // Standard rooms (Rp 1.2jt/month)
  { unitNumber: "101", type: "KOS_BULANAN", pricePerMonth: 1200000, facilities: ["AC", "WiFi", "Kamar Mandi Dalam"] },
  { unitNumber: "102", type: "KOS_BULANAN", pricePerMonth: 1200000, facilities: ["AC", "WiFi", "Kamar Mandi Dalam"] },
  { unitNumber: "103", type: "KOS_BULANAN", pricePerMonth: 1200000, facilities: ["AC", "WiFi", "Kamar Mandi Dalam"] },
  { unitNumber: "201", type: "KOS_BULANAN", pricePerMonth: 1200000, facilities: ["AC", "WiFi", "Kamar Mandi Dalam"] },
  // Deluxe rooms (Rp 1.8jt/month)
  { unitNumber: "202", type: "KOS_BULANAN", pricePerMonth: 1800000, facilities: ["AC", "WiFi", "Kamar Mandi Dalam", "TV"] },
  { unitNumber: "203", type: "KOS_BULANAN", pricePerMonth: 1800000, facilities: ["AC", "WiFi", "Kamar Mandi Dalam", "TV"] },
  { unitNumber: "301", type: "KOS_BULANAN", pricePerMonth: 1800000, facilities: ["AC", "WiFi", "Kamar Mandi Dalam", "TV", " Balkon"] },
  // Suite (Rp 2.5jt/month)
  { unitNumber: "302", type: "KOS_BULANAN", pricePerMonth: 2500000, facilities: ["AC", "WiFi", "Kamar Mandi Dalam", "TV", "Kulkas", "Balkon"] },
];

// Status scenario:
// - 5 units: OCCUPIED (various payment statuses)
// - 1 unit: BOOKED (pending check-in)
// - 1 unit: AVAILABLE
// - 1 unit: MAINTENANCE

// Payment scenario:
// - 2 tenants: paid this month
// - 2 tenants: unpaid (due in 5 days)
// - 1 tenant: overdue
```

---

## 9. Development Sequence

### Sprint 1: Foundation (Hari 1-5)

```
[ ] Project setup + Prisma init
[ ] NextAuth (admin + tenant)
[ ] Prisma schema + migrate
[ ] Base UI components
[ ] Admin layout: Sidebar + Header
[ ] Property CRUD (if multi-property)
[ ] Seed data: property + 8 units
```

### Sprint 2: Public Web (Hari 6-10)

```
[ ] Landing page layout
[ ] Room list with filters
[ ] Room detail page
[ ] Photo gallery component
[ ] Availability calendar
[ ] Booking form
[ ] Booking confirmation page
```

### Sprint 3: Booking Management (Hari 11-15)

```
[ ] Admin booking list
[ ] Booking detail page
[ ] Confirm booking flow
[ ] Reject booking with reason
[ ] Check-in flow
[ ] Unit status auto-update
[ ] WA notification on status change
[ ] Create tenant account on confirm
```

### Sprint 4: Tenant Portal (Hari 16-19)

```
[ ] Tenant auth
[ ] Tenant dashboard
[ ] Invoice list
[ ] Invoice detail
[ ] Upload payment proof
[ ] Payment history
```

### Sprint 5: Invoices + Dashboard (Hari 20-23)

```
[ ] Admin invoice list
[ ] Invoice detail
[ ] Confirm payment flow
[ ] Manual invoice creation
[ ] Dashboard: cards
[ ] Dashboard: unit table
[ ] Dashboard: alert panel
[ ] Cron jobs setup
```

### Sprint 6: Polish (Hari 24)

```
[ ] Seed data: tenants, bookings, invoices
[ ] WA notification testing
[ ] Mobile responsive check
[ ] Demo walkthrough
```

---

## 10. Testing Checklist

- [ ] Room availability check accurate
- [ ] No double-booking possible
- [ ] Booking confirm creates tenant
- [ ] Check-in updates unit status
- [ ] Tenant can upload payment proof
- [ ] Admin can confirm payment
- [ ] Overdue auto-marked after due date
- [ ] Dashboard reflects current state
- [ ] WA notifications send successfully
- [ ] Cron jobs trigger at correct times

---

## 11. Environment Variables

```env
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

FONNTE_TOKEN=
OWNER_PHONE=

CRON_SECRET=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_PROPERTY_NAME=
```
