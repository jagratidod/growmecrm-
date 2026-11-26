export const leadStages = ['New', 'Contacted', 'Qualified', 'Proposal sent', 'Negotiation', 'Won', 'Lost'] as const
export type LeadStage = typeof leadStages[number]

export type LeadTemperature = 'Hot' | 'Warm' | 'Cold'

export type CustomerType = 'B2C' | 'B2B'

export type LeadSource =
  | 'Manual'
  | 'Website'
  | 'Facebook'
  | 'Instagram'
  | 'Google'
  | 'WhatsApp'
  | 'Referral'
  | 'CSV'

export interface LeadActivity {
  id: string
  leadId: string
  type: 'created' | 'stage_changed' | 'assigned' | 'note_added' | 'call' | 'email' | 'whatsapp'
  description: string
  timestamp: string
  author: string
  fromStage?: LeadStage
  toStage?: LeadStage
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
  assignedUserId?: string
  stageChangedAt?: string
  closedAt?: string
  proposalSentAt?: string
  lostReason?: string
  archivedAt?: string
  nextAction?: { dueDate: string; dueTime: string; title: string }
  linkedBookings?: { id: string; status: string; destination: string; departure: string; currency: string; totalAmount: number; amountPaid: number }[]
  temperature: LeadTemperature
  tags: string[]
  notes?: string
  createdAt: string
  updatedAt: string
  activities: LeadActivity[]
}

export type LeadView = 'all' | 'mine' | 'unassigned' | 'due' | 'no-next-action' | 'archived'

export interface LeadFilters {
  view?: LeadView
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
  open: number
  stages: Partial<Record<LeadStage, number>>
}

export type CsvLeadRow = Record<string, string | number | undefined>
