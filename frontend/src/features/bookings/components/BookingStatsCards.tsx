import React from 'react'
import { useBookings } from '../../../context/BookingsContext'
import { Calendar, PlaneTakeoff, Wallet, BadgeCheck } from 'lucide-react'

export const BookingStatsCards: React.FC = () => {
  const { stats } = useBookings()

  const formatCurrency = (val: number) => {
    return '₹' + Number(val || 0).toLocaleString('en-IN')
  }

  const cards = [
    {
      title: 'Total Bookings',
      shortTitle: 'Total bookings',
      value: stats.totalBookings.toLocaleString(),
      icon: Calendar,
      barColor: '#ff7675',
      iconBg: 'bg-[#ff7675]/12 text-[#ff7675]',
    },
    {
      title: 'Departing This Month',
      shortTitle: 'Departing this month',
      value: stats.departingThisMonth.toLocaleString(),
      icon: PlaneTakeoff,
      barColor: '#453372',
      iconBg: 'bg-[#453372]/12 text-[#453372]',
    },
    {
      title: 'Pipeline Value',
      shortTitle: 'Pipeline value',
      value: formatCurrency(stats.pipelineValue),
      icon: Wallet,
      barColor: '#ffb800',
      iconBg: 'bg-[#ffb800]/15 text-[#ffb800]',
    },
    {
      title: 'Total Collected',
      shortTitle: 'Collected',
      value: formatCurrency(stats.collected),
      icon: BadgeCheck,
      barColor: '#22c55e',
      iconBg: 'bg-[#22c55e]/15 text-[#22c55e]',
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
                {card.shortTitle}
              </span>
              <span className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight block mt-0.5">
                {card.value}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
