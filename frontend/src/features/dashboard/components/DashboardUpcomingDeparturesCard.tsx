import React from 'react'

interface DashboardUpcomingDeparturesCardProps {
  onOpenCalendar?: () => void
}

export const DashboardUpcomingDeparturesCard: React.FC<DashboardUpcomingDeparturesCardProps> = ({
  onOpenCalendar,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
          Upcoming departures
        </h3>
        <button
          onClick={onOpenCalendar}
          className="text-xs font-semibold text-[#453372] hover:text-[#322353] transition-colors cursor-pointer hover:underline"
        >
          Calendar
        </button>
      </div>

      <div className="pt-3 text-xs sm:text-sm text-slate-500">
        No trips departing in the next 30 days.
      </div>
    </div>
  )
}
