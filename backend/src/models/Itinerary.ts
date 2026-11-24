import mongoose, { Schema, Document, Types } from 'mongoose';

export type ItineraryStatus = 'Draft' | 'Pending' | 'Confirmed' | 'Completed';

export interface IItineraryDay {
  id: string;
  dayNumber: number;
  title: string;
  description: string;
  activities?: string[];
  hotel?: string;
  meals?: string[];
}

export interface IItinerary extends Document {
  organizationId: Types.ObjectId;
  customerName: string;
  email?: string;
  phone?: string;
  destination: string;
  status: ItineraryStatus;
  departure: Date;
  returnDate?: Date;
  travellers: number;
  totalAmount: number;
  amountPaid: number;
  currency: string;
  package?: string;
  assignedTo?: string;
  notes?: string;
  days: IItineraryDay[];
  createdAt: Date;
  updatedAt: Date;
}

const ItineraryDaySchema = new Schema<IItineraryDay>(
  {
    id: { type: String, required: true },
    dayNumber: { type: Number, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    activities: { type: [String], default: [] },
    hotel: { type: String, default: '', trim: true },
    meals: { type: [String], default: [] },
  },
  { _id: false }
);

const ItinerarySchema = new Schema<IItinerary>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      default: '',
      trim: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    destination: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['Draft', 'Pending', 'Confirmed', 'Completed'],
      default: 'Draft',
      index: true,
    },
    departure: {
      type: Date,
      required: true,
      index: true,
    },
    returnDate: {
      type: Date,
    },
    travellers: {
      type: Number,
      default: 2,
      min: 1,
    },
    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    amountPaid: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    package: {
      type: String,
      default: '',
      trim: true,
    },
    assignedTo: {
      type: String,
      default: '',
      trim: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    days: {
      type: [ItineraryDaySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
ItinerarySchema.index({ organizationId: 1, status: 1 });
ItinerarySchema.index({ organizationId: 1, departure: 1 });
ItinerarySchema.index({ organizationId: 1, createdAt: -1 });

export const Itinerary = mongoose.model<IItinerary>('Itinerary', ItinerarySchema);
