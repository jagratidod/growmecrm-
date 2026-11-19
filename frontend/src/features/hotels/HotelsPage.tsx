import React, { useState } from 'react'
import { LeadsSidebar } from '../leads/components/LeadsSidebar'
import { HotelsHeader } from './components/HotelsHeader'
import { HotelsEmptyState } from './components/HotelsEmptyState'
import { HotelsGrid } from './components/HotelsGrid'
import { AddHotelModal } from './components/AddHotelModal'
import { useHotels } from '../../context/HotelsContext'
import { Menu } from 'lucide-react'
import type { Hotel } from '../../types/hotel.types'

interface HotelsPageProps {
  onNavigateMenu?: (menu: string) => void
}

export const HotelsPage: React.FC<HotelsPageProps> = ({ onNavigateMenu }) => {
  const {
    hotels,
    filteredHotels,
    isAddModalOpen,
    setIsAddModalOpen,
    editingHotel,
    setEditingHotel,
  } = useHotels()

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const isCompletelyEmpty = hotels.length === 0
  const isFilterEmpty = hotels.length > 0 && filteredHotels.length === 0

  const handleOpenAddModal = () => {
    setEditingHotel(null)
    setIsAddModalOpen(true)
  }

  const handleEditHotel = (hotel: Hotel) => {
    setEditingHotel(hotel)
    setIsAddModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-[#f3f4f8] flex text-slate-800 font-sans">
      {/* Sidebar with active Hotels tab cutout */}
      <LeadsSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        currentPath="Hotels"
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
            <span className="font-bold text-sm text-slate-900">Hotels</span>
          </div>
          <div className="w-9" />
        </div>

        <main className="flex-1 p-3 sm:p-5 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Header Bar */}
          <HotelsHeader onOpenAddModal={handleOpenAddModal} />

          {/* Main Content Area */}
          {isCompletelyEmpty ? (
            <HotelsEmptyState onOpenAddModal={handleOpenAddModal} />
          ) : isFilterEmpty ? (
            <HotelsEmptyState onOpenAddModal={handleOpenAddModal} isFiltered />
          ) : (
            <HotelsGrid onEditHotel={handleEditHotel} />
          )}
        </main>
      </div>

      {/* Add / Edit Hotel Modal */}
      <AddHotelModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        hotelToEdit={editingHotel}
      />
    </div>
  )
}
