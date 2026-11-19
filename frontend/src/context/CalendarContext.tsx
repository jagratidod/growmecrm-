import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import type { CalendarEvent } from '../types/calendar.types'
import { useBookings } from './BookingsContext'
import { useToast } from '../components/ui/Toast'

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
}

const STORAGE_KEY = 'treki_crm_calendar_events'

const DEFAULT_EVENTS: CalendarEvent[] = [
  {
    id: 'evt-1',
    title: 'asdfg',
    date: '2026-11-19',
    notes: 'Goa group departure briefing',
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

  // Date anchor: defaults to November 2026 as in screenshots
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    return new Date(2026, 10, 19)
  })

  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState('2026-11-19')

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
    const newEvent: CalendarEvent = {
      id: `evt-${Date.now()}`,
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
  }

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id))
    toast({ title: 'Event deleted', type: 'info' })
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
