import mongoose, { Schema, Document, Types } from 'mongoose';

export type InvoiceStatus = 'paid' | 'partial' | 'unpaid';

export interface IInvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface IInvoice extends Document {
  organizationId: Types.ObjectId;
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  destination: string;
  linkedBookingId?: string;
  issueDate: Date;
  dueDate: Date;
  totalAmount: number;
  paidAmount: number;
  currency: string;
  status: InvoiceStatus;
  items: IInvoiceItem[];
  taxDetails?: {
    gstin?: string;
    gstRate?: number;
    gstAmount?: number;
    hsnSacCode?: string;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceItemSchema = new Schema<IInvoiceItem>(
  {
    description: { type: String, required: true },
    quantity: { type: Number, default: 1, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const InvoiceSchema = new Schema<IInvoice>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    invoiceNumber: {
      type: String,
      required: true,
      trim: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerPhone: {
      type: String,
      default: '',
      trim: true,
    },
    customerEmail: {
      type: String,
      default: '',
      trim: true,
    },
    destination: {
      type: String,
      default: 'Custom Travel Package',
      trim: true,
    },
    linkedBookingId: {
      type: String,
      default: '',
      trim: true,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days later
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: ['paid', 'partial', 'unpaid'],
      default: 'unpaid',
      index: true,
    },
    items: {
      type: [InvoiceItemSchema],
      default: [],
    },
    taxDetails: {
      gstin: { type: String, default: '' },
      gstRate: { type: Number, default: 5 },
      gstAmount: { type: Number, default: 0 },
      hsnSacCode: { type: String, default: '' },
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to calculate invoice status
InvoiceSchema.pre<IInvoice>('save', function (next) {
  if (this.paidAmount >= this.totalAmount && this.totalAmount > 0) {
    this.status = 'paid';
  } else if (this.paidAmount > 0) {
    this.status = 'partial';
  } else {
    this.status = 'unpaid';
  }
  next();
});

// Compound indexes
InvoiceSchema.index({ organizationId: 1, invoiceNumber: 1 }, { unique: true });
InvoiceSchema.index({ organizationId: 1, status: 1 });
InvoiceSchema.index({ organizationId: 1, createdAt: -1 });

export const Invoice = mongoose.model<IInvoice>('Invoice', InvoiceSchema);
