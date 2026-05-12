import logger from '../config/logger.js';
import { SAGA_TYPE } from '../models/sagaState.model.js';
import { executePaymentConfirmSaga } from './paymentSagaJobs.js';
import { executeRefundSaga } from './refundSagaJobs.js';

export async function processSagaJob(saga, jobData) {
  const { type } = saga;

  try {
    if (type === SAGA_TYPE.PAYMENT_CONFIRM) {
      await executePaymentConfirmSaga(saga, jobData);
    } else if (type === SAGA_TYPE.REFUND) {
      await executeRefundSaga(saga, jobData);
    } else {
      logger.error(`[SagaJobRouter] Unknown saga type: ${type}`);
    }
  } catch (err) {
    logger.error(`[SagaJobRouter] Saga ${saga._id} error: ${err.message}`);
    throw err;
  }
}
