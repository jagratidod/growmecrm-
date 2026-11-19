import React, { useState } from 'react'
import { LeadsSidebar } from '../leads/components/LeadsSidebar'
import { CallLogHeader } from './components/CallLogHeader'
import { CallLogEmptyState } from './components/CallLogEmptyState'
import { CallLogTable } from './components/CallLogTable'
import { LogCallModal } from './components/LogCallModal'
import { useCallLog } from '../../context/CallLogContext'
import { Menu } from 'lucide-react'

interface CallLogPageProps {
  onNavigateMenu?: (menu: string) => void
}

export const CallLogPage: React.FC<CallLogPageProps> = ({ onNavigateMenu }) => {
  const { callLogs, filteredCallLogs, isLogModalOpen, setIsLogModalOpen } = useCallLog()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const isCompletelyEmpty = callLogs.length === 0
  const isFilterEmpty = callLogs.length > 0 && filteredCallLogs.length === 0

  return (
    <div className="min-h-screen bg-[#f3f4f8] flex text-slate-800 font-sans">
      {/* Sidebar with active Call Log tab cutout */}
      <LeadsSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        currentPath="Call Log"
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
            <div className="w-7 h-7 rounded-full bg-[#453372] text-white flex items-center justify-center font-bold text-xs">
              TT
            </div>
            <span className="font-bold text-sm text-slate-900">Call Log</span>
          </div>
          <div className="w-9" />
        </div>

        <main className="flex-1 p-3 sm:p-5 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Header Bar */}
          <CallLogHeader onOpenLogModal={() => setIsLogModalOpen(true)} />

          {/* Main Content Area */}
          {isCompletelyEmpty ? (
            <CallLogEmptyState onOpenLogModal={() => setIsLogModalOpen(true)} />
          ) : isFilterEmpty ? (
            <CallLogEmptyState onOpenLogModal={() => setIsLogModalOpen(true)} isFiltered />
          ) : (
            <CallLogTable />
          )}
        </main>
      </div>

      {/* Log Call Modal */}
      <LogCallModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
      />
    </div>
  )
}
