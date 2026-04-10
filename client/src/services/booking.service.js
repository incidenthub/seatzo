import api from './api';

const bookingService = {
  createBooking: (eventId, seatIds, idempotencyKey) =>
    api.post('/bookings', { eventId, seatIds, idempotencyKey }),

  getBookings: (params = {}) =>
    api.get('/bookings', { params }),

  getBookingById: (id) =>
    api.get(`/bookings/${id}`),

  cancelBooking: (id) =>
    api.post(`/bookings/${id}/cancel`),
};

export default bookingService;
