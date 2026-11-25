import mongoose, { Schema, Document } from 'mongoose';

export interface IPlatformSetting extends Document {
  platformName: string;
  supportEmail: string;
  contactPhone: string;
  defaultCurrency: string;
  defaultTrialDays: number;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  allowNewRegistrations: boolean;
  
  // Payment Gateways
  razorpayKeyId?: string;
  razorpayKeySecret?: string;
  razorpayWebhookSecret?: string;
  stripePublishableKey?: string;
  stripeSecretKey?: string;

  // Email Notification Gateway
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpFromEmail?: string;
  smtpPassword?: string;

  createdAt: Date;
  updatedAt: Date;
}

const PlatformSettingSchema = new Schema<IPlatformSetting>(
  {
    platformName: { type: String, default: 'GrowMe CRM', trim: true },
    supportEmail: { type: String, default: '', trim: true },
    contactPhone: { type: String, default: '', trim: true },
    defaultCurrency: { type: String, default: 'INR' },
    defaultTrialDays: { type: Number, default: 14 },
    maintenanceMode: { type: Boolean, default: false },
    maintenanceMessage: {
      type: String,
      default: 'GrowMe CRM is undergoing scheduled maintenance. We will be back online shortly.',
    },
    allowNewRegistrations: { type: Boolean, default: true },

    razorpayKeyId: { type: String, default: '' },
    razorpayKeySecret: { type: String, default: '' },
    razorpayWebhookSecret: { type: String, default: '' },
    stripePublishableKey: { type: String, default: '' },
    stripeSecretKey: { type: String, default: '' },

    smtpHost: { type: String, default: '' },
    smtpPort: { type: Number, default: 587 },
    smtpUser: { type: String, default: '' },
    smtpFromEmail: { type: String, default: '' },
    smtpPassword: { type: String, default: '' },
  },
  { timestamps: true }
);

export const PlatformSetting = mongoose.model<IPlatformSetting>(
  'PlatformSetting',
  PlatformSettingSchema
);
