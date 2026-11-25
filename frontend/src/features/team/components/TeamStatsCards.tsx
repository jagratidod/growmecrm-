import React from 'react'
import { useTeam } from '../../../context/TeamContext'
import { Users, ShieldCheck, Clock } from 'lucide-react'

export const TeamStatsCards: React.FC = () => {
  const { stats } = useTeam()

  const cards = [
    {
      title: 'Members',
      value: stats.members,
      icon: Users,
      barColor: '#453372',
      iconBg: 'bg-brand/12 text-brand',
    },
    {
      title: 'Admins',
      value: stats.admins,
      icon: ShieldCheck,
      barColor: '#ff7675',
      iconBg: 'bg-[#ff7675]/12 text-[#ff7675]',
    },
    {
      title: 'Pending invites',
      value: stats.pendingInvites,
      icon: Clock,
      barColor: '#ffb800',
      iconBg: 'bg-[#ffb800]/15 text-[#ffb800]',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-5 mb-6">
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

            {/* Left Icon with tinted square */}
            <div
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ml-1.5 ${card.iconBg}`}
            >
              <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>

            {/* Right Metric Label & Count */}
            <div className="text-right">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-400 block tracking-wide">
                {card.title}
              </span>
              <span className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight block mt-0.5">
                {card.value}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
