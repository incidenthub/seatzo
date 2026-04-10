import api from './api';

const seatService = {
  getSeats: (eventId) =>
    api.get(`/seats/${eventId}`),

  lockSeats: (eventId, seatIds) =>
    api.post('/seats/lock', { eventId, seatIds }),

  releaseSeats: (eventId, seatIds) =>
    api.post('/seats/release', { eventId, seatIds }),
};

export default seatService;
