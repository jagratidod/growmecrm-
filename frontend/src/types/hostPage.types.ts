export interface HostReview {
  id: string
  name: string
  rating: number
  quote: string
  avatarUrl?: string
  createdAt: string
}

export interface HostContact {
  phone: string
  email: string
  address: string
}

export interface HostPageData {
  websiteUrl: string
  bannerImage: string
  aboutUs: string
  contact: HostContact
  reviews: HostReview[]
}
