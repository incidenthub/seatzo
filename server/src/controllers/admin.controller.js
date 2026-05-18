import User from '../models/user.model.js';
import Event from '../models/event.model.js';
import Booking from '../models/booking.model.js';
import AppError from '../utils/appError.js';
import { BOOKING_STATUS } from '../utils/constants.js';
import { sendOrganiserApprovalEmail } from '../config/email.js';
import {
  getSagas,
  getSagaById,
  retrySaga,
  dismissSaga,
  getSagaStats,
} from '../services/sagaAdminService.js';

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

export const getDashboardStats = async (req, res) => {
  const [userCount, eventCount, bookingStats] = await Promise.all([
    User.countDocuments(),
    Event.countDocuments(),
    Booking.aggregate([
      { $match: { status: BOOKING_STATUS.CONFIRMED } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' }, totalBookings: { $sum: 1 } } }
    ])
  ]);

  res.status(200).json({
    success: true,
    data: {
      users: userCount,
      events: eventCount,
      revenue: bookingStats[0]?.totalRevenue || 0,
      bookings: bookingStats[0]?.totalBookings || 0
    }
  });
};

export const getPendingOrganisers = async (req, res) => {
  const organisers = await User.find({
    role: 'organiser',
    organiserStatus: 'pending',
    idCardFront: { $ne: null }
  }).sort('-createdAt');

  res.status(200).json({ success: true, data: organisers });
};

export const verifyOrganiser = async (req, res) => {
  const { status } = req.body;
  if (!['verified', 'rejected'].includes(status)) {
    throw new AppError('Invalid status', 400);
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { organiserStatus: status },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (status === 'verified') {
    sendOrganiserApprovalEmail(user.email, user.name);
  }

  res.status(200).json({ success: true, data: user });
};

export const listSagas = async (req, res) => {
  const { page = '1', limit = '20', type, status, search } = req.query;
  const result = await getSagas({
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    type,
    status,
    search,
  });
  res.status(200).json({ success: true, ...result });
};

export const getSaga = async (req, res) => {
  const saga = await getSagaById(req.params.id);
  if (!saga) throw new AppError('Saga not found', 404);
  res.status(200).json({ success: true, data: saga });
};

export const retrySagaHandler = async (req, res) => {
  const saga = await retrySaga(req.params.id);
  res.status(200).json({ success: true, data: saga, message: 'Saga re-queued successfully' });
};

export const dismissSagaHandler = async (req, res) => {
  const { adminNotes } = req.body;
  const saga = await dismissSaga(req.params.id, adminNotes);
  res.status(200).json({ success: true, data: saga, message: 'Saga dismissed' });
};

export const getSagasStats = async (req, res) => {
  const stats = await getSagaStats();
  res.status(200).json({ success: true, data: stats });
};
