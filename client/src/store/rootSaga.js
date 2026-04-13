import { all, fork } from 'redux-saga/effects';
import authSaga from './sagas/authSaga';

export default function* rootSaga() {
  yield all([
    fork(authSaga),
    // Add other sagas here as they are created
  ]);
}
