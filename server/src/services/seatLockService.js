import redis from "../config/redis.js";

export const lockSeat = async (eventId, seatId, userId) => {
  const key = `seat:${eventId}:${seatId}`;

  const result = await redis.set(key, userId, {
    NX: true,     // only set if NOT exists
    EX: 300       // expires in 5 mins
  });

  return result === "OK";
};

// 🔓 Release a seat lock
export const releaseLock = async (eventId, seatId) => {
  const key = `seat:${eventId}:${seatId}`;
  await redis.del(key);
};

export const lockMultipleSeats = async (eventId, seatIds, userId) => {
  const lockedSeats = [];

  try {
    for (const seatId of seatIds) {
      const success = await lockSeat(eventId, seatId, userId);

      if (!success) {
        // ❌ rollback everything
        for (const lockedSeatId of lockedSeats) {
          await releaseLock(eventId, lockedSeatId);
        }

        return {
          success: false,
          failedSeat: seatId
        };
      }

      lockedSeats.push(seatId);
    }

    return { success: true };

  } catch (err) {
    // 🔥 safety rollback
    for (const lockedSeatId of lockedSeats) {
      await releaseLock(eventId, lockedSeatId);
    }

    throw err;
  }
};

export const getLockOwner = async (eventId, seatId) => {
  const key = `seat:${eventId}:${seatId}`;
  return await redis.get(key);
};