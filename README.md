# ASIAPLAST — Global B2B Export Portal

ASIAPLAST is an enterprise-grade international B2B showcase and RFQ (Request for Quotation) engine for wholesale garbage bags, industrial bin liners, and private-label OEM manufacturing.

- **Production Domain**: `https://asiaplast.web.app`
- **Firebase Project**: `ajansonline` (Europe West 1)
- **Framework**: Next.js 14 (App Router) + Tailwind CSS + Firebase Admin SDK

---

## Key Architecture & Features

1. **5 Supported Locales**:
   - English (unprefixed: `/`, `/products`, …)
   - Turkish (`/tr`)
   - German (`/de`)
   - French (`/fr`)
   - Arabic (`/ar` with automatic RTL layout switching)
   - `/en` and `/en/...` redirect (308) to the unprefixed path.

2. **Full Product Showcase & Dynamic Catalog**:
   - Product catalog with 8 categories & technical spec sheets (microns, tensile strength, seal types, ASTM/EN standards).
   - Dedicated pages: `/products`, `/products/[slug]`, `/quote`, `/contact`, `/about`, `/export`, `/private-label`, `/knowledge`, `/faq`, `/privacy`, `/terms`.

3. **Enterprise RFQ Engine & Contact Desk**:
   - End-to-end multi-step RFQ form with container calculation heuristics (20ft, 40ft HQ), incoterms (FOB, CIF, CFR, EXW), and sample requests.
   - Dual-tier rate limiting (burst + hourly sliding window) and anti-spam heuristics.
   - Server-side writes using Firebase Admin SDK (client Firestore writes are strictly prohibited by security rules).

4. **Zero-Client-Storage Policy**:
   - Strict zero usage of `localStorage`, `sessionStorage`, or `IndexedDB`.
   - Verified via automated verification tool: `npm run check:storage`.

5. **Central Command Admin Portal (`/admin`)**:
   - Server-side HttpOnly HMAC-SHA256 cookie session (`__session`, the only cookie name Firebase Hosting forwards to the backend).
   - Real-time interactive dashboard: quotation management, status workflow (`new`, `reviewing`, `answered`, `converted`, `closed`), message inquiries, search, and CSV export.
   - Admin API routes return `401` when unauthenticated, `400` for invalid status values and `403` for cross-origin state-changing requests.
   - Protected behind `/admin/login` using credentials configured via environment variables.

---

## Getting Started

### 1. Prerequisites
- Node.js 18.17+ or Node.js 20+
- npm or pnpm

### 2. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your variables (never commit real secrets):
```env
NEXT_PUBLIC_SITE_URL=https://asiaplast.web.app
ADMIN_EMAIL=
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=
```

Generate `ADMIN_SESSION_SECRET` with at least 32 characters, for example:
`node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`

### 3. Development Server
Run the local dev server:
```bash
npm run dev
```
Visit:
- Showcase: [http://localhost:3000](http://localhost:3000)
- RFQ Engine: [http://localhost:3000/quote](http://localhost:3000/quote)
- Admin Portal: [http://localhost:3000/admin](http://localhost:3000/admin)

### 4. Build & Verification
```bash
# Type check
npm run typecheck

# Zero storage verification
npm run check:storage

# Production build
npm run build
```

---

## Deployment to Firebase

Deploying hosting & Cloud Functions backend to Firebase:
```bash
firebase deploy --only hosting
```
Or deploy full infrastructure:
```bash
firebase deploy
```
