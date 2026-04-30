import mongoose from 'mongoose';
import { SEAT_STATUS, SEAT_SECTION } from '../utils/constants.js';

// ─── Seat Schema ───────────────────────────────────────────────────────────
// One document per physical seat per event.
// Person B's seatLockService reads/writes: status, lockedBy, lockExpiresAt.
// Person C's checkout reads: status, price, section for the seat map UI.

const seatSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },

  // e.g. A1, B12, C7 — unique within an event (enforced by compound index below)
  seatNumber: {
    type: String,
    required: true,
  },

  row: {
    type: String,
    required: true,
  },

  section: {
    type: String,
    enum: Object.values(SEAT_SECTION),
    required: true,
  },

  status: {
    type: String,
    enum: Object.values(SEAT_STATUS),
    default: SEAT_STATUS.AVAILABLE,
  },

  // Set by Person B's lockSeat() — cleared on release or BOOKED
  lockedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },

  // Mirrors the Redis TTL — used by the expiry cron as a fallback
  lockExpiresAt: {
    type: Date,
    default: null,
  },

  // Set when seat transitions to BOOKED via webhook
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null,
  },

  // Snapshot of price at seat creation — may differ from basePrice
  // if dynamic pricing was applied at booking time
  price: {
    type: Number,
    required: true,
    min: 0,
  },
});

// ─── Indexes ───────────────────────────────────────────────────────────────

// No two seats can share the same number in the same section of the same event
seatSchema.index({ event: 1, section: 1, seatNumber: 1 }, { unique: true });

// Person B queries this on every seat map load — most critical index
seatSchema.index({ event: 1, status: 1 });

export default mongoose.model('Seat', seatSchema);