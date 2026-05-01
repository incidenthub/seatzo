import redis from '../config/redis.js';
import Seat from '../models/seat.model.js';

export const lockSeat = async (eventId, seatId, userId) => {
  const key = `seat:${eventId}:${seatId}`;

  const result = await redis.set(key, userId, {
    NX: true,
    EX: 300, // 5 minutes
  });

  if (result !== 'OK') return false;

  try {
    await Seat.findByIdAndUpdate(seatId, {
      status: 'LOCKED',
      lockedBy: userId,
      lockExpiresAt: new Date(Date.now() + 300_000),
    });

    return true;

  } catch (err) {
    // Rollback Redis if DB fails
    await redis.del(key);
    throw err;
  }
};

// ─── Release a single seat lock ───────────────────────────────────────────────
export const releaseLock = async (eventId, seatId) => {
  const key = `seat:${eventId}:${seatId}`;

  await Promise.all([
    redis.del(key),
    Seat.findByIdAndUpdate(seatId, {
      status: 'AVAILABLE',
      lockedBy: null,
      lockExpiresAt: null,
    }),
  ]);
};

// ─── Release lock only if owned by user ───────────────────────────────────────
export const releaseLockIfOwner = async (eventId, seatId, userId) => {
  const key = `seat:${eventId}:${seatId}`;
  const lockOwner = await redis.get(key);

  if (lockOwner !== userId) return false;

  await Promise.all([
    redis.del(key),
    Seat.findByIdAndUpdate(seatId, {
      status: 'AVAILABLE',
      lockedBy: null,
      lockExpiresAt: null,
    }),
  ]);

  return true;
};

// ─── Lock multiple seats (transaction-like behavior) ──────────────────────────
export const lockMultipleSeats = async (eventId, seatIds, userId) => {
  const newlyLocked = [];

  try {
    for (const seatId of seatIds) {
      const success = await lockSeat(eventId, seatId, userId);

      if (!success) {
        await Promise.all(
          newlyLocked.map(id => releaseLock(eventId, id))
        );
        return { success: false, failedSeat: seatId };
      }

      newlyLocked.push(seatId);
    }

    return { success: true };

  } catch (err) {
    await Promise.allSettled(
      newlyLocked.map(id => releaseLock(eventId, id))
    );
    throw err;
  }
};

// ─── Mark seats as BOOKED ─────────────────────────────────────────────────────
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

  const keys = seatIds.map(id => `seat:${eventId}:${id}`);
  if (keys.length > 0) {
    await redis.del(keys);
  }
};


export const releaseAllUserLocks = async (eventId, userId) => {
  const pattern = `seat:${eventId}:*`;
  const keys = [];

  for await (const key of redis.scanIterator({ MATCH: pattern, COUNT: 100 })) {
    keys.push(key);
  }

  if (keys.length === 0) return { released: 0 };

  const values = await redis.mGet(keys);

  const ownedKeys = keys.filter((_, i) => values[i] === userId);

  if (ownedKeys.length === 0) return { released: 0 };

  const ownedSeatIds = ownedKeys.map(k => k.split(':')[2]);

  await Promise.all([
    redis.del(ownedKeys),
    Seat.updateMany(
      { _id: { $in: ownedSeatIds } },
      { status: 'AVAILABLE', lockedBy: null, lockExpiresAt: null }
    ),
  ]);

  return { released: ownedKeys.length };
};

// ─── Get lock owner ───────────────────────────────────────────────────────────
export const getLockOwner = async (eventId, seatId) => {
  const key = `seat:${eventId}:${seatId}`;
  return await redis.get(key);
};

// ─── Get remaining TTL ────────────────────────────────────────────────────────
export const getLockTTL = async (eventId, seatId) => {
  const key = `seat:${eventId}:${seatId}`;
  return await redis.ttl(key);
};