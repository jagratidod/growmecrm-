import React from 'react'
import { Bell, MessageSquare, UserPlus, Menu } from 'lucide-react'
import { useTeam } from '../../../context/TeamContext'
import { useAuth } from '../../../context/AuthContext'

interface TeamHeaderProps {
  onOpenMobileMenu?: () => void
}

export const TeamHeader: React.FC<TeamHeaderProps> = ({ onOpenMobileMenu }) => {
  const { setIsInviteModalOpen, loadDemoData, clearAllTeam, members, pendingInvites } = useTeam()
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
              Team
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Invite teammates and manage their access.
            </p>
          </div>
        </div>

        {/* Mobile quick actions */}
        <div className="flex items-center gap-1.5 md:hidden">
          {pendingInvites.length === 0 && members.length <= 1 ? (
            <button
              type="button"
              onClick={loadDemoData}
              className="text-[11px] text-[#453372] bg-purple-50 px-2 py-1 rounded-md font-semibold"
            >
              Demo Team
            </button>
          ) : (
            <button
              type="button"
              onClick={clearAllTeam}
              className="text-[11px] text-slate-400 hover:text-rose-600 px-2 py-1 font-medium"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Right: Notifications, Avatar, and + Invite teammate button */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-end">
        {/* Desktop Quick helper */}
        <div className="hidden lg:flex items-center gap-1.5 mr-1">
          {pendingInvites.length === 0 && members.length <= 1 ? (
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
              onClick={clearAllTeam}
              className="text-[11px] text-slate-400 hover:text-rose-600 px-2 py-1 font-medium transition"
            >
              Reset
            </button>
          )}
        </div>

        {/* Circular Notification Bell badge */}
        <button
          type="button"
          title="Notifications"
          className="w-9 h-9 rounded-full bg-[#f3f4f8] hover:bg-slate-200/80 text-slate-600 flex items-center justify-center relative transition"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-[#ff7675] absolute top-2 right-2 ring-2 ring-white"></span>
        </button>

        {/* Circular Messages badge */}
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

        {/* Primary Action Button: + Invite teammate */}
        <button
          type="button"
          onClick={() => setIsInviteModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#453372] hover:bg-[#382760] text-white text-xs sm:text-sm font-semibold shadow-sm shadow-[#453372]/30 transition active:scale-[0.99] ml-1"
        >
          <UserPlus className="w-4 h-4 stroke-[2.2]" />
          <span>Invite teammate</span>
        </button>
      </div>
    </header>
  )
}
