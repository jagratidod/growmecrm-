import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  actorEmail: string;
  actorRole: string;
  action: string;
  targetOrgName?: string;
  targetOrgId?: string;
  targetUserEmail?: string;
  ipAddress?: string;
  details: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    actorEmail: { type: String, required: true },
    actorRole: { type: String, default: 'SUPER_ADMIN' },
    action: { type: String, required: true },
    targetOrgName: { type: String, default: '' },
    targetOrgId: { type: String, default: '' },
    targetUserEmail: { type: String, default: '' },
    ipAddress: { type: String, default: '' },
    details: { type: String, default: '' },
    status: {
      type: String,
      enum: ['SUCCESS', 'WARNING', 'FAILED'],
      default: 'SUCCESS',
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
