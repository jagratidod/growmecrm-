import mongoose, { Schema, Document, Types } from 'mongoose';

export type FollowUpType = 'call' | 'whatsapp' | 'email' | 'meeting' | 'follow-up';
export type FollowUpStatus = 'pending' | 'completed' | 'overdue';

export interface IFollowUp extends Document {
  organizationId: Types.ObjectId;
  createdBy?: Types.ObjectId;
  leadId?: Types.ObjectId;
  title?: string;
  leadName: string;
  phone: string;
  destination: string;
  dueDate: string; // YYYY-MM-DD
  dueTime: string; // e.g. 11:30 AM
  type: FollowUpType;
  assignedTo?: string;
  assignedToName?: string;
  note: string;
  status: FollowUpStatus;
  completedAt?: Date;
  completedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FollowUpSchema = new Schema<IFollowUp>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization ID is required'],
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    leadId: {
      type: Schema.Types.ObjectId,
      ref: 'Lead',
      index: true,
    },
    title: {
      type: String,
      trim: true,
    },
    leadName: {
      type: String,
      required: [true, 'Lead name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    destination: {
      type: String,
      trim: true,
      default: 'Custom Travel Inquiry',
    },
    dueDate: {
      type: String,
      required: [true, 'Due date is required'],
      trim: true,
      index: true,
    },
    dueTime: {
      type: String,
      trim: true,
      default: '11:00 AM',
    },
    type: {
      type: String,
      enum: ['call', 'whatsapp', 'email', 'meeting', 'follow-up'],
      default: 'follow-up',
    },
    assignedTo: {
      type: String,
      trim: true,
    },
    assignedToName: {
      type: String,
      trim: true,
      default: 'Unassigned',
    },
    note: {
      type: String,
      trim: true,
      default: 'Follow up on travel itinerary and quotes.',
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'overdue'],
      default: 'pending',
      index: true,
    },
    completedAt: {
      type: Date,
    },
    completedBy: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for fast multi-tenant queries
FollowUpSchema.index({ organizationId: 1, status: 1 });
FollowUpSchema.index({ organizationId: 1, dueDate: 1 });
FollowUpSchema.index({ organizationId: 1, createdAt: -1 });

export const FollowUp = mongoose.model<IFollowUp>('FollowUp', FollowUpSchema);
