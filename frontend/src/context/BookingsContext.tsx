import { useRouter } from './RouterContext'
import React, { createContext, useContext, useState, useMemo, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { useToast } from '../components/ui/Toast'
import { useWorkspace } from '../features/workspace/WorkspaceAccess'
import { bookingsService } from '../services/bookingsService'
import type { Booking, BookingFilters, BookingStats, BookingStatus } from '../types/booking.types'

interface BookingsContextType {
  bookings: Booking[]
  loading: boolean
  loadError: string
  filteredBookings: Booking[]
  stats: BookingStats
  filters: BookingFilters
  setFilters: React.Dispatch<React.SetStateAction<BookingFilters>>
  updateFilter: <K extends keyof BookingFilters>(key: K, value: BookingFilters[K]) => void
  resetFilters: () => void
  addBooking: (bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Booking | undefined>
  updateBooking: (id: string, updates: Partial<Booking>) => void
  deleteBooking: (id: string) => void
  updateBookingStatus: (id: string, status: BookingStatus) => void
  selectedBooking: Booking | null
  setSelectedBooking: (booking: Booking | null) => void
  isNewBookingModalOpen: boolean
  setIsNewBookingModalOpen: (open: boolean) => void
}

const BookingsContext = createContext<BookingsContextType | undefined>(undefined)

export const BookingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth()
  const { access } = useWorkspace()
  const { toast } = useToast()
  const { path } = useRouter()
  const enabled = (Boolean(token && access?.modules.includes('bookings'))) && (['/bookings', '/bills', '/calendar', '/events'].includes(path))
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [filters, setFilters] = useState<BookingFilters>({
    search: '',
    status: 'All',
  })

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false)

  useEffect(() => {
    if (!enabled) return
    let active = true
    bookingsService.getBookings().then(({ bookings }) => {
      if (active) { setBookings(bookings); setLoading(false) }
    }, (error: Error) => {
      if (active) { setLoadError(error.message); setLoading(false) }
    })
    return () => { active = false }
  }, [enabled, token])

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

  async function mutate<T>(mutation: () => Promise<T>): Promise<T | undefined> {
    try { return await mutation() }
    catch (error) { toast({ type: 'error', title: 'Booking update failed', description: (error as Error).message }) }
  }
  const replaceBooking = (booking: Booking) => {
    setBookings((previous) => previous.map((item) => item.id === booking.id ? booking : item))
    setSelectedBooking((previous) => previous?.id === booking.id ? booking : previous)
  }
  const addBooking: BookingsContextType['addBooking'] = (data) => mutate(async () => {
    const booking = await bookingsService.createBooking(data)
    setBookings((previous) => [booking, ...previous])
    return booking
  })
  const updateBooking: BookingsContextType['updateBooking'] = (id, updates) => {
    void mutate(async () => replaceBooking(await bookingsService.updateBooking(id, updates)))
  }
  const deleteBooking: BookingsContextType['deleteBooking'] = (id) => {
    void mutate(async () => {
      await bookingsService.deleteBooking(id)
      setBookings((previous) => previous.filter((booking) => booking.id !== id))
      setSelectedBooking((previous) => previous?.id === id ? null : previous)
    })
  }
  const updateBookingStatus: BookingsContextType['updateBookingStatus'] = (id, status) => {
    void mutate(async () => replaceBooking(await bookingsService.updateStatus(id, status)))
  }

  return (
    <BookingsContext.Provider
      value={{
        bookings,
        loading,
        loadError,
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
