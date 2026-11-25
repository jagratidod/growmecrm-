import React from 'react'
import { Plus, Search, Filter } from 'lucide-react'
import { useItineraries } from '../../../context/ItinerariesContext'
import type { ItineraryStatus } from '../../../types/itinerary.types'

interface ItinerariesHeaderProps {
  onOpenNewModal: () => void
}

export const ItinerariesHeader: React.FC<ItinerariesHeaderProps> = ({ onOpenNewModal }) => {
  const { filters, setSearch, setStatusFilter } = useItineraries()

  const statusTabs: { label: string; value: ItineraryStatus | 'All'; countColor: string }[] = [
    { label: 'All itineraries', value: 'All', countColor: 'bg-purple-100 text-[#453372]' },
    { label: 'Confirmed', value: 'Confirmed', countColor: 'bg-emerald-100 text-emerald-700' },
    { label: 'Pending', value: 'Pending', countColor: 'bg-amber-100 text-amber-700' },
    { label: 'Draft', value: 'Draft', countColor: 'bg-slate-100 text-slate-700' },
    { label: 'Completed', value: 'Completed', countColor: 'bg-blue-100 text-blue-700' },
  ]

  return (
    <div className="space-y-6">
      {/* Top row: Title and + New Itinerary Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Itineraries
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Every trip's day-by-day plan — design, edit and share as PDF.
          </p>
        </div>

        <button
          onClick={onOpenNewModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#453372] hover:bg-[#37275d] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98] shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New itinerary</span>
        </button>
      </div>

      {/* Search and Filters row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input matching screenshot style */}
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search customer or destination..."
            value={filters.search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372] transition-all shadow-xs"
          />
        </div>

        {/* Status filter tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 hidden sm:inline-block shrink-0" />
          {statusTabs.map((tab) => {
            const isActive = filters.status === tab.value
            return (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#453372] text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
