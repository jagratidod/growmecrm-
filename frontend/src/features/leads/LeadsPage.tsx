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

interface LeadsPageProps {
  onNavigateMenu?: (menu: string) => void
}

export const LeadsPage: React.FC<LeadsPageProps> = ({ onNavigateMenu }) => {
  const { leads, filteredLeads, resetFilters } = useLeads()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [currentMenu, setCurrentMenu] = useState('Leads')

  const isCompletelyEmpty = leads.length === 0
  const isFilterEmpty = leads.length > 0 && filteredLeads.length === 0

  return (
    <div className="min-h-screen bg-[#f3f4f8] flex text-slate-800 font-sans">
      {/* Left Navigation Sidebar with Signature Curved Cutout in Theme */}
      <LeadsSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        currentPath={currentMenu}
        onSelectMenu={(menu) => {
          setCurrentMenu(menu)
          if (onNavigateMenu) onNavigateMenu(menu)
        }}
      />

      {/* Main CRM Application Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <main className="flex-1 p-3 sm:p-5 lg:p-6 max-w-7xl w-full mx-auto">
          {/* Header Bar */}
          <LeadsHeader onOpenMobileMenu={() => setIsMobileSidebarOpen(true)} />

          {/* 4-Color Accent KPI Stat Cards (Coral, Purple, Yellow, Green) */}
          <LeadStatsCards />

          {/* CRM Pipeline & Leads Table Card */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xs border border-slate-100 mb-6">
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
              <div className="bg-[#f3f4f8]/60 rounded-2xl border border-slate-200/80 p-12 text-center">
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
