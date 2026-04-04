import { lockMultipleSeats } from "../services/seatLockService.js";
import { calculatePrice } from "../services/pricingService.js";

// 🔒 Lock seats
export const lockSeats = async (req, res) => {
  try {
    const { eventId, seatIds } = req.body;
    const userId = "testUser"; // replace later with auth

    const result = await lockMultipleSeats(eventId, seatIds, userId);

    if (!result.success) {
      return res.status(409).json({
        error: `Seat ${result.failedSeat} already locked`
      });
    }

    res.json({ message: "Seats locked successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const getSeats = async (req, res) => {
  try {
    const { eventId } = req.params;

    // 🔥 ADD THIS HERE (VERY IMPORTANT)
    await redis.incr(`viewers:${eventId}`);
    await redis.expire(`viewers:${eventId}`, 300);

    // TEMP event (replace later with DB)
    const event = {
      _id: eventId,
      basePrice: 100,
      totalSeats: 100,
      availableSeats: 50,
      date: new Date(Date.now() + 5 * 60 * 60 * 1000)
    };

    const pricing = await calculatePrice(event);

    res.json({
      eventId,
      pricing
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};