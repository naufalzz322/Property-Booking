# PRD — Property Booking & Management Platform
**Segmen:** 04 · Properti & Akomodasi
**Target:** Jaringan Kos Eksklusif, Guest House, Manajemen Vila Multi-Properti
**Status:** MVP Demo · Pytagotech 2026

---

## 1. Problem Statement

Owner properti (kos eksklusif, guest house, vila) masih mengandalkan chat manual untuk booking — tidak ada sistem terpusat untuk cek availability, menghindari double-booking, dan memonitor kondisi semua unit dari satu tempat. Penghuni tidak punya akses ke tagihan dan riwayat pembayaran mereka sendiri. Owner baru tahu ada masalah (unit lama kosong, tagihan nunggak) saat audit manual. Reputasi rusak karena double-booking, cash flow bocor karena tagihan tidak tertrack.

**Root cause:** Tidak ada platform yang menyatukan booking online, manajemen unit, tagihan penghuni, dan monitoring owner dalam satu sistem.

---

## 2. Goals & Success Metrics

| Goal | Metric |
|------|--------|
| Eliminasi double-booking | 0 kasus double-booking setelah sistem live |
| Booking tanpa chat manual | >80% booking baru masuk via platform dalam 2 bulan |
| Tagihan tersampaikan tepat waktu | Notifikasi tagihan terkirim H-7 dan H-3: 100% |
| Owner bisa monitor real-time | Owner bisa cek status semua unit kapanpun tanpa tanya admin |

---

## 3. User Personas

### 3A. Calon Tamu / Penyewa

| Attribute | Description |
|-----------|-------------|
| **Tugas** | Cari kamar, booking, bayar, cek tagihan bulanan |
| **Pain** | Harus chat WA dulu untuk tahu kamar tersedia atau tidak |
| **Need** | Bisa cek dan booking langsung dari website, 24 jam |
| **Device** | Mobile-first (HP), familiar marketplace apps |

### 3B. Admin Properti

| Attribute | Description |
|-----------|-------------|
| **Tugas** | Kelola booking, konfirmasi pembayaran, buat akun penghuni |
| **Pain** | Booking masuk dari berbagai channel (WA, telepon, walk-in), rawan konflik |
| **Need** | Satu inbox booking, konfirmasi payment mudah, update status unit cepat |
| **Device** | Desktop |

### 3C. Penghuni (setelah check-in)

| Attribute | Description |
|-----------|-------------|
| **Tugas** | Bayar tagihan bulanan, lihat histori pembayaran |
| **Pain** | Tidak tahu berapa yang harus dibayar, tidak ada bukti pembayaran digital |
| **Need** | Akses portal tagihan kapanpun dari HP |
| **Device** | Mobile |

### 3D. Owner / Investor

| Attribute | Description |
|-----------|-------------|
| **Tugas** | Pantau performa properti, keputusan investasi |
| **Pain** | Harus minta laporan ke admin — selalu terlambat dan tidak real-time |
| **Need** | Dashboard real-time: okupansi, pendapatan, unit bermasalah |
| **Device** | Desktop/tablet |

---

## 4. Scope MVP

### 4.1 In Scope

**Public Web (tanpa login):**
- Company profile / landing page
- Daftar kamar dengan foto, fasilitas, harga
- Kalender availability real-time
- Form booking online

**Admin Panel:**
- Manajemen unit/kamar (CRUD)
- Kelola booking (confirm, reject, check-in, check-out)
- Buat akun penghuni setelah check-in
- Input & konfirmasi pembayaran
- Dashboard owner

**Portal Penghuni:**
- Login akun (dibuat admin)
- Lihat tagihan & jatuh tempo
- Upload bukti pembayaran
- Riwayat pembayaran

**Notifikasi:**
- Booking masuk → admin
- Booking dikonfirmasi → tamu
- Tagihan jatuh tempo H-7, H-3 → penghuni
- Unit kosong >X hari → owner
- Kontrak habis H-30 → penghuni & owner

### 4.2 Out of Scope

- Payment gateway terintegrasi (MVP: konfirmasi transfer manual)
- Channel manager OTA
- Maintenance request system
- Multi-currency

---

## 5. Feature Specification

### F-01 · Public Web (Landing + Booking)

**As a** potential tenant
**I want to** browse available rooms and book online
**So that** I don't need to call or WhatsApp to check availability

**Pages:**

| Page | URL | Description |
|------|-----|-------------|
| Landing | `/` | Hero, facilities, CTA |
| Room List | `/kamar` | Grid semua unit dengan filter |
| Room Detail | `/kamar/[slug]` | Foto, fasilitas, kalender, booking form |
| Booking Confirmation | `/booking/confirm` | Post-booking, tunggu konfirmasi |

**Room Detail Features:**

| Feature | Description |
|---------|-------------|
| Photo carousel | 3-5 foto unit, swipeable |
| Facilities grid | Ikon + teks fasilitas |
| Availability calendar | Tanggal terbooking disabled |
| Booking form | Nama, HP, email, tanggal, durasi |

**Acceptance Criteria:**
- [ ] Landing page responsive (mobile + desktop)
- [ ] Room grid dengan filter tipe, harga
- [ ] Kalender tampilkan booked dates dengan warna
- [ ] Form booking kirim data ke backend
- [ ] Konfirmasi page tampil setelah submit

---

### F-02 · Admin: Unit Management

**As an** admin
**I want to** manage all property units
**So that** I can keep inventory up-to-date

**CRUD Fields:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| unitNumber | string | yes | e.g., "101", "A-01" |
| propertyId | FK | yes | untuk multi-properti |
| type | enum | yes | KOS_BULANAN / KOS_HARIAN / GUEST_HOUSE / VILLA |
| slug | string | yes | unique, URL-friendly |
| pricePerMonth | decimal | no | untuk kos bulanan |
| pricePerNight | decimal | no | untuk guest house |
| facilities | string[] | no | ["AC", "WiFi", "Kamar Mandi Dalam"] |
| photos | string[] | no | Supabase Storage URLs |
| description | string | no | |
| status | enum | yes | AVAILABLE / BOOKED / OCCUPIED / MAINTENANCE |

**Status Definitions:**

| Status | Description |
|--------|-------------|
| AVAILABLE | Bisa dibooking |
| BOOKED | Sudah dibooking, belum check-in |
| OCCUPIED | Penghuni aktif |
| MAINTENANCE | Tidak bisa dibooking sementara |

**Acceptance Criteria:**
- [ ] CRUD lengkap berfungsi
- [ ] Upload foto ke Supabase Storage
- [ ] Status auto-update berdasarkan booking
- [ ] Slug unique validation

---

### F-03 · Admin: Booking Management

**As an** admin
**I want to** manage all booking requests
**So that** I can confirm, reject, or check-in guests efficiently

**Booking Flow:**

```
GUEST SUBMIT
     ↓
PENDING (notified to admin)
     ↓
┌──────────────────────────────────────┐
│ Admin Review                         │
│   ↓                    ↓            │
│ CONFIRMED          REJECTED         │
│ (create tenant)     (notify guest)  │
└──────────────────────────────────────┘
     ↓
CONFIRMED + CHECK-IN
     ↓
CHECKED_IN
     ↓
CHECKED_OUT / COMPLETED
     ↓
Unit → AVAILABLE
```

**Booking Fields:**

| Field | Source | Description |
|-------|--------|-------------|
| bookingNumber | auto | e.g., "BK-2026-0001" |
| unitId | form | Target unit |
| guestName | form | Nama lengkap |
| guestPhone | form | No HP |
| guestEmail | form | Email |
| checkInDate | form | Tanggal check-in |
| durationMonths | form | Untuk kos (1/3/6/12) |
| durationNights | form | Untuk guest house |
| notes | form | Permintaan khusus |
| status | system | BookingStatus |
| rejectionReason | admin | Jika rejected |

**Acceptance Criteria:**
- [ ] Admin lihat semua booking dengan filter status
- [ ] Confirm → buat tenant account otomatis
- [ ] Reject → wajib isi alasan
- [ ] Check-in → unit status auto-update
- [ ] WA notification kirim di setiap transisi

---

### F-04 · Tagihan & Pembayaran

**As a** tenant
**I want to** see my bills and pay them easily
**So that** I know exactly what to pay and when

**Invoice Fields:**

| Field | Type | Description |
|-------|------|-------------|
| invoiceNumber | auto | e.g., "INV-2026-0012" |
| tenantId | FK | Tenant |
| unitId | FK | Unit |
| period | string | "2026-10" format |
| rentAmount | decimal | Sewa dasar |
| electricAmount | decimal | Listrik (adjustable) |
| waterAmount | decimal | Air |
| otherAmount | decimal | Lainnya |
| totalAmount | decimal | Calculated |
| dueDate | date | Jatuh tempo |
| status | enum | UNPAID / PAID / OVERDUE / WAIVED |
| paidAt | datetime | Tanggal bayar |
| paymentMethod | string | Transfer / Cash |
| paymentProofUrl | string | Supabase Storage URL |

**Tenant Portal Features:**

| Feature | Description |
|---------|-------------|
| Invoice list | Semua tagihan dengan status |
| Invoice detail | Rincian komponen |
| Upload bukti | Bukti transfer/jatuh tempo |
| Payment history | Riwayat pembayaran |

**Acceptance Criteria:**
- [ ] Tenant bisa lihat semua tagihan
- [ ] Upload bukti bayar berfungsi
- [ ] Admin bisa konfirmasi/reject pembayaran
- [ ] Status auto-update OVERDUE setelah jatuh tempo

---

### F-05 · Dashboard Owner

**As an** owner
**I want to** see property performance at a glance
**So that** I can make informed decisions

**Dashboard Cards:**

| Card | Metric | Calculation |
|------|--------|-------------|
| Okupansi | percentage | (OCCUPIED / TOTAL) × 100 |
| Pendapatan Bulan Ini | currency | Sum of PAID invoices this month |
| Tagihan Overdue | count + amount | Count & sum of OVERDUE invoices |
| Unit Kosong | count | AVAILABLE units |

**Unit Table:**

| Column | Description |
|--------|-------------|
| No Unit | unitNumber |
| Tipe | type |
| Penghuni | tenant name atau - |
| Check-in | tanggal atau - |
| Sewa/bln | pricePerMonth |
| Status Bayar | invoice status |
| Status Unit | unit status |

**Row Colors:**
- Occupied + paid: `bg: #DCFCE7` (green)
- Occupied + overdue: `bg: #FEE2E2` (red)
- Available: `bg: #F3F4F6` (gray)
- Booked: `bg: #FEF3C7` (amber)

**Alert Panel:**

| Alert Type | Trigger | Color |
|------------|---------|-------|
| Unit vacant | > 30 days | red |
| Payment overdue | dueDate < today | red |
| Contract expiring | contractEnd - today < 30 days | amber |

**Acceptance Criteria:**
- [ ] Dashboard load < 2 detik
- [ ] Cards calculate accurately
- [ ] Alert panel auto-populate
- [ ] Klik alert → navigasi ke detail

---

## 6. User Story (INVEST Format)

### US-01: Public Room Booking

```
As a potential guest
I want to browse rooms and book online
So that I can secure accommodation without calling
```

**Acceptance Criteria:**
- Room list loads < 2s
- Calendar shows correct availability
- Booking form validates all required fields
- Confirmation page shows booking number

### US-02: Tenant Bill Payment

```
As a tenant
I want to see my bills and upload payment proof
So that I can pay on time easily
```

**Acceptance Criteria:**
- Bills display with correct amounts
- Upload accepts JPG/PNG < 5MB
- Payment proof visible to admin after upload
- Receipt available after admin confirmation

### US-03: Owner Monitoring

```
As an owner
I want to see real-time property status
So that I don't need to ask admin for updates
```

**Acceptance Criteria:**
- Dashboard reflects current state
- Alerts are accurate
- Export available for reporting

---

## 7. Data Model

```prisma
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
  checkedInAt    DateTime?
  checkedOutAt   DateTime?
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
  bookingId       String    @unique
  booking         Booking   @relation(fields: [bookingId], references: [id])
  unitId          String
  unit            Unit     @relation(fields: [unitId], references: [id])
  name            String
  email           String   @unique
  passwordHash    String
  phone           String
  contractStart   DateTime
  contractEnd     DateTime?
  emergencyName   String?
  emergencyPhone  String?
  isActive        Boolean  @default(true)
  invoices        Invoice[]
  createdAt       DateTime @default(now())
}

model Invoice {
  id             String        @id @default(cuid())
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
  id        String    @id @default(cuid())
  type      AlertType
  entityId  String
  entityType String   // UNIT | INVOICE | TENANT
  message   String
  isRead    Boolean   @default(false)
  createdAt DateTime  @default(now())
}

enum AlertType {
  UNIT_VACANT
  PAYMENT_OVERDUE
  CONTRACT_EXPIRING
}
```

---

## 8. Technical Architecture

### 8.1 Stack

```
Framework:     Next.js 14 (App Router)
Database:      PostgreSQL via Supabase
ORM:          Prisma
Auth:         NextAuth.js (admin) + Credential (tenant)
Storage:      Supabase Storage
Styling:      Tailwind CSS v3 + shadcn/ui
WA Notif:     Fonnte API
Cron:         Vercel Cron Jobs
Deploy:       Vercel + Supabase
```

### 8.2 Auth Strategy

| Role | Auth Method | Access |
|------|-------------|--------|
| ADMIN | NextAuth credentials | /admin/* |
| OWNER | NextAuth credentials | /admin/* |
| TENANT | NextAuth credentials | /tenant/* |
| PUBLIC | None | /* |

### 8.3 API Design

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/booking` | POST | Submit booking (public) |
| `/api/admin/bookings` | GET/PATCH | Manage bookings |
| `/api/admin/bookings/[id]/confirm` | POST | Confirm booking |
| `/api/admin/bookings/[id]/reject` | POST | Reject booking |
| `/api/admin/bookings/[id]/checkin` | POST | Check-in guest |
| `/api/admin/units` | GET/POST | List/create units |
| `/api/admin/units/[id]` | GET/PUT/DELETE | Unit CRUD |
| `/api/admin/invoices` | GET/POST | List/create invoices |
| `/api/admin/invoices/[id]` | GET/PUT | Invoice CRUD |
| `/api/admin/invoices/[id]/confirm` | POST | Confirm payment |
| `/api/tenant/invoices` | GET | Tenant's invoices |
| `/api/tenant/upload-proof` | POST | Upload payment proof |
| `/api/notify/wa` | POST | Send WA notification |
| `/api/cron/invoice-reminder` | GET | H-7, H-3 reminder |
| `/api/cron/overdue-check` | GET | Mark overdue |
| `/api/cron/vacancy-alert` | GET | Alert vacant units |

---

## 9. Demo Script

**Opening Hook:** "Kalau sekarang ada yang WA tanya kamar kosong, berapa lama sampai kalian bisa jawab dengan pasti tidak ada double-booking?"

**Flow:**
1. Tunjukkan landing page dengan foto, fasilitas
2. Demo booking dari HP: pilih kamar → tanggal → submit
3. Tunjukkan notifikasi masuk ke admin
4. Admin konfirmasi → buat tenant account
5. Buka portal tenant: tagihan bulan ini
6. Tenant upload bukti bayar
7. Admin konfirmasi → status lunas
8. Buka dashboard owner: okupansi, overdue, vacant alerts

**Close:** "Website yang bisa booking, sistem yang bisa tagih, dashboard yang bisa pantau — semua dari satu platform."

---

## 10. Timeline

| Phase | Duration |
|-------|----------|
| Setup + schema + auth | 2 hari |
| Public web: landing + room list | 3 hari |
| Room detail + booking form | 3 hari |
| Admin: unit CRUD + photos | 2 hari |
| Admin: booking management | 3 hari |
| Tenant portal: auth + invoices | 3 hari |
| Admin: invoice management | 2 hari |
| Dashboard owner + alerts | 2 hari |
| Cron jobs + WA notifications | 2 hari |
| Seed data + polish | 2 hari |
| **Total** | **~24 hari kerja** |

---

## 11. Definition of Done

- [ ] Double-booking prevention works
- [ ] Booking flow end-to-end < 5 minutes
- [ ] Tenant portal fully functional
- [ ] Dashboard accurate in real-time
- [ ] Cron jobs trigger at correct times
- [ ] WA notifications send successfully
- [ ] Mobile responsive for tenant portal
