import stripe from '../config/stripe.js';
import logger from '../config/logger.js';
import AppError from '../utils/appError.js';
import { webhookService } from '../services/webhook.service.js';

export const handleStripeWebhook = async (req, res) => {
  const signature = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    logger.error('Webhook missing signature or environment secret');
    throw new AppError('Webhook Error: Missing signature or config', 400);
  }

  let event;
  try {
    // Cryptographically verify the payload using the raw body, signature, and webhook secret
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (err) {
    logger.warn('⚠️ Webhook signature verification failed', { error: err.message });
    // Stripe expects a 40x code on failure
    throw new AppError(`Webhook Error: ${err.message}`, 400);
  }

  logger.info(`✅ Webhook verified securely: ${event.type}`, { eventId: event.id });

  // Safety offload to our processing service
  // In a truly robust system (Day 12), we'd push `event` into a BullMQ queue here.
  // For now, we await it synchronously.
  await webhookService.processEvent(event);

  // Acknowledge receipt to Stripe so they don't retry the webhook
  res.status(200).json({ received: true });
};
