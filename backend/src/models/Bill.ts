import mongoose, { Schema, Document, Types } from 'mongoose';

export type BillCategory =
  | 'Hotel'
  | 'Flight'
  | 'Transport'
  | 'Sightseeing'
  | 'Visa'
  | 'Insurance'
  | 'General';

export type BillStatus = 'Paid' | 'Unpaid' | 'Partial';

export interface IBill extends Document {
  organizationId: Types.ObjectId;
  vendor: string;
  category: BillCategory;
  totalAmount: number;
  amountPaid: number;
  currency: string;
  billDate: Date;
  linkedTripId?: string;
  linkedTripName?: string;
  notes?: string;
  status: BillStatus;
  createdAt: Date;
  updatedAt: Date;
}

const BillSchema = new Schema<IBill>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    vendor: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['Hotel', 'Flight', 'Transport', 'Sightseeing', 'Visa', 'Insurance', 'General'],
      default: 'General',
      index: true,
    },
    totalAmount: {
      type: Number,
      required: true,
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
    billDate: {
      type: Date,
      default: Date.now,
    },
    linkedTripId: {
      type: String,
      trim: true,
      default: '',
    },
    linkedTripName: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['Paid', 'Unpaid', 'Partial'],
      default: 'Unpaid',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to automatically calculate bill status
BillSchema.pre<IBill>('save', function (next) {
  if (this.amountPaid >= this.totalAmount && this.totalAmount > 0) {
    this.status = 'Paid';
  } else if (this.amountPaid > 0) {
    this.status = 'Partial';
  } else {
    this.status = 'Unpaid';
  }
  next();
});

// Compound indexes
BillSchema.index({ organizationId: 1, status: 1 });
BillSchema.index({ organizationId: 1, category: 1 });
BillSchema.index({ organizationId: 1, billDate: -1 });

export const Bill = mongoose.model<IBill>('Bill', BillSchema);
