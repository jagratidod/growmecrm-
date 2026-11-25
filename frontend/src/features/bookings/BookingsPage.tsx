import React, { useState } from 'react'
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

interface BookingsPageProps {
  onNavigateMenu?: (menu: string) => void
}

export const BookingsPage: React.FC<BookingsPageProps> = ({ onNavigateMenu }) => {
  const { bookings, loading, loadError, filteredBookings, resetFilters } = useBookings()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

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
        <main className="flex-1 p-3 sm:p-5 lg:p-6 max-w-7xl w-full mx-auto">
          {/* Header Bar */}
          <BookingsHeader onOpenMobileMenu={() => setIsMobileSidebarOpen(true)} />

          {/* 4 KPI Metric Cards (Total, Month Departures, Pipeline Value, Collected) */}
          <BookingStatsCards />

          {/* Bookings Data Card */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xs border border-slate-100 mb-6">
            {/* Filter Tabs (All, Pending, Confirmed, Ongoing, Completed, Cancelled) */}
            <BookingFilterTabs />

            {/* Main Content Area */}
            {loadError ? <p role="alert" className="gm-error">{loadError}</p> : loading ? <p>Loading…</p> : isCompletelyEmpty ? (
              <BookingsEmptyState />
            ) : isFilterEmpty ? (
              <div className="bg-canvas/60 rounded-2xl border border-slate-200/80 p-12 text-center">
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
                  Reset All Filters
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
