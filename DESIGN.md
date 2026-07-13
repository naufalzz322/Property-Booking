# DESIGN.md — Property Booking & Management Platform
**Segmen 04 · Properti & Akomodasi**

---

## 1. Design Principles

**Dua wajah: marketing dan manajemen.** Public web harus aspirasional — calon penyewa harus mau booking. Admin/owner panel harus fungsional dan dense-information. Tidak bisa pakai satu pendekatan untuk keduanya.

### 1.1 Core Principles

1. **Public web: premium & trustworthy** — kos eksklusif / villa harus terlihat premium, bukan seperti OLX
2. **Admin: information density** — owner butuh lihat banyak data sekaligus, bukan card cantik yang isinya sedikit
3. **Mobile untuk penghuni** — portal tagihan diakses dari HP saat mau bayar

---

## 2. Color System

### 2.1 Public Web (Premium)

| Token | Hex | Usage |
|-------|-----|-------|
| `background` | `#FAFAF9` | Warm white |
| `surface` | `#FFFFFF` | Cards |
| `primary` | `#292524` | Stone-900 (warm, not pure black) |
| `accent` | `#D4A853` | Gold — kemewahan, properti premium |
| `accent-hover` | `#B8912F` | Gold darker |
| `text` | `#1C1917` | Body text |
| `text-muted` | `#78716C` | Secondary text |
| `border` | `#E7E5E4` | Dividers |

### 2.2 Admin Panel

| Token | Hex | Usage |
|-------|-----|-------|
| `background` | `#F8F9FA` | Page background |
| `surface` | `#FFFFFF` | Cards, panels |
| `border` | `#E2E8F0` | Dividers |
| `primary` | `#1D4ED8` | Blue — corporate, trustworthy |
| `primary-hover` | `#1E40AF` | Blue darker |
| `text-primary` | `#111827` | Headings |
| `text-secondary` | `#6B7280` | Body |

### 2.3 Status Colors

| Status | Color | Background | Usage |
|--------|-------|------------|-------|
| `available` | `#6B7280` | `#F3F4F6` | Unit available |
| `booked` | `#D97706` | `#FEF3C7` | Unit booked |
| `occupied` | `#16A34A` | `#DCFCE7` | Unit occupied |
| `maintenance` | `#9333EA` | `#F3E8FF` | Unit under maintenance |
| `paid` | `#16A34A` | `#DCFCE7` | Invoice paid |
| `unpaid` | `#D97706` | `#FEF3C7` | Invoice unpaid |
| `overdue` | `#DC2626` | `#FEE2E2` | Invoice overdue |

---

## 3. Typography

### 3.1 Public Web

```
Font: Plus Jakarta Sans (premium feel)
Fallback: Inter
```

| Element | Size | Weight | Usage |
|---------|------|--------|-------|
| `hero-title` | 48px | 700 | Hero headline |
| `hero-subtitle` | 24px | 400 | Hero subtitle |
| `section-title` | 32px | 600 | Section headers |
| `card-title` | 18px | 600 | Card titles |
| `body` | 16px | 400 | Body text |
| `price` | 28px | 700 | Price display |
| `badge` | 12px | 500 | Status badges |

### 3.2 Admin Panel

```
Font: Inter
```

| Element | Size | Weight | Usage |
|---------|------|--------|-------|
| `page-title` | 24px | 700 | Page headings |
| `section-title` | 18px | 600 | Section headers |
| `body` | 14px | 400 | Body text |
| `label` | 12px | 500 | Form labels |
| `caption` | 11px | 400 | Helper text |

---

## 4. Public Web Layout

### 4.1 Landing Page

```
┌────────────────────────────────────────────────────────────────────────┐
│  Navbar:                                                              │
│  [Logo]          Fasilitas    Kamar    Tentang    [Hubungi Kami]      │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │                                                              │    │
│  │  HERO IMAGE (full-width, overlay gradient)                  │    │
│  │                                                              │    │
│  │     Kenyamanan Rumah,                                       │    │
│  │     Fleksibilitas Tinggal                                   │    │
│  │                                                              │    │
│  │     [Lihat Kamar Tersedia →]                                │    │
│  │                                                              │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                        │
│  Fasilitas Unggulan                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │  🚗      │  │  📶      │  │  📹      │  │  🔒      │         │
│  │ Parkir   │  │ WiFi     │  │ CCTV     │  │ Akses    │         │
│  │ Mobil    │  │ 100Mbps  │  │ 24 Jam   │  │ Kartu    │         │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘         │
│                                                                        │
│  Kamar Tersedia                                                     │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐         │
│  │    [PHOTO]      │ │    [PHOTO]      │ │    [PHOTO]      │         │
│  │                 │ │                 │ │                 │         │
│  │  Kamar Standar  │ │  Kamar Deluxe  │ │  Kamar Suite   │         │
│  │  Rp 1.2 juta   │ │  Rp 1.8 juta   │ │  Rp 2.5 juta   │         │
│  │  /bulan        │ │  /bulan        │ │  /bulan        │         │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘         │
│                                                                        │
│  [Lihat Semua Kamar →]                                              │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Room List Page

```
┌────────────────────────────────────────────────────────────────────────┐
│  Kamar Tersedia                                                     │
│  ────────────────────────────────────────────────────────────────    │
│                                                                        │
│  Filter: [Semua Tipe ▼]  [Semua Harga ▼]  [Tersedia ▼]          │
│                                                                        │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  [PHOTO]  │  Kamar Standar 101                            │    │
│  │            │  Type: Kos Bulanan                             │    │
│  │            │  AC • WiFi • Kamar Mandi Dalam                  │    │
│  │            │                                                 │    │
│  │            │  Rp 1.200.000 / bulan        [Pesan Sekarang]  │    │
│  └────────────┴─────────────────────────────────────────────────┘    │
│                                                                        │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  [PHOTO]  │  Kamar Deluxe 202                            │    │
│  │            │  Type: Kos Bulanan                             │    │
│  │            │  AC • WiFi • Kamar Mandi Dalam • TV            │    │
│  │            │                                                 │    │
│  │            │  Rp 1.800.000 / bulan        [Pesan Sekarang]  │    │
│  │            │  ✓ Tersedia                                     │    │
│  └────────────┴─────────────────────────────────────────────────┘    │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### 4.3 Room Detail Page

```
┌────────────────────────────────────────────────────────────────────────┐
│  ← Kembali                                                         │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │                                                              │    │
│  │  [PHOTO CAROUSEL - swipeable]                              │    │
│  │                                                              │    │
│  │  ● ○ ○ ○ ○                                                    │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                        │
│  Kamar Deluxe 202                                                  │
│  Rp 1.800.000 / bulan                                              │
│  ────────────────────────────────────────────────────────────        │
│                                                                        │
│  Fasilitas                                                          │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                    │
│  │  AC    │ │  WiFi  │ │  TV    │ │ K.Mandi│                    │
│  └────────┘ └────────┘ └────────┘ └────────┘                    │
│  ┌────────┐ ┌────────┐ ┌────────┐                                  │
│  │ Kloset │ │ Water  │ │  Parkir│                                  │
│  └────────┘ └────────┘ └────────┘                                  │
│                                                                        │
│  Ketersediaan                                                       │
│  Kalender: [bulan ini dengan tanggal booked disabled]                  │
│                                                                        │
│  ────────────────────────────────────────────────────────────────    │
│                                                                        │
│  [Pesan Sekarang]                                                    │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Admin Panel Layout

### 5.1 Dashboard

```
┌────────────────────────────────────────────────────────────────────────┐
│  Header: [Logo] Graha Maju    [🔔 3] [Admin ▼]                    │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  Okupansi     │ Pendapatan      │ Tagihan        │ Unit           │
│  ┌─────────┐  │ Bulan Ini        │ Overdue        │ Kosong        │
│  │         │  │                  │                │               │
│  │  75%   │  │  Rp 8.400.000   │  1 / Rp 1.8jt │  1 unit      │
│  │ ↑ 12%  │  │ ↑ 5%           │                │               │
│  └─────────┘  └──────────────────┴────────────────┴───────────────┘  │
│                                                                        │
│  Unit Overview                              Alert                    │
│  ┌───────────────────────────────────┐ ┌─────────────────────────┐  │
│  │ No │ Unit │ Penghuni │ Sewa │Sts │ │ ⚠️ Tagihan overdue     │  │
│  │────│──────│──────────│──────│────│ │    Unit 201 - 3 hari   │  │
│  │101 │ Std  │ -        │1.2jt │ 🟢  │ │ ⚠️ Kontrak habis      │  │
│  │102 │ Std  │ A. Sari │1.2jt │ 🟢  │ │    Unit 302 - 25 hari  │  │
│  │103 │ Std  │ B. Joko │1.2jt │ 🟡  │ └─────────────────────────┘  │
│  │... │ ...  │ ...     │ ...  │ ... │                          │
│  └───────────────────────────────────┘                           │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Booking Detail

```
┌────────────────────────────────────────────────────────────────────────┐
│  Booking Detail — BK-2026-0008                                      │
│  ────────────────────────────────────────────────────────────────    │
│                                                                        │
│  Status:  [PENDING]                                                  │
│                                                                        │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  Info Tamu                    │  Info Booking                   │  │
│  │  ────────────────────         │  ────────────────────           │  │
│  │  Nama:  Andi Wijaya          │  Unit: Deluxe 202              │  │
│  │  HP:    081234567890         │  Check-in: 15 Okt 2026        │  │
│  │  Email: andi@email.com      │  Durasi: 6 bulan              │  │
│  │                               │  Estimasi Exit: 15 Apr 2027    │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  Notes:                                                               │
│  "Mohon jika bisa dapat lantai 2, dekat tangga"                     │
│                                                                        │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  [    Konfirmasi Booking    ]    [  Tolak Booking  ]          │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Tenant Portal Layout

### 6.1 Invoice List (Mobile)

```
┌────────────────────────────────────────┐
│  Tagihan Saya                         │
│  ──────────────────────────────────── │
│                                        │
│  ┌─────────────────────────────────┐  │
│  │  Oktober 2026                  │  │
│  │                                 │  │
│  │  Total: Rp 1.850.000          │  │
│  │  Jatuh tempo: 5 Okt 2026      │  │
│  │                                 │  │
│  │  [   BAYAR SEKARANG   ]       │  │
│  │                                 │  │
│  │  Sewa      Rp 1.200.000        │  │
│  │  Listrik   Rp    450.000      │  │
│  │  Air       Rp    100.000      │  │
│  │  Lain      Rp    100.000      │  │
│  └─────────────────────────────────┘  │
│                                        │
│  Riwayat Tagihan                      │
│  ┌─────────────────────────────────┐  │
│  │  Sept 2026          LUNAS ✓   │  │
│  │  Agt 2026           LUNAS ✓   │  │
│  └─────────────────────────────────┘  │
│                                        │
│  ──────────────────────────────────── │
│  [Tagihan]   [Riwayat]   [Akun]      │
└────────────────────────────────────────┘
```

### 6.2 Invoice Card Component

```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│  Oktober 2026                         [⚠️ JATUH TEMPO]  │
│  ──────────────────────────────────────────────────    │
│                                                          │
│  Sewa        Rp 1.200.000                               │
│  Listrik     Rp   450.000                               │
│  Air         Rp   100.000                               │
│  Lain        Rp   100.000                               │
│  ──────────────────────────────────────────────────    │
│  TOTAL        Rp 1.850.000                              │
│                                                          │
│  Status: [BELUM BAYAR]                                  │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │            BAYAR SEKARANG                       │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 7. Component Specifications

### 7.1 Availability Calendar

| State | Background | Text | Interaction |
|-------|------------|-------|--------------|
| Available | `#FFFFFF` | `#111827` | Clickable |
| Available hover | `#EFF6FF` | `#1D4ED8` | Cursor pointer |
| Booked | `#F1F5F9` | `#94A3B8` | Disabled |
| Today | border: 2px `#1D4ED8` | - | - |
| Selected | `#1D4ED8` | `#FFFFFF` | - |

### 7.2 Booking Status Badge

```
┌────────────────┐
│  [●] PENDING   │ ← amber bg, amber text
└────────────────┘
┌──────────────────────┐
│  [●] CONFIRMED      │ ← green bg, green text
└──────────────────────┘
┌────────────────────┐
│  [●] CHECKED IN    │ ← blue bg, blue text
└────────────────────┘
┌─────────────────────┐
│  [●] REJECTED       │ ← red bg, red text
└─────────────────────┘
```

### 7.3 Unit Status Badge

| Status | Icon | Color |
|--------|------|-------|
| AVAILABLE | 🟢 | `#16A34A` |
| BOOKED | 🟡 | `#D97706` |
| OCCUPIED | 🔵 | `#1D4ED8` |
| MAINTENANCE | 🟣 | `#9333EA` |

### 7.4 Invoice Status Badge

| Status | Badge Style |
|--------|-------------|
| UNPAID | amber bg, amber text |
| PAID | green bg, green text |
| OVERDUE | red bg, red text, pulse animation |
| WAIVED | gray bg, gray text |

---

## 8. Navigation

### 8.1 Admin Sidebar

```
┌─────────────────────────────┐
│  🏠 Graha Maju              │
│  [Admin ▼]                 │
├─────────────────────────────┤
│  📊 Dashboard               │
│  📋 Booking                │
│     ├─ Semua Booking       │
│     └─ Pending (3)        │
│  👤 Tenant                │
│  💰 Tagihan              │
│  🏢 Unit & Kamar         │
│  ⚠️  Alert               │
│  🌐 Website Publik        │
│  ⚙️  Pengaturan          │
└─────────────────────────────┘
```

### 8.2 Tenant Bottom Nav

```
┌────────────────────────────────────────┐
│  [Tagihan]    [Riwayat]    [Akun]     │
└────────────────────────────────────────┘
```

---

## 9. Form Designs

### 9.1 Booking Form

```
┌─────────────────────────────────────────────────────────┐
│  Pesan Kamar                                           │
│  ──────────────────────────────────────────────────    │
│                                                          │
│  Unit: [Deluxe 202 - Rp 1.8jt/bulan ▼]               │
│                                                          │
│  Nama Lengkap:                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │  [                                          ]      │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  No. HP:                                                │
│  ┌─────────────────────────────────────────────────┐   │
│  │  [                                          ]      │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  Email:                                                 │
│  ┌─────────────────────────────────────────────────┐   │
│  │  [                                          ]      │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  Tanggal Check-in:                                       │
│  ┌─────────────────────────────────────────────────┐   │
│  │  [📅 15 Oktober 2026                    ]         │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  Durasi:                                                │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                 │
│  │  1   │ │  3   │ │  6   │ │  12  │                 │
│  │bln   │ │bln   │ │bln   │ │bln   │                 │
│  └──────┘ └──────┘ └──────┘ └──────┘                 │
│                                                          │
│  Catatan (opsional):                                     │
│  ┌─────────────────────────────────────────────────┐   │
│  │  [                                          ]      │   │
│  │  [                                          ]      │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │            KIRIM PERMINTAAN                      │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 9.2 Payment Proof Upload

```
┌─────────────────────────────────────────────────────────┐
│  Upload Bukti Pembayaran                                │
│  ──────────────────────────────────────────────────    │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │                                                   │   │
│  │           📷                                     │   │
│  │                                                   │   │
│  │      Drag & drop atau tap untuk upload          │   │
│  │      JPG, PNG maks 5MB                          │   │
│  │                                                   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  [← Kembali]                    [Kirim Bukti Bayar →]   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 10. Performance Targets

| Metric | Target |
|--------|--------|
| Landing page load | < 1.5s |
| Room list render | < 2s |
| Calendar render | < 500ms |
| Booking form submit | < 1s |
| Admin dashboard | < 2s |
| Invoice list (tenant) | < 1.5s |
| Image optimization | WebP, lazy load |

---

## 11. Empty States

### 11.1 No Units

```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│  🏢                                                  │
│                                                          │
│  Belum Ada Kamar                                       │
│  Tambahkan kamar untuk mulai menerima booking           │
│                                                          │
│  [Tambah Kamar Pertama →]                             │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 11.2 No Bookings

```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│  📋                                                  │
│                                                          │
│  Belum Ada Booking                                     │
│  Booking akan muncul di sini setelah tamu mengisi form  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 12. Micro-interactions

### 12.1 Image Gallery

```css
/* Photo carousel */
.carousel-item {
  transition: transform 300ms ease-out;
}

/* Swipe gesture */
.touch-pan-x {
  touch-action: pan-y;
}
```

### 12.2 Button States

```css
.btn-primary {
  transition: background-color 150ms, transform 100ms;
}

.btn-primary:hover {
  background-color: var(--primary-hover);
}

.btn-primary:active {
  transform: scale(0.98);
}
```

### 12.3 Calendar Dates

```css
.date-cell {
  transition: background-color 150ms;
}

.date-cell.booked {
  background: repeating-linear-gradient(
    45deg,
    #f1f5f9,
    #f1f5f9 4px,
    #e2e8f0 4px,
    #e2e8f0 8px
  );
}
```
