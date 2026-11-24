import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import type { CalendarEvent } from '../types/calendar.types'
import { useBookings } from './BookingsContext'
import { useToast } from '../components/ui/Toast'
import { calendarService } from '../services/calendarService'

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
}

const STORAGE_KEY = 'treki_crm_calendar_events'

const DEFAULT_EVENTS: CalendarEvent[] = [
  {
    id: 'evt-1',
    title: 'Goa Tour Group Briefing',
    date: '2026-11-19',
    notes: 'Goa group departure briefing & flight vouchers distribution.',
    type: 'manual',
    color: '#453372',
    createdAt: new Date().toISOString(),
  },
]

const CalendarContext = createContext<CalendarContextType | undefined>(undefined)

export const CalendarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { bookings } = useBookings()
  const { toast } = useToast()

  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.error('Failed to parse calendar events', e)
    }
    return DEFAULT_EVENTS
  })

  // Date anchor: defaults to November 2026
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    return new Date(2026, 10, 19)
  })

  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState('2026-11-19')

  // Fetch from backend API
  const refreshEvents = useCallback(async () => {
    try {
      const res = await calendarService.getEvents()
      if (res?.events && res.events.length > 0) {
        // filter out booking auto events for manual events state
        const manualOnly = res.events.filter((e) => e.type === 'manual')
        if (manualOnly.length > 0) {
          setEvents(manualOnly)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(manualOnly))
        }
      }
    } catch {
      // offline fallback
    }
  }, [])

  useEffect(() => {
    refreshEvents()
  }, [refreshEvents])

  // Save manual events to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
    } catch (e) {
      console.error('Failed to save calendar events', e)
    }
  }, [events])

  // Combine manual events + booking departures/returns automatically
  const allEvents = useMemo(() => {
    const bookingEvents: CalendarEvent[] = []

    bookings.forEach((b) => {
      if (b.departure) {
        bookingEvents.push({
          id: `b-dep-${b.id}`,
          title: `🛫 Departure: ${b.customerName} (${b.destination})`,
          date: b.departure.split('T')[0],
          notes: `Booking for ${b.travellers} pax · Total: ₹${(b.totalAmount || 0).toLocaleString('en-IN')}`,
          type: 'departure',
          color: '#0891b2',
          createdAt: b.createdAt,
        })
      }
      if (b.returnDate) {
        bookingEvents.push({
          id: `b-ret-${b.id}`,
          title: `🛬 Return: ${b.customerName}`,
          date: b.returnDate.split('T')[0],
          notes: `Trip completed for ${b.destination}`,
          type: 'return',
          color: '#059669',
          createdAt: b.createdAt,
        })
      }
    })

    return [...events, ...bookingEvents]
  }, [events, bookings])

  const goToPreviousMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date(2026, 10, 19))
  }

  const addEvent = (data: { title: string; date: string; notes?: string }) => {
    const tempId = `evt-${Date.now()}`
    const newEvent: CalendarEvent = {
      id: tempId,
      title: data.title,
      date: data.date,
      notes: data.notes,
      type: 'manual',
      color: '#453372',
      createdAt: new Date().toISOString(),
    }

    setEvents((prev) => [newEvent, ...prev])
    setIsAddEventModalOpen(false)
    toast({ title: 'Event added to calendar', type: 'success' })

    calendarService
      .createEvent(data)
      .then((res) => {
        if (res?.event) {
          setEvents((prev) => prev.map((e) => (e.id === tempId ? res.event : e)))
        }
      })
      .catch(() => {})
  }

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id))
    toast({ title: 'Event removed', type: 'info' })
    calendarService.deleteEvent(id).catch(() => {})
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
