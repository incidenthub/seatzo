import logger from '../config/logger.js';
import { SAGA_STATUS } from '../models/sagaState.model.js';
import SagaState from '../models/sagaState.model.js';

export class SagaOrchestrator {
  constructor(sagaId) {
    this.sagaId = sagaId;
  }

  // The start method is now handled by queueSaga in sagaService.js
  // Kept for compatibility but no longer used
  async start(initialData) {
    logger.info(`[SagaOrchestrator] Legacy start called for ${this.sagaId} (should use queueSaga instead)`);
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
