export type PredefinedOutcome =
  | 'Connected'
  | 'No answer'
  | 'Voicemail'
  | 'Busy'
  | 'Wrong number'

export interface CallLogEntry {
  id: string
  leadId?: string
  leadName: string
  leadPhone: string
  userName: string
  outcome: string
  notes?: string
  createdAt: string
}

export interface CallLogFilters {
  user: string
  searchLead: string
}
