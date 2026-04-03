# TicketFlow — Product Requirements Document

**Version:** 1.0  
**Stack:** MERN · Redis · Stripe · JWT  
**Timeline:** 6 Weeks  
**Team:** 3 Members (Person A · Person B · Person C)

---

## 1. Overview

TicketFlow is a production-grade, backend-heavy event ticketing platform. It solves three real-world engineering problems that traditional ticketing systems fail at: race conditions on seat selection, static pricing despite demand spikes, and unreliable payment flows that cause double charges or data inconsistency.

The project is built to be impressive in backend engineering interviews at product-focused companies. Every system solves a real concurrency or reliability problem — not a tutorial-level CRUD app.

---

## 2. Problem Statement

| Problem | Impact | TicketFlow's Solution |
|---------|--------|-----------------------|
| Multiple users booking the same seat simultaneously | Double bookings, angry customers | Redis SETNX atomic seat locking |
| Static prices even when demand spikes | Lost revenue | Rule-based dynamic pricing engine |
| Payment failures causing data inconsistency | Double charges, orphaned bookings | Idempotency keys + webhook orchestration |
| No audit trail for seat or payment state changes | Debugging nightmare | Full state machine with timestamps |

---

## 3. Target Users

| Role | Description |
|------|-------------|
| **Customer** | Browses events, selects seats, completes payment, views booking history |
| **Organiser** | Creates and manages events, views analytics and revenue per event |
| **Admin** | Platform-wide oversight — manages users, roles, events, and revenue |

---

## 4. Core Features

### 4.1 Authentication System
- Register with email + OTP verification
- Login returns a short-lived access token (15 min) + httpOnly refresh token cookie (7 days)
- Refresh token rotation on every `/auth/refresh` call
- Forgot password and reset password via OTP
- Role-based access control: `customer`, `organiser`, `admin`

### 4.2 Event Management
- Organisers create events with sections (PREMIUM / GOLD / SILVER / GENERAL)
- On event creation, all seat documents are auto-generated in MongoDB
- Events have a lifecycle: `draft → published → cancelled / completed`
- Public event listing with filters: city, category, date, price range, sort
- Pagination on all list endpoints (default 20, max 50 per page)
- Organiser analytics: revenue, occupancy, bookings by date

### 4.3 Seat Locking (Redis)
- Seats locked atomically using Redis `SETNX` with 5-minute TTL
- Lock mirrored in MongoDB (`lockedBy`, `lockExpiresAt`) for UI and cron sync
- Max 6 seats per booking attempt
- Cron job runs every 60 seconds to release expired locks in MongoDB
- Concurrent viewer count tracked via Redis counters per event

### 4.4 Dynamic Pricing Engine
- Price calculated in real-time on every seat map request
- Three independent multipliers combined:
  - **Availability:** occupancy > 60% → 1.2x, > 80% → 1.5x, > 90% → 2.0x
  - **Time:** event < 24hrs away → 1.3x, evening slot (18–22) → 1.2x, weekday morning → 0.9x
  - **Demand:** concurrent viewers above threshold → 1.5x
- Hard cap at 3x base price
- Result cached in Redis for 30 seconds

### 4.5 Payment Orchestration (Stripe)
- Stripe Payment Intents API (not legacy Charges)
- Idempotency key (UUID v4) generated client-side, checked server-side before every Stripe call
- Payment state machine: `INITIATED → SUCCESS / FAILED → REFUNDED`
- Webhook handler with signature verification (`stripe.webhooks.constructEvent`)
- On success: seats marked BOOKED, Redis locks deleted, confirmation email sent, QR code generated
- On failure: seat locks released, booking marked FAILED
- Refund endpoint triggers Stripe refund and frees seats back to AVAILABLE

### 4.6 Admin Panel
- View and manage all users and their roles
- View all events including drafts
- Platform-wide revenue aggregation pipeline

---

## 5. System Architecture

```
React Frontend (Vite + TailwindCSS)
        │
        ▼
Express REST API (Node.js)
        │
   ┌────┴────┐
   ▼         ▼
Redis       MongoDB
(locks,     (users, events,
 cache,      seats, bookings,
 rate limit) payments)
        │
        ▼
     Stripe
(Payment Intents,
 Webhooks, Refunds)
```

**Request lifecycle for a booking:**
1. User opens seat map → `GET /api/events/:id/seats` (increments Redis viewer counter)
2. User clicks seat → `POST /api/seats/lock` (Redis SETNX + MongoDB update)
3. User proceeds → `POST /api/bookings` (validates Redis lock ownership)
4. Payment created → `POST /api/payments/create` (idempotency check → Stripe PI)
5. User pays → Stripe.js `confirmCardPayment` on frontend
6. Stripe fires webhook → `POST /api/webhooks/stripe` (signature verified)
7. Booking confirmed → seats BOOKED, locks deleted, email + QR sent

---

## 6. Data Models

### User
`name · email · password (bcrypt) · role · phone · isVerified · otp · otpExpiresAt`

### Event
`title · description · organiser · venue · city · category · date · totalSeats · availableSeats · basePrice · sections[] · pricingRules · status · posterUrl · tags`

### Seat
`event · seatNumber · row · section · status · lockedBy · lockExpiresAt · booking · price`

### Booking
`user · event · seats[] · totalAmount · status · paymentId · idempotencyKey · confirmedAt · cancelledAt · qrCode`

### Payment
`booking · user · amount · currency · status · stripePaymentIntentId · stripeChargeId · idempotencyKey · failureReason · retryCount · webhookEvents · refundId`

---

## 7. API Surface

### Auth — Person A
| Method | Route | Auth |
|--------|-------|------|
| POST | `/api/auth/register` | None |
| POST | `/api/auth/verify-email` | None |
| POST | `/api/auth/resend-otp` | None |
| POST | `/api/auth/login` | None |
| POST | `/api/auth/refresh` | Cookie |
| POST | `/api/auth/logout` | JWT |
| POST | `/api/auth/forgot-password` | None |
| POST | `/api/auth/reset-password` | None |

### Events — Person A
| Method | Route | Auth |
|--------|-------|------|
| GET | `/api/events` | None |
| GET | `/api/events/:id` | None |
| POST | `/api/events` | Organiser |
| PUT | `/api/events/:id` | Organiser |
| PATCH | `/api/events/:id/publish` | Organiser |
| DELETE | `/api/events/:id` | Organiser |
| GET | `/api/events/:id/analytics` | Organiser |

### Bookings — Person A
| Method | Route | Auth |
|--------|-------|------|
| POST | `/api/bookings` | JWT |
| GET | `/api/bookings` | JWT |
| GET | `/api/bookings/:id` | JWT |
| POST | `/api/bookings/:id/cancel` | JWT |

### Admin — Person A
| Method | Route | Auth |
|--------|-------|------|
| GET | `/api/admin/users` | Admin |
| PATCH | `/api/admin/users/:id/role` | Admin |
| GET | `/api/admin/events` | Admin |
| GET | `/api/admin/revenue` | Admin |

### Seats — Person B
| Method | Route | Auth |
|--------|-------|------|
| GET | `/api/events/:id/seats` | JWT |
| POST | `/api/seats/lock` | JWT |
| DELETE | `/api/seats/lock` | JWT |

### Payments — Person C
| Method | Route | Auth |
|--------|-------|------|
| POST | `/api/payments/create` | JWT |
| GET | `/api/payments/:id/status` | JWT |
| POST | `/api/payments/:id/refund` | JWT |
| POST | `/api/webhooks/stripe` | Stripe Sig |

---

## 8. Folder Structure

```
seatzo/
├── client/
│   └── src/
│       ├── components/        # SeatMap, LivePrice (Person B)
│       ├── pages/             # Login, Register, EventListings, Checkout, Dashboard
│       ├── hooks/             # useSeatPolling (Person B)
│       ├── context/           # AuthContext (Person C)
│       └── utils/             # axios.js with JWT interceptor (Person C)
│
└── server/
    └── src/
        ├── config/            # db.js, email.js, redis.js, stripe.js
        ├── controllers/       # auth, event, booking, admin, seat, payment, webhook
        ├── middleware/        # auth.js, rateLimiter.js, errorHandler.js
        ├── models/            # User, Event, Seat, Booking, Payment
        ├── routes/            # all route files
        ├── services/          # seatLockService, pricingService, bookingConfirmationService
        ├── utils/             # generateSeats.js
        └── workers/           # seatExpiryWorker.js, viewerTracker.js
```

---

## 9. Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TailwindCSS, React Router, Axios, Stripe.js |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Cache / Locking | Redis (Upstash for cloud) |
| Auth | JWT (access + refresh rotation), bcrypt |
| Payments | Stripe Payment Intents, Webhooks |
| Email | Nodemailer + Gmail SMTP |
| Scheduling | node-cron |
| Security | helmet, cors, express-rate-limit |
| Deployment | Railway (backend + Redis + MongoDB), Vercel (frontend) |

---

## 10. 6-Week Build Plan

| Week | Focus | Owner | Deliverable |
|------|-------|-------|-------------|
| 1 | Auth system + monorepo setup | A | Register, login, OTP, JWT middleware |
| 2 | Event CRUD + seat generation | A | Full event API, 200+ seats auto-generated |
| 3 | Redis seat locking + booking creation | A + B | Atomic locking, concurrency test passing |
| 4 | Dynamic pricing + Stripe payments | B + C | Pricing engine, Payment Intent flow, webhooks |
| 5 | React frontend | A + C | Seat map, checkout, dashboards |
| 6 | Polish + deploy | All | Railway + Vercel deploy, README, demo video |

---

## 11. Security Requirements

| Requirement | Priority |
|-------------|----------|
| Passwords hashed with bcrypt (min 12 rounds) | Critical |
| JWT in Authorization header only, refresh in httpOnly cookie | Critical |
| Stripe webhook signature verified before processing | Critical |
| `.env` never committed — `.env.example` in repo | Critical |
| Input validation on all endpoints (Joi / Zod) | High |
| Rate limiting on auth routes (10 requests / 15 min) | High |
| Helmet.js security headers | High |
| CORS restricted to frontend URL only | High |
| Admin routes behind `requireRole('admin')` | High |
| Raw body preserved for Stripe webhook route | High |

---

## 12. Key Engineering Decisions

**Why Redis for seat locking and not MongoDB transactions?**
MongoDB transactions add latency and complexity. Redis `SETNX` is a single atomic operation at the server level — faster, simpler, and the exact pattern used by production ticketing platforms.

**Why refresh token rotation on every call?**
A stolen refresh token becomes useless after one use. The legitimate user's next request rotates it, immediately invalidating the attacker's copy.

**Why idempotency keys on the client side?**
The client generates the UUID before making the request. If the network drops after Stripe charges but before the response arrives, the retry carries the same key and gets the same result — no double charge.

**Why Stripe webhooks instead of relying on the frontend redirect?**
Frontend redirects can fail (tab closed, network drop). Webhooks are server-to-server and are Stripe's guaranteed delivery mechanism. Booking confirmation only happens via webhook — never via frontend signal.

---

*TicketFlow — Build it like a product. Interview like an engineer.* 