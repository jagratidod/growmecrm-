import React from 'react'
import { Search, Plus, Menu } from 'lucide-react'
import { useBills } from '../../../context/BillsContext'
import { useAuth } from '../../../context/AuthContext'

interface BillsHeaderProps {
  onOpenMobileMenu?: () => void
}

export const BillsHeader: React.FC<BillsHeaderProps> = ({ onOpenMobileMenu }) => {
  const {
    setIsAddBillModalOpen,
    filters,
    updateFilter,
  } = useBills()

  const { user } = useAuth()

  return (
    <header className="bg-white rounded-2xl px-4 sm:px-6 py-3.5 shadow-xs border border-slate-100 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Left: Mobile hamburger + Title & Subtitle */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
        <div className="flex items-center gap-3">
          {onOpenMobileMenu && (
            <button
              onClick={onOpenMobileMenu}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              Bills
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Every vendor cost — hotels, flights, transport — paid and outstanding.
            </p>
          </div>
        </div>
      </div>

      {/* Center: Signature Pill-shaped Search bar from reference */}
      <div className="w-full md:max-w-md relative flex items-center">
        <div className="w-full bg-canvas rounded-full pl-4 pr-1.5 py-1 flex items-center justify-between focus-within:ring-2 focus-within:ring-brand/20 transition-all">
          <input
            type="text"
            placeholder="Search vendor or customer..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="w-full bg-transparent text-xs sm:text-sm text-slate-700 placeholder-slate-400 focus:outline-hidden pr-2"
          />
          <button
            type="button"
            className="w-8 h-8 rounded-full bg-brand hover:bg-brand-hover text-white flex items-center justify-center shrink-0 shadow-xs transition"
          >
            <Search className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Right: Notifications, Avatar, and + Add bill button */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-end">

        {/* User Profile Avatar with purple ring */}
        <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
          <div className="w-9 h-9 rounded-full bg-brand text-white ring-2 ring-brand/30 flex items-center justify-center font-bold text-xs select-none">
            {user ? user.username.slice(0, 2).toUpperCase() : ''}
          </div>
        </div>

        {/* Primary Action Button: + Add bill */}
        <button
          type="button"
          onClick={() => setIsAddBillModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs sm:text-sm font-semibold shadow-sm shadow-brand/30 transition active:scale-[0.99] ml-1"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add bill</span>
        </button>
      </div>
    </header>
  )
}
