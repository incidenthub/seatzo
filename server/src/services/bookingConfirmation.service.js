import Payment from '../models/payment.model.js';
import Booking from '../models/booking.model.js';
import { PAYMENT_STATUS, BOOKING_STATUS } from '../utils/constants.js';
import logger from '../config/logger.js';
import { paymentQueue } from '../queues/paymentEventsQueue.js';
import { markSeatsAsBooked, releaseLock } from '../services/seatLockService.js';

export const bookingConfirmationService = {
  /**
   * Orchestrates the success state transitions when a payment is definitively captured.
   * Built idempotently to handle webhook retries gracefully.
   */
  async confirmSuccess(paymentIntentId, eventId) {
    // 1. Locate the internal payment record linked to this Stripe Intent
    const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId });

    if (!payment) {
      logger.error('CRITICAL: Webhook received for untracked paymentIntentId', { paymentIntentId });
      // We don't throw an error to Stripe, otherwise they will retry sending us ghost data.
      return;
    }

    // 2. Idempotency Check: Stripe guarantees *at least once* delivery.
    // They may send the success webhook twice. We must safely ignore duplicates.
    if (payment.status === PAYMENT_STATUS.SUCCESS) {
      logger.info('Idempotent webhook logic: Payment is already marked SUCCESS', { paymentId: payment._id });
      return;
    }

    // 3. Execute the State Transition
    payment.status = PAYMENT_STATUS.SUCCESS;

    // Push an audit log directly into the payment document
    payment.webhookEvents.push({
      eventId: eventId,
      type: 'payment_intent.succeeded',
      receivedAt: new Date()
    });

    await payment.save();

    logger.info('Database Updated: Payment state transitioned to SUCCESS cleanly', { paymentId: payment._id });

    // 4. Mark booking as CONFIRMED and seats as BOOKED
    try {
      const booking = await Booking.findById(payment.booking);

      if (booking) {
        booking.status = BOOKING_STATUS.CONFIRMED;
        await booking.save();
        logger.info('Booking marked as CONFIRMED', { bookingId: booking._id });

        // Mark all seats as BOOKED
        const seatIds = booking.seats.map(s => s.toString());
        await markSeatsAsBooked(booking.event.toString(), seatIds, booking._id);
        logger.info('Seats marked as BOOKED', { bookingId: booking._id, seatCount: seatIds.length });
      }
    } catch (err) {
      logger.error('Failed to update booking and seats', { error: err.message, paymentId: payment._id });
    }

    // 5. Offload time-consuming side-effects (Email/PDF) to the Background Queue
    // This allows Stripe to receive our HTTP 200 OK instantly.
    try {
      await paymentQueue.add('PAYMENT_SUCCESS', {
        paymentId: payment._id,
        paymentIntentId,
        eventId
      });
      logger.info('Pushed PAYMENT_SUCCESS event to background queue', { paymentId: payment._id });
    } catch (queueErr) {
      logger.error('Failed to dispatch background job, but payment is marked SUCCESS', { error: queueErr.message });
    }
  },

  /**
   * Orchestrates the failure state transitions when a payment definitively fails.
   * Tracks the failure reason so users understand why their card was declined.
   */
  async handleFailure(paymentIntentId, eventId, failureMessage) {
    // 1. Locate the internal payment record
    const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId });

    if (!payment) {
      logger.error('CRITICAL: Failure Webhook received for untracked paymentIntentId', { paymentIntentId });
      return;
    }

    // 2. State Guard: Only allow transition to FAILED if not already SUCCESS or REFUNDED.
    if (payment.status !== PAYMENT_STATUS.INITIATED) {
      logger.info('Idempotent failure logic: Payment is already finalized', { paymentId: payment._id, status: payment.status });
      return;
    }

    // 3. Execute the State Transition
    payment.status = PAYMENT_STATUS.FAILED;
    payment.failureReason = failureMessage || 'Unknown payment gateway failure';

    payment.webhookEvents.push({
      eventId: eventId,
      type: 'payment_intent.payment_failed',
      receivedAt: new Date()
    });

    await payment.save();

    logger.info('Database Updated: Payment state transitioned to FAILED strictly', { paymentId: payment._id });

    // 4. Release locked seats on payment failure
    try {
      const booking = await Booking.findById(payment.booking);

      if (booking) {
        // Release all seats from this booking
        const seatIds = booking.seats.map(s => s.toString());
        for (const seatId of seatIds) {
          await releaseLock(booking.event.toString(), seatId);
        }
        logger.info('Seats released due to payment failure', { bookingId: booking._id, seatCount: seatIds.length });
      }
    } catch (err) {
      logger.error('Failed to release seats on payment failure', { error: err.message, paymentId: payment._id });
    }
  },

  /**
   * Orchestrates the refund state transition if an admin clicks "Refund" manually
   * inside the Stripe UI Dashboard (out of band from our own API).
   */
  async handleRefundWebhook(paymentIntentId, eventId, chargeId) {
    const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId });

    if (!payment) return;

    if (payment.status === PAYMENT_STATUS.REFUNDED) {
       // Already refunded via our own internal API `/payments/:id/refund`
       return;
    }

    // Ensure it's a valid targeted revert (can only refund a successful payment)
    if (payment.status !== PAYMENT_STATUS.SUCCESS) return;

    payment.status = PAYMENT_STATUS.REFUNDED;
    payment.refundId = chargeId; // Depending on mapping, Stripe exposes a unique refund ID
    
    payment.webhookEvents.push({
      eventId: eventId,
      type: 'charge.refunded',
      receivedAt: new Date()
    });

    await payment.save();
    logger.info('Database Updated: Payment state transitioned to REFUNDED purely via incoming webhook', { paymentId: payment._id });
    logger.info('>> Ready for Bookings Refund Integration via Person A/B <<');
  }
};
