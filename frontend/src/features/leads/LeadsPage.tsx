import React, { useState } from 'react'
import { LeadsSidebar } from './components/LeadsSidebar'
import { LeadsHeader } from './components/LeadsHeader'
import { LeadStatsCards } from './components/LeadStatsCards'
import { LeadsSearchFilter } from './components/LeadsSearchFilter'
import { PipelineChevronBar } from './components/PipelineChevronBar'
import { TemperatureChips } from './components/TemperatureChips'
import { LeadsEmptyState } from './components/LeadsEmptyState'
import { LeadsTable } from './components/LeadsTable'
import { NewLeadModal } from './components/NewLeadModal'
import { LeadDetailsDrawer } from './components/LeadDetailsDrawer'
import { ImportCsvModal } from './components/ImportCsvModal'
import { useLeads } from '../../context/LeadsContext'
import { SearchX } from 'lucide-react'

export const LeadsPage: React.FC = () => {
  const { leads, filteredLeads, resetFilters } = useLeads()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const isCompletelyEmpty = leads.length === 0
  const isFilterEmpty = leads.length > 0 && filteredLeads.length === 0

  return (
    <div className="min-h-screen bg-slate-50/60 flex text-slate-800 font-sans">
      {/* Left Navigation Sidebar */}
      <LeadsSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        currentPath="Leads"
      />

      {/* Main Page Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Header */}
          <LeadsHeader onOpenMobileMenu={() => setIsMobileSidebarOpen(true)} />

          {/* Statistics Cards */}
          <LeadStatsCards />

          {/* Search Bar + Filters */}
          <LeadsSearchFilter />

          {/* Sales Pipeline Chevron Bar */}
          <PipelineChevronBar />

          {/* Temperature Filter Chips */}
          <TemperatureChips />

          {/* Content: Empty State, Filtered Empty, or Table */}
          {isCompletelyEmpty ? (
            <LeadsEmptyState />
          ) : isFilterEmpty ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
              <SearchX className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No leads match your criteria</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Try adjusting your search keywords, pipeline stage, or temperature filters.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <LeadsTable />
          )}
        </main>
      </div>

      {/* Slide-out Drawers & Modals */}
      <NewLeadModal />
      <LeadDetailsDrawer />
      <ImportCsvModal />
    </div>
  )
}
