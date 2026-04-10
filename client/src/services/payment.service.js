import api from './api';

const paymentService = {
  createPayment: (bookingId, idempotencyKey) =>
    api.post('/payments/create', { bookingId, idempotencyKey }),

  getPaymentStatus: (paymentId) =>
    api.get(`/payments/${paymentId}/status`),

  requestRefund: (paymentId) =>
    api.post(`/payments/${paymentId}/refund`),
};

export default paymentService;
