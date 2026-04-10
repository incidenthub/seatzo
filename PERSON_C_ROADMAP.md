# Person C Roadmap

This document is the working roadmap for Person C on TicketFlow. It covers the two owned workstreams:

- Payments backend
- Full React frontend

Execution rule:

- Payments backend must be completed first
- Frontend development begins only after the payments backend is finished and verified

It is based on the project docs and team role split in:

- `TicketFlow_Documentation.docx`
- `TicketFlow_Team_Roles .docx`

## 1. Ownership Summary

Person C owns:

- Stripe integration
- Payment idempotency
- Stripe webhook handling
- Booking confirmation and payment failure handling
- Refund flow
- React app setup
- Auth UI integration
- Event browsing UI
- Checkout flow with Stripe Elements
- Booking confirmation and user dashboard pages

Primary owned files:

- `server/src/config/stripe.js`
- `server/src/controllers/paymentController.js`
- `server/src/controllers/webhookController.js`
- `server/src/services/bookingConfirmationService.js`
- `server/src/routes/paymentRoutes.js`
- `server/src/routes/webhookRoutes.js`
- `client/src/main.jsx`
- `client/src/context/AuthContext.jsx`
- `client/src/utils/axios.js`
- `client/src/pages/Register.jsx`
- `client/src/pages/Login.jsx`
- `client/src/pages/EventListings.jsx`
- `client/src/pages/EventDetail.jsx`
- `client/src/pages/Checkout.jsx`
- `client/src/pages/BookingConfirmation.jsx`
- `client/src/pages/UserDashboard.jsx`
- `client/src/pages/BookingDetail.jsx`

## 2. High-Level Goal

Person C is responsible for the full payment lifecycle and the full user-facing app flow:

1. User logs in
2. User browses events
3. User selects seats
4. User goes to checkout
5. User pays through Stripe
6. Stripe webhook confirms or fails payment
7. Booking and seat states are updated correctly
8. User sees confirmation and booking history

## 3. Strict Execution Order

Person C must work in two phases:

### Phase 1: Payments Backend Only

Finish all of the following before starting frontend development:

- Stripe setup and configuration
- Payment model completion if needed
- Payment creation endpoint
- Payment status endpoint
- Idempotency logic
- Webhook route and signature verification
- Booking confirmation flow
- Payment failure release flow
- Refund flow
- Backend payment testing

### Phase 2: Frontend

Frontend work begins only after the backend payment system is complete and stable.

Required gate before frontend:

- `POST /api/payments/create` works correctly
- idempotency is tested
- `POST /api/webhooks/stripe` verifies signatures correctly
- successful payment confirms booking end to end
- failed payment releases seats correctly
- refund flow works correctly

## 4. Dependencies On Other Teammates

### From Person A

Person C depends on:

- Auth APIs
- Event listing and event detail APIs
- Booking creation API
- Booking read APIs
- Booking email and QR support after confirmation

Required endpoints from A:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/events`
- `GET /api/events/:id`
- `POST /api/bookings`
- `GET /api/bookings`
- `GET /api/bookings/:id`

### From Person B

Person C depends on:

- Seat map API
- Seat locking and lock release APIs
- Pricing engine
- Redis-based seat release helpers

Required endpoints or services from B:

- `GET /api/events/:id/seats`
- `POST /api/seats/lock`
- `DELETE /api/seats/lock`
- `calculatePrice(event)`
- `releaseLock(eventId, seatId)`

## 5. Critical Agreements To Finalize First

Before implementation starts, align with A and B on these points:

- Standard API response format
- Standard error response format
- Booking status values
- Payment status values
- Seat map response shape
- JWT storage strategy on frontend
- What happens to booking status when payment fails
- Who owns the `Payment` model if it is not yet created

Suggested enums:

### Booking Status

- `PENDING`
- `CONFIRMED`
- `CANCELLED`
- `FAILED`
- `REFUNDED`

### Payment Status

- `INITIATED`
- `SUCCESS`
- `FAILED`
- `REFUNDED`

## 6. Week-By-Week Roadmap

This schedule is backend-first. Frontend implementation starts only after payment backend completion.

## Week 1: Research, Setup, Design

### Objectives

- Understand Stripe Payment Intents
- Understand idempotency
- Understand webhook security
- Prepare the project for backend payment implementation first

### Tasks

- Create a Stripe test account
- Collect Stripe test keys:
  - secret key
  - publishable key
  - webhook signing secret
- Add all Stripe-related values to `.env.example`
- Study Stripe Payment Intents and webhooks
- Write the payment state machine
- Define request and response contracts for payment APIs
- Defer detailed frontend build work until backend payment scope is complete
- Confirm integration points with A and B

### Deliverables

- Stripe test account ready
- Stripe keys documented
- Payment state machine finalized
- Payment API contracts agreed
- Backend payment plan agreed

### Definition of Done

- You can explain:
  - why Payment Intents are used instead of Charges
  - what idempotency prevents
  - why `express.raw()` is required for Stripe webhooks

## Week 2: Payment Backend Foundation

### Objectives

- Create Stripe server config
- Build payment creation endpoint
- Implement idempotency correctly

### Tasks

- Implement `server/src/config/stripe.js`
- Create or finalize the `Payment` model
- Build `POST /api/payments/create`
- Build `GET /api/payments/:id/status`
- Add `server/src/routes/paymentRoutes.js`
- Validate booking ownership before payment
- Pull live pricing from B's pricing service
- Store payment records in MongoDB
- Update booking with `paymentId` and final amount

### Required Logic For `createPayment`

1. Read `bookingId` and `idempotencyKey`
2. Check existing payment by `idempotencyKey`
3. If found, return existing `clientSecret`
4. Load booking and verify it belongs to current user
5. Load live price from B's service
6. Compute final total amount
7. Create Stripe Payment Intent
8. Save Payment record in MongoDB
9. Link Payment to Booking
10. Return `clientSecret`

### Deliverables

- Stripe config working
- Payment creation endpoint working
- Payment status endpoint working
- Idempotency working

### Definition of Done

- Calling payment creation twice with the same idempotency key never creates two Stripe intents
- A user cannot create a payment for another user's booking
- The DB stores payment state correctly

## Week 3: Webhooks, Confirmation, Failure Handling, Refunds

### Objectives

- Handle Stripe events securely
- Confirm bookings automatically on successful payment
- Release seats safely on failed payment
- Support refunds

### Tasks

- Build `POST /api/webhooks/stripe`
- Use `express.raw({ type: 'application/json' })`
- Verify Stripe signature using webhook secret
- Handle `payment_intent.succeeded`
- Handle `payment_intent.payment_failed`
- Implement `confirmBooking()` in `bookingConfirmationService.js`
- Implement `releaseOnFailure()` in `bookingConfirmationService.js`
- Build `POST /api/payments/:id/refund`

### Success Flow

When payment succeeds:

- Mark Payment as `SUCCESS`
- Mark Booking as `CONFIRMED`
- Mark seats as `BOOKED`
- Remove Redis locks
- Update event availability
- Trigger confirmation email and QR support from A's side

### Failure Flow

When payment fails:

- Mark Payment as `FAILED`
- Release seat locks
- Revert seats to `AVAILABLE`
- Update booking to agreed failed state

### Refund Flow

When refund is requested:

- Validate user owns the booking or is allowed to refund
- Call Stripe refund API
- Mark Payment as `REFUNDED`
- Mark Booking as `REFUNDED`
- Free the seats

### Deliverables

- Secure webhook endpoint
- Success flow working end to end
- Failure flow working end to end
- Refund flow working

### Definition of Done

- Fake or invalid webhooks are rejected
- Successful Stripe webhook confirms the booking automatically
- Failed payment returns seats to available state
- Refunded bookings update all related records correctly

### Backend Completion Gate Before Frontend

Do not begin frontend development until all of these are complete:

- Stripe config is working
- Payment creation endpoint is working
- Idempotency logic is verified
- Payment status endpoint is working
- Webhook signature verification is working
- Success flow is working end to end
- Failure release flow is working end to end
- Refund flow is working end to end

## Week 4: Frontend Foundation

### Objectives

- Begin frontend only after backend payment completion
- Make the frontend runnable
- Connect auth and app structure

### Tasks

- Initialize real Vite React app in `client/`
- Install required dependencies:
  - `react-router-dom`
  - `axios`
  - `react-hook-form`
  - `@stripe/stripe-js`
  - `@stripe/react-stripe-js`
  - `react-hot-toast`
  - `tailwindcss` if the team is using it
- Set up `client/src/main.jsx`
- Set up routes
- Set up `AuthContext`
- Set up Axios instance with JWT interceptor
- Build register page
- Build login page
- Add protected route behavior

### Deliverables

- Frontend starts locally
- Register and login pages work
- JWT is stored and attached to requests
- Unauthorized users are redirected correctly

### Definition of Done

- A logged-in user can move through protected pages without re-entering credentials repeatedly
- API calls include the auth token automatically

## Week 5: Event UI, Seat Map Flow, Checkout, Dashboard

### Objectives

- Build the main user experience
- Integrate the payment flow into checkout

### Tasks

- Build `EventListings.jsx`
  - city filter
  - category filter
  - date filter
  - price range filter
- Build `EventDetail.jsx`
  - show event info
  - integrate B's seat map data
- Build `Checkout.jsx`
  - selected seats summary
  - live price display
  - Stripe Elements card form
  - pay button
- Build `BookingConfirmation.jsx`
- Build `UserDashboard.jsx`
- Build `BookingDetail.jsx`

### Checkout Flow

1. User arrives with locked seats
2. Show order summary
3. Generate idempotency key once
4. Call `POST /api/payments/create`
5. Use returned `clientSecret`
6. Call Stripe `confirmCardPayment`
7. Handle success
8. Handle failure and release locks if needed

### UX Requirements

- Locked seats should show countdown
- Seat map should stay refreshed from B's polling
- Errors should be visible and clear
- Success should redirect cleanly
- Payment button should prevent duplicate submission

### Deliverables

- Event listing UI working
- Event detail UI working
- Checkout flow working with Stripe test cards
- Booking confirmation page working
- User dashboard working
- Booking detail page working

### Definition of Done

- A user can complete the full browse-to-pay flow in the UI
- A declined card shows a usable failure state

## Week 6: Testing, Integration, Deployment

### Objectives

- Validate reliability
- Deploy frontend and verify production webhooks

### Tasks

- Test full happy path:
  - event -> seat lock -> booking -> payment -> webhook -> confirmation
- Test duplicate payment retry with same idempotency key
- Test Stripe failed card:
  - `4000 0000 0000 0002`
- Test refund path
- Test seat release after failure
- Test unauthorized access handling
- Deploy frontend to Vercel
- Configure production Stripe webhook endpoint
- Verify production webhook delivery
- Help with README and demo video

### Deliverables

- Full flow tested
- Frontend deployed
- Production webhook configured
- Demo-ready product

### Definition of Done

- Team can record a complete working demo
- Payment success and failure both behave correctly in deployed environments

## 7. Detailed File-by-File Plan

## Backend

### `server/src/config/stripe.js`

Implement:

- Stripe client initialization
- Environment validation for Stripe secret key

### `server/src/controllers/paymentController.js`

Implement:

- `createPayment`
- `getPaymentStatus`
- `refundPayment`

Must handle:

- idempotency
- booking ownership
- final amount calculation
- Stripe Payment Intent creation
- refund logic

### `server/src/controllers/webhookController.js`

Implement:

- `handleStripeWebhook`

Must handle:

- raw body verification
- signature verification
- success events
- failure events

### `server/src/services/bookingConfirmationService.js`

Implement:

- `confirmBooking`
- `releaseOnFailure`

Must handle:

- updating booking state
- updating seat state
- removing Redis locks
- syncing event seat counts

### `server/src/routes/paymentRoutes.js`

Wire:

- `POST /payments/create`
- `GET /payments/:id/status`
- `POST /payments/:id/refund`

### `server/src/routes/webhookRoutes.js`

Wire:

- `POST /webhooks/stripe`

Important:

- apply `express.raw()` on this route only

## Frontend

### `client/src/main.jsx`

Implement:

- app bootstrap
- router setup
- Stripe Elements provider
- app-wide providers

### `client/src/context/AuthContext.jsx`

Implement:

- auth state
- token storage
- current user tracking
- `login`
- `logout`

### `client/src/utils/axios.js`

Implement:

- axios instance
- API base URL
- JWT request interceptor
- unauthorized response handling

### `client/src/pages/Register.jsx`

Implement:

- form
- validation
- API call
- success and error handling

### `client/src/pages/Login.jsx`

Implement:

- login form
- token save
- redirect on success

### `client/src/pages/EventListings.jsx`

Implement:

- event cards
- filters
- pagination if supported

### `client/src/pages/EventDetail.jsx`

Implement:

- event details
- seat map integration
- lock action triggers

### `client/src/pages/Checkout.jsx`

Implement:

- selected seats display
- live price
- Stripe Elements form
- payment submit
- duplicate-submit protection

### `client/src/pages/BookingConfirmation.jsx`

Implement:

- booking summary
- payment success state
- QR display if available

### `client/src/pages/UserDashboard.jsx`

Implement:

- booking history list
- status badges
- links to booking details

### `client/src/pages/BookingDetail.jsx`

Implement:

- booking details
- seat list
- payment status
- cancel or refund action if allowed

## 8. Strict Build Order

Build in this order:

### Phase 1: Payments Backend

1. Stripe config
2. Payment model if needed
3. `createPayment`
4. Payment routes
5. Payment status endpoint
6. Webhook route with raw body
7. Webhook controller with signature verification
8. Booking confirmation service
9. Failure release service
10. Refund flow
11. Manual backend payment testing
12. End-to-end backend payment verification

### Phase 2: Frontend

13. Frontend app shell
14. Auth context and Axios
15. Login and register pages
16. Event listing and event detail pages
17. Checkout page with Stripe Elements
18. Booking confirmation page
19. User dashboard
20. Booking detail page
21. Full UI integration test pass
22. Deployment

## 9. Risks To Watch

### Payment Risks

- Double charges if idempotency is wrong
- Fake webhook confirmation if signature verification is wrong
- Price mismatch if backend trusts frontend amount
- Booking marked confirmed before webhook arrives

### Frontend Risks

- Duplicate payment submission
- Lock countdown not matching backend reality
- Token expiration causing broken navigation
- Checkout page trying to pay for expired locks

### Integration Risks

- A and C disagree on booking status updates
- B and C disagree on seat map response shape
- Refund flow forgets to release seat state in all places

## 10. Testing Checklist

### Backend Tests

- Create payment with valid booking
- Create payment with invalid booking owner
- Create payment twice with same idempotency key
- Webhook success updates booking and payment
- Webhook failure releases seats
- Refund updates all related records

### Frontend Tests

- Register flow
- Login flow
- Event list loads
- Event detail loads
- Seat selection works
- Checkout submits successfully
- Declined card shows failure message
- Booking dashboard loads correctly

### End-to-End Tests

- Happy path booking flow
- Duplicate retry flow
- Failed card flow
- Refund flow
- Unauthorized route protection

## 11. Backend Completion Checklist Before Frontend

Frontend must not start until this checklist is fully complete:

- Stripe client is configured correctly
- Payment records are being created in MongoDB
- Idempotency returns the same result for retries
- Payment status endpoint returns correct DB state
- Webhook signature verification is working
- Payment success confirms booking correctly
- Payment failure releases seats correctly
- Refund flow works correctly
- All payment routes are wired into the app
- Manual backend tests for success and failure have passed

## 12. Ready-to-Use Daily Workflow

Use this daily workflow while building:

1. Pick one file or feature only
2. Confirm API contract first
3. Implement backend logic
4. Test backend manually
5. Keep building backend until the backend completion checklist is done
6. Start frontend only after backend sign-off
7. Test the user flow end to end
8. Commit only after feature works completely

## 13. Final Success Criteria

Person C is done when:

- Stripe payments are created safely with idempotency
- Stripe webhooks are verified securely
- Successful payments confirm bookings automatically
- Failed payments release seats correctly
- Refunds work correctly
- Frontend supports browse, seat selection, checkout, confirmation, and history
- The team can demo the complete flow without manual DB fixes

## 14. Two-Week Backend-Only Execution Plan

This section is the practical sprint plan for completing the payments backend within 14 days.

Goal:

- Finish the entire payments backend in two weeks
- Prioritize scalability, reliability, and performance
- Do not start frontend work during this sprint

### Core Technical Priorities

The payments backend must optimize for:

- idempotency under retries
- fast request handling
- minimal database round trips
- safe webhook processing
- predictable state transitions
- clean failure recovery
- low-risk production deployment

### Scalability Principles

Use these principles throughout implementation:

- Never trust frontend amounts; calculate server-side only
- Keep payment creation stateless except for DB persistence
- Use indexed lookups for all idempotency and payment-status queries
- Avoid repeated population when a lean query is enough
- Keep webhook handlers short and deterministic
- Make state transitions idempotent where possible
- Release locks and update state in a consistent order
- Avoid synchronous heavy work inside webhook handlers

### Performance Principles

Use these practices by default:

- Use MongoDB indexes on:
  - `idempotencyKey`
  - `stripePaymentIntentId`
  - `booking`
  - `user`
- Use `.select()` and `.lean()` where document methods are not needed
- Minimize `.populate()` usage to only required fields
- Validate input early and fail fast
- Keep Stripe metadata compact
- Return cached existing payment result immediately on duplicate idempotency key
- Avoid duplicate writes when status is already final

## Day-by-Day Plan

### Day 1: Finalize Contracts and Data Model

Tasks:

- Confirm payment-related status enums with team
- Confirm ownership of `Payment` model
- Finalize request and response shapes for all payment routes
- Finalize integration contract with A and B
- Define required indexes for payment queries

Deliverables:

- payment API contract
- payment state machine
- DB field list and indexes finalized

### Day 2: Stripe Config and Environment Validation

Tasks:

- Implement `server/src/config/stripe.js`
- Add strict env validation for Stripe keys
- Decide centralized config loading pattern
- Fail fast on missing payment config

Deliverables:

- reusable Stripe client setup
- validated Stripe env handling

### Day 3: Payment Model and Persistence Design

Tasks:

- Create or finalize `Payment` schema
- Add unique indexes:
  - `idempotencyKey`
  - `stripePaymentIntentId`
- Add useful secondary indexes for lookup and status checks
- Add schema validation and timestamps

Deliverables:

- production-ready `Payment` model

### Day 4: Build `POST /api/payments/create`

Tasks:

- Validate input
- Load booking safely
- verify booking ownership
- calculate amount using backend pricing service
- implement idempotency lookup first
- create Payment Intent only when needed
- persist Payment document
- attach payment reference to booking

Deliverables:

- first working version of payment creation endpoint

### Day 5: Optimize `createPayment` for Performance and Safety

Tasks:

- reduce unnecessary DB reads
- make duplicate-request path fast
- ensure safe behavior under retry storms
- add structured error handling
- ensure endpoint never charges twice for same idempotency key

Deliverables:

- hardened idempotent payment creation flow

### Day 6: Build `GET /api/payments/:id/status`

Tasks:

- validate route ownership rules
- return DB state only, not live Stripe lookup
- optimize for fast read path
- expose only necessary status fields

Deliverables:

- lightweight payment status endpoint

### Day 7: Build Webhook Route and Signature Verification

Tasks:

- wire `POST /api/webhooks/stripe`
- ensure `express.raw()` is applied correctly
- verify Stripe signature securely
- reject invalid signatures immediately
- add safe event parsing and routing

Deliverables:

- secure webhook entrypoint

### Day 8: Implement Success Flow

Tasks:

- build `confirmBooking()`
- update Payment to `SUCCESS`
- update Booking to `CONFIRMED`
- update seats to `BOOKED`
- release Redis locks through B's service
- update event seat counts
- ensure operation is safe on webhook retries

Deliverables:

- payment success flow working end to end

### Day 9: Implement Failure Flow

Tasks:

- build `releaseOnFailure()`
- update Payment to `FAILED`
- revert seats to `AVAILABLE`
- release Redis locks
- update booking to agreed failure state
- ensure duplicate failed events do not corrupt state

Deliverables:

- payment failure flow working end to end

### Day 10: Implement Refund Flow

Tasks:

- build `POST /api/payments/:id/refund`
- validate authorization
- call Stripe refund API
- update Payment and Booking to `REFUNDED`
- release seats safely
- ensure refund path is not double-applied

Deliverables:

- refund flow working

### Day 11: Refactor for Scale and Cleanliness

Tasks:

- move shared logic into services
- centralize status transition rules
- remove repeated queries and duplicated code
- add consistent logging for payment lifecycle
- standardize controller responses

Deliverables:

- cleaner, more maintainable payment backend

### Day 12: Performance Hardening

Tasks:

- review all payment queries for index use
- replace heavy queries with lean reads where possible
- cut unnecessary population
- verify fast duplicate-request path
- verify webhook handler does minimal work
- identify any synchronous bottlenecks

Deliverables:

- performance-hardened payment backend

### Day 13: Failure Testing and Retry Testing

Tasks:

- test duplicate idempotency key retries
- test webhook retry scenarios
- test failed payment scenario
- test refund scenario
- test unauthorized access
- test missing booking or invalid payment state

Deliverables:

- verified reliability under common failure cases

### Day 14: Integration Verification and Freeze

Tasks:

- run full backend happy path
- run full backend failure path
- verify payment states in DB
- verify seat and booking consistency
- verify route wiring in app
- document remaining risks
- freeze backend payment scope

Deliverables:

- backend ready for frontend integration

## 15. Performance Checklist

Before declaring the payments backend complete, confirm all of the following:

- `idempotencyKey` is uniquely indexed
- `stripePaymentIntentId` is uniquely indexed
- duplicate payment requests return quickly without new Stripe calls
- payment status reads do not over-fetch data
- webhook handler rejects invalid signatures immediately
- webhook success and failure flows are safe to retry
- no controller trusts frontend pricing
- no unnecessary `populate()` calls remain in hot paths
- status transitions avoid duplicate writes where possible

## 16. Scalability Checklist

The backend is considered scalable enough for this project when:

- duplicate client retries do not create duplicate charges
- webhook retries do not break state consistency
- read paths are index-backed
- payment creation does not perform unnecessary external calls
- final states are idempotent
- failure recovery is deterministic
- payment endpoints remain stateless aside from DB persistence

## 17. What To Defer Until After Backend Completion

To hit the two-week target, do not spend time on these during the backend sprint:

- frontend pages
- UI polish
- dashboard UX details
- Stripe Elements integration
- route animations or design work
- non-critical refactors outside payment scope

## 18. Sprint Exit Criteria

At the end of two weeks, the payments backend should have:

- `POST /api/payments/create`
- `GET /api/payments/:id/status`
- `POST /api/payments/:id/refund`
- `POST /api/webhooks/stripe`
- idempotency working
- success flow working
- failure flow working
- refund flow working
- payment-related indexes in place
- backend manual testing completed

Only after this point should frontend work begin.
