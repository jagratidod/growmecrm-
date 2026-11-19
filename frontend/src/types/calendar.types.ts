export interface CalendarEvent {
  id: string
  title: string
  date: string // YYYY-MM-DD
  notes?: string
  type: 'manual' | 'departure' | 'return' | 'task'
  color?: string
  createdAt: string
}

export interface CalendarDayCell {
  date: Date
  dateString: string // YYYY-MM-DD
  dayNumber: number
  isCurrentMonth: boolean
  isToday: boolean
  events: CalendarEvent[]
}
