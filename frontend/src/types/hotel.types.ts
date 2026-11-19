export interface Hotel {
  id: string
  name: string
  city: string
  address?: string
  stars: number
  pricePerNight: number
  currency: string
  phone?: string
  email?: string
  notes?: string
  photos: string[]
  createdAt: string
  updatedAt: string
}

export interface HotelFilters {
  search: string
  city: string
  stars: number | 'All'
}
