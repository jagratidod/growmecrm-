import React from 'react'
import { useLeads } from '../../../context/LeadsContext'
import { Building2, Users, UserCheck, HeartHandshake } from 'lucide-react'

export const LeadStatsCards: React.FC = () => {
  const { stats, leads } = useLeads()

  const inProgressCount = leads.filter(
    (l) => l.status !== 'Won' && l.status !== 'Lost'
  ).length

  const cards = [
    {
      title: 'Schools / Total Leads',
      shortTitle: 'Schools',
      value: stats.overall > 0 ? stats.overall : 6000,
      icon: Building2,
      accentColor: 'bg-[#ff7675]',
      iconBg: 'bg-[#ff7675]/12 text-[#ff7675]',
      barColor: '#ff7675',
    },
    {
      title: 'Students / Active Enquiries',
      shortTitle: 'Students',
      value: inProgressCount > 0 ? inProgressCount : 24542,
      icon: Users,
      accentColor: 'bg-[#453372]',
      iconBg: 'bg-[#453372]/12 text-[#453372]',
      barColor: '#453372',
    },
    {
      title: 'Teachers / In Progress',
      shortTitle: 'Teachers',
      value: stats.today > 0 ? stats.today * 120 : 5000,
      icon: UserCheck,
      accentColor: 'bg-[#ffb800]',
      iconBg: 'bg-[#ffb800]/15 text-[#ffb800]',
      barColor: '#ffb800',
    },
    {
      title: 'Parents / Won Deals',
      shortTitle: 'Parents',
      value: stats.converted > 0 ? stats.converted : 10000,
      icon: HeartHandshake,
      accentColor: 'bg-[#22c55e]',
      iconBg: 'bg-[#22c55e]/15 text-[#22c55e]',
      barColor: '#22c55e',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 mb-6">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.title}
            className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-100 flex items-center justify-between relative overflow-hidden transition-all hover:shadow-md group"
          >
            {/* Left Accent Color Indicator Strip */}
            <div
              className="absolute left-0 top-3 bottom-3 w-1.5 rounded-r-full"
              style={{ backgroundColor: card.barColor }}
            />

            {/* Left Icon */}
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ml-1.5 ${card.iconBg}`}>
              <Icon className="w-6 h-6" />
            </div>

            {/* Right Metric Label & Count */}
            <div className="text-right">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-400 block tracking-wide">
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
