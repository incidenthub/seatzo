import { lockMultipleSeats, releaseLock, releaseLockIfOwner, releaseAllUserLocks } from "../services/seatLockService.js";
import { calculatePrice } from "../services/pricingService.js";
import redis from "../config/redis.js";
import { SEAT_STATUS } from "../utils/constants.js";
import Seat from "../models/seat.model.js";
import Event from "../models/event.model.js";

// ─── Lock Seats ───────────────────────────────────────────────────────────────
export const lockSeats = async (req, res) => {
  try {
    const { eventId, seatIds } = req.body;
    const userId = req.user._id.toString();

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

    let failedSeat = null;

    for (const seatId of seatIds) {
      const released = await releaseLockIfOwner(eventId, seatId, userId);
      if (!released) {
        failedSeat = seatId;
        break;
      }
    }

    if (failedSeat) {
      return res.status(403).json({
        error: `You don't own the lock on seat ${failedSeat}`
      });
    }

    res.json({ message: "Seats released" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ─── Release All User Locks ────────────────────────────────────────────────
export const releaseAllLocks = async (req, res) => {
  try {
    const { eventId } = req.body;
    const userId = req.user._id.toString();

    if (!eventId) {
      return res.status(400).json({ error: "eventId is required" });
    }

    const result = await releaseAllUserLocks(eventId, userId);

    res.json({
      message: `Released ${result.released} seat(s)`,
      released: result.released
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ─── Get Seats ────────────────────────────────────────────────────────────────
export const getSeats = async (req, res) => {
  try {
    const { eventId } = req.params;

    // ─── Viewer tracking (atomic: pipeline avoids TTL race) ────────────
    // node-redis v4: exec() returns [incrResult, expireResult] directly —
    // NOT nested [err, val] pairs like ioredis does.
    const viewerKey = `viewers:${eventId}`;
    const [viewerCount] = await redis
      .multi()
      .incr(viewerKey)
      .expire(viewerKey, 300)
      .exec();

    // ─── Fetch from DB ────────────────────────────────────────────────
    const [seats, event] = await Promise.all([
      Seat.find({ event: eventId }).select("_id seatNumber row section status price").lean(),
      Event.findById(eventId).lean()
    ]);

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // ─── Redis Lock Check (source of truth for LOCKED state only) ─────
    const lockKeys = seats.map((s) => `seat:${eventId}:${s._id}`);
    const lockedValues = lockKeys.length > 0 ? await redis.mGet(lockKeys) : [];

    // FIX Bug 1: Redis only overrides status → LOCKED when a lock exists.
    // All other statuses (BOOKED, DISABLED, AVAILABLE) come from the DB.
    const updatedSeats = seats.map((seat, index) => {
      const lockOwner = lockedValues[index];

      if (lockOwner !== null) {
        // Redis says this seat is actively locked
        return {
          ...seat,
          status: SEAT_STATUS.LOCKED,
          lockedBy: lockOwner,
        };
      }

      // No Redis lock — trust the DB status (AVAILABLE, BOOKED, DISABLED…)
      return {
        ...seat,
        lockedBy: null,
      };
    });

    // ─── Availability ────────────────────────────────────────────────
    const availableSeats = updatedSeats.filter(
      (s) => s.status === SEAT_STATUS.AVAILABLE
    ).length;

    // ─── Pricing ─────────────────────────────────────────────────────
    const pricing = updatedSeats.length > 0
      ? await calculatePrice(event, viewerCount)
      : { price: event.basePrice, multiplier: 1, occupancy: 0, viewers: viewerCount };

    // ─── Attach price ────────────────────────────────────────────────
    const seatsWithPrice = updatedSeats.map((seat) => ({
      ...seat,
      currentPrice: pricing.price
    }));

    const response = {
      eventId,
      viewers: viewerCount,
      seats: seatsWithPrice,
      pricing,
      availableSeats,
    };

    // Short-lived cache for performance — never blindly trusted (Redis lock
    // check above always runs against live data on each request)
    await redis.set(`seats:${eventId}`, JSON.stringify(response), { EX: 5 });

    res.json(response);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};