import mongoose from 'mongoose';

export const SAGA_STATUS = Object.freeze({
  PENDING: 'PENDING',
  STEPPING: 'STEPPING',
  COMPLETED: 'COMPLETED',
  COMPENSATING: 'COMPENSATING',
  COMPENSATED: 'COMPENSATED',
  FAILED: 'FAILED',
  DEAD_LETTERED: 'DEAD_LETTERED',
  DISMISSED: 'DISMISSED',
});

export const SAGA_TYPE = Object.freeze({
  PAYMENT_CONFIRM: 'PAYMENT_CONFIRM',
  REFUND: 'REFUND',
});

const sagaStateSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(SAGA_TYPE),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(SAGA_STATUS),
      default: SAGA_STATUS.PENDING,
      required: true,
    },
    currentStep: {
      type: Number,
      default: 0,
    },
    completedSteps: {
      type: [Number],
      default: [],
    },
    paymentIntentId: {
      type: String,
      required: true,
    },
    bookingId: {
      type: String,
      default: null,
    },
    eventId: {
      type: String,
      default: null,
    },
    seatIds: {
      type: [String],
      default: [],
    },
    error: {
      type: String,
      default: null,
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    adminNotes: {
      type: String,
      default: null,
    },
    deadLetteredAt: {
      type: Date,
      default: null,
    },
    failedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

sagaStateSchema.index({ paymentIntentId: 1 }, { unique: true });
sagaStateSchema.index({ status: 1, updatedAt: 1 });
sagaStateSchema.index({ type: 1, status: 1 });

export default mongoose.model('SagaState', sagaStateSchema);
