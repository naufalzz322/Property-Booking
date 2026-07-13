# User Guide: Property Booking Platform

> **Demo Testing Guide for Non-Technical Testers**

---

## 1. Introduction

### What is this System?

The **Property Booking Platform** is a complete property management system for managing room rentals, tenant billing, and automated notifications. It consists of two portals:

- **Admin Portal** — For property managers to manage bookings, tenants, invoices, and system settings
- **Tenant Portal** — For renters to view their unit, pay invoices, and communicate with management

### Who is This Guide For?

This guide is designed for:
- Non-technical testers evaluating the demo
- Stakeholders reviewing the system
- Business users understanding the workflow

### What You Need

- A modern web browser (Chrome, Firefox, Edge, Safari)
- Internet connection
- Demo credentials provided below

---

## 2. How to Access the System

### Admin Portal

**URL:** `http://localhost:3000/admin/login`

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@grahamaju.com | admin123 |
| Owner | owner@grahamaju.com | owner123 |

### Tenant Portal

**URL:** `http://localhost:3000/tenant/login`

Demo tenant accounts are pre-filled on the login page for easy testing.

### Public Pages

| Page | URL |
|------|-----|
| Landing Page | `http://localhost:3000/` |
| Room Listing | `http://localhost:3000/kamar` |
| Booking Form | `http://localhost:3000/kamar/[unit-slug]` |
| Booking Confirmation | `http://localhost:3000/booking/confirm` |

---

## 3. Admin Portal Features

### 3.1 Dashboard

**Path:** `/admin/dashboard`

The dashboard shows an overview of your property:

- **Occupancy Statistics** — Percentage of units currently occupied
- **Revenue Summary** — Monthly income from rentals
- **Pending Bookings** — Number of bookings awaiting confirmation
- **Recent Alerts** — System notifications (overdue payments, expiring contracts)

### 3.2 Booking Management

**Path:** `/admin/booking`

Bookings are displayed in a **Kanban board** with the following columns:

| Status | Description |
|--------|-------------|
| PENDING | New booking requests awaiting review |
| CONFIRMED | Approved bookings, awaiting check-in |
| CHECKED_IN | Tenant has moved in |
| COMPLETED | Stay has ended |
| CANCELLED | Rejected or cancelled bookings |

#### How to Process a Booking

1. Click on a **PENDING** booking card
2. Review guest details (name, contact, dates, notes)
3. Choose an action:
   - **Confirm** — Approves the booking and sends confirmation email/WhatsApp
   - **Reject** — Cancels with rejection notification to guest
4. After confirming, click **"Create Tenant"** to set up the tenant account

> **Note:** Creating a tenant automatically generates the first invoice for the rental period.

### 3.3 Tenant Management

**Path:** `/admin/tenant`

View all registered tenants with:
- Name and contact information
- Assigned unit
- Contract status (Active/Expired)
- Outstanding balance

### 3.4 Invoice Management

**Path:** `/admin/invoice`

Invoices are shown with status badges:

| Status | Color | Description |
|--------|-------|-------------|
| UNPAID | Yellow | Awaiting payment |
| OVERDUE | Red | Past due date |
| PAID | Green | Payment confirmed |

#### Confirming a Payment

1. Find the invoice (filter by status if needed)
2. Click on the invoice to view details
3. Check the **payment proof image**
4. Click **"Konfirmasi Pembayaran"** to mark as paid
5. System sends confirmation notification to tenant

### 3.5 Unit Management

**Path:** `/admin/unit`

Each unit shows:
- Unit number/name
- Price per month
- Status indicator

| Status | Meaning |
|--------|---------|
| Available | Ready for booking |
| Occupied | Currently rented |
| Maintenance | Under repair, not bookable |

Click **"+ Tambah Unit"** to add new units.

---

## 4. Tenant Portal Features

### 4.1 Tenant Dashboard

**Path:** `/tenant/dashboard`

After login, tenants see:
- Assigned unit details
- Current contract information
- Outstanding invoices summary
- Quick actions

### 4.2 Invoice List

**Path:** `/tenant/invoice`

All invoices are listed with:
- Period (billing month)
- Total amount
- Due date
- Status badge (Unpaid/Overdue/Paid)

### 4.3 Invoice Detail & Payment

**Path:** `/tenant/invoice/[id]`

For each invoice, tenants can:

1. **View Payment Breakdown**
   - Rent amount
   - Electric bill
   - Water bill
   - Other charges
   - **Total amount due**

2. **See Due Date Countdown**
   - Shows days remaining until due
   - Changes color as deadline approaches

3. **Upload Payment Proof**
   - Tap to select photo (JPG/PNG, max 5MB)
   - Choose payment method (Transfer/Cash/QRIS)
   - Add optional notes
   - Submit

4. **Contact Property Manager**
   - Phone number (clickable to call)
   - Email (clickable to compose)
   - Address

---

## 5. Settings Configuration

**Path:** `/admin/settings`

Settings are organized in three tabs:

### 5.1 Informasi Properti (Property Information)

This tab configures your property's identity. Changes here affect:
- Sidebar and headers
- Email subject lines
- Email footers
- Public page content

| Field | Description | Where It Appears |
|-------|-------------|------------------|
| **Nama Properti** | Your property name | Sidebar, page titles, emails |
| **Telepon** | Contact phone | Email footer, contact cards |
| **Email** | Contact email | Reply-to address for all emails |
| **Alamat** | Property address | Email footer, confirmation pages |
| **Jam Operasional** | Business hours | Contact sections |

### 5.2 Rekening Bank (Bank Accounts)

Configure bank transfer details shown in invoice emails:
- Bank name
- Account number
- Account holder name

### 5.3 Aturan & Notifikasi (Rules & Notifications)

#### Booking Rules
| Setting | Description |
|---------|-------------|
| Check-in Time | Default arrival time (e.g., 14:00) |
| Check-out Time | Default departure time (e.g., 12:00) |
| Minimum Stay | Minimum rental duration |
| Maximum Advance Booking | How far ahead guests can book |
| Deposit Percentage | Required deposit amount |

#### Invoice Rules
| Setting | Description |
|---------|-------------|
| Due Date | Days after invoice generation |
| Late Fee % | Penalty for overdue payments |
| Reminder Days | When to send payment reminders |

#### Notification Settings
| Setting | Description |
|---------|-------------|
| WhatsApp Owner | Phone number for owner notifications |
| Email Owner | Email for vacancy reports |
| Notify New Booking | Alert when new booking arrives |
| Notify Payment | Alert when payment is received |
| Notify Overdue | Alert for overdue invoices |

#### Testing Notifications

Click the **"Test WhatsApp"** or **"Test Email"** buttons to verify your notification settings are configured correctly.

---

## 6. Email Notifications

The system sends automatic emails for various events:

| Email Type | Trigger | Recipient |
|------------|---------|-----------|
| **Booking Received** | Guest submits booking | Owner (via WhatsApp) |
| **Booking Confirmed** | Admin confirms booking | Guest |
| **Booking Rejected** | Admin rejects booking | Guest |
| **Invoice Created** | System generates invoice | Tenant |
| **Payment Confirmed** | Admin confirms payment | Tenant |
| **Payment Reminder** | Automatic (H-7, H-3) | Tenant |
| **Tenant Account** | Tenant account created | Tenant |
| **Vacancy Report** | Weekly summary | Owner |

### Email Features

- **Reply-to Address** — All replies go to your configured property email
- **Property Footer** — Every email includes your contact information
- **Bank Details** — Invoice emails include transfer instructions

---

## 7. WhatsApp Notifications

WhatsApp messages are sent automatically for:

| Message Type | Recipient | Content |
|--------------|-----------|---------|
| New Booking | Owner | Guest details, dates |
| Booking Confirmed | Guest | Confirmation details |
| Booking Rejected | Guest | Cancellation notice |
| Invoice Created | Tenant | Amount, due date |
| Payment Confirmed | Tenant | Payment receipt |
| Payment Reminder | Tenant | Past due warning |
| Tenant Credentials | Tenant | Login info |

> **Note:** WhatsApp requires a valid phone number in international format (e.g., +6281234567890)

---

## 8. Demo Test Scenarios

### Scenario 1: Complete Booking Flow

Follow this end-to-end test to verify the entire system:

**Step 1 — Guest Books a Room**
1. Open the public page (`/kamar`)
2. Select an available unit
3. Fill in booking form:
   - Full name
   - Phone number
   - Email address
   - Check-in date
   - Duration (months)
   - Notes (optional)
4. Submit booking
5. Note the booking number shown

**Step 2 — Verify Owner Notification**
1. Check your WhatsApp for "New Booking" notification
2. Note guest details

**Step 3 — Admin Confirms Booking**
1. Login to Admin Portal
2. Go to `/admin/booking`
3. Find the PENDING booking
4. Click **"Konfirmasi"**
5. Wait for success message

**Step 4 — Verify Guest Notification**
1. Check email for "Booking Confirmed" email
2. Check WhatsApp for confirmation message

**Step 5 — Create Tenant Account**
1. In admin booking view, click **"Buat Tenant"**
2. Set initial password
3. Submit to create account

**Step 6 — Tenant Views Invoice**
1. Login to Tenant Portal
2. Go to `/tenant/invoice`
3. Verify invoice is listed with correct amount

**Step 7 — Tenant Uploads Payment**
1. Click on invoice
2. Click **"Bayar Sekarang"**
3. Upload a photo (use any image)
4. Select payment method
5. Submit

**Step 8 — Admin Confirms Payment**
1. Login to Admin Portal
2. Go to `/admin/invoice`
3. Find UNPAID invoice
4. Click to view details
5. Verify payment proof image
6. Click **"Konfirmasi Pembayaran"**

**Step 9 — Verify Final Notification**
1. Tenant receives payment confirmation email
2. Invoice status shows as PAID

### Scenario 2: Property Settings Test

Test that property information updates propagate correctly:

**Step 1 — Change Property Name**
1. Go to `/admin/settings`
2. Select **Informasi Properti** tab
3. Change **Nama Properti** to something unique (e.g., "Pyta Test Property")
4. Save

**Step 2 — Verify Changes**
1. Check admin sidebar — name should update
2. Check page title in browser tab
3. Submit a test booking and check email subject line

**Step 3 — Change Contact Info**
1. Update phone and email
2. Save
3. Submit a test booking
4. Check email footer — new contact info should appear

**Step 4 — Test Notifications**
1. Click **"Test Email"** button
2. Verify email arrives with new property info in footer
3. Click **"Test WhatsApp"** button
4. Verify WhatsApp message is received

**Step 5 — Reset to Original**
1. Restore original property name
2. Save

### Scenario 3: Invoice Overdue Test

Test the overdue detection system:

**Step 1 — Create Invoice Past Due Date**
1. Set invoice due date to a past date in database
2. Wait for cron job to run (or trigger manually)

**Step 2 — Verify Status Change**
1. Invoice status changes from UNPAID to OVERDUE
2. Visual indicator changes from yellow to red

**Step 3 — Check Reminder**
1. Cron job sends reminder notification
2. Tenant receives WhatsApp/email reminder

---

## 9. Troubleshooting

### Email Not Received

| Cause | Solution |
|-------|----------|
| Email in spam folder | Check spam/junk folder |
| Wrong email address | Verify tenant email in settings |
| Reply-to not configured | Set property email in Settings |
| Email service down | Check Resend API dashboard |

### WhatsApp Not Working

| Cause | Solution |
|-------|----------|
| Wrong phone format | Use international format: +6281234567890 |
| Phone not verified | Verify number in Fonnte dashboard |
| API key invalid | Check WA_API_KEY in .env |

### Booking Not Visible in Admin

| Cause | Solution |
|-------|----------|
| Wrong status filter | Check all status columns in Kanban |
| Booking was rejected | Check CANCELLED column |
| Wrong property | Verify you are logged into correct account |

### Invoice Not Created

| Cause | Solution |
|-------|----------|
| Tenant not created | Must create tenant from confirmed booking |
| Database error | Check server logs for Prisma errors |
| Cron job not running | Verify cron endpoint is accessible |

### Sidebar/Header Shows Wrong Name

| Cause | Solution |
|-------|----------|
| Cache not cleared | Save settings again (cache auto-clears) |
| Hardcoded value | Report as bug |

---

## 10. Quick Reference Card

### Login Credentials

| Portal | URL | Credentials |
|--------|-----|-------------|
| Admin | /admin/login | admin@grahamaju.com / admin123 |
| Tenant | /tenant/login | Use demo buttons |

### Key Pages

| Feature | Admin Path | Tenant Path |
|---------|------------|-------------|
| Dashboard | /admin/dashboard | /tenant/dashboard |
| Bookings | /admin/booking | — |
| Tenants | /admin/tenant | — |
| Invoices | /admin/invoice | /tenant/invoice |
| Units | /admin/unit | — |
| Settings | /admin/settings | — |
| Rooms | /kamar | — |

### Status Colors

| Item | PENDING | CONFIRMED/ACTIVE | OVERDUE/CANCELLED | PAID/COMPLETED |
|------|---------|------------------|-------------------|----------------|
| Booking | Yellow | Blue | Red | Green |
| Invoice | Yellow | — | Red | Green |
| Unit | — | Green (Occupied) | Orange (Maintenance) | — |

---

## Appendix: Cron Job Endpoints

For testing automation features:

| Endpoint | Purpose | Frequency |
|----------|---------|-----------|
| `/api/cron/invoice-reminder` | Send payment reminders | Daily |
| `/api/cron/overdue-check` | Mark overdue invoices | Daily |
| `/api/cron/vacancy-alert` | Weekly vacancy report | Weekly |

> These endpoints are typically called by external schedulers (Vercel Cron, GitHub Actions, etc.) but can be manually tested.

---

*End of User Guide*
