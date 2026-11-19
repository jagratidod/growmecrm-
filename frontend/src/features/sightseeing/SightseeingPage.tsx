import React, { useState } from 'react'
import { LeadsSidebar } from '../leads/components/LeadsSidebar'
import { SightseeingHeader } from './components/SightseeingHeader'
import { SightseeingEmptyState } from './components/SightseeingEmptyState'
import { SightseeingGrid } from './components/SightseeingGrid'
import { NewActivityModal } from './components/NewActivityModal'
import { useSightseeing } from '../../context/SightseeingContext'
import { Menu } from 'lucide-react'
import type { SightseeingActivity } from '../../types/sightseeing.types'

interface SightseeingPageProps {
  onNavigateMenu?: (menu: string) => void
}

export const SightseeingPage: React.FC<SightseeingPageProps> = ({ onNavigateMenu }) => {
  const {
    activities,
    filteredActivities,
    isModalOpen,
    setIsModalOpen,
    editingActivity,
    setEditingActivity,
  } = useSightseeing()

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const isCompletelyEmpty = activities.length === 0
  const isFilterEmpty = activities.length > 0 && filteredActivities.length === 0

  const handleOpenNewModal = () => {
    setEditingActivity(null)
    setIsModalOpen(true)
  }

  const handleEditActivity = (activity: SightseeingActivity) => {
    setEditingActivity(activity)
    setIsModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-[#f3f4f8] flex text-slate-800 font-sans">
      {/* Sidebar with active Sightseeing tab cutout */}
      <LeadsSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        currentPath="Sightseeing"
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
            <span className="font-bold text-sm text-slate-900">Sightseeing</span>
          </div>
          <div className="w-9" />
        </div>

        <main className="flex-1 p-3 sm:p-5 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Header Bar */}
          <SightseeingHeader onOpenNewModal={handleOpenNewModal} />

          {/* Main Content Area */}
          {isCompletelyEmpty ? (
            <SightseeingEmptyState onOpenNewModal={handleOpenNewModal} />
          ) : isFilterEmpty ? (
            <SightseeingEmptyState onOpenNewModal={handleOpenNewModal} isFiltered />
          ) : (
            <SightseeingGrid onEditActivity={handleEditActivity} />
          )}
        </main>
      </div>

      {/* New / Edit Activity Modal */}
      <NewActivityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        activityToEdit={editingActivity}
      />
    </div>
  )
}
