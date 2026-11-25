import React from 'react'
import {
  LayoutGrid,
  Calendar,
  CalendarDays,
  Inbox,
  Send,
  PhoneCall,
  GitFork,
  CalendarCheck,
  Receipt,
  Ticket,
  Map,
  Package,
  Compass,
  Building2,
  Users,
  User,
  Plug,
  Bot,
  Zap,
  Globe,
  Share2,
  ListChecks,
  FileSpreadsheet,
  LogOut,
  X,
  Crown,
  CreditCard,
} from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { useSettings } from '../../../context/SettingsContext'
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
    { name: 'LinkTree', icon: Share2 },
    { name: 'Follow-ups', icon: ListChecks },
    { name: 'Calendar', icon: CalendarDays },
    { name: 'Invoices', icon: FileSpreadsheet },
    { name: 'Bills', icon: Receipt },
    { name: 'Team', icon: Users },
  ]

  const settingsItems = [
    { name: 'My profile', icon: User },
    { name: 'Organization', icon: Building2 },
    { name: 'Subscription', icon: CreditCard },
    { name: 'Invoice Detail', icon: Receipt },
    { name: 'Channels', icon: Plug },
    { name: 'AI Agent', icon: Bot },
    { name: 'Automation', icon: Zap },
  ]

  const { logout, user } = useAuth()
  const { organization } = useSettings()
  const { navigate } = useRouter()

  const storedAgency = typeof window !== 'undefined' ? localStorage.getItem('crm_current_agency') : null
  const rawAgency =
    user?.organizationName && user.organizationName !== 'Treki Travels'
      ? user.organizationName
      : storedAgency && storedAgency !== 'Treki Travels'
      ? storedAgency
      : organization?.agencyName && organization.agencyName !== 'Treki Travels'
      ? organization.agencyName
      : 'GrowMe CRM'

  const agencyTitle = rawAgency || 'GrowMe CRM'
  const agencyInitials = agencyTitle
    .trim()
    .split(/\s+/)
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'GM'

  const userDisplayName = user?.name || user?.username || 'User'
  const userInitials = userDisplayName
    .trim()
    .split(/\s+/)
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'US'

  const userRole = user?.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'Owner'

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const handleItemClick = (name: string) => {
    if (onSelectMenu) onSelectMenu(name)
    if (name === 'Dashboard') {
      navigate('/dashboard')
    } else if (name === 'Leads') {
      navigate('/leads')
    } else if (name === 'Inbox') {
      navigate('/inbox')
    } else if (name === 'Communications') {
      navigate('/communications')
    } else if (name === 'Call Log') {
      navigate('/call-log')
    } else if (name === 'Bot Flows') {
      navigate('/bot-flows')
    } else if (name === 'Bookings') {
      navigate('/bookings')
    } else if (name === 'Events') {
      navigate('/calendar')
    } else if (name === 'Itineraries') {
      navigate('/itineraries')
    } else if (name === 'Packages') {
      navigate('/packages')
    } else if (name === 'Sightseeing') {
      navigate('/sightseeing')
    } else if (name === 'Hotels') {
      navigate('/hotels')
    } else if (name === 'Host Page') {
      navigate('/host-page')
    } else if (name === 'LinkTree') {
      navigate('/linktree')
    } else if (name === 'Follow-ups') {
      navigate('/follow-ups')
    } else if (name === 'Calendar') {
      navigate('/calendar')
    } else if (name === 'Invoices') {
      navigate('/invoices')
    } else if (name === 'Bills') {
      navigate('/bills')
    } else if (name === 'Team') {
      navigate('/team')
    } else if (name === 'My profile') {
      navigate('/profile')
    } else if (name === 'Organization') {
      navigate('/organization')
    } else if (name === 'Subscription') {
      navigate('/subscription')
    } else if (name === 'Invoice Detail') {
      navigate('/invoice-detail')
    } else if (name === 'Channels') {
      navigate('/channels')
    } else if (name === 'AI Agent') {
      navigate('/ai-agent')
    } else if (name === 'Automation') {
      navigate('/automation')
    } else {
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
              {agencyInitials}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-white tracking-tight leading-none truncate">
                {agencyTitle}
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

          {/* SETTINGS Group matching reference */}
          <div className="pt-4 pb-1.5 px-3.5">
            <p className="text-[10px] font-black text-purple-300/60 uppercase tracking-widest">
              Settings
            </p>
          </div>

          {settingsItems.map((item) => {
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
          {/* Super Admin Quick Link */}
          <div className="pt-3 pb-1 px-3">
            <button
              type="button"
              onClick={() => {
                navigate('/super-admin');
                if (onClose) onClose();
              }}
              className="w-full flex items-center justify-between p-2 rounded-xl bg-gradient-to-r from-amber-400/15 to-amber-300/10 hover:from-amber-400/25 hover:to-amber-300/20 border border-amber-400/30 text-amber-300 text-xs font-bold transition shadow-xs"
            >
              <div className="flex items-center gap-2">
                <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>Super Admin Panel</span>
              </div>
              <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-full">
                MASTER
              </span>
            </button>
          </div>
        </nav>

        {/* Bottom User Profile Footer in Purple Theme */}
        <div className="p-3 border-t border-purple-400/15 bg-[#3a2864]/95 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-white/15 text-white font-semibold text-xs flex items-center justify-center shrink-0">
              {userInitials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {userDisplayName}
              </p>
              <p className="text-[10px] text-purple-200/70 truncate">{userRole}</p>
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
