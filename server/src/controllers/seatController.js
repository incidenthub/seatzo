import { lockMultipleSeats, releaseLock } from "../services/seatLockService.js";
import { calculatePrice } from "../services/pricingService.js";
import redis from "../config/redis.js";
import { SEAT_STATUS } from "../utils/constants.js";
import Seat from "../models/seat.model.js";

// ─── Lock Seats ───────────────────────────────────────────────────────────────
export const lockSeats = async (req, res) => {
  try {
    const { eventId, seatIds } = req.body;
    const userId = req.user._id.toString(); // fixed — was hardcoded

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

// ─── Release Seats ────────────────────────────────────────────────────────────
export const releaseSeats = async (req, res) => {
  try {
    const { eventId, seatIds } = req.body;
    const userId = req.user._id.toString();

    for (const seatId of seatIds) {
      await releaseLock(eventId, seatId);
    }

    res.json({ message: "Seats released" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ─── Get Seats ────────────────────────────────────────────────────────────────
export const getSeats = async (req, res) => {
  try {
    const { eventId } = req.params;

    const cacheKey = `seats:${eventId}`;

    // 1. Cache check
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    // 2. Viewer tracking
    const viewerKey = `viewers:${eventId}`;
    const viewerCount = await redis.incr(viewerKey);

    if (viewerCount === 1) {
      await redis.expire(viewerKey, 300);
    }

    // 3. Fetch seats from DB
    const seats = await Seat.find({ event: eventId })
      .select("seatNumber row section status price")
      .lean();

    // 4. Check Redis locks for real-time status override
    const lockKeys = seats.map((s) => `seat:${eventId}:${s.seatNumber}`);
    const lockedValues = await redis.mGet(lockKeys);

    const updatedSeats = seats.map((seat, index) => {
      if (lockedValues[index]) {
        return { ...seat, status: SEAT_STATUS.LOCKED };
      }
      return seat;
    });

    // 5. Calculate availability
    const availableSeats = updatedSeats.filter(
      (s) => s.status === "AVAILABLE"
    ).length;

    const event = {
      _id: eventId,
      basePrice: 100,
      totalSeats: updatedSeats.length,
      availableSeats,
      date: new Date(Date.now() + 5 * 60 * 60 * 1000)
    };

    // 6. Dynamic pricing
    const pricing = await calculatePrice(event, viewerCount);

    // 7. Attach price per seat
    const seatsWithPrice = updatedSeats.map((seat) => ({
      ...seat,
      currentPrice: pricing.price
    }));

    const response = {
      eventId,
      viewers: viewerCount,
      seats: seatsWithPrice,
      pricing
    };

    // 8. Cache result for 5 seconds
    await redis.set(cacheKey, JSON.stringify(response), { EX: 5 });

    res.json(response);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};