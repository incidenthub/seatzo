import { Queue, Worker } from 'bullmq';
import logger from '../config/logger.js';
import env from '../config/env.js';
import { SAGA_STATUS } from '../models/sagaState.model.js';
import SagaState from '../models/sagaState.model.js';
import { processSagaJob } from '../jobs/sagaJobRouter.js';

let connection;

if (env.redisUrl) {
  try {
    const url = new URL(env.redisUrl);
    connection = {
      host: url.hostname,
      port: parseInt(url.port || '6379', 10),
      username: url.username || undefined,
      password: url.password || undefined,
      tls: url.protocol === 'rediss:' ? {} : undefined,
      maxRetriesPerRequest: null,
    };
  } catch (err) {
    logger.error('[SagaQueue] Failed to parse REDIS_URL, falling back to defaults', { error: err.message });
    connection = {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      maxRetriesPerRequest: null,
    };
  }
} else {
  connection = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    maxRetriesPerRequest: null,
  };
}

export const sagaQueue = new Queue('saga-queue', {
  connection,
});

sagaQueue.on('error', (err) => {
  logger.error('[SagaQueue] Queue connection error:', { error: err.message });
});

export const sagaWorker = new Worker(
  'saga-queue',
  async (job) => {
    const { sagaId } = job.data;
    logger.info(`[SagaWorker] Processing saga ${sagaId}`);

    const saga = await SagaState.findById(sagaId);
    if (!saga) {
      logger.error(`[SagaWorker] Saga ${sagaId} not found, skipping`);
      return;
    }

    if (saga.status === SAGA_STATUS.COMPLETED || saga.status === SAGA_STATUS.COMPENSATED) {
      logger.info(`[SagaWorker] Saga ${sagaId} already ${saga.status}, skipping`);
      return;
    }

    await processSagaJob(saga, job.data);
  },
  {
    connection,
    concurrency: 3,
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 },
    lockDuration: 30000,
    lockRenewTime: 10000,
  }
);

sagaWorker.on('completed', (job) => {
  logger.debug(`[SagaWorker] Job ${job.id} (${job.name}) completed.`);
});

sagaWorker.on('failed', async (job, err) => {
  logger.error(`[SagaWorker] CRITICAL: Job ${job?.id} failed!`, { error: err.message });

  if (job?.data?.sagaId) {
    const saga = await SagaState.findById(job.data.sagaId);
    if (saga) {
      saga.status = SAGA_STATUS.FAILED;
      saga.error = err.message;
      saga.failedAt = new Date();
      await saga.save();
    }
  }
});

logger.info('[BullMQ] Saga Worker initialized and listening');
