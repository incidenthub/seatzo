# TicketFlow Payments Backend
> **Status**: Frozen / Completed
> **Author**: Person C (Payment Architecture)

The payments backend is officially frozen. Below are the rigid boundaries and integration points required for Person A (Booking) and Person B (Seats/Pricing) to stitch this service securely into the rest of the application.

---

## 1. How the Flow Works
1. Clients ping `POST /api/payments/create` with a locked `amount`, `bookingId`, and a generated `idempotencyKey`.
2. The Database safely allocates a `Payment` object and returns the `clientSecret` from Stripe.
3. The frontend renders the Stripe UI card element and completes the payment.
4. Stripe fires a Webhook to `POST /api/webhooks/stripe` with a cryptographically verified signature.
5. The backend verifies the signature, and asynchronously drops the action into BullMQ (`PAYMENT_SUCCESS`).
6. The database transitions the state to `SUCCESS`.

---

## 2. Person A (Bookings and Auth) Integration

You own the `User` and `Booking` models. Currently, the Payment backend simulates the `bookingId` as a pure String inside `payment.model.js`.

**Action Required:**
1. When configuring the frontend check-out, ensure you inject the `req.user.id` correctly in auth headers. Our API already reads it securely via the `.protect()` middleware.
2. Open `server/src/services/bookingConfirmation.service.js`. Under the `// 4. Integrations (Person A and Person B)` block, you must map the `SUCCESS` state strictly to your booking architecture:
   ```js
   // Add this into confirmSuccess():
   await Booking.findByIdAndUpdate(payment.booking, { status: BOOKING_STATUS.CONFIRMED });
   ```
3. Make sure to update the Booking state to `FAILED` or `REFUNDED` natively inside `handleFailure` and `processRefund`.

---

## 3. Person B (Seats and Redis Pricing) Integration

You own the Inventory, Pricing, and Seat Locking architecture.

**Action Required:**
1. Right now, `amount` is trusted blindly from `req.body.amount` upon payment creation. **This is dangerous**. When your Pricing engine is ready, hook it into `payment.controller.js` to rigidly calculate the price on the backend before shipping it across to the Stripe Intention hook.
2. In `bookingConfirmation.service.js`, under the `handleFailure()` process block, you must aggressively break the Redis Locks so those seats become `AVAILABLE` to the rest of the queue again.
   ```js
   // Add this into handleFailure():
   await seatLockService.releaseRedisLocks(payment.booking);
   ```

---

*Codebase is safe to deploy. Dependencies locked.*
