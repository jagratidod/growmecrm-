import mongoose, { Schema, Document, Types } from 'mongoose';

export const leadStages = ['New', 'Contacted', 'Qualified', 'Proposal sent', 'Negotiation', 'Won', 'Lost'] as const;
export type LeadStage = typeof leadStages[number];

export type LeadTemperature = 'Hot' | 'Warm' | 'Cold' | 'Won' | 'Lost';
export type CustomerType = 'B2C' | 'B2B';
export type LeadSource =
  | 'Manual'
  | 'Website'
  | 'Facebook'
  | 'Instagram'
  | 'Google'
  | 'WhatsApp'
  | 'Referral'
  | 'CSV';

export type ActivityType =
  | 'created'
  | 'stage_changed'
  | 'assigned'
  | 'note_added'
  | 'call'
  | 'email'
  | 'whatsapp';

export interface ILeadActivity {
  _id?: Types.ObjectId;
  type: ActivityType;
  description: string;
  timestamp: Date;
  author: string;
  fromStage?: LeadStage;
  toStage?: LeadStage;
}

export interface ILead extends Document {
  organizationId: Types.ObjectId;
  websiteId?: Types.ObjectId;
  name: string;
  email?: string;
  phone: string;
  source: LeadSource;
  status: LeadStage;
  customerType: CustomerType;
  interestedPackage?: string;
  destination: string;
  travelDate?: string;
  travelers: number;
  budget: number;
  currency: string;
  assignedTo: string;
  assignedUserId?: Types.ObjectId;
  stageChangedAt?: Date;
  closedAt?: Date;
  proposalSentAt?: Date;
  lostReason?: string;
  archivedAt?: Date;
  intakeKey?: string;
  temperature: LeadTemperature;
  tags: string[];
  notes?: string;
  activities: ILeadActivity[];
  createdAt: Date;
  updatedAt: Date;
}

const LeadActivitySchema = new Schema<ILeadActivity>({
  type: {
    type: String,
    enum: ['created', 'stage_changed', 'assigned', 'note_added', 'call', 'email', 'whatsapp'],
    default: 'note_added',
  },
  description: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  author: { type: String, default: 'System' },
  fromStage: { type: String, enum: leadStages },
  toStage: { type: String, enum: leadStages },
});

const LeadSchema = new Schema<ILead>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    websiteId: { type: Schema.Types.ObjectId, ref: 'GrowMeWebsite' },
    name: { type: String, required: [true, 'Lead name is required'], trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, default: '', trim: true },
    source: {
      type: String,
      enum: ['Manual', 'Website', 'Facebook', 'Instagram', 'Google', 'WhatsApp', 'Referral', 'CSV'],
      default: 'Manual',
    },
    status: {
      type: String,
      enum: leadStages,
      default: 'New',
      index: true,
    },
    customerType: {
      type: String,
      enum: ['B2C', 'B2B'],
      default: 'B2C',
    },
    interestedPackage: { type: String, trim: true },
    destination: { type: String, required: [true, 'Destination is required'], trim: true },
    travelDate: { type: String },
    travelers: { type: Number, default: 1, min: 1 },
    budget: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'INR' },
    assignedTo: { type: String, default: 'Unassigned' },
    assignedUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    stageChangedAt: { type: Date },
    closedAt: { type: Date },
    proposalSentAt: { type: Date },
    lostReason: { type: String, maxlength: 500 },
    archivedAt: { type: Date },
    intakeKey: { type: String, select: false },
    temperature: {
      type: String,
      enum: ['Hot', 'Warm', 'Cold', 'Won', 'Lost'],
      default: 'Warm',
    },
    tags: { type: [String], default: [] },
    notes: { type: String, default: '' },
    activities: { type: [LeadActivitySchema], default: [] },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for fast multi-tenant filtering
LeadSchema.index({ organizationId: 1, status: 1 });
LeadSchema.index({ organizationId: 1, createdAt: -1 });
LeadSchema.index({ organizationId: 1, assignedUserId: 1 });
LeadSchema.index({ organizationId: 1, intakeKey: 1 }, {
  unique: true, partialFilterExpression: { intakeKey: { $type: 'string' } },
});

export const Lead = mongoose.model<ILead>('Lead', LeadSchema);
