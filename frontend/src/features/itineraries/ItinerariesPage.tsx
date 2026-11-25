import React, { useState } from 'react'
import { LeadsSidebar } from '../leads/components/LeadsSidebar'
import { ItinerariesHeader } from './components/ItinerariesHeader'
import { ItinerariesEmptyState } from './components/ItinerariesEmptyState'
import { ItinerariesTable } from './components/ItinerariesTable'
import { NewItineraryModal } from './components/NewItineraryModal'
import { ItineraryDetailsDrawer } from './components/ItineraryDetailsDrawer'
import { useItineraries } from '../../context/ItinerariesContext'
import { Menu } from 'lucide-react'
import type { Itinerary } from '../../types/itinerary.types'

interface ItinerariesPageProps {
  onNavigateMenu?: (menu: string) => void
}

export const ItinerariesPage: React.FC<ItinerariesPageProps> = ({ onNavigateMenu }) => {
  const {
    itineraries,
    filteredItineraries,
    isNewModalOpen,
    setIsNewModalOpen,
    selectedItinerary,
    setSelectedItinerary,
  } = useItineraries()

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const isCompletelyEmpty = itineraries.length === 0
  const isFilterEmpty = itineraries.length > 0 && filteredItineraries.length === 0

  return (
    <div className="min-h-screen bg-canvas flex text-slate-800 font-sans">
      {/* Sidebar with active Itineraries tab cutout */}
      <LeadsSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        currentPath="Itineraries"
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
            <span className="font-bold text-sm text-slate-900">Itineraries</span>
          </div>
          <div className="w-9" />
        </div>

        <main className="flex-1 p-3 sm:p-5 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Header Bar with Search & + New Itinerary Button */}
          <ItinerariesHeader onOpenNewModal={() => setIsNewModalOpen(true)} />

          {/* Main Content Area */}
          {isCompletelyEmpty ? (
            <ItinerariesEmptyState onOpenNewModal={() => setIsNewModalOpen(true)} />
          ) : isFilterEmpty ? (
            <ItinerariesEmptyState
              onOpenNewModal={() => setIsNewModalOpen(true)}
              isFiltered
            />
          ) : (
            <ItinerariesTable
              onOpenDetails={(itn: Itinerary) => setSelectedItinerary(itn)}
            />
          )}
        </main>
      </div>

      {/* New Itinerary Modal */}
      <NewItineraryModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onCreated={(id) => {
          const created = itineraries.find((it) => it.id === id)
          if (created) setSelectedItinerary(created)
        }}
      />

      {/* Itinerary Details & Day-by-day Drawer */}
      <ItineraryDetailsDrawer
        itinerary={selectedItinerary}
        onClose={() => setSelectedItinerary(null)}
      />
    </div>
  )
}
