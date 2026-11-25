import React from 'react'
import { Clock, Phone, MessageCircle } from 'lucide-react'
import type { DashboardFollowUpSummaryItem } from '../../../services/dashboardService'

interface DashboardFollowUpsCardProps {
  onViewAll?: () => void
  followUpsData?: {
    dueTodayCount: number
    overdueCount: number
    totalPendingCount: number
    items: DashboardFollowUpSummaryItem[]
  }
}

export const DashboardFollowUpsCard: React.FC<DashboardFollowUpsCardProps> = ({
  onViewAll,
  followUpsData,
}) => {
  const items = followUpsData?.items || []
  const hasItems = items.length > 0

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
            Follow-ups due
          </h3>
          {(followUpsData?.dueTodayCount ?? 0) > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-brand">
              {followUpsData?.dueTodayCount} today
            </span>
          )}
          {(followUpsData?.overdueCount ?? 0) > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              {followUpsData?.overdueCount} overdue
            </span>
          )}
        </div>
        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-brand hover:text-brand-hover transition-colors cursor-pointer hover:underline"
        >
          View all
        </button>
      </div>

      {!hasItems ? (
        <div className="pt-3 text-xs sm:text-sm text-slate-500">
          Nothing due right now — you're all caught up. <span role="img" aria-label="party popper">🎉</span>
        </div>
      ) : (
        <div className="pt-2 divide-y divide-slate-100">
          {items.slice(0, 3).map((item) => (
            <div key={item.id} className="py-2.5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {item.title || item.leadName}
                  </p>
                  {item.status === 'overdue' && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                      Overdue
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span>{item.destination}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {item.dueDate} {item.dueTime}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <a
                  href={`https://wa.me/${item.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Hi ${item.leadName}, following up regarding your travel inquiry for ${item.destination}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition"
                  title="WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                </a>
                <a
                  href={`tel:${item.phone}`}
                  className="p-1.5 rounded-lg bg-purple-50 text-brand hover:bg-purple-100 transition"
                  title="Call"
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
