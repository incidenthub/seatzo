import Booking from '../models/booking.model.js';
import Seat from '../models/seat.model.js';
import Event from '../models/event.model.js';
import Payment from '../models/payment.model.js';
import stripe from '../config/stripe.js';
import AppError from '../utils/appError.js';
import { BOOKING_STATUS, SEAT_STATUS, PAYMENT_STATUS } from '../utils/constants.js';
import { releaseLockIfOwner } from '../services/seatLockService.js';
import redis from '../config/redis.js';
import { startPaymentConfirmSaga } from '../services/sagaService.js';

export const createBooking = async (req, res) => {
  const { eventId, seatIds, idempotencyKey } = req.body;
  const userId = req.user._id.toString();

  if (!eventId || !seatIds || !seatIds.length || !idempotencyKey) {
    throw new AppError('eventId, seatIds, and idempotencyKey are required', 400);
  }

  let booking = await Booking.findOne({ idempotencyKey, user: userId });
  if (booking) return res.status(200).json({ success: true, data: booking });

  const event = await Event.findById(eventId);
  if (!event) throw new AppError('Event not found', 404);

  const seats = await Seat.find({ _id: { $in: seatIds }, event: eventId });
  if (seats.length !== seatIds.length) {
    throw new AppError('One or more invalid seats selected', 400);
  }

  const existingPending = await Booking.findOne({
    seats: { $in: seatIds },
    status: BOOKING_STATUS.PENDING,
    user: userId,
  });
  if (existingPending) return res.status(200).json({ success: true, data: existingPending });

  // Verify all seats are Redis-locked by this user before accepting booking
  const lockKeys = seatIds.map((id) => `seat:${eventId}:${id}`);
  const lockOwners = await redis.mGet(lockKeys);
  for (let i = 0; i < seatIds.length; i++) {
    if (lockOwners[i] !== userId) {
      throw new AppError(`Seat ${seats.find(s => s._id.toString() === seatIds[i])?.seatNumber ?? seatIds[i]} is not locked by you`, 403);
    }
  }

  let totalAmount = 0;
  for (const seat of seats) {
    totalAmount += seat.price;
  }
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

  const eventId = booking.event.toString();
  await Promise.allSettled(
    booking.seats.map((seatId) => releaseLockIfOwner(eventId, seatId.toString(), booking.user.toString()))
  );

  res.status(200).json({ success: true, message: 'Booking cancelled' });
};

export const confirmBooking = async (req, res) => {
  const { paymentIntentId } = req.body;
  if (!paymentIntentId) throw new AppError('paymentIntentId is required', 400);

  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new AppError('Booking not found', 404);

  if (booking.user.toString() !== req.user.id) {
    throw new AppError('Not authorized', 403);
  }

  if (booking.status === BOOKING_STATUS.CONFIRMED) {
    await booking.populate('seats', 'seatNumber section price');
    return res.status(200).json({ success: true, data: booking });
  }

  if (booking.status !== BOOKING_STATUS.PENDING) {
    throw new AppError(`Cannot confirm a booking in ${booking.status} status`, 400);
  }

  let intent;
  try {
    intent = await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (err) {
    throw new AppError(`Stripe verification failed: ${err.message}`, 502);
  }
  if (intent.status !== 'succeeded') {
    throw new AppError(`Payment not completed. Stripe status: ${intent.status}`, 402);
  }

  const payment = await Payment.findOneAndUpdate(
    { stripePaymentIntentId: paymentIntentId },
    { status: PAYMENT_STATUS.SUCCESS },
    { returnDocument: 'after' }
  );
  if (payment) booking.paymentId = payment._id;

  const seatIds = booking.seats.map((id) => id.toString());
  const eventId = booking.event.toString();

  await startPaymentConfirmSaga({
    paymentIntentId,
    eventId,
    bookingId: booking._id.toString(),
    seatIds,
  });

  await booking.populate('seats', 'seatNumber section price');

  res.status(200).json({ success: true, data: booking });
};

export const checkIn = async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('event');
  if (!booking) throw new AppError('Booking not found', 404);

  if (booking.status !== BOOKING_STATUS.CONFIRMED) {
    throw new AppError(`Cannot check in. Booking is in ${booking.status} status.`, 400);
  }

  if (booking.event.organiser.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new AppError('Only the event organiser can check in tickets', 403);
  }

  if (booking.checkedIn) {
    throw new AppError(`Ticket already scanned at ${booking.checkedInAt.toLocaleTimeString()}`, 409);
  }

  booking.checkedIn = true;
  booking.checkedInAt = new Date();
  await booking.save();

  res.status(200).json({
    success: true,
    message: 'Check-in successful',
    data: {
      checkedInAt: booking.checkedInAt,
      event: booking.event.title,
      user: booking.user,
    },
  });
};