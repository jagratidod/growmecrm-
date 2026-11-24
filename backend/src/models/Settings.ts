import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IChannelsConfig {
  whatsappConnected: boolean;
  instagramConnected: boolean;
  emailConnected: boolean;
  emailFromAddress: string;
  emailApiKey: string;
}

export interface IAiAgentConfig {
  tone: string;
  systemPrompt: string;
  keyFacts: string;
}

export interface IAutomationLog {
  id: string;
  timestamp: string;
  status: 'Sent' | 'Skipped' | 'Checked' | 'Failed';
  leadName?: string;
  channel?: 'WhatsApp' | 'Instagram' | 'Email';
  details: string;
}

export interface IAutomationConfig {
  enabled: boolean;
  nudgeAfterHours: number;
  nudgeMessage: string;
  logs: IAutomationLog[];
}

export interface ISettings extends Document {
  organizationId: Types.ObjectId;
  channels: IChannelsConfig;
  aiAgent: IAiAgentConfig;
  automation: IAutomationConfig;
  createdAt: Date;
  updatedAt: Date;
}

const AutomationLogSchema = new Schema<IAutomationLog>(
  {
    id: { type: String, required: true },
    timestamp: { type: String, required: true },
    status: {
      type: String,
      enum: ['Sent', 'Skipped', 'Checked', 'Failed'],
      default: 'Checked',
    },
    leadName: { type: String },
    channel: {
      type: String,
      enum: ['WhatsApp', 'Instagram', 'Email'],
    },
    details: { type: String, required: true },
  },
  { _id: false }
);

const SettingsSchema = new Schema<ISettings>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      unique: true,
      index: true,
    },
    channels: {
      whatsappConnected: { type: Boolean, default: false },
      instagramConnected: { type: Boolean, default: false },
      emailConnected: { type: Boolean, default: false },
      emailFromAddress: { type: String, default: 'bookings@youragency.com' },
      emailApiKey: { type: String, default: 're_xxxxxxxxxxxx' },
    },
    aiAgent: {
      tone: { type: String, default: 'Friendly, warm and professional' },
      systemPrompt: {
        type: String,
        default:
          'You are the assistant for Wander & Co. Travel — always mention our 24/7 support line if asked about emergencies...',
      },
      keyFacts: {
        type: String,
        default:
          'We specialise in Kashmir, Ladakh and Himachal packages. Payment: 30% advance, balance before departure.',
      },
    },
    automation: {
      enabled: { type: Boolean, default: false },
      nudgeAfterHours: { type: Number, default: 48 },
      nudgeMessage: {
        type: String,
        default:
          'Just checking in — happy to help if you still have questions about your trip! Let us know.',
      },
      logs: [AutomationLogSchema],
    },
  },
  {
    timestamps: true,
  }
);

export const Settings = mongoose.model<ISettings>('Settings', SettingsSchema);
