import Payment from '../models/payment.model.js';
import Booking from '../models/booking.model.js';
import { PAYMENT_STATUS } from '../utils/constants.js';
import logger from '../config/logger.js';
import { startPaymentConfirmSaga } from './sagaService.js';

export const bookingConfirmationService = {
  async confirmSuccess(paymentIntentId, eventId) {
    const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId });

    if (!payment) {
      logger.error('CRITICAL: Webhook received for untracked paymentIntentId', { paymentIntentId });
      return;
    }

    if (payment.status === PAYMENT_STATUS.SUCCESS) {
      logger.info('Idempotent webhook logic: Payment is already marked SUCCESS', { paymentId: payment._id });
      return;
    }

    const booking = await Booking.findById(payment.booking).populate('seats');
    if (!booking) {
      logger.error('CRITICAL: Booking not found for payment', { paymentId: payment._id, bookingId: payment.booking });
      return;
    }

    const seatIds = booking.seats.map((s) => s._id.toString());
    const eventIdStr = booking.event.toString();

    await startPaymentConfirmSaga({
      paymentIntentId,
      eventId: eventIdStr,
      bookingId: booking._id.toString(),
      seatIds,
    });

    logger.info('PaymentConfirmSaga started for webhook', { paymentIntentId, bookingId: booking._id });
  },

  async handleFailure(paymentIntentId, eventId, failureMessage) {
    const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId });

    if (!payment) {
      logger.error('CRITICAL: Failure Webhook received for untracked paymentIntentId', { paymentIntentId });
      return;
    }

    if (payment.status !== PAYMENT_STATUS.INITIATED) {
      logger.info('Idempotent failure logic: Payment is already finalized', { paymentId: payment._id, status: payment.status });
      return;
    }

    payment.status = PAYMENT_STATUS.FAILED;
    payment.failureReason = failureMessage || 'Unknown payment gateway failure';
    payment.webhookEvents.push({
      eventId: eventId,
      type: 'payment_intent.payment_failed',
      receivedAt: new Date(),
    });

    await payment.save();
    logger.info('Database Updated: Payment state transitioned to FAILED strictly', { paymentId: payment._id });
  },

  async handleRefundWebhook(paymentIntentId, eventId, chargeId) {
    const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId });

    if (!payment) return;

    if (payment.status === PAYMENT_STATUS.REFUNDED) return;

    if (payment.status !== PAYMENT_STATUS.SUCCESS) return;

    payment.status = PAYMENT_STATUS.REFUNDED;
    payment.refundId = chargeId;
    payment.webhookEvents.push({
      eventId: eventId,
      type: 'charge.refunded',
      receivedAt: new Date(),
    });

    await payment.save();
    logger.info('Database Updated: Payment state transitioned to REFUNDED purely via incoming webhook', { paymentId: payment._id });
  }
};
