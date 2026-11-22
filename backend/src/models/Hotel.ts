import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IRoomType {
  name: string;
  pricePerNight: number;
  inclusions?: string;
  capacity?: number;
}

export interface IHotel extends Document {
  organizationId: Types.ObjectId;
  createdBy?: Types.ObjectId;
  name: string;
  city: string;
  address?: string;
  stars: number;
  pricePerNight: number;
  currency: string;
  phone?: string;
  email?: string;
  notes?: string;
  commissionRate: number; // e.g. 15 for 15% agency commission
  contractExpiry?: Date;
  roomTypes: IRoomType[];
  photos: string[];
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: Date;
  updatedAt: Date;
}

const RoomTypeSchema = new Schema<IRoomType>(
  {
    name: {
      type: String,
      required: [true, 'Room type name is required'],
      trim: true,
    },
    pricePerNight: {
      type: Number,
      required: true,
      min: [0, 'Room price cannot be negative'],
    },
    inclusions: {
      type: String,
      trim: true,
      default: '',
    },
    capacity: {
      type: Number,
      min: 1,
      default: 2,
    },
  },
  { _id: true }
);

const HotelSchema = new Schema<IHotel>(
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
    name: {
      type: String,
      required: [true, 'Hotel name is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      index: true,
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    stars: {
      type: Number,
      required: [true, 'Star rating is required'],
      min: [1, 'Minimum rating is 1 star'],
      max: [5, 'Maximum rating is 5 stars'],
      default: 3,
    },
    pricePerNight: {
      type: Number,
      min: [0, 'Price per night cannot be negative'],
      default: 0,
    },
    currency: {
      type: String,
      default: 'INR',
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    commissionRate: {
      type: Number,
      min: [0, 'Commission cannot be negative'],
      max: [100, 'Commission cannot exceed 100%'],
      default: 0,
    },
    contractExpiry: {
      type: Date,
    },
    roomTypes: {
      type: [RoomTypeSchema],
      default: [],
    },
    photos: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'ARCHIVED'],
      default: 'ACTIVE',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for fast multi-tenant queries and sorting
HotelSchema.index({ organizationId: 1, city: 1 });
HotelSchema.index({ organizationId: 1, name: 1 });
HotelSchema.index({ organizationId: 1, createdAt: -1 });

export const Hotel = mongoose.model<IHotel>('Hotel', HotelSchema);
