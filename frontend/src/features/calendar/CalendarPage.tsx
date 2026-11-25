import React, { useState } from 'react'
import { LeadsSidebar } from '../leads/components/LeadsSidebar'
import { CalendarHeader } from './components/CalendarHeader'
import { CalendarMonthNav } from './components/CalendarMonthNav'
import { CalendarGrid } from './components/CalendarGrid'
import { AddEventModal } from './components/AddEventModal'
import { Menu } from 'lucide-react'

interface CalendarPageProps {
  onNavigateMenu?: (menu: string) => void
}

export const CalendarPage: React.FC<CalendarPageProps> = ({ onNavigateMenu }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-canvas flex text-slate-800 font-sans">
      {/* Sidebar with active Calendar tab cutout */}
      <LeadsSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        currentPath="Calendar"
        onSelectMenu={onNavigateMenu}
      />

      {/* Main CRM Application Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Mobile Top App Bar */}
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-brand text-white flex items-center justify-center font-bold text-xs">
              TT
            </div>
            <span className="font-bold text-sm text-slate-900">Calendar</span>
          </div>
          <div className="w-9" />
        </div>

        <main className="flex-1 p-3 sm:p-5 lg:p-8 max-w-7xl w-full mx-auto space-y-5">
          {/* Calendar Header matching screenshot 2 */}
          <CalendarHeader />

          {/* Month Navigation & Today matching screenshot 2 */}
          <CalendarMonthNav />

          {/* 7-column Calendar Grid matching screenshot 2 */}
          <CalendarGrid />
        </main>
      </div>

      {/* Add Event Modal matching screenshot 1 */}
      <AddEventModal />
    </div>
  )
}
