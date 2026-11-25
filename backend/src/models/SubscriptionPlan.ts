import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscriptionPlan extends Document {
  name: string;
  code: string;
  tagline: string;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  maxSeats: number;
  maxLeads: number;
  features: string[];
  isPopular: boolean;
  isActive: boolean;
  stripePriceId?: string;
  razorpayPlanId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionPlanSchema = new Schema<ISubscriptionPlan>(
  {
    name: { type: String, required: true, trim: true },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    tagline: { type: String, default: '' },
    priceMonthly: { type: Number, required: true, default: 0 },
    priceYearly: { type: Number, required: true, default: 0 },
    currency: { type: String, default: 'INR' },
    maxSeats: { type: Number, required: true, default: 2 },
    maxLeads: { type: Number, required: true, default: 500 },
    features: [{ type: String }],
    isPopular: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    stripePriceId: { type: String, default: '' },
    razorpayPlanId: { type: String, default: '' },
  },
  { timestamps: true }
);

export const SubscriptionPlan = mongoose.model<ISubscriptionPlan>(
  'SubscriptionPlan',
  SubscriptionPlanSchema
);
