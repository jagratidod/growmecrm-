import React from 'react'
import { useLeads } from '../../../context/LeadsContext'

export const LeadStatsCards: React.FC = () => {
  const { stats } = useLeads()

  const cards = [
    {
      title: 'Overall leads captured',
      value: stats.overall,
    },
    {
      title: "Today's leads",
      value: stats.today,
    },
    {
      title: 'Leads converted',
      value: stats.converted,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mb-6">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between"
        >
          <span className="text-xs sm:text-sm font-medium text-slate-500">
            {card.title}
          </span>
          <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2 tracking-tight">
            {card.value}
          </span>
        </div>
      ))}
    </div>
  )
}
