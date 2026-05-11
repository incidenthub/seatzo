import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

const pendingUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['customer', 'organiser', 'admin'],
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    idCardFront: {
      type: String,
      default: null,
    },
    idCardBack: {
      type: String,
      default: null,
    },
    organiserStatus: {
      type: String,
      default: "pending",
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 900, // 15 minutes in seconds
    },
  }
);

export default mongoose.model('PendingUser', pendingUserSchema);
