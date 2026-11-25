import React from 'react'
import { Plus } from 'lucide-react'
import { useCalendar } from '../../../context/CalendarContext'

export const CalendarHeader: React.FC = () => {
  const { setIsAddEventModalOpen } = useCalendar()

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Calendar
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          Departures, returns, events and due tasks at a glance.
        </p>
      </div>

      <button
        onClick={() => setIsAddEventModalOpen(true)}
        className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white font-semibold text-xs sm:text-sm shadow-xs hover:shadow transition-all active:scale-[0.98] shrink-0 cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        <span>Add event</span>
      </button>
    </div>
  )
}
