import SagaState, { SAGA_STATUS } from '../models/sagaState.model.js';
import { sagaQueue } from '../queues/sagaQueue.js';
import logger from '../config/logger.js';
import { sendSagaFailureAlert } from '../services/sagaAdminService.js';

const STALE_THRESHOLD_MS = 15 * 60 * 1000;
const MAX_RETRIES = 5;

export async function sagaRecoveryWorker() {
  logger.info('[SagaRecovery] Running saga recovery scan...');

  const staleSagas = await SagaState.find({
    status: { $in: [SAGA_STATUS.PENDING, SAGA_STATUS.STEPPING] },
    updatedAt: { $lt: new Date(Date.now() - STALE_THRESHOLD_MS) },
    retryCount: { $lt: MAX_RETRIES },
  });

  for (const saga of staleSagas) {
    saga.retryCount += 1;
    saga.status = SAGA_STATUS.PENDING;
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
        jobId: `${saga._id}-retry-${saga.retryCount}`,
      }
    );

    logger.info(`[SagaRecovery] Re-queued stale saga ${saga._id} (attempt ${saga.retryCount})`);
  }

  const deadLetteredSagas = await SagaState.find({
    status: SAGA_STATUS.FAILED,
    retryCount: { $gte: MAX_RETRIES },
  });

  for (const saga of deadLetteredSagas) {
    if (saga.status === SAGA_STATUS.DEAD_LETTERED) continue;

    saga.status = SAGA_STATUS.DEAD_LETTERED;
    saga.deadLetteredAt = new Date();
    await saga.save();

    await sendSagaFailureAlert(saga);

    logger.warn(`[SagaRecovery] Saga ${saga._id} moved to DEAD_LETTERED after ${saga.retryCount} retries`);
  }

  logger.info(`[SagaRecovery] Scan complete — ${staleSagas.length} re-queued, ${deadLetteredSagas.length} dead-lettered`);
}

let interval;

export function startRecoveryWorker() {
  interval = setInterval(sagaRecoveryWorker, STALE_THRESHOLD_MS);
  logger.info(`[SagaRecovery] Worker started — runs every ${STALE_THRESHOLD_MS / 60000} minutes`);
}

export function stopRecoveryWorker() {
  if (interval) clearInterval(interval);
}
