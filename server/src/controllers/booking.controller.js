import Booking from '../models/booking.model.js';
import Seat from '../models/seat.model.js';
import Event from '../models/event.model.js';
import AppError from '../utils/appError.js';
import { BOOKING_STATUS, SEAT_STATUS } from '../utils/constants.js';

export const createBooking = async (req, res) => {
  const { eventId, seatIds, idempotencyKey } = req.body;
  const userId = req.user._id.toString();

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
  const bookings = await Booking.find({ user: req.user._id })
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

  if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
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

  if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
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
