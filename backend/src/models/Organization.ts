import mongoose, { Schema, Document } from 'mongoose';

export type PlanType = 'STARTER' | 'PRO' | 'ENTERPRISE';

export interface IOrganization extends Document {
  name: string;
  slug: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  plan: PlanType;
  maxSeats: number;
  maxLeads: number;
  status: 'ACTIVE' | 'SUSPENDED' | 'TRIAL';
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema = new Schema<IOrganization>(
  {
    name: {
      type: String,
      required: [true, 'Agency / Organization name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Organization slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    logoUrl: {
      type: String,
      default: '',
    },
    primaryColor: {
      type: String,
      default: '#4F46E5',
    },
    secondaryColor: {
      type: String,
      default: '#0D9488',
    },
    plan: {
      type: String,
      enum: ['STARTER', 'PRO', 'ENTERPRISE'],
      default: 'STARTER',
    },
    maxSeats: {
      type: Number,
      default: 2,
    },
    maxLeads: {
      type: Number,
      default: 500,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'SUSPENDED', 'TRIAL'],
      default: 'ACTIVE',
    },
  },
  {
    timestamps: true,
  }
);

export const Organization = mongoose.model<IOrganization>('Organization', OrganizationSchema);
