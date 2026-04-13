import api from './api';

const authService = {
  register: (name, email, password) =>
    api.post('/auth/register', { name, email, password }),

  verifyEmail: (email, otp) =>
    api.post('/auth/verify-email', { email, otp }),

  resendOTP: (email) =>
    api.post('/auth/resend-otp', { email }),

  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  logout: () =>
    api.post('/auth/logout'),

  refreshToken: () =>
    api.post('/auth/refresh'),

  forgotPassword: (email) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (email, otp, newPassword) =>
    api.post('/auth/reset-password', { email, otp, newPassword }),
};

export default authService;
