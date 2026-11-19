import React from 'react'
import {
  LayoutGrid,
  Calendar,
  Inbox,
  Send,
  PhoneCall,
  GitFork,
  CalendarCheck,
  Ticket,
  Map,
  Package,
  Compass,
  Building2,
  Globe,
  LogOut,
  X,
} from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'

interface LeadsSidebarProps {
  isOpen?: boolean
  onClose?: () => void
  currentPath?: string
}

export const LeadsSidebar: React.FC<LeadsSidebarProps> = ({
  isOpen = false,
  onClose,
  currentPath = 'Leads',
}) => {
  const menuItems = [
    { name: 'Dashboard', icon: LayoutGrid },
    { name: 'Leads', icon: Calendar, active: true },
    { name: 'Inbox', icon: Inbox },
    { name: 'Communications', icon: Send },
    { name: 'Call Log', icon: PhoneCall },
    { name: 'Bot Flows', icon: GitFork },
    { name: 'Bookings', icon: CalendarCheck },
    { name: 'Events', icon: Ticket },
    { name: 'Itineraries', icon: Map },
    { name: 'Packages', icon: Package },
    { name: 'Sightseeing', icon: Compass },
    { name: 'Hotels', icon: Building2 },
    { name: 'Host Page', icon: Globe },
  ]

  const { logout, user } = useAuth()

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm tracking-wide shadow-sm shadow-indigo-500/20">
              TT
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight leading-none">
                Treki Travels
              </h2>
              <p className="text-[11px] text-slate-400 font-medium mt-1">Travel CRM</p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-200">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = item.name === currentPath

            return (
              <button
                key={item.name}
                type="button"
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all group select-none text-left ${
                  isActive
                    ? 'border border-indigo-400/80 bg-indigo-50/50 text-indigo-600 shadow-sm shadow-indigo-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span className="flex-1 truncate">{item.name}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                )}
              </button>
            )
          })}
        </nav>

        {/* User profile footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between p-2 rounded-xl hover:bg-white hover:shadow-xs transition">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center shrink-0">
                {user ? user.username.slice(0, 2).toUpperCase() : 'KP'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">
                  {user ? user.name : 'Kushal Pareta'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">Admin</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => logout()}
              title="Sign out to Login Page"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
