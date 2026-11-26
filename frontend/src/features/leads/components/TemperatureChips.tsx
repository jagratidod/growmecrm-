import React from 'react'
import { useLeads } from '../../../context/LeadsContext'
import type { LeadTemperature } from '../../../types/lead.types'

export const TemperatureChips: React.FC = () => {
  const { filters, updateFilter, pagination, stats, resetFilters } = useLeads()

  const chips: (LeadTemperature | 'All')[] = ['All', 'Hot', 'Warm', 'Cold']

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 select-none">
      {/* Pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {chips.map((chip) => {
          const isSelected = (filters.temperature || 'All') === chip
          return (
            <button
              key={chip === 'All' ? 'Any priority' : chip}
              type="button"
              aria-pressed={isSelected}
              onClick={() => updateFilter('temperature', chip)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-brand text-white shadow-xs font-semibold'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {chip === 'All' ? 'Any priority' : chip}
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
        <span>{filters.view === 'archived' ? `${pagination.total} archived leads` : `${pagination.total} of ${stats.overall} leads`}</span>
        {(pagination.total !== stats.overall || filters.view === 'archived') && (
          <button type="button" onClick={resetFilters} className="gm-text-button">Clear filters</button>
        )}
      </div>
    </div>
  )
}
