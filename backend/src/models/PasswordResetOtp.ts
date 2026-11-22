import mongoose, { Schema, Document } from 'mongoose';

export interface IPasswordResetOtp extends Document {
  email: string;
  otp: string;
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
}

const PasswordResetOtpSchema = new Schema<IPasswordResetOtp>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      index: true,
    },
    otp: {
      type: String,
      required: [true, 'OTP code is required'],
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 },
    },
    attempts: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const PasswordResetOtp = mongoose.model<IPasswordResetOtp>(
  'PasswordResetOtp',
  PasswordResetOtpSchema
);
