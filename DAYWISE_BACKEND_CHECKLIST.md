# Daywise Backend Checklist

This is the execution checklist for completing the TicketFlow payments backend in 14 days.

Rule:

- Complete backend first
- Do not start frontend work until this checklist is fully done

## Day 1: Contracts and Planning

- Confirm payment status enum:
  - `INITIATED`
  - `SUCCESS`
  - `FAILED`
  - `REFUNDED`
- Confirm booking status behavior for:
  - payment success
  - payment failure
  - refund
- Confirm who owns the `Payment` model
- Confirm exact request and response shapes for:
  - `POST /api/payments/create`
  - `GET /api/payments/:id/status`
  - `POST /api/payments/:id/refund`
  - `POST /api/webhooks/stripe`
- Confirm integration points with A and B
- Review the long-term backend plan in `PAYMENTS_BACKEND_PLAN.md`

Exit check:

- API contracts are fixed
- team dependencies are clear

## Day 2: Stripe Setup

- Create or finalize Stripe test account
- Collect:
  - Stripe secret key
  - Stripe publishable key
  - Stripe webhook signing secret
- Add Stripe-related values to `.env.example`
- Implement `server/src/config/stripe.js`
- Add env validation for Stripe config

Exit check:

- Stripe client can initialize correctly

## Day 3: Payment Model

- Create or finalize `server/src/models/Payment.js`
- Add schema fields:
  - booking
  - user
  - amount
  - currency
  - status
  - stripePaymentIntentId
  - stripeChargeId
  - stripeClientSecret
  - idempotencyKey
  - failureReason
  - refundId
- Add indexes:
  - unique `idempotencyKey`
  - unique `stripePaymentIntentId`
  - `booking`
  - `user + status`
- Add timestamps

Exit check:

- Payment model is ready and indexed

## Day 4: Create Payment Endpoint

- Implement `POST /api/payments/create`
- Validate auth
- Validate payload
- Load booking and verify ownership
- Check existing payment by `idempotencyKey`
- Call pricing logic from backend
- Create Stripe Payment Intent
- Save Payment document
- Link Payment to Booking
- Return `clientSecret`

Exit check:

- Valid request creates a payment intent successfully

## Day 5: Idempotency Hardening

- Re-test `POST /api/payments/create` with same `idempotencyKey`
- Ensure duplicate requests return existing result
- Ensure no second Stripe Payment Intent is created
- Improve controller and service error handling
- Reduce unnecessary DB queries

Exit check:

- Duplicate payment requests are safe

## Day 6: Payment Status Endpoint

- Implement `GET /api/payments/:id/status`
- Validate auth
- Restrict access to owner or authorized role
- Return status from DB only
- Use `.select()` and `.lean()` if possible

Exit check:

- Payment status endpoint works and stays lightweight

## Day 7: Webhook Route Setup

- Implement `server/src/routes/webhookRoutes.js`
- Apply `express.raw({ type: 'application/json' })`
- Implement route wiring in app
- Create initial webhook controller shell

Exit check:

- Stripe webhook route is reachable and uses raw body

## Day 8: Webhook Signature Verification

- Implement signature verification in `server/src/controllers/webhookController.js`
- Reject invalid signature with `400`
- Parse verified event safely
- Route supported event types

Exit check:

- Webhook verification works correctly

## Day 9: Success Flow

- Implement `confirmBooking()` in `server/src/services/bookingConfirmationService.js`
- Update Payment to `SUCCESS`
- Update Booking to `CONFIRMED`
- Update seats to `BOOKED`
- Release Redis locks
- Update event seat counts

Exit check:

- Successful payment webhook confirms booking end to end

## Day 10: Failure Flow

- Implement `releaseOnFailure()` in `server/src/services/bookingConfirmationService.js`
- Update Payment to `FAILED`
- Release seat locks
- Revert seats to `AVAILABLE`
- Update Booking to agreed failed state

Exit check:

- Failed payment restores correct booking and seat state

## Day 11: Refund Flow

- Implement `POST /api/payments/:id/refund`
- Validate authorization
- Call Stripe refund API
- Update Payment to `REFUNDED`
- Update Booking to `REFUNDED`
- Free seats safely

Exit check:

- Refund flow works correctly

## Day 12: Queue and Logging

- Add queue structure for slow side effects
- Add BullMQ setup if using queues now
- Move non-critical work out of webhook request path
- Add structured logging
- Add request IDs if possible

Exit check:

- Slow side effects are separated from critical payment state changes

## Day 13: Reliability and Performance Testing

- Test duplicate idempotency key behavior
- Test invalid webhook signatures
- Test webhook retries
- Test payment success flow repeatedly
- Test payment failure flow repeatedly
- Test refund flow
- Review indexes and heavy queries

Exit check:

- Payment backend is stable under retry and failure scenarios

## Day 14: Final Verification and Freeze

- Re-run full happy path
- Re-run failed payment path
- Re-run refund path
- Verify route wiring
- Verify DB states manually
- Verify no frontend work is still blocking backend completion
- Document any remaining risks

Exit check:

- Payments backend is ready for frontend integration

## Final Completion Checklist

Before frontend work begins, all of these must be true:

- `POST /api/payments/create` works
- `GET /api/payments/:id/status` works
- `POST /api/payments/:id/refund` works
- `POST /api/webhooks/stripe` works securely
- idempotency is verified
- success flow is verified
- failure flow is verified
- refund flow is verified
- payment indexes are present
- backend testing is completed

## Suggested Daily Workflow

Use this every day:

1. Pick the day's target
2. Finish the target fully
3. Test it manually
4. Clean up edge cases
5. Update docs or notes
6. Move to the next day only after the current day is stable
