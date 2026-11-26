import { Schema, Document, Types } from 'mongoose';

export type BioLinkIcon = 'whatsapp' | 'package' | 'web' | 'review';

export interface IBioLinkItem {
  id: string;
  title: string;
  url: string;
  icon: BioLinkIcon;
  active: boolean;
}

export interface ILinkTree extends Document {
  organizationId: Types.ObjectId;
  bioTitle: string;
  bioTagline: string;
  links: IBioLinkItem[];
  createdAt: Date;
  updatedAt: Date;
}

const BioLinkItemSchema = new Schema<IBioLinkItem>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    icon: {
      type: String,
      enum: ['whatsapp', 'package', 'web', 'review'],
      default: 'web',
    },
    active: { type: Boolean, default: true },
  },
  { _id: false }
);

export const LinkTreeSchema = new Schema<ILinkTree>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      unique: true,
    },
    bioTitle: {
      type: String,
      default: 'GrowMe CRM',
      trim: true,
    },
    bioTagline: {
      type: String,
      default: '',
      trim: true,
    },
    links: [BioLinkItemSchema],
  },
  {
    timestamps: true,
  }
);
