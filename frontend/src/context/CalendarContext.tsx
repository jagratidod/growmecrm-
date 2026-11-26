import { useRouter } from './RouterContext'
import { useWorkspace } from '../features/workspace/WorkspaceAccess'
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import type { CalendarEvent } from '../types/calendar.types'
import { useBookings } from './BookingsContext'
import { useToast } from '../components/ui/Toast'
import { calendarService } from '../services/calendarService'
import { formatBookingAmount } from '../features/bookings/formatBookingAmount'

interface CalendarContextType {
  events: CalendarEvent[]
  allEvents: CalendarEvent[]
  currentDate: Date
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>
  goToPreviousMonth: () => void
  goToNextMonth: () => void
  goToToday: () => void
  addEvent: (data: { title: string; date: string; notes?: string }) => void
  deleteEvent: (id: string) => void
  isAddEventModalOpen: boolean
  setIsAddEventModalOpen: (open: boolean) => void
  selectedDate: string
  setSelectedDate: (date: string) => void
  refreshEvents: () => Promise<void>
  loading: boolean
  loadError: string
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined)

export const CalendarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { path } = useRouter()
  const { access } = useWorkspace()
  const enabled = access?.modules.includes('calendar') && ['/calendar', '/events'].includes(path)
  const canViewBookings = access?.modules.includes('bookings')
  const { bookings } = useBookings()
  const { toast } = useToast()

  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [currentDate, setCurrentDate] = useState<Date>(() => {
    return new Date()
  })

  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(() => new Date().toLocaleDateString('en-CA'))

  // Fetch from backend API
  const refreshEvents = useCallback(async () => {
    if (!enabled) return
    setLoading(true)
    setLoadError('')
    try {
      setEvents((await calendarService.getEvents()).events.filter((event) => event.type === 'manual'))
    } catch (error) {
      setLoadError((error as Error).message)
    } finally {
      setLoading(false)
    }
  }, [enabled])

  useEffect(() => {
    void refreshEvents()
  }, [refreshEvents])

  // Combine manual events + booking departures/returns automatically
  const allEvents = useMemo(() => {
    const bookingEvents: CalendarEvent[] = []

    if (!canViewBookings) return events
    bookings.forEach((b) => {
      if (b.status === 'Cancelled') return
      if (b.departure) {
        bookingEvents.push({
          id: `b-dep-${b.id}`,
          title: `Departure · ${b.customerName} (${b.destination})`,
          date: b.departure.split('T')[0],
          notes: `${b.travellers} travellers · ${formatBookingAmount(b.totalAmount, b.currency)}`,
          type: 'departure',
          color: '#0891b2',
          createdAt: b.createdAt,
        })
      }
      if (b.returnDate) {
        bookingEvents.push({
          id: `b-ret-${b.id}`,
          title: `Return · ${b.customerName}`,
          date: b.returnDate.split('T')[0],
          notes: b.destination,
          type: 'return',
          color: '#059669',
          createdAt: b.createdAt,
        })
      }
    })

    return [...events, ...bookingEvents]
  }, [events, bookings, canViewBookings])

  const goToPreviousMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const addEvent = async (data: { title: string; date: string; notes?: string }) => {
    try {
      const { event } = await calendarService.createEvent(data)
      setEvents((prev) => [event, ...prev])
      setIsAddEventModalOpen(false)
      toast({ title: 'Event added to calendar', type: 'success' })
    } catch (error) {
      toast({ type: 'error', title: 'Could not add event', description: (error as Error).message })
    }
  }

  const deleteEvent = async (id: string) => {
    try {
      await calendarService.deleteEvent(id)
      setEvents((prev) => prev.filter((item) => item.id !== id))
    } catch (error) {
      toast({ type: 'error', title: 'Could not delete event', description: (error as Error).message })
    }
  }

  return (
    <CalendarContext.Provider
      value={{
        events,
        allEvents,
        currentDate,
        setCurrentDate,
        goToPreviousMonth,
        goToNextMonth,
        goToToday,
        addEvent,
        deleteEvent,
        isAddEventModalOpen,
        setIsAddEventModalOpen,
        selectedDate,
        setSelectedDate,
        refreshEvents,
        loading,
        loadError,
      }}
    >
      {children}
    </CalendarContext.Provider>
  )
}

export const useCalendar = () => {
  const context = useContext(CalendarContext)
  if (!context) {
    throw new Error('useCalendar must be used within a CalendarProvider')
  }
  return context
}
