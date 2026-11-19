import React, { useState } from 'react'
import { LeadsSidebar } from '../leads/components/LeadsSidebar'
import { BillsHeader } from './components/BillsHeader'
import { BillStatsCards } from './components/BillStatsCards'
import { BillFilterTabs } from './components/BillFilterTabs'
import { BillsEmptyState } from './components/BillsEmptyState'
import { BillsTable } from './components/BillsTable'
import { AddBillModal } from './components/AddBillModal'
import { useBills } from '../../context/BillsContext'
import { SearchX } from 'lucide-react'

interface BillsPageProps {
  onNavigateMenu?: (menu: string) => void
}

export const BillsPage: React.FC<BillsPageProps> = ({ onNavigateMenu }) => {
  const { bills, filteredBills, resetFilters } = useBills()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const isCompletelyEmpty = bills.length === 0
  const isFilterEmpty = bills.length > 0 && filteredBills.length === 0

  return (
    <div className="min-h-screen bg-[#f3f4f8] flex text-slate-800 font-sans">
      {/* Sidebar with active Bills tab cutout */}
      <LeadsSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        currentPath="Bills"
        onSelectMenu={onNavigateMenu}
      />

      {/* Main CRM Application Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <main className="flex-1 p-3 sm:p-5 lg:p-6 max-w-7xl w-full mx-auto">
          {/* Header Bar */}
          <BillsHeader onOpenMobileMenu={() => setIsMobileSidebarOpen(true)} />

          {/* 3 KPI Metric Cards (Total spend, Unpaid, Paid) */}
          <BillStatsCards />

          {/* Main Bills Data Card */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xs border border-slate-100 mb-6">
            {/* Filter Tabs (All, Unpaid, Paid) */}
            <BillFilterTabs />

            {/* Main Content Area */}
            {isCompletelyEmpty ? (
              <BillsEmptyState />
            ) : isFilterEmpty ? (
              <div className="bg-[#f3f4f8]/60 rounded-2xl border border-slate-200/80 p-12 text-center">
                <SearchX className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No bills match your criteria</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Try adjusting your search terms or status filters.
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
              <BillsTable />
            )}
          </div>
        </main>
      </div>

      {/* Add Bill Modal */}
      <AddBillModal />
    </div>
  )
}
