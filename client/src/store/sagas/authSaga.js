import { takeLatest, call, put } from 'redux-saga/effects';
import authService from '../../services/auth.service';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  logoutStart,
  logoutSuccess,
  logoutFailure,
} from '../slices/authSlice';

function* loginSaga(action) {
  try {
    const { email, password } = action.payload;
    const response = yield call(authService.login, email, password);
    yield put(loginSuccess(response.data));
  } catch (error) {
    yield put(loginFailure(error.response?.data?.message || 'Login failed'));
  }
}

function* registerSaga(action) {
  try {
    const { name, email, password } = action.payload;
    const response = yield call(authService.register, name, email, password);
    yield put(registerSuccess(response.data));
  } catch (error) {
    yield put(registerFailure(error.response?.data?.message || 'Registration failed'));
  }
}

function* logoutSaga() {
  try {
    yield call(authService.logout);
    yield put(logoutSuccess());
  } catch (error) {
    yield put(logoutFailure(error.response?.data?.message || 'Logout failed'));
  }
}

export default function* authSaga() {
  yield takeLatest(loginStart.type, loginSaga);
  yield takeLatest(registerStart.type, registerSaga);
  yield takeLatest(logoutStart.type, logoutSaga);
}
