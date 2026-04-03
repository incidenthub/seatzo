import { paymentService } from '../services/payment.service.js';
import AppError from '../utils/appError.js';

export const createPayment = async (req, res) => {
  const { bookingId, amount, idempotencyKey } = req.body;

  if (!bookingId || !idempotencyKey || !amount) {
    throw new AppError('bookingId, amount, and idempotencyKey are required', 400);
  }

  const result = await paymentService.createPaymentIntent({
    userId: req.user.id,
    bookingId,
    amount,
    idempotencyKey
  });

  res.status(201).json({
    success: true,
    data: result
  });
};

export const getPaymentStatus = async (req, res) => {
  const { id } = req.params;

  const result = await paymentService.getPaymentStatus(
    id,
    req.user.id,
    req.user.role
  );

  res.status(200).json({
    success: true,
    data: result
  });
};

export const processRefund = async (req, res) => {
  const { id } = req.params;

  const result = await paymentService.processRefund(
    id,
    req.user.id,
    req.user.role
  );

  res.status(200).json({
    success: true,
    data: result
  });
};
