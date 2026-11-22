import mongoose, { Schema, Document, Types } from 'mongoose';
import { UserRole } from '../types';

export interface ITeamInvite extends Document {
  organizationId: Types.ObjectId;
  email: string;
  role: UserRole;
  token: string;
  expiresAt: Date;
  status: 'Invited' | 'Accepted' | 'Expired';
  createdAt: Date;
}

const TeamInviteSchema = new Schema<ITeamInvite>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['ADMIN', 'MANAGER', 'AGENT'],
      default: 'AGENT',
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Invited', 'Accepted', 'Expired'],
      default: 'Invited',
    },
  },
  {
    timestamps: true,
  }
);

export const TeamInvite = mongoose.model<ITeamInvite>('TeamInvite', TeamInviteSchema);
