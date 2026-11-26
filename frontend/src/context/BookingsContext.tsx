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
  retryLeadSync: (id: string) => Promise<Booking | undefined>
  recordBookingPayment: (id: string, amount: number) => Promise<Booking | undefined>
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
      if (active) { setBookings(bookings); setLoadError(''); setLoading(false) }
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
    const currentMonthStr = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Kolkata' }).slice(0, 7)

    let departingThisMonthCount = 0
    let totalPipelineValue = 0
    let totalCollected = 0

    bookings.forEach((b) => {
      // Check departure month
      if (b.status !== 'Cancelled') {
        if (b.departure?.startsWith(currentMonthStr)) departingThisMonthCount++
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

      const departure = b.departure?.slice(0, 10)
      if (filters.departureFrom && (!departure || departure < filters.departureFrom)) return false
      if (filters.departureTo && (!departure || departure > filters.departureTo)) return false

      // Search keyword filter (customer, destination, phone, email)
      if (filters.search) {
        const query = filters.search.trim().toLowerCase()
        const matchesName = b.customerName.toLowerCase().includes(query)
        const matchesDest = b.destination.toLowerCase().includes(query) || b.package?.toLowerCase().includes(query)
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
  const reportLeadSync = (warning?: string) => {
    if (warning) toast({ type: 'error', title: 'Lead update pending', description: warning })
  }
  const replaceBooking = (booking: Booking) => {
    reportLeadSync(booking.leadSyncWarning)
    setBookings((previous) => previous.map((item) => item.id === booking.id ? booking : item))
    setSelectedBooking((previous) => previous?.id === booking.id ? booking : previous)
  }
  const addBooking: BookingsContextType['addBooking'] = (data) => mutate(async () => {
    const booking = await bookingsService.createBooking(data)
    reportLeadSync(booking.leadSyncWarning)
    setBookings((previous) => [booking, ...previous])
    return booking
  })
  const recordBookingPayment: BookingsContextType['recordBookingPayment'] = (id, amount) => mutate(async () => {
    const { booking, leadSyncWarning } = await bookingsService.recordPayment(id, amount)
    replaceBooking({ ...booking, leadSyncWarning })
    toast({ type: 'success', title: 'Payment recorded' })
    return booking
  })
  const retryLeadSync: BookingsContextType['retryLeadSync'] = (id) => mutate(async () => {
    const booking = await bookingsService.retryLeadSync(id)
    replaceBooking(booking)
    if (!booking.leadConversionPending) toast({ type: 'success', title: 'Linked lead updated' })
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
        recordBookingPayment,
        retryLeadSync,
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
