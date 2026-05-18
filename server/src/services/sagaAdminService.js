import SagaState, { SAGA_STATUS, SAGA_TYPE } from '../models/sagaState.model.js';
import { sagaQueue } from '../queues/sagaQueue.js';
import logger from '../config/logger.js';
import { sendSagaFailureAlertEmail } from '../config/email.js';

const MAX_RETRIES = 5;

export async function sendSagaFailureAlert(saga) {
  try {
    await sendSagaFailureAlertEmail(saga);
    logger.info(`[SagaAlert] Failure alert sent for saga ${saga._id}`);
  } catch (err) {
    logger.error(`[SagaAlert] Failed to send alert email for saga ${saga._id}: ${err.message}`);
  }
}

export async function getSagas({ page = 1, limit = 20, type, status, search }) {
  const filter = {};

  if (type) filter.type = type;
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { paymentIntentId: { $regex: search, $options: 'i' } },
      { bookingId: { $regex: search, $options: 'i' } },
      { error: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;

  const [sagas, total] = await Promise.all([
    SagaState.find(filter)
      .sort('-updatedAt')
      .skip(skip)
      .limit(limit)
      .lean(),
    SagaState.countDocuments(filter),
  ]);

  return {
    sagas,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
}

export async function getSagaById(sagaId) {
  const saga = await SagaState.findById(sagaId).lean();
  return saga;
}

export async function retrySaga(sagaId) {
  const saga = await SagaState.findById(sagaId);
  if (!saga) throw new Error('Saga not found');

  if (![SAGA_STATUS.FAILED, SAGA_STATUS.COMPENSATED, SAGA_STATUS.DEAD_LETTERED].includes(saga.status)) {
    throw new Error(`Cannot retry saga in ${saga.status} status`);
  }

  saga.status = SAGA_STATUS.PENDING;
  saga.retryCount = 0;
  saga.completedSteps = [];
  saga.error = null;
  saga.failedAt = null;
  await saga.save();

  await sagaQueue.add(
    saga._id,
    {
      sagaId: saga._id,
      paymentIntentId: saga.paymentIntentId,
      bookingId: saga.bookingId,
      eventId: saga.eventId,
      seatIds: saga.seatIds,
    },
    {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: true,
      removeOnFail: false,
      jobId: `${saga._id}-manual-retry`,
    }
  );

  logger.info(`[SagaAdmin] Saga ${sagaId} manually re-queued by admin`);
  return saga;
}

export async function dismissSaga(sagaId, adminNotes) {
  const saga = await SagaState.findById(sagaId);
  if (!saga) throw new Error('Saga not found');

  saga.status = SAGA_STATUS.DISMISSED;
  saga.adminNotes = adminNotes || null;
  await saga.save();

  logger.info(`[SagaAdmin] Saga ${sagaId} dismissed by admin`);
  return saga;
}

export async function getSagaStats() {
  const [total, byStatus, byType] = await Promise.all([
    SagaState.countDocuments(),
    SagaState.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    SagaState.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]),
  ]);

  const statusMap = Object.fromEntries(byStatus.map((s) => [s._id, s.count]));
  const typeMap = Object.fromEntries(byType.map((t) => [t._id, t.count]));

  const failed = statusMap[SAGA_STATUS.FAILED] || 0;
  const completed = statusMap[SAGA_STATUS.COMPLETED] || 0;
  const compensated = statusMap[SAGA_STATUS.COMPENSATED] || 0;
  const deadLettered = statusMap[SAGA_STATUS.DEAD_LETTERED] || 0;

  return {
    total,
    completed,
    failed,
    compensated,
    deadLettered,
    pending: statusMap[SAGA_STATUS.PENDING] || 0,
    stepping: statusMap[SAGA_STATUS.STEPPING] || 0,
    compensating: statusMap[SAGA_STATUS.COMPENSATING] || 0,
    dismissed: statusMap[SAGA_STATUS.DISMISSED] || 0,
    failureRate: total > 0 ? `${((failed / total) * 100).toFixed(1)}%` : '0%',
    byStatus: statusMap,
    byType: typeMap,
  };
}
