import mongoose, { Schema, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole } from '../types';

export interface IUser extends Document {
  organizationId: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatarUrl?: string;
  status: 'Active' | 'Inactive';
  lastActive?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
      type: String,
      enum: ['OWNER', 'ADMIN', 'MANAGER', 'AGENT'],
      default: 'AGENT',
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Method to verify password
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);
