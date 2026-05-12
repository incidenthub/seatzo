import logger from '../config/logger.js';
import { SAGA_STATUS } from '../models/sagaState.model.js';
import SagaState from '../models/sagaState.model.js';
import { sagaQueue } from '../queues/sagaQueue.js';

export class SagaOrchestrator {
  constructor(sagaId) {
    this.sagaId = sagaId;
  }

  async start(initialData) {
    const saga = await SagaState.findById(this.sagaId);
    if (!saga) throw new Error(`Saga ${this.sagaId} not found`);

    saga.status = SAGA_STATUS.PENDING;
    await saga.save();

    await sagaQueue.add(
      this.sagaId,
      { sagaId: this.sagaId, ...initialData },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: true,
        removeOnFail: false,
        jobId: this.sagaId,
      }
    );

    logger.info(`[SagaOrchestrator] Started saga ${this.sagaId} (${saga.type})`);
  }

  static async recordStepSuccess(sagaId, stepIndex) {
    const saga = await SagaState.findById(sagaId);
    if (!saga) return;

    saga.status = SAGA_STATUS.STEPPING;
    saga.currentStep = stepIndex;
    if (!saga.completedSteps.includes(stepIndex)) {
      saga.completedSteps.push(stepIndex);
    }
    saga.error = null;
    await saga.save();
  }

  static async recordStepFailure(sagaId, stepIndex, errorMessage) {
    const saga = await SagaState.findById(sagaId);
    if (!saga) return;

    saga.status = SAGA_STATUS.COMPENSATING;
    saga.error = errorMessage;
    await saga.save();
  }

  static async markCompleted(sagaId) {
    const saga = await SagaState.findById(sagaId);
    if (!saga) return;

    saga.status = SAGA_STATUS.COMPLETED;
    saga.currentStep = -1;
    await saga.save();
    logger.info(`[SagaOrchestrator] Saga ${sagaId} completed`);
  }

  static async markCompensated(sagaId) {
    const saga = await SagaState.findById(sagaId);
    if (!saga) return;

    saga.status = SAGA_STATUS.COMPENSATED;
    saga.currentStep = -1;
    await saga.save();
    logger.info(`[SagaOrchestrator] Saga ${sagaId} compensated`);
  }

  static async markFailed(sagaId, errorMessage) {
    const saga = await SagaState.findById(sagaId);
    if (!saga) return;

    saga.status = SAGA_STATUS.FAILED;
    saga.error = errorMessage;
    saga.failedAt = new Date();
    await saga.save();
    logger.error(`[SagaOrchestrator] Saga ${sagaId} failed: ${errorMessage}`);
  }

  static async getReversedCompletedSteps(sagaId) {
    const saga = await SagaState.findById(sagaId);
    if (!saga) return [];
    return [...saga.completedSteps].sort((a, b) => b - a);
  }
}
