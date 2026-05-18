import Payment from '../models/payment.model.js';
import Booking from '../models/booking.model.js';
import Seat from '../models/seat.model.js';
import Event from '../models/event.model.js';
import redis from '../config/redis.js';
import stripe from '../config/stripe.js';
import logger from '../config/logger.js';
import { PAYMENT_STATUS, BOOKING_STATUS } from '../utils/constants.js';
import { withTransaction } from '../utils/mongoTransaction.js';
import { SagaOrchestrator } from '../sagas/SagaOrchestrator.js';
import { executeCompensation } from './compensatingJobs.js';

const STEPS = [
  { name: 'REFUND_VALIDATE', index: 0 },
  { name: 'SEATS_RELEASE', index: 1 },
  { name: 'BOOKING_CANCEL', index: 2 },
  { name: 'STRIPE_REFUND', index: 3 },
];

export async function executeRefundSaga(saga, jobData) {
  const payment = await Payment.findOne({
    stripePaymentIntentId: saga.paymentIntentId,
  });

  if (!payment) {
    await SagaOrchestrator.markFailed(saga._id, 'Payment record not found');
    return;
  }

  if (payment.status === PAYMENT_STATUS.REFUNDED) {
    await SagaOrchestrator.markCompleted(saga._id);
    logger.info(`[RefundSaga] Payment already REFUNDED, skipping ${saga._id}`);
    return;
  }

  for (const step of STEPS) {
    try {
      await SagaOrchestrator.recordStepSuccess(saga._id, step.index);

      if (step.index === 0) {
        await step0RefundValidate(payment, saga);
      } else if (step.index === 1) {
        await step1SeatsRelease(saga);
      } else if (step.index === 2) {
        await step2BookingCancel(saga);
      } else if (step.index === 3) {
        await step3StripeRefund(payment, saga, jobData);
      }
    } catch (err) {
      logger.error(`[RefundSaga] Step ${step.index} failed: ${err.message}`);
      await SagaOrchestrator.recordStepFailure(saga._id, step.index, err.message);
      await executeCompensation(saga);
      return;
    }
  }

  await SagaOrchestrator.markCompleted(saga._id);
}

async function step0RefundValidate(payment, saga) {
  if (payment.status !== PAYMENT_STATUS.SUCCESS) {
    throw new Error(`Cannot refund payment in ${payment.status} state — expected SUCCESS`);
  }

  const booking = await Booking.findById(saga.bookingId);
  if (!booking) {
    throw new Error(`Booking ${saga.bookingId} not found`);
  }

  logger.info(`[RefundSaga] Step 0: Validation passed for payment ${payment._id}`);
}

async function step1SeatsRelease(saga) {
  return withTransaction(async () => {
    const { eventId, seatIds } = saga;

    if (!seatIds?.length) {
      logger.warn(`[RefundSaga] Step 1: No seats to release for ${saga._id}`);
      return;
    }

    await Seat.updateMany(
      { event: eventId, _id: { $in: seatIds } },
      { status: 'AVAILABLE', booking: null, lockedBy: null, lockExpiresAt: null }
    );

    const redisKeys = seatIds.map((id) => `seat:${eventId}:${id}`);
    if (redisKeys.length > 0) {
      await redis.del(...redisKeys);
    }

    await Event.findByIdAndUpdate(eventId, {
      $inc: { availableSeats: seatIds.length },
    });

    logger.info(`[RefundSaga] Step 1: ${seatIds.length} seats released`);
  });
}

async function step2BookingCancel(saga) {
  return withTransaction(async () => {
    const booking = await Booking.findById(saga.bookingId);

    if (!booking) {
      throw new Error(`Booking ${saga.bookingId} not found`);
    }

    booking.status = BOOKING_STATUS.REFUNDED;
    booking.cancelledAt = new Date();
    await booking.save();

    logger.info(`[RefundSaga] Step 2: Booking ${booking._id} marked REFUNDED`);
  });
}

async function step3StripeRefund(payment, saga, jobData) {
  let refundResult;
  try {
    refundResult = await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
    });
  } catch (err) {
    logger.error(`[RefundSaga] Step 3: Stripe refund failed: ${err.message}`);
    throw new Error(`Stripe refund failed: ${err.message}`);
  }

  return withTransaction(async () => {
    payment.status = PAYMENT_STATUS.REFUNDED;
    payment.refundId = refundResult.id;
    payment.webhookEvents.push({
      eventId: refundResult.id,
      type: jobData?.refundType || 'refund.saga',
      receivedAt: new Date(),
    });
    await payment.save();
    logger.info(`[RefundSaga] Step 3: Payment ${payment._id} marked REFUNDED via Stripe ${refundResult.id}`);
  });
}
