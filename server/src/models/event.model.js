import mongoose from 'mongoose';
import { EVENT_STATUS, EVENT_CATEGORY } from '../utils/constants.js';

// ─── Pricing Rules Sub-Schema ──────────────────────────────────────────────
// Stored on the Event document so Person B's pricing engine can read
// the thresholds without a separate DB call.

const pricingRulesSchema = new mongoose.Schema(
  {
    maxViewers:    { type: Number, default: 100 },   // demand multiplier threshold
    enableSurge:   { type: Boolean, default: true },
    maxMultiplier: { type: Number, default: 3.0 },   // price cap: never exceed 3× base
  },
  { _id: false }
);

// ─── Event Schema ──────────────────────────────────────────────────────────

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    organiser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    venue: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      enum: Object.values(EVENT_CATEGORY),
    },

    date: {
      type: Date,
      required: true,
    },

    // Derived from sections on creation — never trust client-supplied values
    totalSeats: {
      type: Number,
      required: true,
      min: 1,
    },

    // Decremented when a booking is CONFIRMED, never below 0
    availableSeats: {
      type: Number,
      required: true,
      min: 0,
    },

    // Stored in paise (₹1 = 100 paise) to avoid floating point issues
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    pricingRules: {
      type: pricingRulesSchema,
      default: () => ({}),
    },

    status: {
      type: String,
      enum: Object.values(EVENT_STATUS),
      default: EVENT_STATUS.DRAFT,
    },

    posterUrl: {
      type: String,
      default: null,
    },

    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// ─── Indexes ───────────────────────────────────────────────────────────────
// Critical for Person C's event listings page filter queries

eventSchema.index({ city: 1, date: 1 });
eventSchema.index({ category: 1, status: 1 });
eventSchema.index({ organiser: 1 });

export default mongoose.model('Event', eventSchema);