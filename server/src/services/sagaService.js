import SagaState, { SAGA_STATUS, SAGA_TYPE } from '../models/sagaState.model.js';
import { SagaOrchestrator } from '../sagas/SagaOrchestrator.js';
import logger from '../config/logger.js';
import { queueSaga } from '../queues/agendaQueue.js';

export async function startPaymentConfirmSaga({ paymentIntentId, eventId, bookingId, seatIds }) {
  const sagaId = paymentIntentId;

  const existing = await SagaState.findById(sagaId);
  if (existing) {
    logger.info(`[SagaService] Saga ${sagaId} already exists with status ${existing.status}`);
    return sagaId;
  }

  await SagaState.create({
    _id: sagaId,
    type: SAGA_TYPE.PAYMENT_CONFIRM,
    status: SAGA_STATUS.PENDING,
    paymentIntentId,
    eventId,
    bookingId,
    seatIds,
    currentStep: 0,
    completedSteps: [],
    retryCount: 0,
  });

  await queueSaga(sagaId, { paymentIntentId, eventId, bookingId, seatIds });

  return sagaId;
}

export async function startRefundSaga({ paymentIntentId, bookingId, eventId, seatIds, refundType }) {
  const sagaId = `${paymentIntentId}-refund`;

  const existing = await SagaState.findById(sagaId);
  if (existing) {
    logger.info(`[SagaService] Refund saga ${sagaId} already exists with status ${existing.status}`);
    return sagaId;
  }

  await SagaState.create({
    _id: sagaId,
    type: SAGA_TYPE.REFUND,
    status: SAGA_STATUS.PENDING,
    paymentIntentId,
    bookingId,
    eventId,
    seatIds,
    currentStep: 0,
    completedSteps: [],
    retryCount: 0,
  });

  await queueSaga(sagaId, { paymentIntentId, bookingId, eventId, seatIds, refundType });

  return sagaId;
}
