import axios from 'axios';
import api from './api';
import { API_BASE_URL } from '../config/constants';

const authService = {
  register: (name, email, password, role) =>
    api.post('/auth/register', { name, email, password, role }),

  verifyEmail: (email, otp) =>
    api.post('/auth/verify-email', { email, otp }),

  resendOTP: (email) =>
    api.post('/auth/resend-otp', { email }),

  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  logout: () =>
    api.post('/auth/logout'),

  refreshToken: () =>
    axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true }),

  forgotPassword: (email) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (email, otp, newPassword) =>
    api.post('/auth/reset-password', { email, otp, newPassword }),
};

export default authService;
