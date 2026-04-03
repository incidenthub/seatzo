import mongoose from 'mongoose';
import { PAYMENT_STATUS } from '../utils/constants.js';

const paymentSchema = new mongoose.Schema(
  {
    // The user who made the payment
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // The booking this payment is for (kept as a string for now as per previous isolation)
    booking: {
      type: String,
      required: true,
    },
    // Payment amount in the smallest currency unit (e.g., paise for INR, cents for USD)
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    // Currency code (e.g., 'inr')
    currency: {
      type: String,
      required: true,
      lowercase: true,
    },
    // Current status of this payment in our system
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.INITIATED,
      required: true,
    },
    // Critical: Ensures we never double-charge. Re-using this key returns the existing intent.
    idempotencyKey: {
      type: String,
      required: true,
    },
    // Stripe IDs for tracking and webhooks
    stripePaymentIntentId: {
      type: String,
      required: true,
    },
    stripeClientSecret: {
      type: String,
      required: true,
    },
    stripeChargeId: {
      type: String,
      default: null,
    },
    // Reason from Stripe if the payment fails
    failureReason: {
      type: String,
      default: null,
    },
    // Stripe refund ID if this payment gets refunded
    refundId: {
      type: String,
      default: null,
    },
    // Keep a log of webhook events that hit this payment for debugging
    webhookEvents: [
      {
        eventId: String,
        type: String,
        receivedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ─────────────────────────────────────────────────────────────────

paymentSchema.index({ idempotencyKey: 1 }, { unique: true });
paymentSchema.index({ stripePaymentIntentId: 1 }, { unique: true });
paymentSchema.index({ booking: 1 });
paymentSchema.index({ user: 1, status: 1 });

export default mongoose.model('Payment', paymentSchema);
