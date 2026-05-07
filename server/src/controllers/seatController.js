import { lockMultipleSeats, releaseLock, releaseLockIfOwner, releaseAllUserLocks } from "../services/seatLockService.js";
import { calculatePrice } from "../services/pricingService.js";
import redis from "../config/redis.js";
import { SEAT_STATUS } from "../utils/constants.js";
import Seat from "../models/seat.model.js";
import Event from "../models/event.model.js";

export const lockSeats = async (req, res) => {
  try {
    const { eventId, seatIds } = req.body;
    const userId = req.user._id.toString();
    const result = await lockMultipleSeats(eventId, seatIds, userId);
    if (!result.success) {
      return res.status(409).json({ error: `Seat ${result.failedSeat} already locked` });
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
    const userId = req.user._id.toString();
    let failedSeat = null;
    for (const seatId of seatIds) {
      const released = await releaseLockIfOwner(eventId, seatId, userId);
      if (!released) { failedSeat = seatId; break; }
    }
    if (failedSeat) {
      return res.status(403).json({ error: `You don't own the lock on seat ${failedSeat}` });
    }
    res.json({ message: "Seats released" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const releaseAllLocks = async (req, res) => {
  try {
    // Support both regular JSON body and navigator.sendBeacon (arrives as Buffer)
    let body = req.body;
    if (Buffer.isBuffer(body)) {
      try { body = JSON.parse(body.toString()); } catch { body = {}; }
    }
    const { eventId } = body;
    const userId = req.user._id.toString();

    if (!eventId) {
      return res.status(400).json({ error: "eventId is required" });
    }
    const result = await releaseAllUserLocks(eventId, userId);
    res.json({ message: `Released ${result.released} seat(s)`, released: result.released });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getSeats = async (req, res) => {
  try {
    const { eventId } = req.params;

    const viewerKey = `viewers:${eventId}`;
    const [viewerCount] = await redis.multi().incr(viewerKey).expire(viewerKey, 300).exec();

    const [seats, event] = await Promise.all([
      Seat.find({ event: eventId }).select("_id seatNumber row section status price").lean(),
      Event.findById(eventId).lean(),
    ]);

    if (!event) return res.status(404).json({ error: "Event not found" });

    const lockKeys = seats.map((s) => `seat:${eventId}:${s._id}`);
    const lockedValues = lockKeys.length > 0 ? await redis.mGet(lockKeys) : [];

    const updatedSeats = seats.map((seat, index) => {
      const lockOwner = lockedValues[index];
      if (lockOwner !== null) {
        return { ...seat, status: SEAT_STATUS.LOCKED, lockedBy: lockOwner };
      }
      // No Redis lock — trust DB status (AVAILABLE, BOOKED, DISABLED…)
      return { ...seat, lockedBy: null };
    });

    const availableSeats = updatedSeats.filter((s) => s.status === SEAT_STATUS.AVAILABLE).length;

    const pricing = updatedSeats.length > 0
      ? await calculatePrice(event, viewerCount)
      : { price: event.basePrice, multiplier: 1, occupancy: 0, viewers: viewerCount };

    // FIX: seat.price is the base snapshot — do NOT multiply it again here.
    // Send currentPrice separately so the frontend uses the dynamic price
    // for display/checkout without corrupting the stored base price.
    const seatsWithPrice = updatedSeats.map((seat) => ({
      ...seat,
      currentPrice: pricing.price,
    }));

    const response = { eventId, viewers: viewerCount, seats: seatsWithPrice, pricing, availableSeats };
    await redis.set(`seats:${eventId}`, JSON.stringify(response), { EX: 5 });
    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};