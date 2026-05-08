import redis from '../config/redis.js';
import Seat from '../models/seat.model.js';

const LOCK_TTL = 300; // 5 minutes

// Atomic lock via Lua: SET NX only if key absent
const LOCK_SCRIPT = `
  local key = KEYS[1]
  local owner = ARGV[1]
  local ttl = tonumber(ARGV[2])
  local current = redis.call('GET', key)
  if current == owner then
    redis.call('EXPIRE', key, ttl)
    return 'RENEWED'
  end
  if current ~= false then
    return 'CONFLICT'
  end
  redis.call('SET', key, owner, 'EX', ttl)
  return 'OK'
`;

// Atomic release via Lua: DEL only if caller owns
const RELEASE_SCRIPT = `
  local key = KEYS[1]
  local owner = ARGV[1]
  local current = redis.call('GET', key)
  if current == owner then
    redis.call('DEL', key)
    return 1
  end
  return 0
`;

export const lockSeat = async (eventId, seatId, userId) => {
  const key = `seat:${eventId}:${seatId}`;
  const result = await redis.eval(LOCK_SCRIPT, { keys: [key], arguments: [userId, String(LOCK_TTL)] });

  if (result === 'CONFLICT') return false;

  try {
    await Seat.findByIdAndUpdate(seatId, {
      status: 'LOCKED',
      lockedBy: userId,
      lockExpiresAt: new Date(Date.now() + LOCK_TTL * 1000),
    });
    return true;
  } catch (err) {
    await redis.eval(RELEASE_SCRIPT, { keys: [key], arguments: [userId] });
    throw err;
  }
};

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

export const releaseLockIfOwner = async (eventId, seatId, userId) => {
  const key = `seat:${eventId}:${seatId}`;
  const released = await redis.eval(RELEASE_SCRIPT, { keys: [key], arguments: [userId] });
  if (!released) return false;

  await Seat.findByIdAndUpdate(seatId, {
    status: 'AVAILABLE',
    lockedBy: null,
    lockExpiresAt: null,
  });
  return true;
};

export const lockMultipleSeats = async (eventId, seatIds, userId) => {
  const newlyLocked = [];
  try {
    for (const seatId of seatIds) {
      const success = await lockSeat(eventId, seatId, userId);
      if (!success) {
        await Promise.allSettled(
          newlyLocked.map((id) => releaseLockIfOwner(eventId, id, userId))
        );
        return { success: false, failedSeat: seatId };
      }
      newlyLocked.push(seatId);
    }
    return { success: true };
  } catch (err) {
    await Promise.allSettled(
      newlyLocked.map((id) => releaseLockIfOwner(eventId, id, userId))
    );
    throw err;
  }
};

export const renewLocks = async (eventId, seatIds, userId) => {
  const pipeline = redis.multi();
  for (const seatId of seatIds) {
    const key = `seat:${eventId}:${seatId}`;
    pipeline.eval(LOCK_SCRIPT, { keys: [key], arguments: [userId, String(LOCK_TTL)] });
  }
  const results = await pipeline.exec();
  const failed = seatIds.filter((_, i) => results[i] === 'CONFLICT');
  return { renewed: failed.length === 0, failedSeats: failed };
};

export const markSeatsAsBooked = async (eventId, seatIds, bookingId) => {
  await Seat.updateMany(
    { event: eventId, _id: { $in: seatIds } },
    { status: 'BOOKED', booking: bookingId, lockedBy: null, lockExpiresAt: null }
  );
  const keys = seatIds.map((id) => `seat:${eventId}:${id}`);
  if (keys.length > 0) await redis.del(...keys);
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

  const ownedSeatIds = ownedKeys.map((k) => k.split(':')[2]);
  await Promise.all([
    redis.del(...ownedKeys),
    Seat.updateMany(
      { _id: { $in: ownedSeatIds } },
      { status: 'AVAILABLE', lockedBy: null, lockExpiresAt: null }
    ),
  ]);
  return { released: ownedKeys.length };
};

export const getLockOwner = async (eventId, seatId) => {
  return await redis.get(`seat:${eventId}:${seatId}`);
};

export const getLockTTL = async (eventId, seatId) => {
  return await redis.ttl(`seat:${eventId}:${seatId}`);
};