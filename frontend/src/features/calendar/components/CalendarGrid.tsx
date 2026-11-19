import React from 'react'
import { useCalendar } from '../../../context/CalendarContext'
import type { CalendarDayCell, CalendarEvent } from '../../../types/calendar.types'
import { Trash2 } from 'lucide-react'

const DAY_NAMES = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

export const CalendarGrid: React.FC = () => {
  const {
    currentDate,
    allEvents,
    setSelectedDate,
    setIsAddEventModalOpen,
    deleteEvent,
  } = useCalendar()

  // Generate calendar grid for current month starting Monday
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() // 0-indexed

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)

  // Monday = 0, Sunday = 6
  let firstDayIndex = firstDayOfMonth.getDay() - 1
  if (firstDayIndex === -1) firstDayIndex = 6

  const daysInMonth = lastDayOfMonth.getDate()

  // Days from previous month to fill the first row
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  const cells: CalendarDayCell[] = []

  // Leading days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthLastDay - i)
    const dateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`
    cells.push({
      date: d,
      dateString,
      dayNumber: d.getDate(),
      isCurrentMonth: false,
      isToday: false,
      events: allEvents.filter((e) => e.date === dateString),
    })
  }

  // Current month days
  // Reference anchor today is November 19, 2026
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day)
    const dateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      day
    ).padStart(2, '0')}`
    const isToday =
      d.getFullYear() === 2026 && d.getMonth() === 10 && d.getDate() === 19

    cells.push({
      date: d,
      dateString,
      dayNumber: day,
      isCurrentMonth: true,
      isToday,
      events: allEvents.filter((e) => e.date === dateString),
    })
  }

  // Trailing days from next month
  const totalCells = Math.ceil(cells.length / 7) * 7
  const trailingDays = totalCells - cells.length
  for (let day = 1; day <= trailingDays; day++) {
    const d = new Date(year, month + 1, day)
    const dateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      day
    ).padStart(2, '0')}`
    cells.push({
      date: d,
      dateString,
      dayNumber: day,
      isCurrentMonth: false,
      isToday: false,
      events: allEvents.filter((e) => e.date === dateString),
    })
  }

  const handleCellClick = (cell: CalendarDayCell) => {
    setSelectedDate(cell.dateString)
    setIsAddEventModalOpen(true)
  }

  const handleDeleteEvent = (e: React.MouseEvent, evt: CalendarEvent) => {
    e.stopPropagation()
    if (evt.type === 'manual') {
      deleteEvent(evt.id)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* 7-column Day Header matching screenshot 2 */}
      <div className="grid grid-cols-7 border-b border-slate-200/80 bg-slate-50/50">
        {DAY_NAMES.map((name) => (
          <div
            key={name}
            className="py-3 text-center text-[11px] font-bold text-slate-500 tracking-wider"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Calendar Month Grid */}
      <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
        {cells.map((cell, idx) => (
          <div
            key={idx}
            onClick={() => handleCellClick(cell)}
            className={`min-h-[90px] sm:min-h-[115px] p-2 sm:p-2.5 transition-colors cursor-pointer group flex flex-col justify-between relative ${
              cell.isToday
                ? 'bg-purple-50/30 ring-2 ring-inset ring-[#453372]/30'
                : 'hover:bg-slate-50/60'
            }`}
          >
            {/* Day Number Header */}
            <div className="flex items-center justify-between">
              {cell.isToday ? (
                <div className="w-6 h-6 rounded-full bg-[#453372] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {cell.dayNumber}
                </div>
              ) : (
                <span
                  className={`text-xs font-semibold ${
                    cell.isCurrentMonth ? 'text-slate-700' : 'text-slate-300'
                  }`}
                >
                  {cell.dayNumber}
                </span>
              )}
            </div>

            {/* Events container */}
            <div className="space-y-1 mt-1 flex-1 overflow-hidden">
              {cell.events.map((evt) => (
                <div
                  key={evt.id}
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                  className={`px-1.5 py-0.5 rounded-md text-[11px] font-semibold truncate flex items-center justify-between gap-1 group/evt ${
                    evt.type === 'departure'
                      ? 'bg-cyan-50 text-cyan-800 border border-cyan-200/70'
                      : evt.type === 'return'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/70'
                      : 'bg-purple-50 text-[#453372] border border-purple-200/70'
                  }`}
                  title={`${evt.title}${evt.notes ? ` — ${evt.notes}` : ''}`}
                >
                  <span className="truncate">{evt.title}</span>
                  {evt.type === 'manual' && (
                    <button
                      type="button"
                      onClick={(e) => handleDeleteEvent(e, evt)}
                      className="opacity-0 group-hover/evt:opacity-100 hover:text-rose-600 transition-opacity shrink-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
