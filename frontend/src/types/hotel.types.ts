export interface RoomType {
  id?: string
  name: string
  pricePerNight: number
  inclusions?: string
  capacity?: number
}

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
  commissionRate?: number
  contractExpiry?: string
  roomTypes?: RoomType[]
  photos: string[]
  createdAt: string
  updatedAt: string
}

export interface HotelFilters {
  search: string
  city: string
  stars: number | 'All'
}
