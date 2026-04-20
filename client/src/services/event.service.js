import api from './api';

const pendingEventListRequests = new Map();
const pendingEventDetailRequests = new Map();

const getEventListCacheKey = (params = {}) => JSON.stringify(params || {});

const getEventDetailCacheKey = (id) => String(id || '');

const eventService = {
  // ─── Public ──────────────────────────────────────────────────────────────
  // GET /api/events — list with filters (city, category, date, price, sort, page)
  getAllEvents: (params = {}) =>
    {
      const cacheKey = getEventListCacheKey(params);

      if (pendingEventListRequests.has(cacheKey)) {
        return pendingEventListRequests.get(cacheKey);
      }

      const request = api.get('/events', { params });
      pendingEventListRequests.set(cacheKey, request);

      request.finally(() => {
        pendingEventListRequests.delete(cacheKey);
      });

      return request;
    },

  // GET /api/events/:id
  getEventById: (id) =>
    {
      const cacheKey = getEventDetailCacheKey(id);

      if (pendingEventDetailRequests.has(cacheKey)) {
        return pendingEventDetailRequests.get(cacheKey);
      }

      const request = api.get(`/events/${id}`);
      pendingEventDetailRequests.set(cacheKey, request);

      request.finally(() => {
        pendingEventDetailRequests.delete(cacheKey);
      });

      return request;
    },

  // GET /api/seats/:eventId — seat map + dynamic pricing + viewer count
  getEventSeats: (id) =>
    api.get(`/seats/${id}`),

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
