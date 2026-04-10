import api from './api';

const paymentService = {
  // POST /api/payments/create — creates a Stripe Payment Intent
  createPayment: (bookingId, amount, idempotencyKey) =>
    api.post('/payments/create', { bookingId, amount, idempotencyKey }),

  // GET /api/payments/:id/status — real-time payment status
  getPaymentStatus: (paymentId) =>
    api.get(`/payments/${paymentId}/status`),

  // POST /api/payments/:id/refund — trigger Stripe refund
  requestRefund: (paymentId) =>
    api.post(`/payments/${paymentId}/refund`),
};

export default paymentService;
