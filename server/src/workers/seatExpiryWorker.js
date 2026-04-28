import cron from "node-cron";
import Seat from "../models/seat.model.js";
import redis from "../config/redis.js";

// runs every minute
cron.schedule("* * * * *", async () => {
  const now = new Date();

  // Find expired locks before updating
  const expiredSeats = await Seat.find({
    status: "LOCKED",
    lockExpiresAt: { $lt: now }
  }).select("seatNumber event");

  if (expiredSeats.length > 0) {
    // Clear expired locks from Redis
    const redisKeys = expiredSeats.map(
      seat => `seat:${seat.event}:${seat.seatNumber}`
    );
    if (redisKeys.length > 0) {
      await redis.del(...redisKeys);
    }

    // Update MongoDB
    const result = await Seat.updateMany(
      {
        status: "LOCKED",
        lockExpiresAt: { $lt: now }
      },
      {
        $set: {
          status: "AVAILABLE",
          lockedBy: null,
          lockExpiresAt: null
        }
      }
    );

    console.log(`Released ${result.modifiedCount} expired locks`);
  }
});