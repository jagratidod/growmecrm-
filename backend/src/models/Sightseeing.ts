import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISightseeing extends Document {
  organizationId: Types.ObjectId;
  createdBy?: Types.ObjectId;
  name: string;
  coverImage?: string;
  description: string;
  destination?: string;
  duration?: string;
  tags?: string[];
  isFavorite?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SightseeingSchema = new Schema<ISightseeing>(
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
      required: [true, 'Activity name is required'],
      trim: true,
      index: true,
    },
    coverImage: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    destination: {
      type: String,
      trim: true,
      default: '',
    },
    duration: {
      type: String,
      trim: true,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for fast multi-tenant queries
SightseeingSchema.index({ organizationId: 1, name: 1 });
SightseeingSchema.index({ organizationId: 1, createdAt: -1 });

export const Sightseeing = mongoose.model<ISightseeing>('Sightseeing', SightseeingSchema);
