import React, { useEffect, useState } from 'react'
import { LeadsSidebar } from '../leads/components/LeadsSidebar'
import { BookingsHeader } from './components/BookingsHeader'
import { BookingStatsCards } from './components/BookingStatsCards'
import { BookingFilterTabs } from './components/BookingFilterTabs'
import { BookingsEmptyState } from './components/BookingsEmptyState'
import { BookingsTable } from './components/BookingsTable'
import { NewBookingModal } from './components/NewBookingModal'
import { BookingDetailsDrawer } from './components/BookingDetailsDrawer'
import { useBookings } from '../../context/BookingsContext'
import { SearchX } from 'lucide-react'
import { bookingsService } from '../../services/bookingsService'
import { useToast } from '../../components/ui/Toast'
import { useRouter } from '../../context/RouterContext'

interface BookingsPageProps {
  onNavigateMenu?: (menu: string) => void
}

export const BookingsPage: React.FC<BookingsPageProps> = ({ onNavigateMenu }) => {
  const { bookings, loading, loadError, filteredBookings, resetFilters, setIsNewBookingModalOpen, setSelectedBooking } = useBookings()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const { search, navigate } = useRouter()
  const { toast } = useToast()
  useEffect(() => {
    if (new URLSearchParams(search).get('new') !== '1') return
    setIsNewBookingModalOpen(true)
    navigate('/bookings', { replace: true })
  }, [search, navigate, setIsNewBookingModalOpen])

  useEffect(() => {
    const bookingId = new URLSearchParams(search).get('booking')
    if (!bookingId) return
    let active = true
    bookingsService.getBookingById(bookingId).then(
      (booking) => { if (active) setSelectedBooking(booking) },
      (error: Error) => { if (active) toast({ type: 'error', title: 'Could not open booking', description: error.message }) },
    ).finally(() => { if (active) navigate('/bookings', { replace: true }) })
    return () => { active = false }
  }, [search, navigate, setSelectedBooking, toast])

  const isCompletelyEmpty = bookings.length === 0
  const isFilterEmpty = bookings.length > 0 && filteredBookings.length === 0

  return (
    <div className="min-h-screen bg-canvas flex text-slate-800 font-sans">
      {/* Sidebar with active Bookings tab cutout */}
      <LeadsSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        currentPath="Bookings"
        onSelectMenu={onNavigateMenu}
      />

      {/* Main CRM Application Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <main className="flex-1 gm-crm-content">
          {/* Header Bar */}
          <BookingsHeader onOpenMobileMenu={() => setIsMobileSidebarOpen(true)} />

          {/* 4 KPI Metric Cards (Total, Month Departures, Pipeline Value, Collected) */}
          <BookingStatsCards />

          {/* Bookings Data Card */}
          <div className="gm-crm-results">
            {/* Filter Tabs (All, Pending, Confirmed, Ongoing, Completed, Cancelled) */}
            <BookingFilterTabs />

            {/* Main Content Area */}
            {loadError ? <p role="alert" className="gm-error">{loadError}</p> : loading ? <p>Loading…</p> : isCompletelyEmpty ? (
              <BookingsEmptyState />
            ) : isFilterEmpty ? (
              <div className="gm-crm-empty">
                <SearchX className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No bookings match your criteria</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Try adjusting your search terms or status filters.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-brand text-white hover:bg-brand-hover transition"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <BookingsTable />
            )}
          </div>
        </main>
      </div>

      {/* Modals & Slide-out Drawers */}
      <NewBookingModal />
      <BookingDetailsDrawer />
    </div>
  )
}
