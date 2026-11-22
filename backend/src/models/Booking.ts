import mongoose, { Schema, Document, Types } from 'mongoose';

export type BookingStatus = 'Pending' | 'Confirmed' | 'Ongoing' | 'Completed' | 'Cancelled';

export interface IBooking extends Document {
  organizationId: Types.ObjectId;
  customerName: string;
  email?: string;
  phone?: string;
  destination: string;
  status: BookingStatus;
  departure: string; // YYYY-MM-DD
  returnDate?: string; // YYYY-MM-DD
  travellers: number;
  totalAmount: number;
  amountPaid: number;
  currency: string;
  package?: string;
  assignedTo?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Ongoing', 'Completed', 'Cancelled'],
      default: 'Pending',
      index: true,
    },
    departure: {
      type: String,
      required: [true, 'Departure date is required'],
    },
    returnDate: {
      type: String,
    },
    travellers: {
      type: Number,
      default: 1,
      min: 1,
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: 0,
      default: 0,
    },
    amountPaid: {
      type: Number,
      min: 0,
      default: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    package: {
      type: String,
      trim: true,
    },
    assignedTo: {
      type: String,
      default: 'Unassigned',
      trim: true,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for fast multi-tenant filtering
BookingSchema.index({ organizationId: 1, status: 1 });
BookingSchema.index({ organizationId: 1, departure: 1 });
BookingSchema.index({ organizationId: 1, createdAt: -1 });

export const BookingModel = mongoose.model<IBooking>('Booking', BookingSchema);
export const Booking = BookingModel;
