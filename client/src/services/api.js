import axios from 'axios';
import { API_BASE_URL } from '../config/constants';
import Cookies from 'js-cookie';

// ─── Axios Instance ───────────────────────────────────────────────────────
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true, // send cookies for refresh token
  headers: {
    'Content-Type': 'application/json',
  },
});

const getLoginRedirectPath = () => {
  try {
    const storedUser = Cookies.get('user') ? JSON.parse(Cookies.get('user')) : null;
    if (window.location.pathname.startsWith('/organizer') || storedUser?.role === 'organiser') {
      return '/organizer-login';
    }
  } catch {
    if (window.location.pathname.startsWith('/organizer')) {
      return '/organizer-login';
    }
  }
  return '/login';
};

const isPublicAuthRoute = (url = '') => {
  return [
    '/auth/login',
    '/auth/register',
    '/auth/verify-email',
    '/auth/resend-otp',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/refresh',
  ].some((route) => url.includes(route));
};

// ─── Request Interceptor ──────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (isPublicAuthRoute(originalRequest?.url || '')) {
      return Promise.reject(error);
    }

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newToken = data.accessToken;
        Cookies.set('accessToken', newToken, { expires: 7, path: '/' });
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        const redirectPath = getLoginRedirectPath();
        Cookies.remove('accessToken', { path: '/' });
        Cookies.remove('user', { path: '/' });
        // Redirect to the appropriate login page if we're not already there
        if (window.location.pathname !== redirectPath) {
          window.location.href = redirectPath;
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
