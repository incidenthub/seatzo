import api from './api';

const seatService = {
  // POST /api/seats/lock — atomically lock seats via Redis SETNX
  lockSeats: (eventId, seatIds) =>
    api.post('/seats/lock', { eventId, seatIds }),

  // POST /api/seats/release — release locked seats
  releaseSeats: (eventId, seatIds) =>
    api.post('/seats/release', { eventId, seatIds }),
};

export default seatService;
