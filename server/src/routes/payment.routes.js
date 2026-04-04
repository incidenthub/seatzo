import { createPayment, getPaymentStatus, processRefund } from '../controllers/payment.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import asyncHandler from '../utils/asyncHandler.js';
import { Router } from "express";

const router = Router();

// Protect ALL payment routes — user must be logged in
router.use(protect);

router.post('/create', asyncHandler(createPayment));
router.get('/:id/status', asyncHandler(getPaymentStatus));
router.post('/:id/refund', asyncHandler(processRefund));

export default router;
