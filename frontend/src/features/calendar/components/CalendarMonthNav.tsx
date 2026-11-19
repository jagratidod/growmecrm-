import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCalendar } from '../../../context/CalendarContext'

export const CalendarMonthNav: React.FC = () => {
  const { currentDate, goToPreviousMonth, goToNextMonth, goToToday } = useCalendar()

  const monthYearString = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(currentDate)

  return (
    <div className="flex items-center justify-between pt-2">
      {/* Month & Year Title matching screenshot 2 */}
      <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
        {monthYearString}
      </h2>

      {/* Navigation Controls matching screenshot 2 */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={goToPreviousMonth}
          className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-2xs cursor-pointer"
          title="Previous month"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={goToToday}
          className="px-4 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors shadow-2xs cursor-pointer"
        >
          Today
        </button>

        <button
          type="button"
          onClick={goToNextMonth}
          className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-2xs cursor-pointer"
          title="Next month"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
