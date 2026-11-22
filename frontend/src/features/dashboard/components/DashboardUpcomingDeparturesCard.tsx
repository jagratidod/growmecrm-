import React from 'react'
import { Plane } from 'lucide-react'
import type { DashboardDepartureItem } from '../../../services/dashboardService'

interface DashboardUpcomingDeparturesCardProps {
  onOpenCalendar?: () => void
  departures?: DashboardDepartureItem[]
}

export const DashboardUpcomingDeparturesCard: React.FC<DashboardUpcomingDeparturesCardProps> = ({
  onOpenCalendar,
  departures = [],
}) => {
  const hasDepartures = departures.length > 0

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
            Upcoming departures
          </h3>
          {hasDepartures && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
              {departures.length} next 30d
            </span>
          )}
        </div>
        <button
          onClick={onOpenCalendar}
          className="text-xs font-semibold text-[#453372] hover:text-[#322353] transition-colors cursor-pointer hover:underline"
        >
          Calendar
        </button>
      </div>

      {!hasDepartures ? (
        <div className="pt-3 text-xs sm:text-sm text-slate-500">
          No trips departing in the next 30 days.
        </div>
      ) : (
        <div className="pt-2 divide-y divide-slate-100">
          {departures.slice(0, 3).map((dep) => (
            <div key={dep.id} className="py-2.5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {dep.customerName}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span>{dep.destination}</span>
                  <span>•</span>
                  <span>{dep.travellers} Pax</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="flex items-center gap-1 text-xs font-bold text-slate-800">
                  <Plane className="w-3.5 h-3.5 text-blue-600" />
                  <span>{dep.departure}</span>
                </div>
                <span className="text-[10px] font-medium text-emerald-600">
                  {dep.daysUntil <= 0 ? 'Today' : `in ${dep.daysUntil} days`}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
