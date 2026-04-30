import { Queue, Worker } from 'bullmq';
import logger from '../config/logger.js';
import env from '../config/env.js';
import { sendBookingConfirmation } from '../config/email.js';
import Payment from '../models/payment.model.js';
import Booking from '../models/booking.model.js';
import Event from '../models/event.model.js';
import User from '../models/user.model.js';

// Standard connection options for BullMQ
// Prefers the REDIS_URL from config or defaults to configured host/port
let connection;

if (env.redisUrl) {
  try {
    const url = new URL(env.redisUrl);
    connection = {
      host: url.hostname,
      port: parseInt(url.port || '6379', 10),
      username: url.username || undefined,
      password: url.password || undefined,
      tls: url.protocol === 'rediss:' ? {} : undefined,
      maxRetriesPerRequest: null // Required by BullMQ
    };
    logger.info(`[BullMQ] Parsed Redis URL for connection: ${url.hostname}:${url.port}`);
  } catch (err) {
    logger.error('[BullMQ] Failed to parse REDIS_URL, falling back to defaults', { error: err.message });
    connection = {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      maxRetriesPerRequest: null
    };
  }
} else {
  connection = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    maxRetriesPerRequest: null
  };
  logger.info(`[BullMQ] Using default Redis connection: ${connection.host}:${connection.port}`);
}

export const paymentQueue = new Queue('payment-events-queue', { connection });

// Log connection errors globally
paymentQueue.on('error', (err) => {
  logger.error('[BullMQ] Queue connection error:', { error: err.message });
});

paymentQueue.on('waiting', (jobId) => {
  logger.debug(`[BullMQ] Job ${jobId} is waiting to be processed`);
});

/**
 * 2. Initialize the asynchronous Worker.
 * This actively listens to the queue in the background and executes intensive side effects
 * like PDF ticket generation, Email notification, or external API hits over many seconds.
 */
const paymentWorker = new Worker('payment-events-queue', async job => {
  
  if (job.name === 'PAYMENT_SUCCESS') {
    const { paymentId, bookingId, paymentIntentId, eventId } = job.data;
    logger.info(`[Worker] Started async side-effects for successful Payment ${paymentId}`);
    
    try {
      // 1. Fetch relevant records
      const payment = await Payment.findById(paymentId).populate('user');
      if (!payment) {
        logger.error(`[Worker] Payment ${paymentId} not found`);
        return;
      }

      const booking = await Booking.findById(bookingId).populate('event').populate('seats');
      if (!booking) {
        logger.error(`[Worker] Booking ${bookingId} for Payment ${paymentId} not found`);
        return;
      }

      const user = payment.user;
      const event = booking.event;

      // 2. Prepare Email Content
      const dateStr = new Date(event.date).toLocaleString('en-IN', {
        dateStyle: 'full',
        timeStyle: 'short'
      });

      const subject = `Booking Confirmed: ${event.title} - Seatzo`;
      const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 20px; color: #333; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #7c3aed; text-align: center;">Booking Confirmed! 🎫</h2>
          <p>Hi ${user.name},</p>
          <p>Your booking for <strong>${event.title}</strong> has been successfully confirmed. Get ready for an amazing experience!</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Event:</strong> ${event.title}</p>
            <p style="margin: 5px 0;"><strong>Date & Time:</strong> ${dateStr}</p>
            <p style="margin: 5px 0;"><strong>Venue:</strong> ${event.venue}, ${event.city}</p>
            <p style="margin: 5px 0;"><strong>Seats:</strong> ${booking.seats.length} Tickets</p>
            <p style="margin: 5px 0;"><strong>Total Paid:</strong> ₹${(payment.amount / 100).toFixed(2)}</p>
          </div>

          <p style="font-size: 0.9em; color: #666;">Please show your digital ticket at the entrance. You can find your tickets and QR code in the "My Bookings" section of your dashboard.</p>
          
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="text-align: center; font-size: 0.8em; color: #999;">
            &copy; ${new Date().getFullYear()} Seatzo. All rights reserved.
          </p>
        </div>
      `;

      // 3. Dispatch Email
      // Map seat IDs to numbers if they are populated, or just use the count
      const seatLabels = booking.seats.map(s => typeof s === 'object' ? s.seatNumber : s).filter(Boolean);

      await sendBookingConfirmation(user.email, user.name, {
        id: booking._id,
        eventTitle: event.title,
        eventDate: event.date,
        venue: event.venue,
        city: event.city,
        seats: seatLabels.length > 0 ? seatLabels : [`${booking.seats.length} Tickets`],
        amount: payment.amount,
        qrCode: booking.qrCode
      });

      logger.info(`[Worker] 📧 Confirmation email sent to ${user.email} for Payment ${paymentId}`);

    } catch (err) {
      logger.error(`[Worker] Error in PAYMENT_SUCCESS side-effects: ${err.message}`, { stack: err.stack });
      throw err; // Re-throw so BullMQ can retry the job if configured
    }
  }
  
  if (job.name === 'PAYMENT_FAILURE') {
    logger.info(`[Worker] Dispatching failure notification for Payment ${job.data.paymentId}`);
  }

}, { 
  connection,
  concurrency: 5
});

logger.info('[BullMQ] Payment Events Worker initialized and listening');

// ─── Worker Event Logging ──────────────────────────────────────────────────

paymentWorker.on('completed', job => {
  logger.debug(`[BullMQ] Job ${job.id} (${job.name}) completed successfully.`);
});

paymentWorker.on('failed', (job, err) => {
  logger.error(`[BullMQ] CRITICAL: Job ${job.id} (${job.name}) failed!`, { error: err.message });
});
