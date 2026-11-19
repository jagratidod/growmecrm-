import React from 'react'
import { RotateCw } from 'lucide-react'
import { useLeads } from '../../../context/LeadsContext'
import type { LeadTemperature } from '../../../types/lead.types'

export const TemperatureChips: React.FC = () => {
  const { filters, updateFilter, filteredLeads, leads, resetFilters } = useLeads()

  const chips: (LeadTemperature | 'All')[] = ['All', 'Hot', 'Warm', 'Cold', 'Won', 'Lost']

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 select-none">
      {/* Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        {chips.map((chip) => {
          const isSelected = (filters.temperature || 'All') === chip
          return (
            <button
              key={chip}
              type="button"
              onClick={() => updateFilter('temperature', chip)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {chip}
            </button>
          )
        })}
      </div>

      {/* Live count indicator + Refresh */}
      <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-semibold text-slate-700">Live</span>
          <span>
            Showing <strong className="text-slate-900">{filteredLeads.length}</strong> leads out of{' '}
            <strong className="text-slate-900">{leads.length}</strong>
          </span>
        </div>

        <button
          type="button"
          onClick={resetFilters}
          title="Reset filters and refresh"
          className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
