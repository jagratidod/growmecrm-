import React from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { useLeads } from '../../../context/LeadsContext'

interface DashboardHeroProps {
  onRefresh?: () => void
  isLoading?: boolean
}

export const DashboardHero: React.FC<DashboardHeroProps> = ({ onRefresh, isLoading }) => {
  const { user } = useAuth()
  const { setIsNewLeadModalOpen } = useLeads()

  // Format dynamic date e.g. "Thursday, November 19"
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date())

  // Dynamic greeting based on current local hour
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const firstName = user?.name ? user.name.split(' ')[0] : 'there'
  const agencyName = user?.organizationName || 'your workspace'

  return (
    <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#3e2e68] via-[#453372] to-[#594096] text-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm border border-purple-500/20">
      <div className="space-y-1.5">
        <p className="text-xs sm:text-sm font-medium text-purple-200/90 tracking-wide">
          {formattedDate}
        </p>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          {getGreeting()}, {firstName} <span className="inline-block animate-wiggle">👋</span>
        </h1>
        <p className="text-xs sm:text-sm text-purple-200/80 font-normal">
          Here's what's happening at {agencyName}.
        </p>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition cursor-pointer"
            title="Refresh dashboard metrics"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        )}
        <button
          onClick={() => setIsNewLeadModalOpen(true)}
          className="bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-xs hover:shadow transition-all active:scale-[0.98] inline-flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-slate-700" />
          <span>New lead</span>
        </button>
      </div>
    </div>
  )
}
