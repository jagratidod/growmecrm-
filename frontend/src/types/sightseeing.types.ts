export interface SightseeingActivity {
  id: string
  name: string
  coverImage?: string
  description: string
  destination?: string
  duration?: string
  tags?: string[]
  isFavorite?: boolean
  createdAt: string
  updatedAt: string
}

export interface SightseeingFilters {
  search: string
}
