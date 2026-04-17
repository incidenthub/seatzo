import Event from '../models/event.model.js';
import Seat from '../models/seat.model.js';
import Booking from '../models/booking.model.js';
import generateSeats from '../utils/generateSeats.js';
import { EVENT_STATUS, SEAT_STATUS } from '../utils/constants.js';

// ─── Create Event ─────────────────────────────────────────────────────────────
// POST /api/events  (organiser, admin)
// Body must include a `sections` array — seat counts are derived from it,
// never taken from the client directly.

export const createEvent = async (req, res) => {
  try {
    const {
      title, description, venue, city, category,
      date, basePrice, pricingRules, posterUrl, tags,
      sections,
    } = req.body;

    if (!sections || !sections.length) {
      return res.status(400).json({ error: 'At least one section with seats is required' });
    }

    // Validate each section has the required shape
    for (const s of sections) {
      if (!s.name || !s.rows?.length || !s.seatsPerRow || !s.price) {
        return res.status(400).json({
          error: 'Each section must have name, rows, seatsPerRow, and price',
        });
      }
    }

    // Derive seat count from sections — never trust a client-supplied number
    const totalSeats = sections.reduce(
      (sum, s) => sum + s.rows.length * s.seatsPerRow,
      0
    );

    const event = await Event.create({
      title,
      description,
      venue,
      city,
      category,
      date,
      basePrice,
      pricingRules,
      posterUrl,
      tags,
      organiser: req.user._id,
      totalSeats,
      availableSeats: totalSeats,
      status: EVENT_STATUS.DRAFT,
    });

    // Bulk-insert all seat documents in a single round-trip
    await generateSeats(event._id, sections);

    res.status(201).json({
      message: 'Event created successfully',
      event,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Get Events ───────────────────────────────────────────────────────────────
// GET /api/events  (public)
// Supports: city, category, date, minPrice, maxPrice, sort, page, limit

export const getEvents = async (req, res) => {
  try {
    const {
      city, category, date,
      minPrice, maxPrice,
      sort, page = 1, limit = 20,
    } = req.query;

    // Only return published events to the public
    const filter = { status: EVENT_STATUS.PUBLISHED };

    if (city) filter.city = city.toLowerCase().trim();
    if (category) filter.category = category;

    if (date) {
      const dayStart = new Date(date);
      const dayEnd = new Date(date);
      dayEnd.setDate(dayEnd.getDate() + 1);
      filter.date = { $gte: dayStart, $lt: dayEnd };
    }

    if (minPrice || maxPrice) {
      filter.basePrice = {};
      if (minPrice) filter.basePrice.$gte = Number(minPrice);
      if (maxPrice) filter.basePrice.$lte = Number(maxPrice);
    }

    const sortOptions = {
      date: { date: 1 },
      price: { basePrice: 1 },
      popularity: { availableSeats: 1 },  // fewest seats left = most popular
    };
    const sortQuery = sortOptions[sort] || { date: 1 };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [events, total] = await Promise.all([
      Event.find(filter)
        .sort(sortQuery)
        .skip(skip)
        .limit(limitNum)
        .populate('organiser', 'name email'),
      Event.countDocuments(filter),
    ]);

    res.json({
      events,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Get Event ────────────────────────────────────────────────────────────────
// GET /api/events/:id  (public)

export const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organiser', 'name email');

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ event });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Update Event ─────────────────────────────────────────────────────────────
// PUT /api/events/:id  (organiser — must own the event)
// Seat counts cannot be changed after creation — sections is intentionally blocked.

export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    if (event.organiser.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden — you do not own this event' });
    }

    if (event.status !== EVENT_STATUS.DRAFT) {
      return res.status(400).json({
        error: `Cannot edit an event with status: ${event.status}`,
      });
    }

    // Strip fields that must never be updated after creation
    const { sections, totalSeats, availableSeats, organiser, status, ...safeFields } = req.body;

    const updated = await Event.findByIdAndUpdate(
      req.params.id,
      safeFields,
      { new: true, runValidators: true }
    );

    res.json({ message: 'Event updated', event: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Publish Event ────────────────────────────────────────────────────────────
// PATCH /api/events/:id/publish  (organiser — must own the event)

export const publishEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    if (event.organiser.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden — you do not own this event' });
    }

    if (event.status !== EVENT_STATUS.DRAFT) {
      return res.status(400).json({
        error: `Cannot publish an event with status: ${event.status}`,
      });
    }

    event.status = EVENT_STATUS.PUBLISHED;
    await event.save();

    res.json({ message: 'Event published successfully', event });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Cancel Event ─────────────────────────────────────────────────────────────
// DELETE /api/events/:id  (organiser — must own the event)
// Soft delete — sets status to cancelled and disables all available seats.

export const cancelEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    if (event.organiser.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden — you do not own this event' });
    }

    if (event.status === EVENT_STATUS.CANCELLED) {
      return res.status(400).json({ error: 'Event is already cancelled' });
    }

    event.status = EVENT_STATUS.CANCELLED;
    await event.save();

    // Disable all seats that haven't been booked yet
    // so Person B cannot acquire new locks on this event
    await Seat.updateMany(
      { event: event._id, status: SEAT_STATUS.AVAILABLE },
      { $set: { status: SEAT_STATUS.DISABLED } }
    );

    res.json({ message: 'Event cancelled' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Get Analytics ────────────────────────────────────────────────────────────
// GET /api/events/:id/analytics  (organiser — must own the event)
// Uses MongoDB aggregation pipelines — runs in parallel for performance.

export const getAnalytics = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    if (event.organiser.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden — you do not own this event' });
    }

    const [revenueResult, bookingsByDate, seatBreakdown] = await Promise.all([
      // Total revenue + confirmed booking count
      Booking.aggregate([
        { $match: { event: event._id, status: 'CONFIRMED' } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' },
            totalBookings: { $sum: 1 },
          },
        },
      ]),

      // Bookings per day — for a chart on Person C's organiser dashboard
      Booking.aggregate([
        { $match: { event: event._id, status: 'CONFIRMED' } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$confirmedAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Seat status breakdown — AVAILABLE / LOCKED / BOOKED / DISABLED
      Seat.aggregate([
        { $match: { event: event._id } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    const totalRevenue = revenueResult[0]?.totalRevenue ?? 0;
    const totalBookings = revenueResult[0]?.totalBookings ?? 0;
    const soldSeats = event.totalSeats - event.availableSeats;
    const occupancyRate = event.totalSeats > 0
      ? `${((soldSeats / event.totalSeats) * 100).toFixed(1)}%`
      : '0%';

    res.json({
      totalRevenue,
      totalBookings,
      totalSeats: event.totalSeats,
      availableSeats: event.availableSeats,
      soldSeats,
      occupancyRate,
      bookingsByDate,
      seatBreakdown,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};