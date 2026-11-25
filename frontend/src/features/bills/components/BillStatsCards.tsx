import React from 'react'
import { useBills } from '../../../context/BillsContext'
import { Receipt, AlertCircle, CheckCircle2 } from 'lucide-react'

export const BillStatsCards: React.FC = () => {
  const { stats } = useBills()

  const formatCurrency = (val: number) => {
    return '₹' + Number(val || 0).toLocaleString('en-IN')
  }

  const cards = [
    {
      title: 'Total Spend',
      shortTitle: 'Total spend',
      value: formatCurrency(stats.totalSpend),
      icon: Receipt,
      barColor: '#453372',
      iconBg: 'bg-brand/12 text-brand',
      valueColor: 'text-slate-800',
    },
    {
      title: 'Unpaid Vendor Dues',
      shortTitle: 'Unpaid',
      value: formatCurrency(stats.unpaid),
      icon: AlertCircle,
      barColor: '#ffb800',
      iconBg: 'bg-[#ffb800]/15 text-[#ffb800]',
      valueColor: 'text-[#d97706]', // amber/orange
    },
    {
      title: 'Total Paid Out',
      shortTitle: 'Paid',
      value: formatCurrency(stats.paid),
      icon: CheckCircle2,
      barColor: '#22c55e',
      iconBg: 'bg-[#22c55e]/15 text-[#22c55e]',
      valueColor: 'text-[#16a34a]', // green
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-5 mb-6">
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
              <span className={`text-2xl sm:text-3xl font-black tracking-tight block mt-0.5 ${card.valueColor}`}>
                {card.value}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
