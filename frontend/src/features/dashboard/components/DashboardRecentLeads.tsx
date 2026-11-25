import React from 'react'
import { Plus, Calendar, ArrowRight, User } from 'lucide-react'
import { useLeads } from '../../../context/LeadsContext'

interface DashboardRecentLeadsProps {
  onViewAll?: () => void
}

export const DashboardRecentLeads: React.FC<DashboardRecentLeadsProps> = ({ onViewAll }) => {
  const { leads, setIsNewLeadModalOpen, setSelectedLead } = useLeads()

  const isEmpty = leads.length === 0

  // Latest 5 leads
  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between min-h-[340px]">
      <div>
        {/* Header matching screenshot */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            Recent leads
          </h2>
          <button
            onClick={onViewAll}
            className="text-xs sm:text-sm font-semibold text-brand hover:text-brand-hover transition-colors cursor-pointer hover:underline"
          >
            View all
          </button>
        </div>

        {/* Content */}
        {isEmpty ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            {/* Calendar / ID badge matching screenshot 2 */}
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-brand mb-3 shadow-2xs">
              <Calendar className="w-6 h-6 stroke-[1.75]" />
            </div>

            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              No leads yet
            </h3>

            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-1 mb-5 leading-relaxed">
              Your incoming enquiries will show up here. Add your first lead to get started.
            </p>

            <button
              onClick={() => setIsNewLeadModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow transition-all active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add a lead</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentLeads.map((lead) => (
              <div
                key={lead.id}
                onClick={() => {
                  setSelectedLead(lead)
                  if (onViewAll) onViewAll()
                }}
                className="py-3 px-2 flex items-center justify-between hover:bg-slate-50/80 rounded-xl transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-purple-100 text-brand flex items-center justify-center font-bold text-xs shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 truncate group-hover:text-brand transition-colors">
                      {lead.name}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {lead.destination || 'Unspecified'} • {lead.travelers} Pax
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-slate-900">
                      ₹{(lead.budget || 0).toLocaleString('en-IN')}
                    </p>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-brand">
                      {lead.status}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!isEmpty && (
        <div className="pt-3 border-t border-slate-100">
          <button
            onClick={() => setIsNewLeadModalOpen(true)}
            className="w-full py-2 rounded-xl bg-slate-50 hover:bg-purple-50 text-brand text-xs font-semibold border border-dashed border-purple-200 transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create new enquiry</span>
          </button>
        </div>
      )}
    </div>
  )
}
