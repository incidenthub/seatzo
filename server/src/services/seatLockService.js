import redis from '../config/redis.js';
import Seat from '../models/Seat.js';

// ─── Lock a single seat ───────────────────────────────────────────────────────
// Atomically claims the Redis key (NX = only if not exists).
// If Redis succeeds, mirrors the lock into MongoDB.
// If MongoDB fails, rolls back the Redis key so state stays consistent.
export const lockSeat = async (eventId, seatId, userId) => {
  const key = `seat:${eventId}:${seatId}`;

  // Step 1 — atomic Redis claim
  // NX: only set if key does NOT exist (prevents double-booking)
  // EX: auto-expire after 300s if user never completes checkout
  const result = await redis.set(key, userId, {
    NX: true,
    EX: 300,
  });

  // Someone else already holds this seat — return false immediately
  if (result !== 'OK') return false;

  // Step 2 — mirror lock into MongoDB
  // Required for: seatExpiryWorker queries, seat map UI, booking validation
  try {
    await Seat.findByIdAndUpdate(
      seatId,
      {
        status:        'LOCKED',
        lockedBy:      userId,
        lockExpiresAt: new Date(Date.now() + 300_000),
      },
      { new: true, runValidators: true }
    );

    return true;

  } catch (err) {
    // MongoDB write failed — release the Redis key so the seat
    // doesn't get stuck locked in Redis with no MongoDB record.
    // This is the rollback that keeps both stores consistent.
    await redis.del(key);
    throw err;
  }
};

// ─── Release a single seat lock ───────────────────────────────────────────────
// Clears both Redis key AND resets MongoDB status back to AVAILABLE.
export const releaseLock = async (eventId, seatId) => {
  const key = `seat:${eventId}:${seatId}`;

  // Run both in parallel — no dependency between them
  await Promise.all([
    redis.del(key),
    Seat.findByIdAndUpdate(seatId, {
      status:        'AVAILABLE',
      lockedBy:      null,
      lockExpiresAt: null,
    }),
  ]);
};

// ─── Lock multiple seats atomically ───────────────────────────────────────────
// Tries to lock each seat in order.
// If any seat fails, rolls back ALL previously acquired locks.
// All-or-nothing: either every seat is locked, or none are.
export const lockMultipleSeats = async (eventId, seatIds, userId) => {
  const lockedSeats = [];

  try {
    for (const seatId of seatIds) {
      const success = await lockSeat(eventId, seatId, userId);

      if (!success) {
        // This seat is taken — roll back every seat we already locked
        await Promise.all(
          lockedSeats.map(id => releaseLock(eventId, id))
        );
        return { success: false, failedSeat: seatId };
      }

      lockedSeats.push(seatId);
    }

    return { success: true };

  } catch (err) {
    // Unexpected error (Redis down, MongoDB timeout, etc.)
    // Best-effort rollback of whatever we managed to lock
    await Promise.allSettled(
      lockedSeats.map(id => releaseLock(eventId, id))
    );
    throw err;
  }
};

// ─── Release ALL locks held by a user for an event ────────────────────────────
// Called when user abandons checkout (back button, timeout, etc.)
// Frees up all their held seats immediately instead of waiting for TTL.
export const releaseAllUserLocks = async (eventId, userId) => {
  // Find all seats this user has locked in MongoDB
  const lockedSeats = await Seat.find({
    event:     eventId,
    lockedBy:  userId,
    status:    'LOCKED',
  }).select('_id');

  if (lockedSeats.length === 0) return { released: 0 };

  // Release all in parallel — Redis + MongoDB for each seat
  await Promise.all(
    lockedSeats.map(seat => releaseLock(eventId, seat._id.toString()))
  );

  return { released: lockedSeats.length };
};

// ─── Get who owns a lock ──────────────────────────────────────────────────────
// Returns the userId who locked this seat, or null if unlocked.
// Called by Person A's booking controller to validate locks before payment.
export const getLockOwner = async (eventId, seatId) => {
  const key = `seat:${eventId}:${seatId}`;
  return await redis.get(key); // returns userId string or null
};

// ─── Get remaining TTL on a lock ─────────────────────────────────────────────
// Returns seconds remaining, or -2 if key doesn't exist.
// Useful for showing the countdown timer on the frontend.
export const getLockTTL = async (eventId, seatId) => {
  const key = `seat:${eventId}:${seatId}`;
  return await redis.ttl(key); // seconds remaining
};