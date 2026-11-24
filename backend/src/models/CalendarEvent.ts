import mongoose, { Schema, Document, Types } from 'mongoose';

export type CalendarEventType = 'manual' | 'departure' | 'return' | 'task' | 'meeting';

export interface ICalendarEvent extends Document {
  organizationId: Types.ObjectId;
  title: string;
  date: string; // YYYY-MM-DD
  notes?: string;
  type: CalendarEventType;
  color?: string;
  linkedBookingId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CalendarEventSchema = new Schema<ICalendarEvent>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: String, // Stored as YYYY-MM-DD for fast date indexing
      required: true,
      trim: true,
      index: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    type: {
      type: String,
      enum: ['manual', 'departure', 'return', 'task', 'meeting'],
      default: 'manual',
      index: true,
    },
    color: {
      type: String,
      default: '#453372',
    },
    linkedBookingId: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

CalendarEventSchema.index({ organizationId: 1, date: 1 });

export const CalendarEvent = mongoose.model<ICalendarEvent>('CalendarEvent', CalendarEventSchema);
