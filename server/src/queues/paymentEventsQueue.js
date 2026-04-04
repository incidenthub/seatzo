import { Queue, Worker } from 'bullmq';
import logger from '../config/logger.js';
import dotenv from 'dotenv';
dotenv.config();

// Standard connection options for BullMQ
// Requires a running Redis instance or defaults to localhost
const connection = {
  url: process.env.REDIS_URL,
  tls: {}
};

/**
 * 1. Initialize the Queue. 
 * We push jobs to this queue from the sync webhook handler to instantly free up the connection.
 */
export const paymentQueue = new Queue('payment-events-queue', { connection });

/**
 * 2. Initialize the asynchronous Worker.
 * This actively listens to the queue in the background and executes intensive side effects
 * like PDF ticket generation, Email notification, or external API hits over many seconds.
 */
const paymentWorker = new Worker('payment-events-queue', async job => {
  
  if (job.name === 'PAYMENT_SUCCESS') {
    const { paymentId, paymentIntentId, eventId } = job.data;
    logger.info(`[Worker] Started async side-effects for successful Payment ${paymentId}`);
    
    // Simulate complex asynchronous integrations (e.g. SMTP email rendering)
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    logger.info(`[Worker] 📧 Email/Tickets dispatched for Payment ${paymentId}`);
  }
  
  if (job.name === 'PAYMENT_FAILURE') {
    logger.info(`[Worker] Dispatching failure notification for Payment ${job.data.paymentId}`);
  }

}, { connection });

// ─── Worker Event Logging ──────────────────────────────────────────────────

paymentWorker.on('completed', job => {
  logger.debug(`[BullMQ] Job ${job.id} (${job.name}) completed successfully.`);
});

paymentWorker.on('failed', (job, err) => {
  logger.error(`[BullMQ] CRITICAL: Job ${job.id} (${job.name}) failed!`, { error: err.message });
});
