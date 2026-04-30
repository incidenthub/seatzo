import Booking from '../models/booking.model.js';
import Seat from '../models/seat.model.js';
import Event from '../models/event.model.js';
import Payment from '../models/payment.model.js';
import stripe from '../config/stripe.js';
import AppError from '../utils/appError.js';
import { BOOKING_STATUS, SEAT_STATUS, PAYMENT_STATUS } from '../utils/constants.js';
import { paymentQueue } from '../queues/paymentEventsQueue.js';

export const createBooking = async (req, res) => {
  const { eventId, seatIds, idempotencyKey } = req.body;
  const userId = req.user.id;

  if (!eventId || !seatIds || !seatIds.length || !idempotencyKey) {
    throw new AppError('eventId, seatIds, and idempotencyKey are required', 400);
  }

  // 1. Check idempotency
  let booking = await Booking.findOne({ idempotencyKey, user: userId });
  if (booking) {
    return res.status(200).json({
      success: true,
      data: booking
    });
  }

  // 2. Validate event exists (and fetch pricing rules or basePrice if needed)
  const event = await Event.findById(eventId);
  if (!event) {
    throw new AppError('Event not found', 404);
  }

  // 3. Validate logic for seats lock mapping
  // Only allow booking if the user actually holds the locks
  const seats = await Seat.find({ _id: { $in: seatIds }, event: eventId });
  
  if (seats.length !== seatIds.length) {
    throw new AppError('One or more invalid seats selected', 400);
  }
  
  let totalAmount = 0;
  
  // 2.5 Check if any of these seats already have a PENDING booking
  // This prevents double entries if idempotency fails or multiple tabs are open
  const existingPending = await Booking.findOne({
    seats: { $in: seatIds },
    status: BOOKING_STATUS.PENDING,
    user: userId // Only catch if it's the same user to avoid blocking others if locks are weird
  });

  if (existingPending) {
    return res.status(200).json({
      success: true,
      data: existingPending
    });
  }

  for (const seat of seats) {
    if (seat.status !== SEAT_STATUS.LOCKED || seat.lockedBy.toString() !== userId) {
      throw new AppError(`Seat ${seat.seatNumber} is not currently locked by you`, 403);
    }
    // TODO: Ideally apply dynamic pricing here, for now using base seat price
    totalAmount += seat.price;
  }

  // Calculate taxes / convenience fee (12% as per frontend mock)
  const fees = Math.round(totalAmount * 0.12);
  const finalTotal = totalAmount + fees;

  try {
    booking = await Booking.create({
      user: userId,
      event: eventId,
      seats: seatIds,
      totalAmount: finalTotal,
      status: BOOKING_STATUS.PENDING,
      idempotencyKey
    });

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    if (error.code === 11000) { // Dupe Idempotency
        booking = await Booking.findOne({ idempotencyKey });
        return res.status(200).json({ success: true, data: booking });
    }
    throw error;
  }
};

export const getBookings = async (req, res) => {
  const bookings = await Booking.find({ user: req.user.id })
                                .populate('event', 'title posterUrl date')
                                .populate('seats', 'seatNumber section')
                                .sort('-createdAt');
  
  res.status(200).json({
    success: true,
    data: bookings
  });
};

export const getBookingById = async (req, res) => {
  const booking = await Booking.findById(req.params.id)
                               .populate('event')
                               .populate('seats', 'seatNumber section price');
  
  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new AppError('Not authorized to access this booking', 403);
  }

  res.status(200).json({
    success: true,
    data: booking
  });
};

export const cancelBooking = async (req, res) => {
  // Can only cancel pending bookings manually
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new AppError('Not authorized to cancel this booking', 403);
  }

  if (booking.status !== BOOKING_STATUS.PENDING) {
    throw new AppError(`Cannot cancel a booking in ${booking.status} status`, 400);
  }

  booking.status = BOOKING_STATUS.CANCELLED;
  booking.cancelledAt = new Date();
  await booking.save();

  // Theoretically we should release seats, but the TTL cron job does that automatically for LOCKS

  res.status(200).json({
    success: true,
    message: 'Booking cancelled'
  });
};

// ─── Confirm Booking ──────────────────────────────────────────────────────────
// POST /api/bookings/:id/confirm
// Verifies payment with Stripe directly (no webhook required) then transitions
// Booking → CONFIRMED, Seats → BOOKED, Event.availableSeats decremented.
export const confirmBooking = async (req, res) => {
  const { paymentIntentId } = req.body;

  if (!paymentIntentId) {
    throw new AppError('paymentIntentId is required', 400);
  }

  // 1. Load booking and verify ownership
  const booking = await Booking.findById(req.params.id).populate("seats");
  if (!booking) throw new AppError('Booking not found', 404);

  if (booking.user.toString() !== req.user.id) {
    throw new AppError('Not authorized', 403);
  }

  // 2. Idempotency — already confirmed, just return it
  if (booking.status === BOOKING_STATUS.CONFIRMED) {
    return res.status(200).json({ success: true, data: booking });
  }

  if (booking.status !== BOOKING_STATUS.PENDING) {
    throw new AppError(`Cannot confirm a booking in ${booking.status} status`, 400);
  }

  // 3. Verify the payment actually succeeded with Stripe (source of truth)
  let intent;
  try {
    intent = await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (err) {
    throw new AppError(`Stripe verification failed: ${err.message}`, 502);
  }

  if (intent.status !== 'succeeded') {
    throw new AppError(`Payment not completed. Stripe status: ${intent.status}`, 402);
  }

  // 4. Mark the linked Payment record as SUCCESS
  const payment = await Payment.findOneAndUpdate(
    { stripePaymentIntentId: paymentIntentId },
    { status: PAYMENT_STATUS.SUCCESS },
    { new: true }
  );

  if (payment) {
    // 4.1. Link payment to booking
    booking.paymentId = payment._id;
  }

  // 5. Confirm the booking
  booking.status = BOOKING_STATUS.CONFIRMED;
  booking.confirmedAt = new Date();
  await booking.save();

  // 6. Mark all seats as BOOKED
  await Seat.updateMany(
    { _id: { $in: booking.seats } },
    { $set: { status: SEAT_STATUS.BOOKED } },
  );

  // 7. Decrement availableSeats on the Event
  await Event.findByIdAndUpdate(booking.event, {
    $inc: { availableSeats: -booking.seats.length },
  });

  // 8. Trigger background side-effects (Email, etc.)
  if (payment) {
    await paymentQueue.add('PAYMENT_SUCCESS', {
      paymentId: payment._id,
      paymentIntentId: payment.stripePaymentIntentId,
      bookingId: booking._id,
      eventId: booking.event
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: true,
      removeOnFail: false
    });
    console.log(`[ConfirmBooking] Triggered async worker for Booking ${booking._id}`);
  } else {
    console.warn(`[ConfirmBooking] Payment record not found for intent ${paymentIntentId}. Email skipped.`);
  }

  res.status(200).json({ success: true, data: booking });
};
