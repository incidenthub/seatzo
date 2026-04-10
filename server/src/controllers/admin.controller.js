import User from '../models/user.model.js';
import Event from '../models/event.model.js';
import Booking from '../models/booking.model.js';
import AppError from '../utils/appError.js';
import { BOOKING_STATUS } from '../utils/constants.js';

export const getAllUsers = async (req, res) => {
  const users = await User.find().select('-password -otp').sort('-createdAt');
  res.status(200).json({ success: true, data: users });
};

export const updateUserRole = async (req, res) => {
  const { role } = req.body;
  if (!['customer', 'organiser', 'admin'].includes(role)) {
    throw new AppError('Invalid role', 400);
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({ success: true, data: user });
};

export const getAllEvents = async (req, res) => {
  const events = await Event.find().populate('organiser', 'name email').sort('-createdAt');
  res.status(200).json({ success: true, data: events });
};

export const getPlatformRevenue = async (req, res) => {
  // Aggregate revenue from confirmed bookings across all events
  const revenueDetails = await Booking.aggregate([
    {
      $match: { status: BOOKING_STATUS.CONFIRMED }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalAmount' },
        totalBookings: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: revenueDetails.length > 0 ? revenueDetails[0] : { totalRevenue: 0, totalBookings: 0 }
  });
};
