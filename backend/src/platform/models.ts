import { model, Schema, Types } from 'mongoose';

export interface WorkspaceSettings {
  organizationId: Types.ObjectId;
  addOns: string[];
  mongo?: string;
  cloudinary?: string;
  billing?: {
    checkoutUrl?: string;
    paidThrough?: Date;
    paymentReference?: string;
  };
}

export const Workspace = model<WorkspaceSettings>('GrowMeWorkspace', new Schema<WorkspaceSettings>({
  organizationId: { type: Schema.Types.ObjectId, required: true, unique: true },
  addOns: { type: [String], default: [] },
  mongo: String,
  cloudinary: String,
  billing: {
    checkoutUrl: String,
    paidThrough: Date,
    paymentReference: String,
  },
}, { timestamps: true }));

export const Website = model('GrowMeWebsite', new Schema({
  organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
  name: { type: String, required: true, trim: true },
  domain: { type: String, required: true, unique: true },
  sections: { type: [String], required: true },
  formKeyHash: { type: String, required: true, select: false },
}, { timestamps: true }));

export interface WebsiteContent {
  _id: Types.ObjectId;
  draft: Record<string, unknown>;
  published: Record<string, unknown>;
  publishedAt?: Date;
}
