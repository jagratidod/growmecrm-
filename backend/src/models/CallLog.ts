import mongoose, { Schema, Document, Types } from 'mongoose';

export type CallOutcome =
  | 'Connected'
  | 'No answer'
  | 'Voicemail'
  | 'Busy'
  | 'Wrong number'
  | string;

export interface ICallLog extends Document {
  organizationId: Types.ObjectId;
  leadId?: string;
  leadName: string;
  leadPhone: string;
  userId?: Types.ObjectId;
  userName: string;
  outcome: CallOutcome;
  notes?: string;
  durationSeconds?: number;
  createdAt: Date;
  updatedAt: Date;
}

const CallLogSchema = new Schema<ICallLog>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    leadId: {
      type: String,
      default: '',
      trim: true,
    },
    leadName: {
      type: String,
      required: true,
      trim: true,
    },
    leadPhone: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    outcome: {
      type: String,
      default: 'Connected',
      trim: true,
      index: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    durationSeconds: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

CallLogSchema.index({ organizationId: 1, createdAt: -1 });
CallLogSchema.index({ organizationId: 1, userName: 1 });

export const CallLog = mongoose.model<ICallLog>('CallLog', CallLogSchema);
