# CHANGELOG.md — Property Booking Platform (04)

All notable changes to this project are documented in this file.

---

## [1.4.0] — 2026-07-09

### Sprint 1-5 Complete

#### Foundation (1.0.0)
- Next.js 16 + TypeScript + App Router
- Tailwind CSS v4 + shadcn/ui (17 components)
- Prisma 7 + PostgreSQL + pg adapter
- NextAuth.js (admin/owner + tenant credentials)
- Core libs: prisma, auth, supabase, wa, booking, invoice
- Admin layout: Sidebar + Header
- Dashboard with stats cards + unit table + alerts
- Full CRUD: Units, Bookings, Tenants, Invoices, Alerts
- Public web: Landing, Room list, Room detail, Booking form
- Tenant portal: Dashboard, Invoice list, Invoice detail
- Cron jobs: invoice reminder, overdue check, vacancy alert
- WA notifications via Fonnte
- Seed data script

#### Public Web Polish (1.1.0)
- PhotoGallery with carousel, thumbnails, fullscreen, swipe support
- AvailabilityCalendar with booked dates visualization
- Enhanced booking form validation (phone, email, date)
- Mobile responsive improvements

#### Invoice Detail + Payment (1.2.0)
- Tenant invoice detail page with upload proof
- Admin invoice detail page with confirm/reject
- Supabase Storage for payment proofs
- WA notification on confirm/reject

#### Tenant Portal Polish (1.3.0)
- Payment history page with yearly grouping
- Account settings page
- Improved dashboard UX with stats

#### Dashboard Charts + Export (1.4.0)
- Revenue bar/line chart with period toggle
- Occupancy pie chart with status distribution
- Analytics API endpoint
- Export invoices/tenants to CSV

---

## [1.8.0] — 2026-07-13

### Property Info Wiring Complete
- **Informasi Properti fields now functional:**
  - Property name → sidebar, headers, emails
  - Phone → contact cards, email footer
  - Email → Reply-to for all outgoing emails
  - Address → email footer, booking confirmation
  - Operational hours → contact sections

### Email System Enhanced
- All emails now include property contact info in footer
- Reply-to header set to property email
- Bank transfer instructions in invoice emails
- 8 email functions updated with consistent template

### Settings Page Improvements
- Test notification buttons (WhatsApp + Email)
- Real-time notification settings verification
- Owner phone/email display in test results

### Public Pages Enhanced
- Contact info cards added to booking confirmation page
- Tenant invoice detail includes property contact section

### New Files
- `USER-GUIDE.md` — Comprehensive demo testing guide
- `AdminSidebarWrapper.tsx` — Server component for dynamic property name
- `PropertyContactCard.tsx` — Reusable contact info component
- `src/lib/property.ts` — Property info utilities with caching

---

## [1.5.0] — Sprint 6: Final Polish (2026-07-11)

### Added
- `web/DESIGN-AUDIT.md` — Comprehensive design & system audit report
- `web/ARCHITECTURE.md` — System architecture diagram (Mermaid)

### Completed
- Design token generation from brand colors (#D4A853 gold accent)
- WCAG 2.2 contrast audit across all color tokens
- Architecture analysis with dependency health check
- Accessibility scan (79 files, 0 critical issues)

### Accessibility Fixes Applied
- Fixed amber text contrast: amber-700 → amber-800 (1.72:1 → 4.85:1)
- Fixed emerald/green text contrast: emerald-700 → emerald-800 (3.0:1 → 5.29:1)
- Created centralized design tokens at `src/lib/design-tokens.ts`
- Updated status badges across all components

### Planned
- [ ] Email notifications
- [ ] Performance optimization

---

## [Unreleased] — Development

### Admin Panel Redesign (2026-07-11)
- **AdminSidebar:** Complete redesign with modern dark theme, section organization (Dashboard, Operasional, Manajemen), amber gradient for active items
- **AdminHeader:** Enhanced with breadcrumbs, global search bar, notification dropdown, quick action buttons
- **DashboardCards:** Enhanced with trend indicators, sparklines, progress bars for occupancy target
- **UnitListClient:** Changed to card layout with grid/list toggle, new UnitCard component
- **TenantListClient:** Changed to card layout with avatar, payment status, quick contact buttons
- **New Components:**
  - `ui/TrendBadge.tsx` - Trend indicator badge
  - `ui/MiniSparkline.tsx` - SVG sparkline chart
  - `ui/StatsCardSkeleton.tsx` - Loading skeleton for stats
  - `ui/AdminEmptyState.tsx` - Consistent empty state with illustrations
  - `UnitCard.tsx` - Unit card component
  - `TenantCard.tsx` - Tenant card component with contact actions

### Admin Booking Redesign (2026-07-11)
- **Complete Kanban-style board** with 4 status columns (PENDING → CONFIRMED → CHECKED_IN → COMPLETED)
- **New BookingCard component** with inline confirm/reject actions, urgency indicators
- **New BookingColumn component** for status swimlanes
- **New BookingDetailDrawer** with full guest contact, timeline, quick actions
- **New BookingQuickActions** with urgent banner, stats tabs
- **Enhanced search & filter** with today/urgent filters

