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