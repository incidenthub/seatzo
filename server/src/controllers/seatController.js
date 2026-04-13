import { lockMultipleSeats } from "../services/seatLockService.js";
import { calculatePrice } from "../services/pricingService.js";
import redis from "../config/redis.js";
import { SEAT_STATUS } from "../utils/constants.js";
import Seat from "../models/seat.model.js"
import { releaseLock } from "../services/seatLockService.js";



// 🔒 Lock seats
export const lockSeats = async (req, res) => {
  try {
    const { eventId, seatIds } = req.body;
    const userId = "69d0de61feb5e5771ce5e1b4"; // replace later with auth

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



export const releaseSeats = async (req, res) => {
  try {
    const { eventId, seatIds } = req.body;

    for (const seatId of seatIds) {
      await releaseLock(eventId, seatId);
    }

    res.json({ message: "Seats released" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}


export const generateSeats = () => {
  const seats = [];

  for (let i = 1; i <= 50; i++) {
    seats.push({
      seatId: `A${i}`,
      status: "AVAILABLE"
    });
  }

  return seats;
};

export const getSeats = async (req, res) => {
  try {
    const { eventId } = req.params;

    const cacheKey = `seats:${eventId}`;

    // 🚀 1. CACHE CHECK
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    // 🔥 2. VIEWER TRACKING
    const viewerKey = `viewers:${eventId}`;
    const viewerCount = await redis.incr(viewerKey);

    if (viewerCount === 1) {
      await redis.expire(viewerKey, 300);
    }

    // 🪑 3. FETCH SEATS FROM DB
    const seats = await Seat.find({ event: eventId })
      .select("seatNumber row section status price")
      .lean();

    // 🔒 4. CHECK REDIS LOCKS (REAL-TIME OVERRIDE)
    const lockKeys = seats.map(
      (s) => `seat:${eventId}:${s.seatNumber}`
    );

    const lockedValues = await redis.mGet(lockKeys);

    const updatedSeats = seats.map((seat, index) => {
      if (lockedValues[index]) {
        return {
          ...seat,

          status: SEAT_STATUS.LOCKED
        };
      }
      return seat;
    });

    // 📊 5. CALCULATE AVAILABILITY
    const availableSeats = updatedSeats.filter(
      (s) => s.status === "AVAILABLE"
    ).length;

    const event = {
      _id: eventId,
      basePrice: 100, // replace later with Event model
      totalSeats: updatedSeats.length,
      availableSeats,
      date: new Date(Date.now() + 5 * 60 * 60 * 1000)
    };

    // 💰 6. PRICING
    const pricing = await calculatePrice(event, viewerCount);

    // 🧩 7. ATTACH PRICE PER SEAT
    const seatsWithPrice = updatedSeats.map((seat) => ({
      ...seat,
      currentPrice: pricing.price // dynamic price
    }));

    const response = {
      eventId,
      viewers: viewerCount,
      seats: seatsWithPrice,
      pricing
    };

    // ⚡ 8. CACHE RESULT (5 sec)
    await redis.set(cacheKey, JSON.stringify(response), {
      EX: 5
    });

    res.json(response);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};