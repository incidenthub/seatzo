import Payment from '../models/payment.model.js';
import Booking from '../models/booking.model.js';
import Seat from '../models/seat.model.js';
import Event from '../models/event.model.js';
import redis from '../config/redis.js';
import logger from '../config/logger.js';
import { PAYMENT_STATUS, BOOKING_STATUS } from '../utils/constants.js';
import { SagaOrchestrator } from '../sagas/SagaOrchestrator.js';

export async function rollbackPayment(saga) {
  const payment = await Payment.findOne({
    stripePaymentIntentId: saga.paymentIntentId,
  });

  if (!payment) {
    logger.warn(`[RollbackPayment] Payment not found for ${saga.paymentIntentId}`);
    return;
  }

  if (payment.status === PAYMENT_STATUS.SUCCESS) {
    payment.status = PAYMENT_STATUS.FAILED;
    payment.failureReason = 'Saga rollback: downstream step failed';
    await payment.save();
    logger.info(`[RollbackPayment] Payment ${payment._id} rolled back to FAILED`);
  }
}

export async function rollbackBooking(saga) {
  const booking = await Booking.findById(saga.bookingId);

  if (!booking) {
    logger.warn(`[RollbackBooking] Booking not found: ${saga.bookingId}`);
    return;
  }

  if (booking.status === BOOKING_STATUS.CONFIRMED) {
    booking.status = BOOKING_STATUS.PENDING;
    booking.confirmedAt = null;
    booking.qrCode = null;
    await booking.save();
    logger.info(`[RollbackBooking] Booking ${booking._id} rolled back to PENDING`);
  }
}

export async function rollbackSeats(saga) {
  const { eventId, seatIds } = saga;

  if (!seatIds?.length) {
    logger.warn(`[RollbackSeats] No seatIds for saga ${saga._id}`);
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

  logger.info(`[RollbackSeats] ${seatIds.length} seats restored for event ${eventId}`);
}

export async function executeCompensation(saga) {
  logger.info(`[Compensation] Starting compensation for saga ${saga._id}`);

  const reversedSteps = await SagaOrchestrator.getReversedCompletedSteps(saga._id);

  for (const stepIndex of reversedSteps) {
    try {
      if (stepIndex === 3) {
        logger.info(`[Compensation] Step 3 (EMAIL_NOTIFY) — best-effort only, skipping rollback`);
        continue;
      }
      if (stepIndex === 2) {
        await rollbackSeats(saga);
      } else if (stepIndex === 1) {
        await rollbackBooking(saga);
      } else if (stepIndex === 0) {
        await rollbackPayment(saga);
      }
    } catch (err) {
      logger.error(`[Compensation] Step ${stepIndex} rollback failed: ${err.message}`);
    }
  }

  await SagaOrchestrator.markCompensated(saga._id);
}
