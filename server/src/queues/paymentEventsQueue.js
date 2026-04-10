import { Queue, Worker } from 'bullmq';
import logger from '../config/logger.js';
import env from '../config/env.js';

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
}

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
