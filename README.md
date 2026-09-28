# Mandapam — Wedding Venue Booking Marketplace

A BookMyShow-style multi-venue marketplace for booking marriage plots, banquet halls, party plots, lawns, resorts, and wedding venues across India.

Built with **Next.js 16 + TypeScript + Tailwind CSS 4 + shadcn/ui + Zustand + Recharts**.

## Features

### Customer side
- Hero search by city, event type, date, and guest count
- Browse by venue type (Marriage Plot, Banquet Hall, Party Plot, Lawn, Resort, Wedding Venue)
- Venue listing with full filter sidebar (budget, capacity, indoor/outdoor, parking, catering, decoration, AC, rooms, 17 amenities)
- Sort by price / rating / capacity
- Venue detail page with photo gallery, packages, amenities, reviews
- 45-day availability calendar with weekday/weekend pricing
- 3-step booking flow: Details → Payment (UPI / Card / Net Banking + coupon codes) → Confirmation
- Date auto-locks on confirmed booking
- My Bookings dashboard with status tracking and cancellation
- Compare up to 3 venues side-by-side across 16 dimensions

### Venue-owner side
- KPI dashboard (revenue, upcoming events, active venues, avg rating)
- Revenue bar chart + events-by-type pie chart
- Manage venues (add / edit / delete) with photos, amenities, packages
- Month-view calendar with click-to-block / unblock dates
- Booking management (accept / cancel / complete) with internal notes
- Per-venue package manager
- Earnings & settlements with **tiered commission breakdown**

### Admin panel
- Platform-wide GMV dashboard with area chart
- Venue approval workflow (pending / approved / rejected)
- All-bookings table with inline status editor
- Per-owner commission settlements
- Dispute resolution (open / investigating / resolved)
- Coupon CRUD (flat / percent, min-amount rules)
- Customer directory
- Cross-platform reviews feed
- Reports (bookings per month, venues by city, venues by type, top-rated)

## Tiered commission model

Commission is computed per booking using a two-tier model:

**Tier 1 — Base rate by venue type**

| Venue Type      | Base Rate |
|-----------------|-----------|
| Marriage Plot   | 7%        |
| Party Plot      | 8%        |
| Lawn            | 8%        |
| Banquet Hall    | 10%       |
| Wedding Venue   | 11%       |
| Resort          | 12%       |

**Tier 2 — High-value slab discount** (subtracted from base)

| Booking value            | Discount |
|--------------------------|----------|
| Up to ₹2,00,000          | —        |
| ₹2,00,000 – ₹8,00,000    | −1 pp    |
| ₹8,00,000 – ₹20,00,000   | −2 pp    |
| Above ₹20,00,000         | −3 pp    |

**Floor**: Final rate never drops below **5%**.

The full logic lives in [`src/lib/commission.ts`](src/lib/commission.ts) — pure, testable, no side effects.

## Tech stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 with custom wedding-themed palette (deep maroon + rose-gold)
- **UI**: shadcn/ui (New York style) + Lucide icons
- **State**: Zustand (with `persist` middleware → localStorage)
- **Charts**: Recharts
- **Toasts**: Sonner
- **Animations**: Framer Motion
- **Date utils**: date-fns

## Project structure

```
src/
├── app/
│   ├── globals.css          # Wedding-themed design tokens + utility classes
│   ├── layout.tsx           # Root layout with metadata
│   └── page.tsx             # Single-route SPA router (role-based view switch)
├── components/
│   ├── admin/               # 9 admin views (dashboard, approvals, bookings, commission, disputes, coupons, customers, reviews, reports)
│   ├── booking/             # 3-step booking flow dialog
│   ├── customer/            # 5 customer views (home, browse, venue-detail, my-bookings, compare)
│   ├── owner/               # Owner dashboard + venues + calendar + bookings + packages + earnings
│   ├── site-header.tsx      # Header with role switcher
│   ├── site-footer.tsx      # Footer with city links
│   └── venue-card.tsx       # Shared venue card
└── lib/
    ├── commission.ts        # Tiered commission engine
    ├── seed-data.ts         # 9 realistic Indian wedding venues + bookings + coupons + disputes
    ├── store.ts             # Zustand store with all actions + INR/date formatters
    └── types.ts             # Domain types
```

## Getting started

```bash
# Install deps
bun install

# Run dev server
bun run dev

# Lint
bun run lint

# Push Prisma schema (SQLite by default)
bun run db:push
```

Open http://localhost:3000 — use the role switcher in the top-right to flip between Customer, Venue Owner, and Admin.

## Demo data

The app ships with:
- **9 venues** across 8 Indian cities (Ahmedabad, Udaipur, Jaipur, Pune, Bengaluru, Mumbai, Goa, Surat)
- **5 bookings** in various states (confirmed, pending payment, completed)
- **3 coupons** (`MANDAPAM1000`, `EARLYBIRD10`, `WEDDING5000`)
- **2 disputes** (open + investigating)
- **1 pending venue approval** for testing the admin workflow

All data persists to `localStorage` under the `mandapam-store` key. Clear site data to reset.

## Roadmap

- [ ] NextAuth.js for real customer / owner / admin sessions
- [ ] Razorpay integration for live payments
- [ ] Prisma + PostgreSQL backend (replace in-memory Zustand)
- [ ] S3 / Cloudinary image uploads in owner's Add Venue dialog
- [ ] Twilio / Gupshup WhatsApp + SMS confirmations
- [ ] Map-based search with lat/lng proximity

## License

MIT — feel free to fork, adapt, and deploy.
