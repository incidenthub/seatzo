import api from './api';

const seatService = {
  // POST /api/seats/lock — atomically lock seats via Redis SETNX
  lockSeats: (eventId, seatIds) =>
    api.post('/seats/lock', { eventId, seatIds }),

  // DELETE /api/seats/lock — release locked seats
  releaseSeats: (eventId, seatIds) =>
    api.delete('/seats/lock', { data: { eventId, seatIds } }),
};

export default seatService;
