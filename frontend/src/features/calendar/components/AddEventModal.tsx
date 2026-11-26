import React, { useState, useEffect } from 'react'
import { X, Calendar as CalendarIcon } from 'lucide-react'
import { useCalendar } from '../../../context/CalendarContext'
import { useToast } from '../../../components/ui/Toast'

export const AddEventModal: React.FC = () => {
  const { isAddEventModalOpen, setIsAddEventModalOpen, addEvent, selectedDate } = useCalendar()
  const { toast } = useToast()

  const [title, setTitle] = useState('')
  const [date, setDate] = useState(selectedDate)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (selectedDate) {
      setDate(selectedDate)
    }
    if (isAddEventModalOpen) {
      setTitle('')
      setNotes('')
    }
  }, [selectedDate, isAddEventModalOpen])

  if (!isAddEventModalOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast({ title: 'Please enter an event title', type: 'error' })
      return
    }
    if (!date) {
      toast({ title: 'Please select a date', type: 'error' })
      return
    }

    addEvent({
      title: title.trim(),
      date,
      notes: notes.trim() || undefined,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/80 w-full max-w-lg overflow-hidden animate-scale-in">
        {/* Header matching screenshot 1 */}
        <div className="px-6 sm:px-8 pt-6 pb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Add event
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Add a manual entry to your agency's calendar.
            </p>
          </div>

          <button
            onClick={() => setIsAddEventModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form matching screenshot 1 */}
        <form onSubmit={handleSubmit} className="px-6 sm:px-8 pb-6 sm:pb-8 space-y-4">
          {/* Title Input */}
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-semibold text-slate-700 block">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"

              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
              autoFocus
            />
          </div>

          {/* Date Picker */}
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-semibold text-slate-700 block">
              Date <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all bg-white"
              />
              <CalendarIcon className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Notes Textarea */}
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-semibold text-slate-700 block">
              Notes
            </label>
            <textarea
              rows={3}
              placeholder="Optional details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand resize-none transition-all"
            />
          </div>

          {/* Modal Action Buttons matching screenshot 1 */}
          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddEventModalOpen(false)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-semibold transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow transition-all active:scale-[0.98]"
            >
              Add event
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
