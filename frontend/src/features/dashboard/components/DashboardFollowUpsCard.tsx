import React from 'react'

interface DashboardFollowUpsCardProps {
  onViewAll?: () => void
}

export const DashboardFollowUpsCard: React.FC<DashboardFollowUpsCardProps> = ({ onViewAll }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
          Follow-ups due
        </h3>
        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-[#453372] hover:text-[#322353] transition-colors cursor-pointer hover:underline"
        >
          View all
        </button>
      </div>

      <div className="pt-3 text-xs sm:text-sm text-slate-500">
        Nothing due right now — you're all caught up. <span role="img" aria-label="party popper">🎉</span>
      </div>
    </div>
  )
}
