# Panduan Pengguna: Platform Pemesanan Properti

> **Panduan Pengujian Demo untuk Penguji Non-Teknis**

---

## 1. Pendahuluan

### Apa Itu Sistem Ini?

**Platform Pemesanan Properti** adalah sistem manajemen properti lengkap untuk mengelola penyewaan kamar, penagihan penyewa, dan notifikasi otomatis. Sistem ini terdiri dari dua portal:

- **Portal Admin** — Untuk manajer properti dalam mengelola pemesanan, penyewa, invoice, dan pengaturan sistem
- **Portal Penyewa** — Untuk penyewa dalam melihat unit mereka, membayar invoice, dan berkomunikasi dengan pengelola

### Siapa yang Harus Membaca Panduan Ini?

Panduan ini dirancang untuk:
- Penguji non-teknis yang mengevaluasi demo
- Pemangku kepentingan yang meninjau sistem
- Pengguna bisnis yang memahami alur kerja

### Apa yang Anda Butuhkan

- Browser web modern (Chrome, Firefox, Edge, Safari)
- Koneksi internet
- Kredensial demo yang disediakan di bawah

---

## 2. Cara Mengakses Sistem

### Portal Admin

**URL:** [Link Admin Login Page](https://property-booking-three.vercel.app/login)

| Peran | Email | Kata Sandi |
|-------|-------|------------|
| Admin | admin@grahamaju.com | admin123 |
| Pemilik | owner@grahamaju.com | owner123 |

### Portal Penyewa

**URL:** [Link Penyewa Login Page](https://property-booking-three.vercel.app/tenant/login)

Akun demo penyewa sudah terisi di halaman login untuk memudahkan pengujian.

### Halaman Publik

| Halaman | URL |
|---------|-----|
| Halaman Utama | `http://localhost:3000/` |
| Daftar Kamar | `http://localhost:3000/kamar` |
| Formulir Pemesanan | `http://localhost:3000/kamar/[unit-slug]` |
| Konfirmasi Pemesanan | `http://localhost:3000/booking/confirm` |

---

## 3. Fitur Portal Admin

### 3.1 Dashboard

**Path:** `/admin/dashboard`

Dashboard menampilkan ringkasan properti Anda:

- **Statistik Hunian** — Persentase unit yang sedang dihuni
- **Ringkasan Pendapatan** — Penghasilan bulanan dari sewa
- **Pemesanan Menunggu** — Jumlah pemesanan yang menunggu konfirmasi
- **Pemberitahuan Terbaru** — Notifikasi sistem (pembayaran terlambat, kontrak hampir habis)

### 3.2 Manajemen Pemesanan

**Path:** `/admin/booking`

Pemesanan ditampilkan dalam **Papan Kanban** dengan kolom berikut:

| Status | Deskripsi |
|--------|------------|
| PENDING | Permintaan pemesanan baru menunggu review |
| CONFIRMED | Pemesanan disetujui, menunggu check-in |
| CHECKED_IN | Penyewa sudah pindah masuk |
| COMPLETED | Masa tinggal sudah berakhir |
| CANCELLED | Pemesanan ditolak atau dibatalkan |

#### Cara Memproses Pemesanan

1. Klik kartu pemesanan berstatus **PENDING**
2. Review detail tamu (nama, kontak, tanggal, catatan)
3. Pilih aksi:
   - **Konfirmasi** — Menyetujui pemesanan dan mengirim email/WhatsApp konfirmasi
   - **Tolak** — Membatalkan dengan notifikasi penolakan ke tamu
4. Setelah mengkonfirmasi, klik **"Buat Tenant"** untuk membuat akun penyewa

> **Catatan:** Membuat tenant secara otomatis menghasilkan invoice pertama untuk periode sewa.

### 3.3 Manajemen Tenant

**Path:** `/admin/tenant`

Lihat semua penyewa terdaftar dengan informasi:
- Nama dan kontak
- Unit yang ditugaskan
- Status kontrak (Aktif/Habis)
- Saldo tertunggak

### 3.4 Manajemen Invoice

**Path:** `/admin/invoice`

Invoice ditampilkan dengan status:

| Status | Warna | Deskripsi |
|--------|-------|------------|
| UNPAID | Kuning | Menunggu pembayaran |
| OVERDUE | Merah | Melewati jatuh tempo |
| PAID | Hijau | Pembayaran terkonfirmasi |

#### Cara Mengkonfirmasi Pembayaran

1. Cari invoice (filter berdasarkan status jika perlu)
2. Klik invoice untuk melihat detail
3. Periksa **bukti pembayaran**
4. Klik **"Konfirmasi Pembayaran"** untuk menandai lunas
5. Sistem mengirim notifikasi konfirmasi ke penyewa

### 3.5 Manajemen Unit

**Path:** `/admin/unit`

Setiap unit menampilkan:
- Nomor/nama unit
- Harga per bulan
- Indikator status

| Status | Arti |
|--------|------|
| Available | Siap untuk dipesan |
| Occupied | Sedang disewa |
| Maintenance | Dalam perbaikan, tidak bisa dipesan |

Klik **"+ Tambah Unit"** untuk menambah unit baru.

---

## 4. Fitur Portal Penyewa

### 4.1 Dashboard Penyewa

**Path:** `/tenant/dashboard`

Setelah login, penyewa melihat:
- Detail unit yang ditugaskan
- Informasi kontrak saat ini
- Ringkasan invoice yang belum lunas
- Aksi cepat

### 4.2 Daftar Invoice

**Path:** `/tenant/invoice`

Semua invoice tercantum dengan:
- Periode (bulan tagihan)
- Total jumlah
- Tanggal jatuh tempo
- Status (Belum Bayar/Jatuh Tempo/Lunas)

### 4.3 Detail Invoice & Pembayaran

**Path:** `/tenant/invoice/[id]`

Untuk setiap invoice, penyewa dapat:

1. **Lihat Rincian Pembayaran**
   - Jumlah sewa
   - Tagihan listrik
   - Tagihan air
   - Biaya lain
   - **Total yang harus dibayar**

2. **Lihat Hitung Mundur Jatuh Tempo**
   - Menampilkan hari tersisa sampai jatuh tempo
   - Berubah warna seiring mendekati deadline

3. **Unggah Bukti Pembayaran**
   - Ketuk untuk pilih foto (JPG/PNG, maks 5MB)
   - Pilih metode pembayaran (Transfer/Tunai/QRIS)
   - Tambahkan catatan opsional
   - Kirim

4. **Hubungi Pengelola Properti**
   - Nomor telepon (bisa diklik untuk menelepon)
   - Email (bisa diklik untuk membuat pesan)
   - Alamat

---

## 5. Konfigurasi Pengaturan

**Path:** `/admin/settings`

Pengaturan diatur dalam tiga tab:

### 5.1 Informasi Properti

Tab ini mengkonfigurasi identitas properti Anda. Perubahan di sini memengaruhi:
- Sidebar dan header
- Subjek email
- Footer email
- Konten halaman publik

| Field | Deskripsi | Muncul di Mana |
|-------|------------|----------------|
| **Nama Properti** | Nama properti Anda | Sidebar, judul halaman, email |
| **Telepon** | Nomor kontak | Footer email, kartu kontak |
| **Email** | Email kontak | Alamat balasan untuk semua email |
| **Alamat** | Alamat properti | Footer email, halaman konfirmasi |
| **Jam Operasional** | Jam kerja | Bagian kontak |

### 5.2 Rekening Bank

Konfigurasi detail transfer bank yang ditampilkan di email invoice:
- Nama bank
- Nomor rekening
- Nama pemilik rekening

### 5.3 Aturan & Notifikasi

#### Aturan Pemesanan
| Pengaturan | Deskripsi |
|-----------|------------|
| Waktu Check-in | Waktu kedatangan default (misal: 14:00) |
| Waktu Check-out | Waktu keberangkatan default (misal: 12:00) |
| Minimum Sewa | Durasi sewa minimum |
| Maksimum Pemesanan | Berapa jauh sebelumnya tamu bisa memesan |
| Persentase Deposit | Jumlah deposit yang diperlukan |

#### Aturan Invoice
| Pengaturan | Deskripsi |
|-----------|------------|
| Jatuh Tempo | Hari setelah invoice dibuat |
| Denda Terlambat % | Denda untuk pembayaran terlambat |
| Hari Pengingat | Kapan mengirim pengingat pembayaran |

#### Pengaturan Notifikasi
| Pengaturan | Deskripsi |
|-----------|------------|
| WhatsApp Pemilik | Nomor telepon untuk notifikasi pemilik |
| Email Pemilik | Email untuk laporan kekosongan |
| Notif Pemesanan Baru | Alert saat pemesanan baru masuk |
| Notif Pembayaran | Alert saat pembayaran masuk |
| Notif Terlambat | Alert untuk invoice jatuh tempo |

#### Menguji Notifikasi

Klik tombol **"Test WhatsApp"** atau **"Test Email"** untuk memverifikasi pengaturan notifikasi Anda.

---

## 6. Notifikasi Email

Sistem mengirim email otomatis untuk berbagai acara:

| Tipe Email | Pemicu | Penerima |
|------------|--------|----------|
| **Pemesanan Diterima** | Tamu submit pemesanan | Pemilik (via WhatsApp) |
| **Pemesanan Dikonfirmasi** | Admin konfirmasi pemesanan | Tamu |
| **Pemesanan Ditolak** | Admin tolak pemesanan | Tamu |
| **Invoice Dibuat** | Sistem generate invoice | Penyewa |
| **Pembayaran Dikonfirmasi** | Admin konfirmasi pembayaran | Penyewa |
| **Pengingat Pembayaran** | Otomatis (H-7, H-3) | Penyewa |
| **Akun Tenant** | Akun tenant dibuat | Penyewa |
| **Laporan Kekosongan** | Ringkasan mingguan | Pemilik |

### Fitur Email

- **Alamat Reply-to** — Semua balasan masuk ke email properti Anda
- **Footer Properti** — Setiap email menyertakan informasi kontak Anda
- **Detail Bank** — Email invoice menyertakan instruksi transfer

---

## 7. Notifikasi WhatsApp

Pesan WhatsApp dikirim otomatis untuk:

| Tipe Pesan | Penerima | Konten |
|------------|----------|--------|
| Pemesanan Baru | Pemilik | Detail tamu, tanggal |
| Pemesanan Dikonfirmasi | Tamu | Detail konfirmasi |
| Pemesanan Ditolak | Tamu | Pemberitahuan pembatalan |
| Invoice Dibuat | Penyewa | Jumlah, jatuh tempo |
| Pembayaran Dikonfirmasi | Penyewa | Bukti pembayaran |
| Pengingat Pembayaran | Penyewa | Peringatan terlambat |
| Kredensial Tenant | Penyewa | Info login |

> **Catatan:** WhatsApp memerlukan nomor telepon valid dalam format internasional (misal: +6281234567890)

---

## 8. Skenario Pengujian Demo

### Skenario 1: Alur Pemesanan Lengkap

Ikuti pengujian end-to-end ini untuk memverifikasi seluruh sistem:

**Langkah 1 — Tamu Memesan Kamar**
1. Buka halaman publik (`/kamar`)
2. Pilih unit yang tersedia
3. Isi formulir pemesanan:
   - Nama lengkap
   - Nomor telepon
   - Alamat email
   - Tanggal check-in
   - Durasi (bulan)
   - Catatan (opsional)
4. Submit pemesanan
5. Catat nomor pemesanan yang ditampilkan

**Langkah 2 — Verifikasi Notifikasi Pemilik**
1. Periksa WhatsApp untuk notifikasi "Pemesanan Baru"
2. Catat detail tamu

**Langkah 3 — Admin Mengkonfirmasi Pemesanan**
1. Login ke Portal Admin
2. Buka `/admin/booking`
3. Cari pemesanan berstatus PENDING
4. Klik **"Konfirmasi"**
5. Tunggu pesan sukses

**Langkah 4 — Verifikasi Notifikasi Tamu**
1. Periksa email untuk email "Pemesanan Dikonfirmasi"
2. Periksa WhatsApp untuk pesan konfirmasi

**Langkah 5 — Buat Akun Tenant**
1. Di tampilan booking admin, klik **"Buat Tenant"**
2. Set password awal
3. Submit untuk membuat akun

**Langkah 6 — Tenant Melihat Invoice**
1. Login ke Portal Tenant
2. Buka `/tenant/invoice`
3. Verifikasi invoice tercantum dengan jumlah yang benar

**Langkah 7 — Tenant Mengunggah Pembayaran**
1. Klik invoice
2. Klik **"Bayar Sekarang"**
3. Unggah foto (gunakan gambar apapun)
4. Pilih metode pembayaran
5. Submit

**Langkah 8 — Admin Mengkonfirmasi Pembayaran**
1. Login ke Portal Admin
2. Buka `/admin/invoice`
3. Cari invoice berstatus UNPAID
4. Klik untuk melihat detail
5. Verifikasi gambar bukti pembayaran
6. Klik **"Konfirmasi Pembayaran"**

**Langkah 9 — Verifikasi Notifikasi Akhir**
1. Tenant menerima email konfirmasi pembayaran
2. Status invoice menunjukkan PAID

### Skenario 2: Pengujian Pengaturan Properti

Uji bahwa pembaruan informasi properti tersebar dengan benar:

**Langkah 1 — Ubah Nama Properti**
1. Buka `/admin/settings`
2. Pilih tab **Informasi Properti**
3. Ubah **Nama Properti** ke sesuatu yang unik (misal: "Pyta Test Property")
4. Simpan

**Langkah 2 — Verifikasi Perubahan**
1. Periksa sidebar admin — nama harus berubah
2. Periksa judul halaman di tab browser
3. Submit pemesanan tes dan periksa subjek email

**Langkah 3 — Ubah Info Kontak**
1. Perbarui telepon dan email
2. Simpan
3. Submit pemesanan tes
4. Periksa footer email — info kontak baru harus muncul

**Langkah 4 — Uji Notifikasi**
1. Klik tombol **"Test Email"**
2. Verifikasi email masuk dengan info properti baru di footer
3. Klik tombol **"Test WhatsApp"**
4. Verifikasi pesan WhatsApp diterima

**Langkah 5 — Kembalikan ke Original**
1. Kembalikan nama properti asli
2. Simpan

### Skenario 3: Pengujian Invoice Terlambat

Uji sistem deteksi keterlambatan:

**Langkah 1 — Buat Invoice Lewat Jatuh Tempo**
1. Set tanggal jatuh tempo invoice ke tanggal lalu di database
2. Tunggu cron job berjalan (atau picu manual)

**Langkah 2 — Verifikasi Perubahan Status**
1. Status invoice berubah dari UNPAID ke OVERDUE
2. Indikator visual berubah dari kuning ke merah

**Langkah 3 — Periksa Pengingat**
1. Cron job mengirim notifikasi pengingat
2. Tenant menerima pengingat WhatsApp/email

---

## 9. Pemecahan Masalah

### Email Tidak Diterima

| Penyebab | Solusi |
|----------|--------|
| Email di folder spam | Periksa folder spam |
| Alamat email salah | Verifikasi email tenant di pengaturan |
| Reply-to belum dikonfigurasi | Set email properti di Settings |
| Layanan email down | Periksa dashboard Resend API |

### WhatsApp Tidak Berfungsi

| Penyebab | Solusi |
|----------|--------|
| Format nomor salah | Gunakan format internasional: +6281234567890 |
| Nomor belum diverifikasi | Verifikasi nomor di dashboard Fonnte |
| API key tidak valid | Periksa WA_API_KEY di .env |

### Pemesanan Tidak Muncul di Admin

| Penyebab | Solusi |
|----------|--------|
| Filter status salah | Periksa semua kolom status di Kanban |
| Pemesanan ditolak | Periksa kolom CANCELLED |
| Properti salah | Verifikasi login dengan akun yang benar |

### Invoice Tidak Dibuat

| Penyebab | Solusi |
|----------|--------|
| Tenant belum dibuat | Harus buat tenant dari pemesanan yang dikonfirmasi |
| Error database | Periksa log server untuk error Prisma |
| Cron job tidak berjalan | Verifikasi endpoint cron bisa diakses |

### Sidebar/Header Menampilkan Nama Salah

| Penyebab | Solusi |
|----------|--------|
| Cache belum dihapus | Simpan pengaturan lagi (cache auto-clear) |
| Nilai hardcoded | Laporkan sebagai bug |

---

## 10. Kartu Referensi Cepat

### Kredensial Login

| Portal | URL | Kredensial |
|--------|-----|------------|
| Admin | /admin/login | admin@grahamaju.com / admin123 |
| Tenant | /tenant/login | Gunakan tombol demo |

### Halaman Utama

| Fitur | Path Admin | Path Tenant |
|-------|------------|-------------|
| Dashboard | /admin/dashboard | /tenant/dashboard |
| Pemesanan | /admin/booking | — |
| Tenant | /admin/tenant | — |
| Invoice | /admin/invoice | /tenant/invoice |
| Unit | /admin/unit | — |
| Pengaturan | /admin/settings | — |
| Kamar | /kamar | — |

### Warna Status

| Item | PENDING | CONFIRMED/ACTIVE | OVERDUE/CANCELLED | PAID/COMPLETED |
|------|---------|------------------|-------------------|----------------|
| Pemesanan | Kuning | Biru | Merah | Hijau |
| Invoice | Kuning | — | Merah | Hijau |
| Unit | — | Hijau (Dihuni) | Orange (Maintenance) | — |

---

## Lampiran: Endpoint Cron Job

Untuk menguji fitur otomasi:

| Endpoint | Tujuan | Frekuensi |
|----------|--------|-----------|
| `/api/cron/invoice-reminder` | Kirim pengingat pembayaran | Harian |
| `/api/cron/overdue-check` | Tandai invoice jatuh tempo | Harian |
| `/api/cron/vacancy-alert` | Laporan kekosongan mingguan | Mingguan |

> Endpoint ini biasanya dipanggil oleh scheduler eksternal (Vercel Cron, GitHub Actions, dll) tetapi bisa diuji manual.

---

*Akhir Panduan Pengguna*
