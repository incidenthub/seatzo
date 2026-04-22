import { createSlice } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

const COOKIE_OPTIONS = { expires: 7, path: '/' };

const initialState = {
  user: Cookies.get('user') ? JSON.parse(Cookies.get('user')) : null,
  token: Cookies.get('accessToken') || null,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.accessToken;
      state.error = null;
      Cookies.set('user', JSON.stringify(action.payload.user), COOKIE_OPTIONS);
      Cookies.set('accessToken', action.payload.accessToken, COOKIE_OPTIONS);
    },
    loginFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    registerStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    registerSuccess: (state) => {
      state.isLoading = false;
      state.error = null;
    },
    registerFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    logoutStart: (state) => {
      state.isLoading = true;
    },
    logoutSuccess: (state) => {
      state.isLoading = false;
      state.user = null;
      state.token = null;
      state.error = null;
      Cookies.remove('user', { path: '/' });
      Cookies.remove('accessToken', { path: '/' });
    },
    logoutFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  logoutStart,
  logoutSuccess,
  logoutFailure,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;
