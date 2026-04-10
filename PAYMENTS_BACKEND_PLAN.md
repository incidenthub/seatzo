# Payments Backend Plan

This document is the implementation plan for Person C's payments backend in TicketFlow.

Goal:

- Complete the payments backend before frontend work begins
- Build it for high scalability, high performance, and safe payment processing
- Keep the design practical for a two-week delivery window

## 1. Backend Objective

The payments backend must reliably support:

- payment intent creation
- duplicate request safety through idempotency
- secure Stripe webhook handling
- booking confirmation on payment success
- seat release on payment failure
- refunds
- fast status reads

The backend should be designed so it can scale horizontally with minimal changes.

## 2. Recommended Technology Stack

Use this stack for the payments backend:

- Runtime: `Node.js`
- API framework: `Express`
- Database: `MongoDB`
- ODM: `Mongoose`
- Cache and coordination: `Redis`
- Job queue: `BullMQ`
- Payment gateway: `Stripe Payment Intents`
- Logging: `Pino`
- Observability: `OpenTelemetry`
- Validation: `Joi` or `Zod`
- Load testing: `k6`

## 3. Why This Stack

### Node.js + Express

- Fast to build with in your current project
- Easy to scale horizontally behind a load balancer
- Good fit for I/O-heavy APIs like payment processing

### MongoDB + Mongoose

- Fits the existing project architecture
- Good enough for transactional payment-related state if indexes are designed correctly
- Mongoose gives schema validation and indexed query support

### Redis

- Fast coordination layer for lock release and short-lived state
- Also supports queueing infrastructure through BullMQ

### BullMQ

- Useful for async side effects like emails, reconciliation, and retryable background work
- Prevents webhook requests from becoming slow

### Stripe Payment Intents

- Modern Stripe flow for payment handling
- Supports safer retry behavior and better real-world card flows than legacy Charges APIs

## 4. Core System Design

The payments backend should be built as a stateless API layer with a persistent database and async workers.

Architecture:

- API server handles request validation, auth, payment creation, and webhook verification
- MongoDB stores payment and booking state
- Redis supports lock coordination and async jobs
- BullMQ workers handle slow side effects
- Stripe handles card processing and sends webhook events

High-level flow:

1. Client sends `bookingId` and `idempotencyKey`
2. API checks for an existing payment by `idempotencyKey`
3. If found, API returns the existing result immediately
4. If not found, API calculates the amount on the server
5. API creates a Stripe Payment Intent
6. API stores the Payment record in MongoDB
7. Stripe sends webhook events
8. Webhook handler confirms or fails the booking
9. Slow side effects are pushed to workers

## 5. Folder Structure

Recommended backend structure:

```text
server/src/
  app.js
  server.js
  config/
    env.js
    db.js
    redis.js
    stripe.js
    logger.js
    telemetry.js
  controllers/
    paymentController.js
    webhookController.js
  middleware/
    auth.js
    errorHandler.js
    requestId.js
  models/
    Payment.js
    Booking.js
    Event.js
    Seat.js
  routes/
    paymentRoutes.js
    webhookRoutes.js
  services/
    paymentService.js
    paymentIntentService.js
    paymentStateService.js
    bookingConfirmationService.js
    refundService.js
  queues/
    paymentEventsQueue.js
    notificationQueue.js
  workers/
    paymentEventWorker.js
    reconciliationWorker.js
  utils/
    appError.js
    asyncHandler.js
    constants.js
    validators.js
```

## 6. Data Model Plan

### Payment Schema

Recommended fields:

- `booking`
- `user`
- `amount`
- `currency`
- `status`
- `stripePaymentIntentId`
- `stripeChargeId`
- `stripeClientSecret`
- `idempotencyKey`
- `failureReason`
- `refundId`
- `webhookEvents`
- `createdAt`
- `updatedAt`

### Payment Status Enum

- `INITIATED`
- `SUCCESS`
- `FAILED`
- `REFUNDED`

### Required Indexes

Use these indexes at minimum:

```js
PaymentSchema.index({ idempotencyKey: 1 }, { unique: true });
PaymentSchema.index({ stripePaymentIntentId: 1 }, { unique: true });
PaymentSchema.index({ booking: 1 });
PaymentSchema.index({ user: 1, status: 1 });
```

Why these indexes matter:

- `idempotencyKey` prevents duplicate charge creation and makes retries fast
- `stripePaymentIntentId` makes webhook lookups fast
- `booking` supports booking-linked payment reads
- `user + status` helps dashboard and payment history queries

## 7. API Design

The payments backend should expose these routes first.

### `POST /api/payments/create`

Purpose:

- create a new payment intent
- return an existing one if the same idempotency key was already used

Request body:

```json
{
  "bookingId": "booking_id",
  "idempotencyKey": "uuid-v4"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "paymentId": "payment_id",
    "clientSecret": "pi_secret_xxx",
    "status": "INITIATED",
    "amount": 25000,
    "currency": "inr"
  }
}
```

Processing steps:

1. Validate auth
2. Validate request payload
3. Check existing payment by `idempotencyKey`
4. Return existing result immediately if found
5. Load booking
6. Verify booking belongs to current user
7. Calculate live amount on the server
8. Create Stripe Payment Intent
9. Save Payment document
10. Link booking to payment
11. Return `clientSecret`

### `GET /api/payments/:id/status`

Purpose:

- return payment status quickly from MongoDB

Response should include only necessary fields:

- payment id
- booking id
- status
- amount
- currency

Important rule:

- do not call Stripe from this endpoint

### `POST /api/payments/:id/refund`

Purpose:

- issue a refund safely

Processing steps:

1. Validate auth and authorization
2. Ensure payment is refundable
3. Call Stripe refund API
4. Update payment to `REFUNDED`
5. Update booking state
6. Release seats safely
7. Trigger async side effects if needed

### `POST /api/webhooks/stripe`

Purpose:

- securely handle Stripe events

Important rules:

- must use `express.raw({ type: 'application/json' })`
- must verify webhook signature
- must reject invalid signature immediately
- must process events idempotently

Primary events to support:

- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- optionally `charge.refunded`

## 8. Service Layer Design

Keep controllers thin and move logic into services.

### `paymentService.js`

Responsible for:

- idempotency lookup
- booking ownership validation
- amount calculation
- payment persistence

### `paymentIntentService.js`

Responsible for:

- Stripe Payment Intent creation
- Stripe-specific request shaping

### `paymentStateService.js`

Responsible for:

- consistent payment status transitions
- retry-safe success or failure updates

### `bookingConfirmationService.js`

Responsible for:

- booking confirmation on successful payment
- seat booking updates
- lock release coordination
- event seat count updates

### `refundService.js`

Responsible for:

- Stripe refund creation
- refund validation
- payment and booking updates
- seat release after refund

## 9. State Transition Rules

### Payment State Machine

```text
INITIATED -> SUCCESS
INITIATED -> FAILED
SUCCESS -> REFUNDED
```

### Booking State Machine

```text
PENDING -> CONFIRMED
PENDING -> FAILED
CONFIRMED -> REFUNDED
```

Rules:

- Never move `SUCCESS` back to `INITIATED`
- Webhook retries must not apply success logic twice
- Refunds should only be allowed from valid prior states
- Final states should be idempotent

## 10. Performance Design

To make the payments backend high-performance:

- Use unique indexes on hot lookup fields
- Return existing idempotent results before calling Stripe
- Use `.lean()` for read-only queries
- Use `.select()` to fetch only needed fields
- Avoid large or repeated `.populate()` calls in hot paths
- Keep webhook requests short
- Avoid doing slow work inside controllers
- Move slow side effects to BullMQ workers

### Hot Path Optimization Rules

For `POST /payments/create`:

- do input validation early
- do idempotency lookup first
- avoid unnecessary DB reads
- avoid duplicate writes if record already exists

For `POST /webhooks/stripe`:

- verify signature first
- reject invalid events immediately
- keep success and failure handlers deterministic
- do not send emails directly in the webhook request

For `GET /payments/:id/status`:

- read from DB only
- return minimal fields
- keep it read-optimized

## 11. Scalability Design

To make the system scalable:

- Keep API servers stateless
- Scale API instances horizontally
- Run queue workers separately from API servers
- Use Redis for async job coordination
- Make payment creation safe under retries
- Make webhook handling safe under duplicate event delivery
- Keep all final transitions idempotent

### What Must Be Safe Under Scale

- same user retrying payment request multiple times
- Stripe retrying the same webhook event
- multiple API instances running at once
- multiple worker instances processing different jobs

## 12. Queue and Worker Strategy

Use BullMQ for background jobs.

Suggested queues:

- `payment-events`
- `notifications`
- `reconciliation`

Use workers for:

- booking confirmation emails
- audit logs
- retryable side effects
- periodic reconciliation checks if needed

Do not use workers for:

- the primary payment state change itself
- webhook signature verification

The core payment state change should happen synchronously and safely. The slow extras should happen asynchronously.

## 13. Reliability and Safety Rules

The backend must follow these safety rules:

- Never trust the frontend for price calculation
- Never confirm bookings from frontend success alone
- Only confirm bookings from verified Stripe webhook success
- Always verify booking ownership before creating payment
- Always verify webhook signature before processing event
- Ensure duplicate idempotency keys do not create duplicate Stripe intents
- Ensure duplicate webhook events do not duplicate booking updates

## 14. Observability and Monitoring

Add these from the start:

- structured logs with `Pino`
- request IDs on incoming requests
- error logging with enough context
- webhook event logs
- payment lifecycle logs
- traces and metrics with `OpenTelemetry`

Track at least:

- payment creation latency
- duplicate idempotency hit rate
- webhook processing latency
- refund latency
- payment success rate
- payment failure rate

## 15. Two-Week Build Plan

### Week 1

1. Finalize contracts and schema
2. Implement `stripe.js`
3. Create or finalize `Payment` model
4. Add required indexes
5. Implement `POST /api/payments/create`
6. Implement `GET /api/payments/:id/status`
7. Harden idempotency behavior

### Week 2

1. Implement webhook route with raw body
2. Implement webhook controller and signature verification
3. Implement success flow
4. Implement failure flow
5. Implement refund flow
6. Add BullMQ workers for slow side effects
7. Run load and retry tests
8. Finalize logging and observability

## 16. Testing Plan

### Functional Tests

- create payment with valid booking
- create payment with invalid booking owner
- create payment twice with same idempotency key
- process successful payment webhook
- process failed payment webhook
- refund successful payment

### Reliability Tests

- retry the same idempotency key multiple times
- replay the same webhook event multiple times
- test refund duplicate handling
- test invalid webhook signatures

### Performance Tests

Use `k6` for:

- repeated `POST /api/payments/create`
- duplicate request bursts using same `idempotencyKey`
- concurrent status checks
- webhook retry simulation

## 17. Deployment Shape

Production deployment should have:

- one or more API instances
- one or more worker instances
- MongoDB deployment
- Redis deployment
- Stripe webhook pointed at the API

Recommended pattern:

- API and workers are separate processes
- API stays stateless
- workers handle slow side effects

## 18. Definition Of Done

The payments backend is complete when:

- `POST /api/payments/create` works
- `GET /api/payments/:id/status` works
- `POST /api/payments/:id/refund` works
- `POST /api/webhooks/stripe` works securely
- idempotency is verified
- payment success flow works end to end
- payment failure flow works end to end
- refund flow works end to end
- required indexes are present
- logging is in place
- basic performance and retry testing is complete

Only after this point should frontend development begin.
