// ─── API Base URL ─────────────────────────────────────────────────────────
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// ─── Stripe ───────────────────────────────────────────────────────────────
export const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

// ─── Booking Status ───────────────────────────────────────────────────────
export const BOOKING_STATUS = Object.freeze({
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
});

// ─── Payment Status ───────────────────────────────────────────────────────
export const PAYMENT_STATUS = Object.freeze({
  INITIATED: 'INITIATED',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
});

// ─── Seat Status ──────────────────────────────────────────────────────────
export const SEAT_STATUS = Object.freeze({
  AVAILABLE: 'AVAILABLE',
  LOCKED: 'LOCKED',
  BOOKED: 'BOOKED',
  DISABLED: 'DISABLED',
});

// ─── Seat Sections ────────────────────────────────────────────────────────
export const SEAT_SECTION = Object.freeze({
  PREMIUM: 'PREMIUM',
  GOLD: 'GOLD',
  SILVER: 'SILVER',
  GENERAL: 'GENERAL',
});

// ─── Section Colors ───────────────────────────────────────────────────────
export const SECTION_COLORS = {
  PREMIUM: { bg: '#8b5cf6', text: '#fff', label: 'Premium' },
  GOLD: { bg: '#f59e0b', text: '#fff', label: 'Gold' },
  SILVER: { bg: '#94a3b8', text: '#fff', label: 'Silver' },
  GENERAL: { bg: '#06b6d4', text: '#fff', label: 'General' },
};

// ─── Seat Status Colors ──────────────────────────────────────────────────
export const SEAT_COLORS = {
  AVAILABLE: '#22c55e',
  LOCKED: '#eab308',
  BOOKED: '#ef4444',
  SELECTED: '#3b82f6',
  DISABLED: '#374151',
};

// ─── Event Categories ─────────────────────────────────────────────────────
export const EVENT_CATEGORY = Object.freeze({
  MOVIE: 'movie',
  CONCERT: 'concert',
  SPORTS: 'sports',
  THEATRE: 'theatre',
  STANDUP: 'standup',
});

// ─── Category Display ─────────────────────────────────────────────────────
export const CATEGORY_META = {
  movie: { icon: '🎬', label: 'Movie', gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
  concert: { icon: '🎵', label: 'Concert', gradient: 'linear-gradient(135deg, #f093fb, #f5576c)' },
  sports: { icon: '⚽', label: 'Sports', gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
  theatre: { icon: '🎭', label: 'Theatre', gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)' },
  standup: { icon: '🎤', label: 'Stand-Up', gradient: 'linear-gradient(135deg, #fa709a, #fee140)' },
};
