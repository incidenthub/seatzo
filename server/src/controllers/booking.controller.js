import Booking from '../models/booking.model.js';
import Seat from '../models/seat.model.js';
import Event from '../models/event.model.js';
import Payment from '../models/payment.model.js';
import stripe from '../config/stripe.js';
import AppError from '../utils/appError.js';
import { BOOKING_STATUS, SEAT_STATUS, PAYMENT_STATUS } from '../utils/constants.js';
import { paymentQueue } from '../queues/paymentEventsQueue.js';
import { markSeatsAsBooked, releaseLock } from '../services/seatLockService.js';

export const createBooking = async (req, res) => {
  const { eventId, seatIds, idempotencyKey } = req.body;
  const userId = req.user._id.toString();

  if (!eventId || !seatIds || !seatIds.length || !idempotencyKey) {
    throw new AppError('eventId, seatIds, and idempotencyKey are required', 400);
  }

  // 1. Check idempotency
  let booking = await Booking.findOne({ idempotencyKey, user: userId });
  if (booking) {
    return res.status(200).json({ success: true, data: booking });
  }

  // 2. Validate event exists
  const event = await Event.findById(eventId);
  if (!event) {
    throw new AppError('Event not found', 404);
  }

  // 3. Validate seats
  const seats = await Seat.find({ _id: { $in: seatIds }, event: eventId });

  if (seats.length !== seatIds.length) {
    throw new AppError('One or more invalid seats selected', 400);
  }

  // 4. Check if any of these seats already have a PENDING booking for this user
  const existingPending = await Booking.findOne({
    seats: { $in: seatIds },
    status: BOOKING_STATUS.PENDING,
    user: userId,
  });

  if (existingPending) {
    return res.status(200).json({ success: true, data: existingPending });
  }

  let totalAmount = 0;

  for (const seat of seats) {
    if (seat.status !== SEAT_STATUS.LOCKED || seat.lockedBy.toString() !== userId) {
      throw new AppError(`Seat ${seat.seatNumber} is not currently locked by you`, 403);
    }
    totalAmount += seat.price;
  }

  // Calculate taxes / convenience fee (12%)
  const fees = Math.round(totalAmount * 0.12);
  const finalTotal = totalAmount + fees;

  try {
    booking = await Booking.create({
      user: userId,
      event: eventId,
      seats: seatIds,
      totalAmount: finalTotal,
      status: BOOKING_STATUS.PENDING,
      idempotencyKey,
    });

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    if (error.code === 11000) {
      booking = await Booking.findOne({ idempotencyKey });
      return res.status(200).json({ success: true, data: booking });
    }
    throw error;
  }
};

export const getBookings = async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate('event', 'title posterUrl date')
    .populate('seats', 'seatNumber section')
    .sort('-createdAt');

  res.status(200).json({ success: true, data: bookings });
};

export const getBookingById = async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('event')
    .populate('seats', 'seatNumber section price');

  if (!booking) throw new AppError('Booking not found', 404);

  if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('Not authorized to access this booking', 403);
  }

  res.status(200).json({ success: true, data: booking });
};

export const cancelBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) throw new AppError('Booking not found', 404);

  if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('Not authorized to cancel this booking', 403);
  }

  if (booking.status !== BOOKING_STATUS.PENDING) {
    throw new AppError(`Cannot cancel a booking in ${booking.status} status`, 400);
  }

  booking.status = BOOKING_STATUS.CANCELLED;
  booking.cancelledAt = new Date();
  await booking.save();

  // BUG 3 FIX: actively release Redis locks + reset seat status immediately
  // instead of waiting for the 5-minute Redis TTL to expire naturally.
  const eventId = booking.event.toString();
  await Promise.allSettled(
    booking.seats.map((seatId) => releaseLock(eventId, seatId.toString()))
  );

  res.status(200).json({ success: true, message: 'Booking cancelled' });
};

// ─── Confirm Booking ──────────────────────────────────────────────────────────
export const confirmBooking = async (req, res) => {
  const { paymentIntentId } = req.body;

  if (!paymentIntentId) throw new AppError('paymentIntentId is required', 400);

  // 1. Load booking — do NOT populate seats yet (we need raw ObjectIds for queries)
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new AppError('Booking not found', 404);

  if (booking.user.toString() !== req.user.id) {
    throw new AppError('Not authorized', 403);
  }

  // 2. Idempotency — already confirmed
  if (booking.status === BOOKING_STATUS.CONFIRMED) {
    // Populate before returning so the frontend gets seat details
    await booking.populate('seats', 'seatNumber section price');
    return res.status(200).json({ success: true, data: booking });
  }

  if (booking.status !== BOOKING_STATUS.PENDING) {
    throw new AppError(`Cannot confirm a booking in ${booking.status} status`, 400);
  }

  // 3. Verify payment with Stripe
  let intent;
  try {
    intent = await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (err) {
    throw new AppError(`Stripe verification failed: ${err.message}`, 502);
  }

  if (intent.status !== 'succeeded') {
    throw new AppError(`Payment not completed. Stripe status: ${intent.status}`, 402);
  }

  // 4. Mark the Payment record as SUCCESS
  const payment = await Payment.findOneAndUpdate(
    { stripePaymentIntentId: paymentIntentId },
    { status: PAYMENT_STATUS.SUCCESS },
    { new: true }
  );

  if (payment) {
    booking.paymentId = payment._id;
  }

  // 5. Confirm the booking
  booking.status = BOOKING_STATUS.CONFIRMED;
  booking.confirmedAt = new Date();
  await booking.save();

  // BUG 2 FIX: extract raw seatId strings BEFORE any populate call.
  // After populate(), booking.seats becomes full objects — passing those
  // into Seat.updateMany's $in filter causes only the first seat to match.
  const seatIds = booking.seats.map((id) => id.toString());
  const eventId = booking.event.toString();

  // BUG 1 FIX: use markSeatsAsBooked so Redis lock keys are deleted
  // alongside the DB status update, keeping both stores in sync.
  await markSeatsAsBooked(eventId, seatIds, booking._id);

  // 6. Decrement availableSeats on the Event
  await Event.findByIdAndUpdate(booking.event, {
    $inc: { availableSeats: -seatIds.length },
  });

  // 7. Populate seats for the response so BookingConfirmation can render seat numbers
  await booking.populate('seats', 'seatNumber section price');

  // 8. Trigger background side-effects (email, etc.)
  if (payment) {
    await paymentQueue.add(
      'PAYMENT_SUCCESS',
      {
        paymentId: payment._id,
        paymentIntentId: payment.stripePaymentIntentId,
        bookingId: booking._id,
        eventId: booking.event,
      },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: true,
        removeOnFail: false,
      }
    );
    console.log(`[ConfirmBooking] Triggered async worker for Booking ${booking._id}`);
  } else {
    console.warn(`[ConfirmBooking] Payment record not found for intent ${paymentIntentId}. Email skipped.`);
  }

  res.status(200).json({ success: true, data: booking });
};