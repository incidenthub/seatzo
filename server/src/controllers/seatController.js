import { lockMultipleSeats, releaseLockIfOwner, releaseAllUserLocks, renewLocks } from '../services/seatLockService.js';
import { calculatePrice } from '../services/pricingService.js';
import redis from '../config/redis.js';
import { SEAT_STATUS } from '../utils/constants.js';
import Seat from '../models/seat.model.js';
import Event from '../models/event.model.js';

export const lockSeats = async (req, res) => {
  const { eventId, seatIds } = req.body;
  if (!eventId || !Array.isArray(seatIds) || !seatIds.length) {
    return res.status(400).json({ error: 'eventId and seatIds are required' });
  }
  const userId = req.user._id.toString();

  try {
    const result = await lockMultipleSeats(eventId, seatIds, userId);
    if (!result.success) {
      return res.status(409).json({ error: `Seat ${result.failedSeat} is already taken`, failedSeat: result.failedSeat });
    }

    // Return per-seat TTL so frontend can set accurate countdown
    const ttl = 600;
    res.json({ message: 'Seats locked successfully', ttl, expiresAt: Date.now() + ttl * 1000 });
  } catch (err) {
    console.error('[lockSeats]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const releaseSeats = async (req, res) => {
  const { eventId, seatIds } = req.body;
  if (!eventId || !Array.isArray(seatIds) || !seatIds.length) {
    return res.status(400).json({ error: 'eventId and seatIds are required' });
  }
  const userId = req.user._id.toString();

  try {
    let failedSeat = null;
    for (const seatId of seatIds) {
      const released = await releaseLockIfOwner(eventId, seatId, userId);
      if (!released) { failedSeat = seatId; break; }
    }
    if (failedSeat) {
      return res.status(403).json({ error: `You don't own the lock on seat ${failedSeat}` });
    }
    res.json({ message: 'Seats released' });
  } catch (err) {
    console.error('[releaseSeats]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const releaseAllLocks = async (req, res) => {
  let body = req.body;
  if (Buffer.isBuffer(body)) {
    try { body = JSON.parse(body.toString()); } catch { body = {}; }
  }
  const { eventId } = body;
  const userId = req.user._id.toString();

  if (!eventId) return res.status(400).json({ error: 'eventId is required' });

  try {
    const result = await releaseAllUserLocks(eventId, userId);
    res.json({ message: `Released ${result.released} seat(s)`, released: result.released });
  } catch (err) {
    console.error('[releaseAllLocks]', err?.message, err?.code, err?.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const renewSeatLocks = async (req, res) => {
  const { eventId, seatIds } = req.body;
  if (!eventId || !Array.isArray(seatIds) || !seatIds.length) {
    return res.status(400).json({ error: 'eventId and seatIds are required' });
  }
  const userId = req.user._id.toString();

  try {
    const result = await renewLocks(eventId, seatIds, userId);
    if (!result.renewed) {
      return res.status(409).json({
        error: 'Some locks could not be renewed — they may have been taken',
        failedSeats: result.failedSeats,
      });
    }
    res.json({ message: 'Locks renewed', ttl: 600, expiresAt: Date.now() + 600 * 1000 });
  } catch (err) {
    console.error('[renewSeatLocks]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSeats = async (req, res) => {
  try {
    const { eventId } = req.params;

    const viewerKey = `viewers:${eventId}`;
    const [viewerCount] = await redis.multi().incr(viewerKey).expire(viewerKey, 300).exec();

    const [seats, event] = await Promise.all([
      Seat.find({ event: eventId }).select('_id seatNumber row section status price').lean(),
      Event.findById(eventId).lean(),
    ]);

    if (!event) return res.status(404).json({ error: 'Event not found' });

    const lockKeys = seats.map((s) => `seat:${eventId}:${s._id}`);
    const lockedValues = lockKeys.length > 0 ? await redis.mGet(lockKeys) : [];

    const ttls = lockKeys.length > 0
      ? await Promise.all(lockKeys.map((k) => redis.ttl(k)))
      : [];

    const updatedSeats = seats.map((seat, index) => {
      const lockOwner = lockedValues[index];
      if (lockOwner !== null) {
        return { ...seat, status: SEAT_STATUS.LOCKED, lockedBy: lockOwner, lockTtl: ttls[index] ?? 0 };
      }
      return { ...seat, lockedBy: null, lockTtl: 0 };
    });

    const availableSeats = updatedSeats.filter((s) => s.status === SEAT_STATUS.AVAILABLE).length;

    const pricing = updatedSeats.length > 0
      ? await calculatePrice(event, viewerCount)
      : { price: event.basePrice, multiplier: 1, occupancy: 0, viewers: viewerCount };

    const seatsWithPrice = updatedSeats.map((seat) => ({
      ...seat,
      currentPrice: pricing.price,
    }));

    const response = { eventId, viewers: viewerCount, seats: seatsWithPrice, pricing, availableSeats };
    await redis.set(`seats:${eventId}`, JSON.stringify(response), { EX: 5 });
    res.json(response);
  } catch (err) {
    console.error('[getSeats]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};