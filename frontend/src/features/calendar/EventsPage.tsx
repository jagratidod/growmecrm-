import { useState } from 'react'
import { CalendarDays, Menu, Plus, Search } from 'lucide-react'
import { useCalendar } from '../../context/CalendarContext'
import { useRouter } from '../../context/RouterContext'
import { LeadsSidebar } from '../leads/components/LeadsSidebar'
import { AddEventModal } from './components/AddEventModal'
import type { CalendarEvent } from '../../types/calendar.types'

const kinds: Record<CalendarEvent['type'], string> = { manual: 'Event', departure: 'Departure', return: 'Return', task: 'Task' }
const dateLabel = (date: string) => new Date(date + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })

export function EventsPage() {
  const { allEvents, setIsAddEventModalOpen, setSelectedDate, loading, loadError, refreshEvents } = useCalendar()
  const { navigate } = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [range, setRange] = useState<'Upcoming' | 'Past' | 'All'>('Upcoming')
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Kolkata' })
  const visible = allEvents
    .filter(({ title, notes, date }) => (range === 'All' || (range === 'Upcoming' ? date >= today : date < today)) && [title, notes, date].some((text) => text?.toLowerCase().includes(search.trim().toLowerCase())))
    .sort((first, second) => range === 'Past' ? second.date.localeCompare(first.date) : first.date.localeCompare(second.date))

  return <div className="gm-shell">
    <LeadsSidebar isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    <main className="gm-main gm-crm-content">
      <header className="gm-heading gm-row">
        <div className="flex items-center gap-2">
          <button type="button" className="gm-mobile gm-icon-button" aria-label="Open menu" onClick={() => setMenuOpen(true)}><Menu size={20} /></button>
          <h1>Events</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="gm-button secondary" onClick={() => navigate('/calendar')}><CalendarDays size={16} /> Calendar</button>
          <button type="button" className="gm-button" onClick={() => { setSelectedDate(today); setIsAddEventModalOpen(true) }}><Plus size={16} /> Add event</button>
        </div>
      </header>
      <div className="gm-row mb-4">
        <label className="gm-crm-search"><Search size={16} /><input type="search" aria-label="Search events" placeholder="Search events or departures" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
        <div className="gm-stage-filters !m-0" role="group" aria-label="Event date range">
          {(['Upcoming', 'Past', 'All'] as const).map((item) => <button type="button" key={item} aria-pressed={range === item} onClick={() => setRange(item)}>{item}</button>)}
        </div>
      </div>
      {loadError ? <p role="alert" className="gm-error">{loadError} <button type="button" className="gm-text-button" onClick={refreshEvents}>Retry</button></p>
        : loading ? <p role="status">Loading events…</p>
        : visible.length ? <ul className="gm-card gm-event-list">
          {visible.map((event) => <li key={event.id}>
            <time dateTime={event.date}>{dateLabel(event.date)}</time>
            <div><strong>{event.title}</strong>{event.notes && <small>{event.notes}</small>}</div>
            <span className="gm-tag">{kinds[event.type]}</span>
          </li>)}
        </ul> : <div className="gm-crm-empty"><CalendarDays className="mx-auto mb-3 text-brand" size={24} /><h2>{search ? 'No matching events' : range === 'Upcoming' ? 'No upcoming events' : range === 'Past' ? 'No past events' : 'No events yet'}</h2></div>}
    </main>
    <AddEventModal />
  </div>
}
