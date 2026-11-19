export type BrochureDesign = 'Signature' | 'Adventure'
export type PackageStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

export interface PricingOption {
  id: string
  label: string
  price: number
  isPeakSeason?: boolean
}

export interface PackageDuration {
  nights: number
  days: number
}

export interface PackageItineraryDay {
  id: string
  dayNumber: number
  title: string
  sightseeing?: string[]
  dayPlan: string
  hotelType?: string
  stay?: string
  activities?: string
  meals?: string
  distance?: string
  notes?: string
  photos?: string[]
}

export interface PackageFaq {
  id: string
  question: string
  answer: string
}

export interface TravelPackage {
  id: string
  name: string
  code?: string
  status: PackageStatus
  brochureDesign: BrochureDesign
  template?: string
  categories: string[]
  slug: string
  duration: PackageDuration
  bookingTitle?: string
  destination: string
  price: number
  originalPrice?: number
  currency: string
  route?: string
  bookingAmount?: number
  pricingOptions: PricingOption[]
  itineraryDays?: PackageItineraryDay[]
  bannerImage?: string
  whatsappBannerImage?: string
  whatsappDescription?: string
  description?: string
  contactNumber?: string
  contactEmail?: string

  // Step 3: Logistics
  inclusions?: string
  exclusions?: string
  pickupDropPoints?: string
  thingsToCarry?: string

  // Step 4: Policies
  cancellationPolicy?: string
  paymentTerms?: string
  termsAndConditions?: string

  // Step 5: FAQs
  faqs?: PackageFaq[]

  // Step 6: Extra
  highlights?: string[]
  galleryImages?: string[]

  createdAt: string
  updatedAt: string
}
