import React from 'react'
import {
  LayoutGrid,
  Users,
  UserCheck,
  CalendarCheck,
  BookOpen,
  Calendar,
  FileText,
  CreditCard,
  Settings,
  LogOut,
  X,
} from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { useRouter } from '../../../context/RouterContext'

interface LeadsSidebarProps {
  isOpen?: boolean
  onClose?: () => void
  currentPath?: string
}

export const LeadsSidebar: React.FC<LeadsSidebarProps> = ({
  isOpen = false,
  onClose,
  currentPath = 'Dashboard',
}) => {
  const menuItems = [
    { name: 'Dashboard', icon: LayoutGrid },
    { name: 'Students', icon: Users },
    { name: 'Teachers', icon: UserCheck },
    { name: 'Parents', icon: Users },
    { name: 'Library', icon: BookOpen },
    { name: 'Attendance', icon: Calendar },
    { name: 'Exam', icon: FileText },
    { name: 'Notice', icon: CalendarCheck },
    { name: 'Account', icon: CreditCard },
    { name: 'Settings', icon: Settings },
  ]

  const { logout, user } = useAuth()
  const { navigate } = useRouter()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
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
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-56 sm:w-60 bg-[#453372] text-white flex flex-col justify-between transition-transform duration-300 ease-in-out shrink-0 select-none overflow-hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Brand Logo */}
        <div className="pt-6 pb-4 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-white text-[#453372] flex items-center justify-center shadow-md">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6"
              >
                <circle cx="12" cy="6" r="2.5" fill="currentColor" />
                <path d="M4 19.5c0-3.5 3.5-5.5 8-5.5s8 2 8 5.5" />
                <path d="M7 19.5h10" />
                <path d="M4 16l3-1.5" />
                <path d="M20 16l-3-1.5" />
              </svg>
            </div>
            <div className="lg:hidden">
              <h2 className="text-sm font-bold text-white tracking-wide">Smart CRM</h2>
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

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto pl-4 pr-0 py-3 space-y-1.5 scrollbar-none z-10">
          {menuItems.map((item) => {
            const isActive = item.name === currentPath

            return (
              <div key={item.name} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    if (onClose) onClose()
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-2.5 text-xs sm:text-sm font-medium transition-all text-left ${
                    isActive
                      ? 'sidebar-active-tab text-[#453372] font-bold shadow-xs'
                      : 'text-purple-200/85 hover:text-white hover:translate-x-1'
                  }`}
                >
                  <span className="truncate">{item.name}</span>
                </button>
              </div>
            )
          })}
        </nav>

        {/* Botanical / Tropical Leaf Illustration Art in Bottom Section */}
        <div className="relative w-full h-44 pointer-events-none overflow-hidden mt-auto">
          {/* Subtle gradient overlay to blend into purple */}
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-[#453372]/30 to-[#453372] z-10 pointer-events-none" />

          <svg
            viewBox="0 0 240 180"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute bottom-0 left-0 w-full h-full object-cover opacity-85"
          >
            {/* Background deep leaves */}
            <path
              d="M10 180 C20 120 70 100 120 110 C80 140 50 165 30 180 Z"
              fill="#2e1f52"
            />
            <path
              d="M140 180 C150 110 200 90 250 100 C210 135 180 165 160 180 Z"
              fill="#372661"
            />

            {/* Midground Teal Leaves */}
            <path
              d="M-20 180 C0 110 50 85 90 95 C60 125 30 155 10 180 Z"
              fill="#1e737d"
              opacity="0.85"
            />
            <path
              d="M200 180 C180 120 140 100 110 105 C140 135 170 160 190 180 Z"
              fill="#258994"
              opacity="0.8"
            />

            {/* Foreground Fresh Aqua & Mint Leaves */}
            <path
              d="M40 180 C55 125 105 105 135 115 C100 140 75 165 60 180 Z"
              fill="#42a8b3"
              opacity="0.9"
            />
            <path
              d="M80 180 C100 130 160 115 195 125 C155 150 120 170 100 180 Z"
              fill="#62c4ce"
              opacity="0.95"
            />
            <path
              d="M10 180 C25 140 65 130 90 140 C65 160 40 175 25 180 Z"
              fill="#86dce3"
              opacity="0.9"
            />
            <path
              d="M130 180 C145 140 195 130 220 140 C190 160 165 175 150 180 Z"
              fill="#a2ebef"
              opacity="0.85"
            />

            {/* Leaf Vein lines */}
            <path
              d="M40 180 Q85 145 135 115"
              stroke="#62c4ce"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.6"
            />
            <path
              d="M80 180 Q135 150 195 125"
              stroke="#86dce3"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.6"
            />
          </svg>
        </div>

        {/* Minimal User Profile & Logout */}
        <div className="p-3 border-t border-purple-400/20 bg-[#3a2864]/90 z-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-white/15 text-white font-semibold text-xs flex items-center justify-center shrink-0">
              {user ? user.username.slice(0, 2).toUpperCase() : 'SM'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {user ? user.name : 'Smart Admin'}
              </p>
              <p className="text-[10px] text-purple-200/70 truncate">Administrator</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title="Sign Out"
            className="p-1.5 rounded-lg text-purple-200 hover:text-white hover:bg-white/10 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  )
}
