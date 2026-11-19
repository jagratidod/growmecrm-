export type ItineraryStatus = 'Draft' | 'Pending' | 'Confirmed' | 'Completed'

export interface ItineraryDay {
  id: string
  dayNumber: number
  title: string
  description: string
  activities?: string[]
  hotel?: string
  meals?: string[] // e.g., ['Breakfast', 'Dinner']
}

export interface Itinerary {
  id: string
  customerName: string
  email?: string
  phone?: string
  destination: string
  status: ItineraryStatus
  departure: string // YYYY-MM-DD
  returnDate?: string // YYYY-MM-DD
  travellers: number
  totalAmount: number
  amountPaid: number
  currency: string
  package?: string
  assignedTo?: string
  notes?: string
  days: ItineraryDay[]
  createdAt: string
  updatedAt: string
}

export interface ItineraryFilters {
  search: string
  status: ItineraryStatus | 'All'
}
