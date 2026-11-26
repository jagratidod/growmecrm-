import { CalendarRange, Menu, Plus, Search } from 'lucide-react'
import { useBookings } from '../../../context/BookingsContext'

export function BookingsHeader({ onOpenMobileMenu }: { onOpenMobileMenu?: () => void }) {
  const { setIsNewBookingModalOpen, filters, updateFilter } = useBookings()
  return <header className="gm-heading mb-5 space-y-3">
    <div className="gm-row">
      <div className="flex items-center gap-2">
        {onOpenMobileMenu && <button type="button" className="gm-mobile gm-icon-button" aria-label="Open menu" onClick={onOpenMobileMenu}><Menu size={20} /></button>}
        <h1>Bookings</h1>
      </div>
      <button type="button" className="gm-button" onClick={() => setIsNewBookingModalOpen(true)}><Plus size={16} /> New booking</button>
    </div>
    <div className="gm-crm-filter-bar">
      <div className="gm-crm-search">
        <Search size={17} aria-hidden="true" />
        <input type="search" aria-label="Search bookings" placeholder="Customer, destination, package or phone"
          value={filters.search} onChange={(event) => updateFilter('search', event.target.value)} />
      </div>
      <details className="gm-booking-date-filter">
        <summary className="gm-button secondary"><CalendarRange size={16} /> Departure dates{(filters.departureFrom || filters.departureTo) && <span aria-label="Active filter">•</span>}</summary>
        <div>
          <label>From<input aria-label="Departure from" type="date" value={filters.departureFrom || ''} max={filters.departureTo || undefined} onChange={(event) => updateFilter('departureFrom', event.target.value)} /></label>
          <label>Through<input aria-label="Departure through" type="date" value={filters.departureTo || ''} min={filters.departureFrom || undefined} onChange={(event) => updateFilter('departureTo', event.target.value)} /></label>
          {(filters.departureFrom || filters.departureTo) && <button className="gm-text-button" type="button" onClick={() => { updateFilter('departureFrom', ''); updateFilter('departureTo', '') }}>Clear dates</button>}
        </div>
      </details>
    </div>
  </header>
}
