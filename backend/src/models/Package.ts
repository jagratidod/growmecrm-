import mongoose, { Schema, Document, Types } from 'mongoose';

export type BrochureDesign = 'Signature' | 'Adventure';
export type PackageStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface IPricingOption {
  id: string;
  label: string;
  price: number;
  isPeakSeason?: boolean;
}

export interface IPackageDuration {
  nights: number;
  days: number;
}

export interface IPackageItineraryDay {
  id: string;
  dayNumber: number;
  title: string;
  sightseeing?: string[];
  dayPlan: string;
  hotelType?: string;
  stay?: string;
  activities?: string;
  meals?: string;
  distance?: string;
  notes?: string;
  photos?: string[];
}

export interface IPackageFaq {
  id: string;
  question: string;
  answer: string;
}

export interface ITravelPackage extends Document {
  organizationId: Types.ObjectId;
  name: string;
  code?: string;
  status: PackageStatus;
  brochureDesign: BrochureDesign;
  template?: string;
  categories: string[];
  slug: string;
  duration: IPackageDuration;
  bookingTitle?: string;
  destination: string;
  price: number;
  originalPrice?: number;
  currency: string;
  route?: string;
  bookingAmount?: number;
  pricingOptions: IPricingOption[];
  itineraryDays: IPackageItineraryDay[];
  bannerImage?: string;
  whatsappBannerImage?: string;
  whatsappDescription?: string;
  description?: string;
  contactNumber?: string;
  contactEmail?: string;

  // Step 3: Logistics
  inclusions?: string;
  exclusions?: string;
  pickupDropPoints?: string;
  thingsToCarry?: string;

  // Step 4: Policies
  cancellationPolicy?: string;
  paymentTerms?: string;
  termsAndConditions?: string;

  // Step 5: FAQs
  faqs?: IPackageFaq[];

  // Step 6: Extra
  highlights?: string[];
  galleryImages?: string[];

  // Step 7: Review & Distribution
  showOnLinkTree?: boolean;
  linkTreeCategories?: string[];

  createdAt: Date;
  updatedAt: Date;
}

const PricingOptionSchema = new Schema<IPricingOption>(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    price: { type: Number, required: true },
    isPeakSeason: { type: Boolean, default: false },
  },
  { _id: false }
);

const PackageDurationSchema = new Schema<IPackageDuration>(
  {
    nights: { type: Number, default: 1 },
    days: { type: Number, default: 2 },
  },
  { _id: false }
);

const ItineraryDaySchema = new Schema<IPackageItineraryDay>(
  {
    id: { type: String, required: true },
    dayNumber: { type: Number, required: true },
    title: { type: String, default: '' },
    sightseeing: { type: [String], default: [] },
    dayPlan: { type: String, default: '' },
    hotelType: { type: String, default: '' },
    stay: { type: String, default: '' },
    activities: { type: String, default: '' },
    meals: { type: String, default: '' },
    distance: { type: String, default: '' },
    notes: { type: String, default: '' },
    photos: { type: [String], default: [] },
  },
  { _id: false }
);

const PackageFaqSchema = new Schema<IPackageFaq>(
  {
    id: { type: String, required: true },
    question: { type: String, default: '' },
    answer: { type: String, default: '' },
  },
  { _id: false }
);

const PackageSchema = new Schema<ITravelPackage>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    name: { type: String, required: [true, 'Package name is required'], trim: true },
    code: { type: String, trim: true },
    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
      default: 'DRAFT',
      index: true,
    },
    brochureDesign: {
      type: String,
      enum: ['Signature', 'Adventure'],
      default: 'Signature',
    },
    template: { type: String, default: '' },
    categories: { type: [String], default: [] },
    slug: { type: String, required: true, lowercase: true, trim: true },
    duration: { type: PackageDurationSchema, default: () => ({ nights: 1, days: 2 }) },
    bookingTitle: { type: String, default: '' },
    destination: { type: String, required: [true, 'Destination is required'], trim: true },
    price: { type: Number, required: [true, 'Price is required'], min: 0 },
    originalPrice: { type: Number, min: 0 },
    currency: { type: String, default: 'INR' },
    route: { type: String, default: '' },
    bookingAmount: { type: Number, default: 0 },
    pricingOptions: { type: [PricingOptionSchema], default: [] },
    itineraryDays: { type: [ItineraryDaySchema], default: [] },
    bannerImage: { type: String, default: '' },
    whatsappBannerImage: { type: String, default: '' },
    whatsappDescription: { type: String, default: '' },
    description: { type: String, default: '' },
    contactNumber: { type: String, default: '' },
    contactEmail: { type: String, default: '' },

    // Logistics
    inclusions: { type: String, default: '' },
    exclusions: { type: String, default: '' },
    pickupDropPoints: { type: String, default: '' },
    thingsToCarry: { type: String, default: '' },

    // Policies
    cancellationPolicy: { type: String, default: '' },
    paymentTerms: { type: String, default: '' },
    termsAndConditions: { type: String, default: '' },

    // FAQs
    faqs: { type: [PackageFaqSchema], default: [] },

    // Extra
    highlights: { type: [String], default: [] },
    galleryImages: { type: [String], default: [] },

    // Review & Distribution
    showOnLinkTree: { type: Boolean, default: false },
    linkTreeCategories: { type: [String], default: [] },
  },
  {
    timestamps: true,
  }
);

// Compound index: A slug must be unique within an organization
PackageSchema.index({ organizationId: 1, slug: 1 }, { unique: true });
PackageSchema.index({ organizationId: 1, status: 1 });

export const TravelPackageModel = mongoose.model<ITravelPackage>('TravelPackage', PackageSchema);
