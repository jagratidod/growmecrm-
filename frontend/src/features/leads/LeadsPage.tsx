import React, { useState } from 'react'
import { LeadsSidebar } from './components/LeadsSidebar'
import { LeadsHeader } from './components/LeadsHeader'
import { LeadStatsCards } from './components/LeadStatsCards'
import { SmartDashboardWidgets } from '../dashboard/SmartDashboardWidgets'
import { LeadsSearchFilter } from './components/LeadsSearchFilter'
import { PipelineChevronBar } from './components/PipelineChevronBar'
import { TemperatureChips } from './components/TemperatureChips'
import { LeadsEmptyState } from './components/LeadsEmptyState'
import { LeadsTable } from './components/LeadsTable'
import { NewLeadModal } from './components/NewLeadModal'
import { LeadDetailsDrawer } from './components/LeadDetailsDrawer'
import { ImportCsvModal } from './components/ImportCsvModal'
import { useLeads } from '../../context/LeadsContext'
import { SearchX, TableProperties } from 'lucide-react'

export const LeadsPage: React.FC = () => {
  const { leads, filteredLeads, resetFilters } = useLeads()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const isCompletelyEmpty = leads.length === 0
  const isFilterEmpty = leads.length > 0 && filteredLeads.length === 0

  return (
    <div className="min-h-screen bg-[#f3f4f8] flex text-slate-800 font-sans">
      {/* Left Navigation Sidebar with Curved Active Tab & Botanical Art */}
      <LeadsSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        currentPath="Dashboard"
      />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <main className="flex-1 p-3 sm:p-5 lg:p-6 max-w-7xl w-full mx-auto">
          {/* Header Bar */}
          <LeadsHeader onOpenMobileMenu={() => setIsMobileSidebarOpen(true)} />

          {/* Top 4 KPI Metric Cards (Coral, Purple, Yellow, Green) */}
          <LeadStatsCards />

          {/* Smart Dashboard Reference Widgets: Calendar, School Performance, Top Scorer Podium Cards */}
          <SmartDashboardWidgets />

          {/* Section Divider / View Switcher */}
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-100 mb-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#453372]/10 text-[#453372] flex items-center justify-center font-bold">
                  <TableProperties className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 tracking-tight">
                    Leads Management & Pipeline
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Track enquiries, pipeline stages, and conversion status
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-[#453372] border border-purple-200">
                  {leads.length} Records
                </span>
              </div>
            </div>

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
              <div className="bg-[#f3f4f8]/50 rounded-2xl border border-slate-200/80 p-12 text-center">
                <SearchX className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No leads match your criteria</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Try adjusting your search keywords, pipeline stage, or temperature filters.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-[#453372] text-white hover:bg-[#382760] transition"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <LeadsTable />
            )}
          </div>
        </main>
      </div>

      {/* Slide-out Drawers & Modals */}
      <NewLeadModal />
      <LeadDetailsDrawer />
      <ImportCsvModal />
    </div>
  )
}
