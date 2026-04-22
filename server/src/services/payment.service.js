import stripe from "../config/stripe.js";
import Payment from "../models/payment.model.js";
import AppError from "../utils/appError.js";
import { PAYMENT_STATUS, DEFAULT_CURRENCY } from "../utils/constants.js";
import logger from "../config/logger.js";

export const paymentService = {
  async createPaymentIntent({ userId, bookingId, amount, idempotencyKey }) {
    // 1. Idempotency Check (Fast Path)
    const existingPayment = await Payment.findOne({ idempotencyKey }).lean();

    if (existingPayment) {
      if (existingPayment.amount !== amount) {
        logger.warn("Tampered idempotency attempt: amount mismatch", {
          idempotencyKey,
          amount,
          existingAmount: existingPayment.amount,
        });
        throw new AppError(
          "Idempotency key already used with a different amount",
          400,
        );
      }

      logger.info("Idempotency key hit. Returning existing payment intent.", {
        idempotencyKey,
        paymentId: existingPayment._id,
      });

      return {
        paymentId: existingPayment._id,
        clientSecret: existingPayment.stripeClientSecret,
        status: existingPayment.status,
        amount: existingPayment.amount,
        currency: existingPayment.currency,
      };
    }

    // 2. Create Stripe Payment Intent
    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.create(
        {
          amount,
          currency: DEFAULT_CURRENCY,
          metadata: {
            bookingId: bookingId,
            userId: userId,
          },
        },
        { idempotencyKey },
      );
    } catch (err) {
      logger.error("Failed to create Stripe Payment Intent", {
        error: err.message,
        idempotencyKey,
      });
      throw new AppError(`Payment gateway error: ${err.message}`, 502);
    }

    // 3. Store the Payment document with Race Condition Protection (E11000)
    let payment;
    try {
      payment = await Payment.create({
        user: userId,
        booking: bookingId,
        amount,
        currency: DEFAULT_CURRENCY,
        status: PAYMENT_STATUS.INITIATED,
        stripePaymentIntentId: paymentIntent.id,
        stripeClientSecret: paymentIntent.client_secret, // ✅ fixed
        idempotencyKey,
      });
    } catch (err) {
      if (err.code === 11000) {
        logger.info(
          "Race condition mitigated: Duplicate key error handled gracefully",
          { idempotencyKey },
        );
        const racedPayment = await Payment.findOne({ idempotencyKey }).lean();
        return {
          paymentId: racedPayment._id,
          clientSecret: racedPayment.stripeClientSecret,
          status: racedPayment.status,
          amount: racedPayment.amount,
          currency: racedPayment.currency,
        };
      }
      throw err;
    }

    return {
      paymentId: payment._id,
      clientSecret: paymentIntent.client_secret, // ✅ fixed
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
    };
  },

  async getPaymentStatus(paymentId, userId, userRole) {
    const payment = await Payment.findById(paymentId)
      .select(
        "status amount currency user stripePaymentIntentId failureReason updatedAt",
      )
      .lean();

    if (!payment) {
      throw new AppError("Payment not found", 404);
    }

    if (payment.user.toString() !== userId && userRole !== "admin") {
      throw new AppError(
        "You do not have permission to view this payment",
        403,
      );
    }

    return {
      paymentId: payment._id,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      stripePaymentIntentId: payment.stripePaymentIntentId,
      failureReason: payment.failureReason,
      lastUpdated: payment.updatedAt,
    };
  },

  async processRefund(paymentId, userId, userRole) {
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      throw new AppError("Payment not found", 404);
    }

    if (payment.user.toString() !== userId && userRole !== "admin") {
      throw new AppError(
        "You do not have permission to refund this payment",
        403,
      );
    }

    if (payment.status !== PAYMENT_STATUS.SUCCESS) {
      throw new AppError(
        `Cannot refund a payment that is in ${payment.status} state`,
        400,
      );
    }

    let refundResult;
    try {
      refundResult = await stripe.refunds.create({
        payment_intent: payment.stripePaymentIntentId,
      });
    } catch (err) {
      logger.error("Stripe Refund API Failed", {
        error: err.message,
        paymentIntentId: payment.stripePaymentIntentId,
      });
      throw new AppError(`Refund failed via gateway: ${err.message}`, 502);
    }

    payment.status = PAYMENT_STATUS.REFUNDED;
    payment.refundId = refundResult.id;

    payment.webhookEvents.push({
      eventId: refundResult.id,
      type: "refund.manual_api_trigger",
      receivedAt: new Date(),
    });

    await payment.save();

    logger.info("Database Updated: Payment refunded successfully", {
      paymentId: payment._id,
      refundId: refundResult.id,
    });

    logger.info(">> Ready for Bookings Refund Integration via Person A/B <<");

    return {
      paymentId: payment._id,
      status: payment.status,
      refundId: payment.refundId,
    };
  },
};