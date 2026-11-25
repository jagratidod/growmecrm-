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
  } = useLeads()

  const { user } = useAuth()

  return (
    <header className="bg-white rounded-2xl px-4 sm:px-6 py-3.5 shadow-xs border border-line mb-6 flex flex-wrap items-center justify-between gap-3">
      {/* Left: Mobile hamburger + CRM Title / Welcome Greeting */}
      <div className="flex items-center gap-3 w-full lg:w-auto min-w-0 justify-between lg:justify-start">
        <div className="flex items-center gap-3">
          {onOpenMobileMenu && (
            <button
              onClick={onOpenMobileMenu}
              className="lg:hidden p-2 rounded-xl text-copy-muted hover:bg-canvas transition"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-ink tracking-tight">Leads</h1>
            <p className="text-xs text-copy-muted truncate max-w-52">
              {user?.organizationName || 'GrowMe Workspace'}
            </p>
          </div>
        </div>

      </div>

      {/* Center: Signature Pill-shaped Search bar with purple button from reference */}
      <div className="w-full grow md:max-w-md md:min-w-40 md:basis-45 relative flex items-center">
        <div className="w-full bg-canvas rounded-full pl-4 pr-1.5 py-1 flex items-center justify-between focus-within:ring-2 focus-within:ring-brand/20 transition-all">
          <input
            type="text"
            placeholder="Search leads, destinations, contacts..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="w-full bg-transparent text-xs sm:text-sm text-slate-700 placeholder-slate-400 focus:outline-hidden pr-2"
          />
          <button
            type="button"
            aria-label="Search leads"
            className="w-8 h-8 rounded-full bg-brand hover:bg-brand-hover text-white flex items-center justify-center shrink-0 shadow-xs transition"
          >
            <Search className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Right: Notification & Message Badges, User Profile, and Primary Action Buttons */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap">

        {/* Circular Notification Bell badge from reference */}
        <button
          type="button"
          title="Notifications"
          className="w-9 h-9 rounded-full bg-canvas hover:bg-slate-200/80 text-slate-600 flex items-center justify-center relative transition"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-[#ff7675] absolute top-2 right-2 ring-2 ring-white"></span>
        </button>

        {/* Circular Messages / Chat badge from reference */}
        <button
          type="button"
          title="Messages"
          className="w-9 h-9 rounded-full bg-canvas hover:bg-slate-200/80 text-slate-600 flex items-center justify-center relative transition"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-[#22c55e] absolute top-2 right-2 ring-2 ring-white"></span>
        </button>

        {/* User Profile Avatar with purple ring */}
        <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
          <div className="w-9 h-9 rounded-full bg-brand text-white ring-2 ring-brand/30 flex items-center justify-center font-bold text-xs select-none">
            {user ? user.username.slice(0, 2).toUpperCase() : ''}
          </div>
        </div>

        {/* Primary Action Buttons: Import CSV and New Lead */}
        <div className="flex items-center gap-2 ml-1">
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            aria-label="Import leads"
            className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold shadow-xs transition"
          >
            <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Import</span>
          </button>

          <button
            type="button"
            onClick={() => setIsNewLeadModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs sm:text-sm font-semibold shadow-xs transition whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New lead</span>
          </button>
        </div>
      </div>
    </header>
  )
}
