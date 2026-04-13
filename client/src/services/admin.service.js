import api from './api';

const adminService = {
  // GET /api/admin/users — all users with roles
  getAllUsers: () =>
    api.get('/admin/users'),

  // PATCH /api/admin/users/:id/role — change a user's role
  updateUserRole: (userId, role) =>
    api.patch(`/admin/users/${userId}/role`, { role }),

  // GET /api/admin/events — all events including drafts
  getAllEvents: () =>
    api.get('/admin/events'),

  // GET /api/admin/revenue — platform-wide revenue aggregation
  getPlatformRevenue: () =>
    api.get('/admin/revenue'),
};

export default adminService;
