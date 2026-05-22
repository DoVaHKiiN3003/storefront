# STOREV2 — Storefront Overhaul

## Overview

Complete reimagining of a ceramic/design storefront web app. This branch introduces **12 new major features** across **40+ files**, including a full database-backed backend (Prisma + SQLite), customer accounts, blog CMS, inventory management, reviews moderation, multi-currency support, image uploads, CSV export, real-time SSE updates, rate limiting, email notifications, and admin management UI.

**Branch:** `storefront-v2`  
**Deployed at:** [https://storefront-kappa-jet.vercel.app](https://storefront-kappa-jet.vercel.app)

---

## New API Routes

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/products` | GET | List all products (with optional search/filter) |
| `/api/products/[slug]` | GET | Single product by slug |
| `/api/orders` | GET, POST | List orders (with pagination, status filter, customer filter via `?my=true`); create order |
| `/api/orders/[id]` | GET, PATCH | Get single order; update status (sends email notification) |
| `/api/send-confirmation` | POST | Send order confirmation email via Resend |
| `/api/create-payment-intent` | POST | Create Stripe PaymentIntent (mock fallback in dev) |
| `/api/coupons/validate` | POST | Validate coupon code against DB |
| `/api/admin/dashboard` | GET | Aggregated analytics (revenue, orders, top products, page views) |
| `/api/admin/products` | GET, POST | List and create products |
| `/api/admin/products/[id]` | PUT | Update product |
| `/api/admin/orders/sse` | GET | Server-Sent Events for real-time order updates |
| `/api/admin/inventory` | GET, PATCH | List inventory (with low-stock filter); update stock |
| `/api/admin/reviews` | GET, POST | List reviews (with status filter); create review |
| `/api/admin/reviews/[id]` | PATCH, DELETE | Approve/reject review; delete review |
| `/api/auth/register` | POST | Customer registration with SHA-256 + salt password hashing |
| `/api/auth/login` | POST | Customer login with session token generation |
| `/api/auth/session` | GET | Verify session token and return user data |
| `/api/blog` | GET, POST | List blog posts (with pagination, published filter); create post |
| `/api/blog/[slug]` | GET, PATCH, DELETE | Get/edit/delete blog post |
| `/api/currencies` | GET, POST | List currencies; upsert currency rate |
| `/api/upload` | POST | File upload (image validation, 5MB limit, local storage) |
| `/api/export/orders` | GET | CSV export of orders (with date range filter) |
| `/api/export/products` | GET | CSV export of products with analytics data |

---

## Database Schema (Prisma + SQLite)

**File:** `prisma/schema.prisma`

### Models

| Model | Key Fields | Purpose |
|-------|-----------|---------|
| `Product` | id, slug, name, price, category, stock, isFeatured | Core product catalog |
| `ProductVariant` | label, type (size/color), priceDelta, color, stock | Product options |
| `Order` | email, total, status, shipping address fields, couponCode | Customer orders |
| `OrderItem` | productId, name, price, quantity, variant | Line items |
| `Customer` | email, name | Guest customer tracking |
| `CustomerAccount` | email, name, password (hashed), sessionToken | Registered customer accounts |
| `Review` | productId, customerId, rating (1-5), title, comment, status (pending/approved/rejected) | Product reviews |
| `Coupon` | code, type (percentage/fixed), value, maxUses, usedCount, isActive | Discount codes |
| `AnalyticsEvent` | name, params, path, sessionId | Client-side event tracking |
| `PageView` | path, title, sessionId | Page view logging |
| `ProductAnalytics` | productId, views, addToCarts, purchases, revenue | Per-product analytics |
| `CmsPage` | slug, title, content, type (hero/about/faq/page), isPublished | CMS content |
| `BlogPost` | slug, title, excerpt, content, coverImage, author, tags, isPublished, sortOrder | Blog/news content |
| `UploadedFile` | filename, url, mimeType, size | File upload tracking |
| `CurrencyRate` | code, name, symbol, rateToUSD | Multi-currency support |
| `Setting` | key, value | Admin key-value store |
| `CartItem` | productId, name, price, quantity, variant, sessionId | Ephemeral cart analytics |
| `Account` | email, password, role | Admin accounts |

### Seed Data (`prisma/seed.ts`)

- 5 products with variants and analytics rows
- 6 default settings (store name, shipping rates, tax rate)
- 3 CMS pages (hero banner, about, FAQ)
- 1 sample coupon (`WELCOME10` — 10% off)
- 6 currencies (USD, EUR, GBP, JPY, CAD, AUD)
- 3 blog posts with full HTML content
- 5 sample reviews (4 approved, 1 pending)

---

## Customer Accounts (`/login`, `/register`, `/account`)

### Authentication Flow
- **Registration** (`POST /api/auth/register`): SHA-256 + salt password hashing, session token generation, httpOnly cookie + localStorage token
- **Login** (`POST /api/auth/login`): Password verification, session rotation, rate-limited (10 req/min per IP)
- **Session** (`GET /api/auth/session`): Bearer token verification
- **Rate limiting**: 5 req/min for registration, 10 req/min for login — in-memory token bucket with `X-RateLimit-*` headers

### Pages
- **`/login`** — Styled form with email/password, show/hide password toggle, error handling, loading state, link to register
- **`/register`** — Full name + email + password form, validation (min 8 chars, email format), duplicate email detection
- **`/account`** — Profile card, order count, filtered order history (scoped to logged-in user via `?my=true` + Bearer token), sign-out button, quick links

### Navigation
- Nav bar dynamically shows **User icon** (→ `/account`) or **LogIn icon** (→ `/login`) based on `localStorage` session
- Re-checks auth state on route change via `usePathname`

---

## Admin Panel (`/admin`)

**File:** `src/app/admin/page.tsx` (+700+ lines)

### 8 Tabs

| Tab | Component | Features |
|-----|-----------|----------|
| **Overview** | Inline | KPI cards (page views, add-to-cart, conversions, revenue), events chart, traffic source, most-viewed pages, conversion funnel, quick stats |
| **Events** | Inline | Real-time event feed with color-coded event types, paginated, auto-refresh every 5s |
| **Products** | Inline | Product performance table (views, cart, wishlist, purchases, revenue, conversion rate) |
| **Orders** | Inline | Order table with customer info, items, status badges, dropdown status transitions (pending→confirmed→shipped→delivered), CSV export button, auto-refresh |
| **Inventory** | `InventoryTab.tsx` | Summary cards (total/low/out-of-stock), search, inline stock editing with save/cancel |
| **Reviews** | `ReviewsTab.tsx` | Status filter tabs (pending/approved/rejected), search, approve/reject/delete actions |
| **Blog** | `BlogTab.tsx` | CRUD form with slug, title, excerpt, HTML content, cover image, tags, publish toggle; list with edit/delete/publish toggle |
| **Currencies** | `CurrenciesTab.tsx` | Add/edit currency form (code, name, symbol, rate-to-USD), table with all currencies, refresh button |

### Key Features
- **Auto-refresh**: Dashboard and orders auto-refresh every 5 seconds
- **CSV export**: Download orders CSV from the Orders tab header
- **Order status management**: Dropdown transitions with icons (confirm, ship, deliver, cancel)
- **Real-time analytics**: Client-side event tracking via `analyticsStore.ts`
- **Dark mode support**: All admin components respect the theme

---

## Blog / News System

### API
- **`GET /api/blog`** — List posts with pagination (`limit`, `offset`), published filter, tag filter
- **`POST /api/blog`** — Create post with slug uniqueness check
- **`GET/PATCH/DELETE /api/blog/[slug]`** — Read, update, delete blog posts

### Public Pages
- **`/blog`** — Card grid layout with cover images, tags, excerpts, date, hover effects, loading skeleton, empty state
- **`/blog/[slug]`** — Full article page with tags, title, excerpt, cover image, author, dates, HTML content rendered via `dangerouslySetInnerHTML`, loading skeleton, 404 state

### Admin
- Full CRUD form in the Blog tab with edit/create modes
- Publish/draft toggle with visual badge
- Tag management (comma-separated input)
- Cover image URL field

---

## Inventory Management

### API (`/api/admin/inventory`)
- **GET** — List all products with stock levels, low-stock flag (threshold configurable), out-of-stock flag, variant stock totals, purchases count; optional `?lowStock=true` filter
- **PATCH** — Update stock level for a product

### Admin UI (`InventoryTab.tsx`)
- Summary cards: Total products, low stock count, out of stock count, threshold
- Search/filter: Text search + All/Low Stock toggle
- Inline stock editing: Click edit icon → number input → save/cancel
- Visual indicators: Amber warning for low stock, red for out of stock
- Product thumbnails, price display, variant stock totals

---

## Reviews Moderation

### API
- **`GET /api/admin/reviews`** — List reviews with product info, status filter, pagination
- **`POST /api/admin/reviews`** — Create review (rating 1-5, product validation, status defaults to "pending")
- **`PATCH /api/admin/reviews/[id]`** — Update review status (pending → approved/rejected)
- **`DELETE /api/admin/reviews/[id]`** — Delete review

### Admin UI (`ReviewsTab.tsx`)
- Status filter tabs with counts: Pending (with badge), Approved, Rejected, All
- Search across reviewer name, product name, and comment text
- Per-review actions: Approve, Reject, Delete (with confirm dialog)
- Visual state badges: Approved (green), Rejected (red), Pending (with action buttons)
- Star rating display, product name, date, email

---

## Multi-Currency Support

### API (`/api/currencies`)
- **GET** — List all currencies ordered by code
- **POST** — Create or update (upsert) currency rate by code

### Admin UI (`CurrenciesTab.tsx`)
- Add/edit currency form with Code (auto-uppercase, max 3 chars), Name, Symbol, Rate to USD fields
- Currency table: Code, Name, Symbol, Rate (4 decimal places), Updated date, Edit button
- Refresh button to reload from server

### Seed Data
6 currencies pre-seeded: USD (1.0), EUR (0.92), GBP (0.79), JPY (151.5), CAD (1.36), AUD (1.53)

---

## Image Uploads

### API (`POST /api/upload`)
- Accepts multipart/form-data with a `file` field
- Validates file type: JPEG, PNG, WebP, GIF, SVG only
- Enforces 5MB file size limit
- Saves to `public/uploads/` directory with unique timestamped filenames
- Tracks uploads in the `UploadedFile` database table
- Returns the public URL and original filename

---

## Rate Limiting

**File:** `src/app/api/middleware.ts`

- In-memory token bucket implementation (configurable `maxRequests` per `windowMs`)
- Standard `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` headers
- Automatic stale entry cleanup every 5 minutes
- Applied to auth routes: 10 req/min for login, 5 req/min for registration

---

## Email Notifications

### Order Status Changes (`/api/orders/[id]`)
- When an order status is updated (confirmed, shipped, delivered, cancelled), a status email is sent via Resend
- Non-blocking — the order update succeeds even if email fails
- Includes: order number, status-specific message, item summary, total
- Gracefully skips if `RESEND_API_KEY` is not configured

### Order Confirmation (`/api/send-confirmation`)
- Full HTML email with order items, summary, and shipping address
- Uses `@react-email/render` to pre-render React templates

---

## Server-Side Pagination

Orders and blog API routes support `limit` and `offset` query parameters:
- Orders default: `limit=50`, max `200`
- Blog default: `limit=20`, max `50`
- All list endpoints return `total`, `limit`, and `offset` for client-side pagination UI

---

## CSV Export

### Orders Export (`/api/export/orders`)
- Filters: `?status=pending` and `?days=30` (default 90, max 365)
- Columns: Order ID, Date, Status, Customer Name, Email, Items, Subtotal, Shipping, Tax, Total, Coupon, Ship City, Ship State
- Proper CSV quoting with `"` escaping
- Content-Disposition header with dated filename

### Products Export (`/api/export/products`)
- Columns: ID, Name, Slug, Category, Price, Stock, Featured, Views, Add to Carts, Purchases, Revenue, Variant Count, Created
- Includes product analytics data
- Sorted alphabetically by name

---

## Real-Time Order Updates (SSE)

**Endpoint:** `GET /api/admin/orders/sse`

- Server-Sent Events stream for real-time dashboards
- Polls for new orders every 3 seconds
- Sends heartbeat messages every 10 seconds
- Includes full order data (items, customer info)
- Proper SSE headers: `Content-Type: text/event-stream`, `Cache-Control: no-cache`
- Cleanup on client disconnect
- Auth check via `ADMIN_SSE_TOKEN` env var (dev mode bypass)

---

## New Pages

### Authentication
| Page | Route | Features |
|------|-------|----------|
| Login | `/login` | Email/password form, show/hide password, rate-limited, redirects to home |
| Register | `/register` | Full name + email + password, validation, duplicate detection, auto-login |
| Account | `/account` | Profile card, order count, filtered order history with thumbnails, sign-out |

### Blog
| Page | Route | Features |
|------|-------|----------|
| Blog | `/blog` | Card grid, cover images, tags, excerpts, skeleton loading, empty state |
| Blog Post | `/blog/[slug]` | Full article, HTML content, author, dates, share link, 404 state |

---

## New Admin Components (`src/app/admin/components/`)

| Component | Purpose |
|-----------|---------|
| `InventoryTab.tsx` | Stock management with search, filter, inline editing, summary cards |
| `ReviewsTab.tsx` | Review moderation with approve/reject/delete, status filters |
| `BlogTab.tsx` | Blog post CRUD with form, publish toggle, tag management |
| `CurrenciesTab.tsx` | Currency rate management with add/edit form and table |

---

## New Dependencies

**`package.json` additions (second batch):**
- `@prisma/client` ^7.8.0 — Database ORM
- `@prisma/adapter-better-sqlite3` ^7.8.0 — SQLite adapter
- `better-sqlite3` ^12.10.0 — SQLite driver
- `prisma` ^7.8.0 (dev) — Schema management
- `tsx` ^4.22.3 (dev) — TypeScript execution for seeds
- `dotenv` ^17.4.2 — Environment variable loading
- `@stripe/stripe-js` ^9.6.0 — Stripe frontend SDK
- `@stripe/react-stripe-js` ^6.4.0 — Stripe React components
- `stripe` ^22.1.1 — Stripe backend SDK
- `vitest` ^4.1.7 (dev) — Unit testing
- `@testing-library/react` ^16.3.2 — React testing utilities
- `@testing-library/jest-dom` ^6.9.1 — DOM matchers
- `jsdom` ^29.1.1 — DOM environment for tests

---

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | Prisma datasource (`file:./dev.db`) |
| `RESEND_API_KEY` | No | Email delivery (order confirmations + status updates) |
| `STRIPE_SECRET_KEY` | No | Stripe payment processing |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | No | Stripe frontend key |
| `ADMIN_SSE_TOKEN` | No | SSE endpoint authentication |

---

## Git Branch

```bash
git checkout storefront-v2
```

### Key Commits
```
7ff43fe fix: use @react-email/render for email template rendering
623f7f0 chore: trigger fresh vercel build for env vars
7f68ff7 Storefront v2: checkout, reviews, wishlist, dark mode, 404, about, toasts, zoom, scroll-to-top, recently viewed, performance
```

### Uncommitted Work (this session — 12 new features)
- **Prisma schema**: CustomerAccount, Review, BlogPost, UploadedFile, CurrencyRate models
- **Customer accounts**: Register, Login, Session API + pages
- **Blog CMS**: Blog API + admin tab + public pages
- **Inventory management**: API + admin tab with stock editing
- **Reviews moderation**: API + admin tab with approve/reject/delete
- **Multi-currency**: API + admin tab with rate management
- **Image uploads**: API with file validation
- **Rate limiting**: In-memory token bucket middleware
- **Email notifications**: Order status change emails via Resend
- **CSV export**: Orders and products export endpoints
- **SSE**: Real-time order updates endpoint
- **Server-side pagination**: Orders and blog list endpoints
- **Seed data**: Currencies, blog posts, sample reviews
- **Data fixes**: .env with DATABASE_URL, migration applied, account orders scoping fix
