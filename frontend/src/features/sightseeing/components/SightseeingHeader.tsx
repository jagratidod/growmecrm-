import React from 'react'
import { Plus, Search, Compass } from 'lucide-react'
import { useSightseeing } from '../../../context/SightseeingContext'

interface SightseeingHeaderProps {
  onOpenNewModal: () => void
}

export const SightseeingHeader: React.FC<SightseeingHeaderProps> = ({ onOpenNewModal }) => {
  const { filters, setSearch, activities } = useSightseeing()

  return (
    <div className="space-y-6">
      {/* Top Row: Title and + New activity button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Sightseeing
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Reusable activities you drop into package days — write once, reuse everywhere.
          </p>
        </div>

        <button
          onClick={onOpenNewModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#453372] hover:bg-[#37275d] text-white font-semibold text-sm shadow-xs hover:shadow transition-all active:scale-[0.98] shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New activity</span>
        </button>
      </div>

      {/* Search Bar matching screenshot */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search activities..."
            value={filters.search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372] shadow-2xs transition-all"
          />
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium bg-white px-3 py-1.5 rounded-xl border border-slate-200">
          <Compass className="w-4 h-4 text-[#453372]" />
          <span>{activities.length} {activities.length === 1 ? 'Activity' : 'Activities'} in Library</span>
        </div>
      </div>
    </div>
  )
}
