import redis from '../config/redis.js';
import Seat from '../models/seat.model.js';

export const lockSeat = async (eventId, seatId, userId) => {
  // seatId is the MongoDB _id from frontend
  const seat = await Seat.findById(seatId);

  if (!seat || seat.status !== 'AVAILABLE') {
    return false;
  }

  // Use seatNumber for Redis key (more human-readable)
  const key = `seat:${eventId}:${seat.seatNumber}`;

  const result = await redis.set(key, userId, {
    NX: true,
    EX: 300,
  });

  if (result !== 'OK') return false;

  try {
    const updated = await Seat.findByIdAndUpdate(
      seatId,
      {
        status: 'LOCKED',
        lockedBy: userId,
        lockExpiresAt: new Date(Date.now() + 300_000),
      },
      { new: true }
    );

    if (!updated) {
      await redis.del(key); // rollback Redis
      return false;
    }

    return true;

  } catch (err) {
    await redis.del(key);
    throw err;
  }
};

// ─── Release a single seat lock ───────────────────────────────────────────────
// Clears both Redis key AND resets MongoDB status back to AVAILABLE.
export const releaseLock = async (eventId, seatId) => {
  // seatId is MongoDB _id
  const seat = await Seat.findById(seatId);

  if (!seat) return;

  const key = `seat:${eventId}:${seat.seatNumber}`;

  // Run both in parallel — no dependency between them
  await Promise.all([
    redis.del(key),
    Seat.findByIdAndUpdate(
      seatId,
      {
        status: 'AVAILABLE',
        lockedBy: null,
        lockExpiresAt: null,
      }
    ),
  ]);
};

// ─── Release lock only if owned by user ────────────────────────────────────
export const releaseLockIfOwner = async (eventId, seatId, userId) => {
  const seat = await Seat.findById(seatId);

  if (!seat) return false;

  const key = `seat:${eventId}:${seat.seatNumber}`;
  const lockOwner = await redis.get(key);

  // Verify ownership
  if (lockOwner !== userId) {
    return false;
  }

  await Promise.all([
    redis.del(key),
    Seat.findByIdAndUpdate(
      seatId,
      {
        status: 'AVAILABLE',
        lockedBy: null,
        lockExpiresAt: null,
      }
    ),
  ]);

  return true;
};

// ─── Mark seats as BOOKED ──────────────────────────────────────────────────
export const markSeatsAsBooked = async (eventId, seatIds, bookingId) => {
  await Seat.updateMany(
    {
      event: eventId,
      _id: { $in: seatIds },
      status: 'LOCKED'
    },
    {
      status: 'BOOKED',
      booking: bookingId,
      lockedBy: null,
      lockExpiresAt: null
    }
  );

  // Also clear from Redis — need to get seatNumbers to form the Redis keys
  const seatsToRelease = await Seat.find({ _id: { $in: seatIds } }).select('seatNumber');
  const keys = seatsToRelease.map(s => `seat:${eventId}:${s.seatNumber}`);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
};

export const lockMultipleSeats = async (eventId, seatIds, userId) => {
  const newlyLocked = [];

  try {
    for (const seatId of seatIds) {
      const success = await lockSeat(eventId, seatId, userId);

      if (!success) {
        // Roll back ONLY the seats we successfully locked in this specific request.
        // This avoids accidentally releasing other seats the user might have in their cart.
        await Promise.all(
          newlyLocked.map(id => releaseLock(eventId, id))
        );
        return { success: false, failedSeat: seatId };
      }

      newlyLocked.push(seatId);
    }

    return { success: true };

  } catch (err) {
    // Best-effort rollback of whatever we managed to lock in this turn
    await Promise.allSettled(
      newlyLocked.map(id => releaseLock(eventId, id))
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
  });

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