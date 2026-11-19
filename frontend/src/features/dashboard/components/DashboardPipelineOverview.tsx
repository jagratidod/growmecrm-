import React from 'react'
import { useLeads } from '../../../context/LeadsContext'
import type { LeadStage } from '../../../types/lead.types'

interface DashboardPipelineOverviewProps {
  onOpenPipeline?: () => void
}

const STAGES: { stage: LeadStage; label: string; color: string; bg: string }[] = [
  { stage: 'New', label: 'New Enquiry', color: '#6366f1', bg: 'bg-indigo-500' },
  { stage: 'Contacted', label: 'Contacted', color: '#0ea5e9', bg: 'bg-sky-500' },
  { stage: 'Qualified', label: 'Qualified', color: '#eab308', bg: 'bg-yellow-500' },
  { stage: 'Proposal sent', label: 'Proposal Sent', color: '#a855f7', bg: 'bg-purple-500' },
  { stage: 'Won', label: 'Won', color: '#10b981', bg: 'bg-emerald-500' },
]

export const DashboardPipelineOverview: React.FC<DashboardPipelineOverviewProps> = ({
  onOpenPipeline,
}) => {
  const { leads } = useLeads()

  const isEmpty = leads.length === 0

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
          Pipeline overview
        </h2>
        <button
          onClick={onOpenPipeline}
          className="text-xs sm:text-sm font-semibold text-[#453372] hover:text-[#322353] transition-colors cursor-pointer hover:underline"
        >
          Open pipeline
        </button>
      </div>

      {isEmpty ? (
        <div className="py-4 text-xs sm:text-sm text-slate-500">
          Add your first lead and your pipeline will light up here.
        </div>
      ) : (
        <div className="py-4 space-y-4">
          {/* Segmented Progress Bar */}
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
            {STAGES.map((s) => {
              const count = leads.filter((l) => l.status === s.stage).length
              const pct = (count / leads.length) * 100
              if (count === 0) return null
              return (
                <div
                  key={s.stage}
                  style={{ width: `${pct}%` }}
                  className={`${s.bg} h-full transition-all duration-300 relative group`}
                  title={`${s.label}: ${count} leads (${Math.round(pct)}%)`}
                />
              )
            })}
          </div>

          {/* Stage Statistics Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
            {STAGES.map((s) => {
              const stageLeads = leads.filter((l) => l.status === s.stage)
              const count = stageLeads.length
              const value = stageLeads.reduce((acc, l) => acc + (l.budget || 0), 0)

              return (
                <div
                  key={s.stage}
                  onClick={onOpenPipeline}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-purple-50/40 hover:border-purple-200 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${s.bg}`} />
                    <span className="text-[11px] font-semibold text-slate-600 truncate">
                      {s.label}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between gap-1">
                    <span className="text-base font-bold text-slate-900">{count}</span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      ₹{value.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
