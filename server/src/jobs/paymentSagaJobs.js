import Payment from '../models/payment.model.js';
import Booking from '../models/booking.model.js';
import Seat from '../models/seat.model.js';
import Event from '../models/event.model.js';
import redis from '../config/redis.js';
import logger from '../config/logger.js';
import { PAYMENT_STATUS, BOOKING_STATUS } from '../utils/constants.js';
import { withTransaction } from '../utils/mongoTransaction.js';
import { generateQRCode } from '../utils/qrCode.js';
import { SagaOrchestrator } from '../sagas/SagaOrchestrator.js';
import { executeCompensation } from './compensatingJobs.js';
import { queuePaymentSuccessEmail } from '../queues/agendaQueue.js';

const STEPS = [
  { name: 'PAYMENT_CONFIRM', index: 0 },
  { name: 'BOOKING_CONFIRM', index: 1 },
  { name: 'SEATS_BOOK', index: 2 },
  { name: 'EMAIL_NOTIFY', index: 3 },
];

export async function executePaymentConfirmSaga(saga, jobData) {
  const payment = await Payment.findOne({
    stripePaymentIntentId: saga.paymentIntentId,
  });

  if (!payment) {
    await SagaOrchestrator.markFailed(saga._id, 'Payment record not found');
    return;
  }

  if (payment.status === PAYMENT_STATUS.SUCCESS) {
    await SagaOrchestrator.markCompleted(saga._id);
    logger.info(`[PaymentConfirmSaga] Payment already SUCCESS, skipping ${saga._id}`);
    return;
  }

  for (const step of STEPS) {
    try {
      await SagaOrchestrator.recordStepSuccess(saga._id, step.index);

      if (step.index === 0) {
        await step0PaymentConfirm(payment, jobData.eventId);
      } else if (step.index === 1) {
        await step1BookingConfirm(saga, payment);
      } else if (step.index === 2) {
        await step2SeatsBook(saga);
      } else if (step.index === 3) {
        await step3EmailNotify(payment, saga);
      }
    } catch (err) {
      logger.error(`[PaymentConfirmSaga] Step ${step.index} failed: ${err.message}`);
      await SagaOrchestrator.recordStepFailure(saga._id, step.index, err.message);
      await executeCompensation(saga);
      return;
    }
  }

  await SagaOrchestrator.markCompleted(saga._id);
}

async function step0PaymentConfirm(payment, eventId) {
  return withTransaction(async () => {
    payment.status = PAYMENT_STATUS.SUCCESS;
    payment.webhookEvents.push({
      eventId: eventId,
      type: 'payment_intent.succeeded',
      receivedAt: new Date(),
    });
    await payment.save();
    logger.info(`[PaymentConfirmSaga] Step 0: Payment ${payment._id} marked SUCCESS`);
  });
}

async function step1BookingConfirm(saga, payment) {
  return withTransaction(async () => {
    const booking = await Booking.findById(saga.bookingId);

    if (!booking) {
      throw new Error(`Booking ${saga.bookingId} not found`);
    }

    booking.status = BOOKING_STATUS.CONFIRMED;
    booking.confirmedAt = new Date();

    const qrData = {
      bookingId: booking._id,
      event: saga.eventId,
      seats: saga.seatIds,
      amount: booking.totalAmount,
      user: booking.user,
    };
    booking.qrCode = await generateQRCode(qrData);

    await booking.save();
    logger.info(`[PaymentConfirmSaga] Step 1: Booking ${booking._id} marked CONFIRMED`);
  });
}

async function step2SeatsBook(saga) {
  return withTransaction(async () => {
    const { eventId, seatIds, bookingId } = saga;

    await Seat.updateMany(
      { event: eventId, _id: { $in: seatIds } },
      { status: 'BOOKED', booking: bookingId, lockedBy: null, lockExpiresAt: null }
    );

    const redisKeys = seatIds.map((id) => `seat:${eventId}:${id}`);
    if (redisKeys.length > 0) {
      await redis.del(...redisKeys);
    }

    await Event.findByIdAndUpdate(eventId, {
      $inc: { availableSeats: -seatIds.length },
    });

    logger.info(`[PaymentConfirmSaga] Step 2: ${seatIds.length} seats marked BOOKED`);
  });
}

async function step3EmailNotify(payment, saga) {
  await queuePaymentSuccessEmail({
    paymentId: payment._id,
    paymentIntentId: payment.stripePaymentIntentId,
    bookingId: saga.bookingId,
    eventId: saga.eventId,
  });
  logger.info(`[PaymentConfirmSaga] Step 3: Email job dispatched for ${saga._id}`);
}
