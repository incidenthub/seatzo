import { Router } from 'express';
import { createBooking, getBookings, getBookingById, cancelBooking, confirmBooking } from '../controllers/booking.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();

router.use(protect);

router.post('/', asyncHandler(createBooking));
router.get('/', asyncHandler(getBookings));
router.get('/:id', asyncHandler(getBookingById));
router.post('/:id/cancel', asyncHandler(cancelBooking));
router.post('/:id/confirm', asyncHandler(confirmBooking));

export default router;
