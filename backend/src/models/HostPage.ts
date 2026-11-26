import { Schema, Document, Types } from 'mongoose';

export interface IHostReview {
  id: string;
  name: string;
  rating: number;
  quote: string;
  avatarUrl?: string;
  createdAt: Date;
}

export interface IHostContact {
  phone?: string;
  email?: string;
  address?: string;
  whatsapp?: string;
  instagram?: string;
}

export interface IHostPage extends Document {
  organizationId: Types.ObjectId;
  websiteSlug: string;
  websiteUrl?: string;
  bannerImage?: string;
  tagline?: string;
  aboutUs?: string;
  contact: IHostContact;
  reviews: IHostReview[];
  isPublished: boolean;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const HostReviewSchema = new Schema<IHostReview>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5, default: 5 },
    quote: { type: String, required: true, trim: true },
    avatarUrl: { type: String, trim: true, default: '' },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const HostContactSchema = new Schema<IHostContact>(
  {
    phone: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, default: '' },
    address: { type: String, trim: true, default: '' },
    whatsapp: { type: String, trim: true, default: '' },
    instagram: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

export const HostPageSchema = new Schema<IHostPage>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      unique: true,
    },
    websiteSlug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    websiteUrl: {
      type: String,
      trim: true,
      default: '',
    },
    bannerImage: {
      type: String,
      trim: true,
      default: '',
    },
    tagline: {
      type: String,
      trim: true,
      default: '',
    },
    aboutUs: {
      type: String,
      trim: true,
      default: '',
    },
    contact: {
      type: HostContactSchema,
      default: () => ({}),
    },
    reviews: {
      type: [HostReviewSchema],
      default: [],
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);
