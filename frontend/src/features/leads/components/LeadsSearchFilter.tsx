import React from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useLeads } from '../../../context/LeadsContext'
import type { LeadStage, LeadTemperature, CustomerType } from '../../../types/lead.types'

export const LeadsSearchFilter: React.FC = () => {
  const {
    filters,
    updateFilter,
    resetFilters,
    isFiltersDrawerOpen,
    setIsFiltersDrawerOpen,
  } = useLeads()

  const hasActiveFilters =
    filters.stage !== 'All' ||
    filters.temperature !== 'All' ||
    filters.customerType !== 'All' ||
    Boolean(filters.destination) ||
    Boolean(filters.assignedTo)

  return (
    <div className="relative mb-4">
      {/* Search Bar + Filters Toggle Button */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            placeholder="Search name, email, phone, destination..."
            className="w-full bg-white border border-slate-200/90 rounded-2xl pl-11 pr-10 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#453372] focus:ring-2 focus:ring-[#453372]/15 transition shadow-xs"
          />
          {filters.search && (
            <button
              onClick={() => updateFilter('search', '')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsFiltersDrawerOpen(!isFiltersDrawerOpen)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 sm:py-3 rounded-2xl border text-xs sm:text-sm font-semibold transition shadow-xs shrink-0 select-none ${
            hasActiveFilters || isFiltersDrawerOpen
              ? 'border-[#453372] bg-purple-50 text-[#453372]'
              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4 text-current" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-[#453372]"></span>
          )}
        </button>
      </div>

      {/* Advanced Filter Panel Popup / Drawer */}
      {isFiltersDrawerOpen && (
        <div className="mt-3 p-5 bg-white border border-slate-200 rounded-2xl shadow-lg space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h4 className="text-sm font-bold text-slate-800">Advanced Filters</h4>
            <div className="flex items-center gap-3">
              <button
                onClick={resetFilters}
                className="text-xs text-[#453372] hover:underline font-semibold"
              >
                Reset All
              </button>
              <button
                onClick={() => setIsFiltersDrawerOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Lead status / stage */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Lead Stage
              </label>
              <select
                value={filters.stage || 'All'}
                onChange={(e) => updateFilter('stage', e.target.value as LeadStage | 'All')}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-400"
              >
                <option value="All">All Stages</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Proposal sent">Proposal sent</option>
                <option value="Negotiation">Negotiation</option>
                <option value="Won">Won</option>
                <option value="Lost">Lost</option>
              </select>
            </div>

            {/* Lead temperature */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Temperature
              </label>
              <select
                value={filters.temperature || 'All'}
                onChange={(e) => updateFilter('temperature', e.target.value as LeadTemperature | 'All')}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-400"
              >
                <option value="All">All Temperatures</option>
                <option value="Hot">Hot</option>
                <option value="Warm">Warm</option>
                <option value="Cold">Cold</option>
                <option value="Won">Won</option>
                <option value="Lost">Lost</option>
              </select>
            </div>

            {/* Customer Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Customer Type
              </label>
              <select
                value={filters.customerType || 'All'}
                onChange={(e) => updateFilter('customerType', e.target.value as CustomerType | 'All')}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-400"
              >
                <option value="All">All Types</option>
                <option value="B2C">B2C</option>
                <option value="B2B">B2B</option>
              </select>
            </div>

            {/* Assigned To */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Assigned Team Member
              </label>
              <select
                value={filters.assignedTo || 'All'}
                onChange={(e) => updateFilter('assignedTo', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-400"
              >
                <option value="All">All Members</option>
                <option value="Unassigned">Unassigned</option>
                <option value="Kushal Pareta">Kushal Pareta</option>
                <option value="Pooja Sharma">Pooja Sharma</option>
                <option value="Rahul Verma">Rahul Verma</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
