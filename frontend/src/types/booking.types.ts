export type BookingStatus = 'Pending' | 'Confirmed' | 'Ongoing' | 'Completed' | 'Cancelled'

export interface Booking {
  id: string
  customerName: string
  email?: string
  phone?: string
  destination: string
  status: BookingStatus
  departure: string // YYYY-MM-DD
  returnDate?: string // YYYY-MM-DD
  travellers: number
  totalAmount: number
  amountPaid: number
  currency: string
  package?: string
  assignedTo?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface BookingFilters {
  search: string
  status: BookingStatus | 'All'
}

export interface BookingStats {
  totalBookings: number
  departingThisMonth: number
  pipelineValue: number
  collected: number
}
