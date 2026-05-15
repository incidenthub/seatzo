import redis from '../config/redis.js';
import Seat from '../models/seat.model.js';

const LOCK_TTL = 300;

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
  const uid = userId.toString();
  const key = `seat:${eventId}:${seatId}`;
  const result = await redis.eval(LOCK_SCRIPT, { keys: [key], arguments: [uid, String(LOCK_TTL)] });

  if (result === 'CONFLICT') return false;

  try {
    await Seat.findByIdAndUpdate(seatId, {
      status: 'LOCKED',
      lockedBy: uid,
      lockExpiresAt: new Date(Date.now() + LOCK_TTL * 1000),
    });
    return true;
  } catch (err) {
    await redis.eval(RELEASE_SCRIPT, { keys: [key], arguments: [uid] });
    throw err;
  }
};

export const releaseLock = async (eventId, seatId) => {
  const key = `seat:${eventId}:${seatId}`;
  await Promise.all([
    redis.del(key),
    Seat.findByIdAndUpdate(seatId, { status: 'AVAILABLE', lockedBy: null, lockExpiresAt: null }),
  ]);
};

export const releaseLockIfOwner = async (eventId, seatId, userId) => {
  const uid = userId.toString();
  const key = `seat:${eventId}:${seatId}`;
  const released = await redis.eval(RELEASE_SCRIPT, { keys: [key], arguments: [uid] });
  if (!released) return false;
  await Seat.findByIdAndUpdate(seatId, { status: 'AVAILABLE', lockedBy: null, lockExpiresAt: null });
  return true;
};

export const lockMultipleSeats = async (eventId, seatIds, userId) => {
  const uid = userId.toString();
  
  const pipeline = redis.multi();
  for (const seatId of seatIds) {
    const key = `seat:${eventId}:${seatId}`;
    pipeline.eval(LOCK_SCRIPT, { keys: [key], arguments: [uid, String(LOCK_TTL)] });
  }
  
  const results = await pipeline.exec();
  
  const failedIndices = [];
  results.forEach((result, i) => {
    if (result[1] === 'CONFLICT') failedIndices.push(i);
  });
  
  if (failedIndices.length > 0) {
    const releasePipeline = redis.multi();
    failedIndices.forEach(i => {
      const seatId = seatIds[i];
      const key = `seat:${eventId}:${seatId}`;
      releasePipeline.eval(RELEASE_SCRIPT, { keys: [key], arguments: [uid] });
    });
    await releasePipeline.exec();
    return { success: false, failedSeat: seatIds[failedIndices[0]] };
  }
  
  await Seat.updateMany(
    { _id: { $in: seatIds }, status: { $ne: 'LOCKED' } },
    { status: 'LOCKED', lockedBy: uid, lockExpiresAt: new Date(Date.now() + LOCK_TTL * 1000) }
  );
  
  return { success: true };
};

export const renewLocks = async (eventId, seatIds, userId) => {
  const uid = userId.toString();
  const pipeline = redis.multi();
  for (const seatId of seatIds) {
    const key = `seat:${eventId}:${seatId}`;
    pipeline.eval(LOCK_SCRIPT, { keys: [key], arguments: [uid, String(LOCK_TTL)] });
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
  const uid = userId.toString();
  // lockedBy is stored as a plain string — never wrap in ObjectId
  const seats = await Seat.find({
    event: eventId,
    status: 'LOCKED',
    lockedBy: uid,
  }).select('_id').lean();

  if (seats.length === 0) return { released: 0 };

  const seatIds = seats.map((s) => s._id.toString());
  const redisKeys = seatIds.map((id) => `seat:${eventId}:${id}`);

  await Promise.all([
    redis.del(...redisKeys),
    Seat.updateMany(
      { _id: { $in: seatIds } },
      { status: 'AVAILABLE', lockedBy: null, lockExpiresAt: null }
    ),
  ]);
  return { released: seatIds.length };
};

export const getLockOwner = async (eventId, seatId) => redis.get(`seat:${eventId}:${seatId}`);
export const getLockTTL   = async (eventId, seatId) => redis.ttl(`seat:${eventId}:${seatId}`);