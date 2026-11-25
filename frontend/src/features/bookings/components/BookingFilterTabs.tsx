import React from 'react'
import { useBookings } from '../../../context/BookingsContext'
import type { BookingStatus } from '../../../types/booking.types'

export const BookingFilterTabs: React.FC = () => {
  const { filters, updateFilter, bookings, filteredBookings } = useBookings()

  const tabs: { id: BookingStatus | 'All'; label: string; dotColor?: string }[] = [
    { id: 'All', label: 'All bookings' },
    { id: 'Pending', label: 'Pending', dotColor: 'bg-[#ffb800]' },
    { id: 'Confirmed', label: 'Confirmed', dotColor: 'bg-blue-500' },
    { id: 'Ongoing', label: 'Ongoing', dotColor: 'bg-brand' },
    { id: 'Completed', label: 'Completed', dotColor: 'bg-[#22c55e]' },
    { id: 'Cancelled', label: 'Cancelled', dotColor: 'bg-slate-400' },
  ]

  const statusCounts = React.useMemo(() => {
    const counts: Record<string, number> = { All: bookings.length }
    tabs.forEach((t) => {
      if (t.id !== 'All') counts[t.id] = 0
    })
    bookings.forEach((b) => {
      if (counts[b.status] !== undefined) {
        counts[b.status]++
      }
    })
    return counts
  }, [bookings, tabs])

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 select-none">
      {/* Pills Container */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        {tabs.map((tab) => {
          const isSelected = filters.status === tab.id
          const count = statusCounts[tab.id] || 0

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => updateFilter('status', tab.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                isSelected
                  ? 'bg-brand text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab.dotColor && (
                <span
                  className={`w-2 h-2 rounded-full ${tab.dotColor} ${
                    isSelected ? 'ring-2 ring-white/50' : ''
                  }`}
                />
              )}
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Showing count indicator */}
      <div className="text-xs text-slate-400 font-medium shrink-0">
        Showing <strong className="text-slate-700">{filteredBookings.length}</strong> of{' '}
        <strong className="text-slate-700">{bookings.length}</strong> bookings
      </div>
    </div>
  )
}
