export type BillCategory =
  | 'Hotel'
  | 'Flight'
  | 'Transport'
  | 'Sightseeing'
  | 'Visa'
  | 'Insurance'
  | 'General'

export type BillStatus = 'Paid' | 'Unpaid' | 'Partial'

export interface Bill {
  id: string
  vendor: string
  category: BillCategory
  totalAmount: number
  amountPaid: number
  currency: string
  billDate: string // YYYY-MM-DD
  linkedTripId?: string
  linkedTripName?: string
  notes?: string
  status: BillStatus
  createdAt: string
  updatedAt: string
}

export interface BillFilters {
  search: string
  status: 'All' | 'Unpaid' | 'Paid'
  category?: BillCategory | 'All'
}

export interface BillStats {
  totalSpend: number
  unpaid: number
  paid: number
}
