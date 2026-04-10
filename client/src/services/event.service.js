import api from './api';

const eventService = {
  // ─── Public ──────────────────────────────────────────────────────────────
  // GET /api/events — list with filters (city, category, date, price, sort, page)
  getAllEvents: (params = {}) =>
    api.get('/events', { params }),

  // GET /api/events/:id
  getEventById: (id) =>
    api.get(`/events/${id}`),

  // GET /api/events/:id/seats — seat map + dynamic pricing + viewer count
  getEventSeats: (id) =>
    api.get(`/events/${id}/seats`),

  // ─── Organiser ───────────────────────────────────────────────────────────
  // POST /api/events — create event with sections
  createEvent: (eventData) =>
    api.post('/events', eventData),

  // PUT /api/events/:id — update draft event
  updateEvent: (id, eventData) =>
    api.put(`/events/${id}`, eventData),

  // PATCH /api/events/:id/publish — publish a draft event
  publishEvent: (id) =>
    api.patch(`/events/${id}/publish`),

  // DELETE /api/events/:id — cancel/soft-delete event
  deleteEvent: (id) =>
    api.delete(`/events/${id}`),

  // GET /api/events/:id/analytics — revenue, occupancy, bookings by date
  getAnalytics: (id) =>
    api.get(`/events/${id}/analytics`),
};

export default eventService;
