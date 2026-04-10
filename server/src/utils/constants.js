// ─── Payment & Booking Constants ───────────────────────────────────────────
// Single source of truth for status enums across the payments backend.

export const PAYMENT_STATUS = Object.freeze({
  INITIATED: 'INITIATED',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
});

export const BOOKING_STATUS = Object.freeze({
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
});

export const SEAT_STATUS = Object.freeze({
  AVAILABLE: 'AVAILABLE',
  LOCKED: 'LOCKED',
  BOOKED: 'BOOKED',
  DISABLED: 'DISABLED',      // added — used when an event is cancelled
});

export const SEAT_SECTION = Object.freeze({
  PREMIUM: 'PREMIUM',
  GOLD: 'GOLD',
  SILVER: 'SILVER',
  GENERAL: 'GENERAL',
});

export const EVENT_STATUS = Object.freeze({
  DRAFT: 'draft',
  PUBLISHED: 'published',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
});

export const EVENT_CATEGORY = Object.freeze({
  MOVIE: 'movie',
  CONCERT: 'concert',
  SPORTS: 'sports',
  THEATRE: 'theatre',
  STANDUP: 'standup',
});

export const SUPPORTED_CURRENCIES = Object.freeze(['inr', 'usd']);

export const DEFAULT_CURRENCY = 'inr';

// Stripe webhook event types we handle
export const STRIPE_EVENTS = Object.freeze({
  PAYMENT_INTENT_SUCCEEDED: 'payment_intent.succeeded',
  PAYMENT_INTENT_FAILED: 'payment_intent.payment_failed',
  CHARGE_REFUNDED: 'charge.refunded',
});

// Valid payment state transitions (from → [allowed targets])
export const PAYMENT_TRANSITIONS = Object.freeze({
  [PAYMENT_STATUS.INITIATED]: [PAYMENT_STATUS.SUCCESS, PAYMENT_STATUS.FAILED],
  [PAYMENT_STATUS.SUCCESS]: [PAYMENT_STATUS.REFUNDED],
  [PAYMENT_STATUS.FAILED]: [],
  [PAYMENT_STATUS.REFUNDED]: [],
});