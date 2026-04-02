import cron from "node-cron";
import Seat from "../models/Seat.js";

// runs every minute
cron.schedule("* * * * *", async () => {
  const now = new Date();

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

  if (result.modifiedCount > 0) {
    console.log(`Released ${result.modifiedCount} expired locks`);
  }
});