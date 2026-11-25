import mongoose, { Schema, Document, Types } from 'mongoose';

export type CampaignChannel = 'whatsapp' | 'email';
export type CampaignStatus = 'sent' | 'scheduled' | 'draft';

export interface ICampaign extends Document {
  organizationId: Types.ObjectId;
  title: string;
  channel: CampaignChannel;
  audience: string;
  message?: string;
  recipientCount: number;
  sentAt: string;
  status: CampaignStatus;
  openRate: string;
  createdAt: Date;
  updatedAt: Date;
}

const CampaignSchema = new Schema<ICampaign>(
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
    channel: {
      type: String,
      enum: ['whatsapp', 'email'],
      default: 'whatsapp',
    },
    audience: {
      type: String,
      required: true,
      default: 'All Active Leads',
    },
    message: {
      type: String,
      trim: true,
    },
    recipientCount: {
      type: Number,
      default: 0,
    },
    sentAt: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['sent', 'scheduled', 'draft'],
      default: 'draft',
    },
    openRate: {
      type: String,
      default: '-',
    },
  },
  {
    timestamps: true,
  }
);

CampaignSchema.index({ organizationId: 1, createdAt: -1 });

export const Campaign = mongoose.model<ICampaign>('Campaign', CampaignSchema);
