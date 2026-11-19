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
import { useRouter } from '../../../context/RouterContext'

interface LeadsSidebarProps {
  isOpen?: boolean
  onClose?: () => void
  currentPath?: string
  onSelectMenu?: (menuName: string) => void
}

export const LeadsSidebar: React.FC<LeadsSidebarProps> = ({
  isOpen = false,
  onClose,
  currentPath = 'Leads',
  onSelectMenu,
}) => {
  const menuItems = [
    { name: 'Dashboard', icon: LayoutGrid },
    { name: 'Leads', icon: Calendar },
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
  const { navigate } = useRouter()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const handleItemClick = (name: string) => {
    if (onSelectMenu) onSelectMenu(name)
    if (name === 'Bookings') {
      navigate('/bookings')
    } else if (name === 'Leads' || name === 'Dashboard') {
      navigate('/leads')
    }
    if (onClose) onClose()
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-60 sm:w-64 bg-[#453372] text-white flex flex-col justify-between transition-transform duration-300 ease-in-out shrink-0 select-none overflow-hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Brand Logo matching reference circular icon style */}
        <div className="pt-5 pb-4 px-5 flex items-center justify-between border-b border-purple-400/15">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white text-[#453372] flex items-center justify-center font-black text-sm tracking-wide shadow-md shrink-0">
              TT
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-white tracking-tight leading-none truncate">
                Treki Travels
              </h2>
              <p className="text-[11px] text-purple-200/70 font-medium mt-1">Travel CRM</p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-purple-200 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation list: All original CRM items with the curved active tab cutout from reference */}
        <nav className="flex-1 overflow-y-auto pl-4 pr-0 py-3 space-y-1 scrollbar-thin scrollbar-thumb-purple-900/40">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = item.name === currentPath

            return (
              <div key={item.name} className="relative">
                <button
                  type="button"
                  onClick={() => handleItemClick(item.name)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs sm:text-sm font-medium transition-all text-left ${
                    isActive
                      ? 'sidebar-active-tab text-[#453372] font-bold shadow-xs'
                      : 'text-purple-200/80 hover:text-white hover:bg-white/5 rounded-l-xl'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-[#453372]' : 'text-purple-300/80'
                    }`}
                  />
                  <span className="truncate">{item.name}</span>
                </button>
              </div>
            )
          })}
        </nav>

        {/* Bottom User Profile Footer in Purple Theme */}
        <div className="p-3 border-t border-purple-400/15 bg-[#3a2864]/95 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-white/15 text-white font-semibold text-xs flex items-center justify-center shrink-0">
              {user ? user.username.slice(0, 2).toUpperCase() : 'KP'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {user ? user.name : 'Kushal Pareta'}
              </p>
              <p className="text-[10px] text-purple-200/70 truncate">Admin</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title="Sign out"
            className="p-1.5 rounded-lg text-purple-200 hover:text-white hover:bg-white/10 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  )
}
