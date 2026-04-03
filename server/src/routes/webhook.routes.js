import { Router } from 'express';
import express from 'express';
import { handleStripeWebhook } from '../controllers/webhook.controller.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();

// CRITICAL: Stripe requires the raw body to verify the webhook signature.
// We apply express.raw() ONLY to this specific route, avoiding json parsing.
router.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  asyncHandler(handleStripeWebhook)
);

export default router;
