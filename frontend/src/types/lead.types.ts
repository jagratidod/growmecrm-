export type LeadStage =
  | 'New'
  | 'Contacted'
  | 'Qualified'
  | 'Proposal sent'
  | 'Negotiation'
  | 'Won'
  | 'Lost'

export type LeadTemperature = 'Hot' | 'Warm' | 'Cold' | 'Won' | 'Lost'

export type CustomerType = 'B2C' | 'B2B'

export type LeadSource =
  | 'Manual'
  | 'Website'
  | 'Facebook'
  | 'Instagram'
  | 'Google'
  | 'WhatsApp'
  | 'Referral'

export interface LeadActivity {
  id: string
  leadId: string
  type: 'created' | 'stage_changed' | 'assigned' | 'note_added' | 'call' | 'email' | 'whatsapp'
  description: string
  timestamp: string
  author: string
}

export interface Lead {
  id: string
  name: string
  email?: string
  phone: string
  source: LeadSource
  status: LeadStage
  customerType: CustomerType
  interestedPackage?: string
  destination: string
  travelDate?: string
  travelers: number
  budget: number
  currency: string
  assignedTo: string
  temperature: LeadTemperature
  tags: string[]
  notes?: string
  createdAt: string
  updatedAt: string
  activities: LeadActivity[]
}

export interface LeadFilters {
  search: string
  stage?: LeadStage | 'All'
  temperature?: LeadTemperature | 'All'
  destination?: string
  assignedTo?: string
  customerType?: CustomerType | 'All'
  source?: LeadSource | 'All'
  travelDateFrom?: string
  travelDateTo?: string
}

export interface LeadStats {
  overall: number
  today: number
  converted: number
}
