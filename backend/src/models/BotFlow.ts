import mongoose, { Schema, Document, Types } from 'mongoose';

export type BotChannel = 'all' | 'whatsapp' | 'instagram';
export type BotTriggerType =
  | 'FIRST_MESSAGE'
  | 'KEYWORD'
  | 'GET_QUOTE'
  | 'OFF_HOURS'
  | 'TRIP_COMPLETED'
  | 'MANUAL';

export type BotStepType =
  | 'send_message'
  | 'ask_question'
  | 'button_choices'
  | 'assign_agent'
  | 'tag_lead';

export interface IBotStep {
  id: string;
  stepNumber: number;
  stepType: BotStepType;
  content: string;
  options?: string[];
  delaySeconds?: number;
}

export interface IBotFlow extends Document {
  organizationId: Types.ObjectId;
  name: string;
  description: string;
  channel: BotChannel;
  trigger: string;
  triggerType: BotTriggerType;
  triggerConfig?: {
    keywords?: string[];
    offHoursStart?: string;
    offHoursEnd?: string;
    leadStatus?: string;
  };
  enabled: boolean;
  stepsCount: number;
  steps: IBotStep[];
  stats: {
    totalTriggered: number;
    totalCompleted: number;
    lastTriggeredAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const BotStepSchema = new Schema<IBotStep>(
  {
    id: { type: String, required: true },
    stepNumber: { type: Number, required: true },
    stepType: {
      type: String,
      enum: ['send_message', 'ask_question', 'button_choices', 'assign_agent', 'tag_lead'],
      default: 'send_message',
    },
    content: { type: String, required: true },
    options: { type: [String], default: [] },
    delaySeconds: { type: Number, default: 0 },
  },
  { _id: false }
);

const BotFlowSchema = new Schema<IBotFlow>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    channel: {
      type: String,
      enum: ['all', 'whatsapp', 'instagram'],
      default: 'all',
      index: true,
    },
    trigger: {
      type: String,
      required: true,
      trim: true,
    },
    triggerType: {
      type: String,
      enum: ['FIRST_MESSAGE', 'KEYWORD', 'GET_QUOTE', 'OFF_HOURS', 'TRIP_COMPLETED', 'MANUAL'],
      default: 'FIRST_MESSAGE',
    },
    triggerConfig: {
      keywords: { type: [String], default: [] },
      offHoursStart: { type: String, default: '20:00' },
      offHoursEnd: { type: String, default: '09:00' },
      leadStatus: { type: String, default: '' },
    },
    enabled: {
      type: Boolean,
      default: true,
      index: true,
    },
    stepsCount: {
      type: Number,
      default: 1,
    },
    steps: {
      type: [BotStepSchema],
      default: [],
    },
    stats: {
      totalTriggered: { type: Number, default: 0 },
      totalCompleted: { type: Number, default: 0 },
      lastTriggeredAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: fast queries per organization and channel/enabled state
BotFlowSchema.index({ organizationId: 1, channel: 1 });
BotFlowSchema.index({ organizationId: 1, enabled: 1 });

export const BotFlow = mongoose.model<IBotFlow>('BotFlow', BotFlowSchema);
