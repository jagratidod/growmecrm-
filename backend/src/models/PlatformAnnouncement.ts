import mongoose, { Schema, Document } from 'mongoose';

export interface IPlatformAnnouncement extends Document {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'critical';
  targetAudience: 'ALL' | 'OWNERS' | 'AGENTS';
  active: boolean;
  expiresAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const PlatformAnnouncementSchema = new Schema<IPlatformAnnouncement>(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['info', 'warning', 'success', 'critical'],
      default: 'info',
    },
    targetAudience: {
      type: String,
      enum: ['ALL', 'OWNERS', 'AGENTS'],
      default: 'ALL',
    },
    active: { type: Boolean, default: true },
    expiresAt: { type: Date },
    createdBy: { type: String, default: 'Super Admin' },
  },
  { timestamps: true }
);

export const PlatformAnnouncement = mongoose.model<IPlatformAnnouncement>(
  'PlatformAnnouncement',
  PlatformAnnouncementSchema
);
