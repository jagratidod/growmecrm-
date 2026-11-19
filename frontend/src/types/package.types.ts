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
  bannerImage?: string
  whatsappBannerImage?: string
  whatsappDescription?: string
  description?: string
  contactNumber?: string
  contactEmail?: string
  createdAt: string
  updatedAt: string
}
