import React from 'react'
import {
  Search,
  Bell,
  MessageSquare,
  UploadCloud,
  Plus,
  Menu,
} from 'lucide-react'
import { useLeads } from '../../../context/LeadsContext'
import { useAuth } from '../../../context/AuthContext'

interface LeadsHeaderProps {
  onOpenMobileMenu?: () => void
}

export const LeadsHeader: React.FC<LeadsHeaderProps> = ({ onOpenMobileMenu }) => {
  const {
    setIsNewLeadModalOpen,
    setIsImportModalOpen,
    filters,
    updateFilter,
    leads,
    loadDemoData,
    clearAllLeads,
  } = useLeads()

  const { user } = useAuth()

  return (
    <header className="bg-white rounded-2xl px-4 sm:px-6 py-3.5 shadow-xs border border-slate-100 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Left: Mobile hamburger + CRM Title / Welcome Greeting */}
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
            <h1 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
              Welcome to <span className="text-[#453372] font-black">Treki CRM</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Track and manage every travel enquiry in one place
            </p>
          </div>
        </div>

        {/* Quick demo actions for mobile */}
        <div className="flex items-center gap-1.5 md:hidden">
          {leads.length === 0 ? (
            <button
              type="button"
              onClick={loadDemoData}
              className="text-[11px] text-[#453372] bg-purple-50 px-2 py-1 rounded-md font-semibold"
            >
              Load Demo
            </button>
          ) : (
            <button
              type="button"
              onClick={clearAllLeads}
              className="text-[11px] text-slate-400 hover:text-rose-600 px-2 py-1 font-medium"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Center: Signature Pill-shaped Search bar with purple button from reference */}
      <div className="w-full md:max-w-md relative flex items-center">
        <div className="w-full bg-[#f3f4f8] rounded-full pl-4 pr-1.5 py-1 flex items-center justify-between focus-within:ring-2 focus-within:ring-[#453372]/20 transition-all">
          <input
            type="text"
            placeholder="Search leads, destinations, contacts..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="w-full bg-transparent text-xs sm:text-sm text-slate-700 placeholder-slate-400 focus:outline-hidden pr-2"
          />
          <button
            type="button"
            className="w-8 h-8 rounded-full bg-[#453372] hover:bg-[#382760] text-white flex items-center justify-center shrink-0 shadow-xs transition"
          >
            <Search className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Right: Notification & Message Badges, User Profile, and Primary Action Buttons */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-end">
        {/* Quick Demo Data toggle on desktop */}
        <div className="hidden lg:flex items-center gap-1.5 mr-1">
          {leads.length === 0 ? (
            <button
              type="button"
              onClick={loadDemoData}
              className="text-[11px] text-[#453372] bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2.5 py-1.5 rounded-lg font-semibold transition"
            >
              Demo Data
            </button>
          ) : (
            <button
              type="button"
              onClick={clearAllLeads}
              className="text-[11px] text-slate-400 hover:text-rose-600 px-2 py-1 font-medium transition"
            >
              Reset
            </button>
          )}
        </div>

        {/* Circular Notification Bell badge from reference */}
        <button
          type="button"
          title="Notifications"
          className="w-9 h-9 rounded-full bg-[#f3f4f8] hover:bg-slate-200/80 text-slate-600 flex items-center justify-center relative transition"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-[#ff7675] absolute top-2 right-2 ring-2 ring-white"></span>
        </button>

        {/* Circular Messages / Chat badge from reference */}
        <button
          type="button"
          title="Messages"
          className="w-9 h-9 rounded-full bg-[#f3f4f8] hover:bg-slate-200/80 text-slate-600 flex items-center justify-center relative transition"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-[#22c55e] absolute top-2 right-2 ring-2 ring-white"></span>
        </button>

        {/* User Profile Avatar with purple ring */}
        <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
          <div className="w-9 h-9 rounded-full bg-[#453372] text-white ring-2 ring-[#453372]/30 flex items-center justify-center font-bold text-xs select-none">
            {user ? user.username.slice(0, 2).toUpperCase() : 'KP'}
          </div>
        </div>

        {/* Primary Action Buttons: Import CSV and New Lead */}
        <div className="flex items-center gap-2 ml-1">
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold shadow-xs transition"
          >
            <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Import</span>
          </button>

          <button
            type="button"
            onClick={() => setIsNewLeadModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-[#453372] hover:bg-[#382760] text-white text-xs sm:text-sm font-semibold shadow-xs shadow-[#453372]/30 transition"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New lead</span>
          </button>
        </div>
      </div>
    </header>
  )
}
