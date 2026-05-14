import { Agenda } from 'agenda';
import mongoose from 'mongoose';
import logger from '../config/logger.js';
import { processSagaJob } from '../jobs/sagaJobRouter.js';
import SagaState, { SAGA_STATUS } from '../models/sagaState.model.js';
import { sendBookingConfirmation } from '../config/email.js';
import Payment from '../models/payment.model.js';
import Booking from '../models/booking.model.js';
import Event from '../models/event.model.js';

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/seatzo';

export const agenda = new Agenda({
  db: {
    address: mongoUri,
    collection: 'agendaJobs',
  },
  defaultConcurrency: 1,
  lockLimit: 1,
  lockTime: 5 * 60 * 1000, // 5 minutes
});

// ==================== SAGA JOBS ====================

agenda.define('process-saga', async (job) => {
  const { sagaId } = job.attrs.data;
  logger.info(`[Agenda] Processing saga ${sagaId}`);

  const saga = await SagaState.findById(sagaId);
  if (!saga) {
    logger.error(`[Agenda] Saga ${sagaId} not found, skipping`);
    return;
  }

  if (saga.status === SAGA_STATUS.COMPLETED || saga.status === SAGA_STATUS.COMPENSATED) {
    logger.info(`[Agenda] Saga ${sagaId} already ${saga.status}, skipping`);
    return;
  }

  try {
    await processSagaJob(saga, job.attrs.data);
  } catch (err) {
    logger.error(`[Agenda] Saga ${sagaId} failed: ${err.message}`);
    saga.status = SAGA_STATUS.FAILED;
    saga.error = err.message;
    saga.failedAt = new Date();
    await saga.save();
    throw err;
  }
});

// ==================== PAYMENT JOBS ====================

agenda.define('payment-success-email', async (job) => {
  const { paymentId, bookingId, paymentIntentId, eventId } = job.attrs.data;
  logger.info(`[Agenda] Processing payment success email for ${paymentId}`);

  try {
    const payment = await Payment.findById(paymentId).populate('user');
    if (!payment) {
      logger.error(`[Agenda] Payment ${paymentId} not found`);
      return;
    }

    const booking = await Booking.findById(bookingId).populate('event').populate('seats');
    if (!booking) {
      logger.error(`[Agenda] Booking ${bookingId} not found`);
      return;
    }

    const user = payment.user;
    const event = booking.event;

    const dateStr = new Date(event.date).toLocaleString('en-IN', {
      dateStyle: 'full',
      timeStyle: 'short',
    });

    await sendBookingConfirmation(user.email, user.name, {
      id: booking._id,
      eventTitle: event.title,
      eventDate: event.date,
      venue: event.venue,
      city: event.city,
      seats: booking.seats.map((s) => s.seatNumber || s),
      amount: payment.amount,
      qrCode: booking.qrCode,
    });

    logger.info(`[Agenda] Email sent to ${user.email}`);
  } catch (err) {
    logger.error(`[Agenda] Email job failed: ${err.message}`);
    throw err;
  }
});

// ==================== START / STOP ====================

export async function startAgenda() {
  await agenda.start();
  logger.info('[Agenda] Queue started');
}

export async function stopAgenda() {
  await agenda.stop();
  logger.info('[Agenda] Queue stopped');
}

// ==================== HELPERS ====================

export async function queueSaga(sagaId, data) {
  await agenda.schedule('now', 'process-saga', {
    sagaId,
    ...data,
  });
  logger.info(`[Agenda] Scheduled saga job: ${sagaId}`);
}

export async function queuePaymentSuccessEmail(data) {
  await agenda.schedule('now', 'payment-success-email', data);
  logger.info(`[Agenda] Scheduled payment email job`);
}

export { agenda as default };