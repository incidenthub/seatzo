import api from './api';

const eventService = {
  getAllEvents: (params = {}) => {
    return api.get('/events', { params });
  },

  getEventById: (id) => {
    return api.get(`/events/${id}`);
  },

  getEventSeats: (id) => {
    return api.get(`/events/${id}/seats`);
  },
};

export default eventService;
