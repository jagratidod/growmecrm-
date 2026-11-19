import React, { createContext, useContext, useState, useMemo, useEffect } from 'react'
import type { Booking, BookingFilters, BookingStats, BookingStatus } from '../types/booking.types'

interface BookingsContextType {
  bookings: Booking[]
  filteredBookings: Booking[]
  stats: BookingStats
  filters: BookingFilters
  setFilters: React.Dispatch<React.SetStateAction<BookingFilters>>
  updateFilter: <K extends keyof BookingFilters>(key: K, value: BookingFilters[K]) => void
  resetFilters: () => void
  addBooking: (bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => Booking
  updateBooking: (id: string, updates: Partial<Booking>) => void
  deleteBooking: (id: string) => void
  updateBookingStatus: (id: string, status: BookingStatus) => void
  selectedBooking: Booking | null
  setSelectedBooking: (booking: Booking | null) => void
  isNewBookingModalOpen: boolean
  setIsNewBookingModalOpen: (open: boolean) => void
  loadDemoData: () => void
  clearAllBookings: () => void
}

const STORAGE_KEY = 'treki_crm_bookings_data'

const DEMO_BOOKINGS: Booking[] = [
  {
    id: 'bk-1',
    customerName: 'Ananya Sharma',
    email: 'ananya.sharma@gmail.com',
    phone: '+91 98201 55672',
    destination: 'Bali, Indonesia',
    status: 'Confirmed',
    departure: '2026-12-10',
    returnDate: '2026-12-17',
    travellers: 2,
    totalAmount: 185000,
    amountPaid: 95000,
    currency: 'INR',
    package: 'Honeymoon Special Villa Package',
    assignedTo: 'Rahul Verma',
    notes: 'Airport pick up scheduled. Private pool villa confirmed.',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'bk-2',
    customerName: 'Vikramaditya Singhania',
    email: 'vikram.singhania@corp.in',
    phone: '+91 98112 34901',
    destination: 'Dubai & Abu Dhabi, UAE',
    status: 'Pending',
    departure: '2026-12-20',
    returnDate: '2026-12-26',
    travellers: 4,
    totalAmount: 340000,
    amountPaid: 50000,
    currency: 'INR',
    package: 'Luxury Desert Safari & Marina Tour',
    assignedTo: 'Priya Nair',
    notes: 'Awaiting visa approval and remaining advance payment.',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'bk-3',
    customerName: 'Rajesh & Meera Patel',
    email: 'patel.rajesh@outlook.com',
    phone: '+91 97234 11890',
    destination: 'Kashmir Valley, India',
    status: 'Ongoing',
    departure: '2026-11-18',
    returnDate: '2026-11-25',
    travellers: 3,
    totalAmount: 120000,
    amountPaid: 120000,
    currency: 'INR',
    package: 'Gulmarg Gondola & Dal Lake Houseboat',
    assignedTo: 'Rahul Verma',
    notes: 'Guest checked into Srinagar houseboat today. All payments cleared.',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'bk-4',
    customerName: 'Kavita Menon',
    email: 'kavita.menon@techsoft.com',
    phone: '+91 98450 78210',
    destination: 'Swiss Alps & Paris',
    status: 'Completed',
    departure: '2026-10-15',
    returnDate: '2026-10-24',
    travellers: 2,
    totalAmount: 520000,
    amountPaid: 520000,
    currency: 'INR',
    package: 'Grand European Winter Wonder',
    assignedTo: 'Priya Nair',
    notes: 'Trip completed successfully. Received 5-star Google review.',
    createdAt: new Date(Date.now() - 86400000 * 35).toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const BookingsContext = createContext<BookingsContextType | undefined>(undefined)

export const BookingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bookings, setBookings] = useState<Booking[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch {
      // fallback
    }
    return DEMO_BOOKINGS
  })

  const [filters, setFilters] = useState<BookingFilters>({
    search: '',
    status: 'All',
  })

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false)

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings))
    } catch {
      // ignore
    }
  }, [bookings])

  const updateFilter = <K extends keyof BookingFilters>(key: K, value: BookingFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => {
    setFilters({ search: '', status: 'All' })
  }

  // Calculate dynamic stats matching the screenshot
  const stats = useMemo<BookingStats>(() => {
    const currentMonthStr = new Date().toISOString().slice(0, 7) // e.g. "2026-11"

    let departingThisMonthCount = 0
    let totalPipelineValue = 0
    let totalCollected = 0

    bookings.forEach((b) => {
      // Check departure month
      if (b.departure && b.departure.startsWith(currentMonthStr)) {
        departingThisMonthCount++
      }

      // Add to pipeline value if not cancelled
      if (b.status !== 'Cancelled') {
        totalPipelineValue += b.totalAmount || 0
        totalCollected += b.amountPaid || 0
      }
    })

    return {
      totalBookings: bookings.length,
      departingThisMonth: departingThisMonthCount,
      pipelineValue: totalPipelineValue,
      collected: totalCollected,
    }
  }, [bookings])

  // Filtered bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // Status filter
      if (filters.status !== 'All' && b.status !== filters.status) {
        return false
      }

      // Search keyword filter (customer, destination, phone, email)
      if (filters.search) {
        const query = filters.search.toLowerCase()
        const matchesName = b.customerName.toLowerCase().includes(query)
        const matchesDest = b.destination.toLowerCase().includes(query)
        const matchesEmail = b.email?.toLowerCase().includes(query)
        const matchesPhone = b.phone?.toLowerCase().includes(query)
        if (!matchesName && !matchesDest && !matchesEmail && !matchesPhone) {
          return false
        }
      }

      return true
    })
  }, [bookings, filters])

  const addBooking = (bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Booking => {
    const now = new Date().toISOString()
    const newBooking: Booking = {
      ...bookingData,
      id: 'bk-' + Date.now(),
      createdAt: now,
      updatedAt: now,
    }

    setBookings((prev) => [newBooking, ...prev])
    return newBooking
  }

  const updateBooking = (id: string, updates: Partial<Booking>) => {
    const now = new Date().toISOString()
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates, updatedAt: now } : b))
    )
    if (selectedBooking && selectedBooking.id === id) {
      setSelectedBooking((prev) => (prev ? { ...prev, ...updates, updatedAt: now } : null))
    }
  }

  const deleteBooking = (id: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== id))
    if (selectedBooking && selectedBooking.id === id) {
      setSelectedBooking(null)
    }
  }

  const updateBookingStatus = (id: string, status: BookingStatus) => {
    updateBooking(id, { status })
  }

  const loadDemoData = () => {
    setBookings(DEMO_BOOKINGS)
  }

  const clearAllBookings = () => {
    setBookings([])
    setSelectedBooking(null)
  }

  return (
    <BookingsContext.Provider
      value={{
        bookings,
        filteredBookings,
        stats,
        filters,
        setFilters,
        updateFilter,
        resetFilters,
        addBooking,
        updateBooking,
        deleteBooking,
        updateBookingStatus,
        selectedBooking,
        setSelectedBooking,
        isNewBookingModalOpen,
        setIsNewBookingModalOpen,
        loadDemoData,
        clearAllBookings,
      }}
    >
      {children}
    </BookingsContext.Provider>
  )
}

export const useBookings = (): BookingsContextType => {
  const context = useContext(BookingsContext)
  if (!context) {
    throw new Error('useBookings must be used within a BookingsProvider')
  }
  return context
}
