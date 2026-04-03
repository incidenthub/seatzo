import logger from '../config/logger.js';
import { STRIPE_EVENTS } from '../utils/constants.js';
import { bookingConfirmationService } from './bookingConfirmation.service.js';

export const webhookService = {
  /**
   * Main router for webhook events after cryptographic verification.
   * Day 8 stops at parsing and routing. Day 9-11 will implement the actual business logic limits.
   */
  async processEvent(event) {
    const dataObject = event.data.object;

    switch (event.type) {
      case STRIPE_EVENTS.PAYMENT_INTENT_SUCCEEDED:
        logger.info('💰 Action Trigger: Payment Succeeded Flow', { paymentIntentId: dataObject.id });
        await bookingConfirmationService.confirmSuccess(dataObject.id, event.id);
        break;

      case STRIPE_EVENTS.PAYMENT_INTENT_FAILED:
        logger.info('❌ Action Trigger: Payment Failed Flow', { paymentIntentId: dataObject.id });
        const failureMessage = dataObject.last_payment_error?.message || 'Payment failed';
        await bookingConfirmationService.handleFailure(dataObject.id, event.id, failureMessage);
        break;

      case STRIPE_EVENTS.CHARGE_REFUNDED:
        logger.info('💸 Action Trigger: Charge Refunded Flow', { chargeId: dataObject.id, paymentIntentId: dataObject.payment_intent });
        // Handled via fallback sync in case refund was clicked manually in the Stripe Dashboard
        await bookingConfirmationService.handleRefundWebhook(dataObject.payment_intent, event.id, dataObject.id);
        break;

      default:
        // Automatically acknowledge unhandled events without throwing an error
        logger.debug(`Ignored unhandled Stripe event type: ${event.type}`);
    }
  }
};
