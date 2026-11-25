import React from 'react'
import { useLeads } from '../../../context/LeadsContext'
import { Calendar, Users, TrendingUp, CheckCircle2 } from 'lucide-react'

export const LeadStatsCards: React.FC = () => {
  const { stats, leads } = useLeads()

  const inPipelineCount = leads.filter(
    (l) => l.status !== 'Won' && l.status !== 'Lost'
  ).length

  const cards = [
    {
      title: 'Overall Leads Captured',
      shortTitle: 'Overall Leads',
      value: stats.overall,
      icon: Calendar,
      barColor: 'var(--gm-blue)',
      iconBg: 'bg-blue-soft text-blue-ink',
    },
    {
      title: "Today's Enquiries",
      shortTitle: "Today's Leads",
      value: stats.today,
      icon: Users,
      barColor: 'var(--gm-accent)',
      iconBg: 'bg-brand-soft text-brand',
    },
    {
      title: 'Active In Pipeline',
      shortTitle: 'In Pipeline',
      value: inPipelineCount,
      icon: TrendingUp,
      barColor: '#ffb800',
      iconBg: 'bg-amber-50 text-amber-700',
    },
    {
      title: 'Leads Converted',
      shortTitle: 'Deals Won',
      value: stats.converted,
      icon: CheckCircle2,
      barColor: '#22c55e',
      iconBg: 'bg-emerald-50 text-emerald-700',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 mb-6">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.shortTitle}
            className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-100 flex items-center justify-between relative overflow-hidden transition-all hover:shadow-md group"
          >
            {/* Left Accent Color Indicator Strip from reference */}
            <div
              className="absolute left-0 top-3 bottom-3 w-1.5 rounded-r-full"
              style={{ backgroundColor: card.barColor }}
            />

            {/* Left Icon with tinted square background */}
            <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ml-1.5 ${card.iconBg}`}>
              <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>

            {/* Right Metric Label & Count */}
            <div className="text-right">
              <span className="text-[11px] sm:text-xs font-semibold text-copy-muted block tracking-wide">
                {card.shortTitle}
              </span>
              <span className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight block mt-0.5">
                {card.value.toLocaleString()}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
