import React, { useState } from 'react'
import {
  X,
  MapPin,
  Calendar,
  Users,
  Plus,
  Trash2,
  Share2,
  Printer,
  Hotel,
  Utensils,
  CheckCircle2,
  Compass,
} from 'lucide-react'
import { useItineraries } from '../../../context/ItinerariesContext'
import { useToast } from '../../../components/ui/Toast'
import type { Itinerary } from '../../../types/itinerary.types'

interface ItineraryDetailsDrawerProps {
  itinerary: Itinerary | null
  onClose: () => void
}

export const ItineraryDetailsDrawer: React.FC<ItineraryDetailsDrawerProps> = ({
  itinerary,
  onClose,
}) => {
  const { addDay, deleteDay } = useItineraries()
  const { toast } = useToast()

  const [isAddingDay, setIsAddingDay] = useState(false)
  const [newDayTitle, setNewDayTitle] = useState('')
  const [newDayDesc, setNewDayDesc] = useState('')
  const [newDayHotel, setNewDayHotel] = useState('')
  const [newDayMeals, setNewDayMeals] = useState<string[]>(['Breakfast'])
  const [newActivityInput, setNewActivityInput] = useState('')
  const [newActivities, setNewActivities] = useState<string[]>([])

  if (!itinerary) return null

  const handleAddActivity = () => {
    if (!newActivityInput.trim()) return
    setNewActivities((prev) => [...prev, newActivityInput.trim()])
    setNewActivityInput('')
  }

  const handleRemoveActivity = (idx: number) => {
    setNewActivities((prev) => prev.filter((_, i) => i !== idx))
  }

  const toggleMeal = (meal: string) => {
    setNewDayMeals((prev) =>
      prev.includes(meal) ? prev.filter((m) => m !== meal) : [...prev, meal]
    )
  }

  const handleSaveDay = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDayTitle.trim()) {
      toast({ title: 'Please provide a title for this day', type: 'error' })
      return
    }

    try {
      await addDay(itinerary.id, {
        title: newDayTitle.trim(),
        description: newDayDesc.trim() || 'Free day to explore or relax at own pace.',
        hotel: newDayHotel.trim() || undefined,
        meals: newDayMeals.length > 0 ? newDayMeals : undefined,
        activities: newActivities.length > 0 ? newActivities : undefined,
      })
      toast({ title: 'New day added to itinerary', type: 'success' })
      setIsAddingDay(false)
      setNewDayTitle('')
      setNewDayDesc('')
      setNewDayHotel('')
      setNewDayMeals(['Breakfast'])
      setNewActivities([])
    } catch {
      toast({ title: 'Failed to add day', type: 'error' })
    }
  }

  const handleDeleteDay = async (dayId: string) => {
    if (window.confirm('Delete this day from the itinerary?')) {
      await deleteDay(itinerary.id, dayId)
      toast({ title: 'Day removed from plan', type: 'info' })
    }
  }

  const handlePrintPDF = () => {
    window.print()
  }

  const handleShare = () => {
    const url = `${window.location.origin}/itineraries/view/${itinerary.id}`
    navigator.clipboard?.writeText(url)
    toast({ title: 'Customer itinerary PDF link copied to clipboard!', type: 'success' })
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-250">
        {/* Top Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-brand">
                {itinerary.status}
              </span>
              {itinerary.package && (
                <span className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                  {itinerary.package}
                </span>
              )}
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mt-2">
              {itinerary.customerName}’s Itinerary
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1 font-medium text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                {itinerary.destination}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {itinerary.departure} {itinerary.returnDate && `→ ${itinerary.returnDate}`}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                {itinerary.travellers} {itinerary.travellers === 1 ? 'person' : 'people'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-xl text-slate-500 hover:text-brand hover:bg-white border border-slate-200 transition-colors"
              title="Share Link"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={handlePrintPDF}
              className="p-2 rounded-xl text-slate-500 hover:text-brand hover:bg-white border border-slate-200 transition-colors"
              title="Print / Save PDF"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white border border-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Summary Pill Bar */}
          <div className="grid grid-cols-3 gap-3 bg-purple-50/50 p-4 rounded-2xl border border-purple-100/60">
            <div>
              <p className="text-[11px] font-semibold text-purple-900/60 uppercase tracking-wider">
                Total Budget
              </p>
              <p className="text-base font-extrabold text-brand mt-0.5">
                ₹{itinerary.totalAmount.toLocaleString('en-IN')}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-purple-900/60 uppercase tracking-wider">
                Paid Advance
              </p>
              <p className="text-base font-extrabold text-emerald-600 mt-0.5">
                ₹{itinerary.amountPaid.toLocaleString('en-IN')}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-purple-900/60 uppercase tracking-wider">
                Balance Due
              </p>
              <p className="text-base font-extrabold text-slate-700 mt-0.5">
                ₹{Math.max(0, itinerary.totalAmount - itinerary.amountPaid).toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {itinerary.notes && (
            <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-3.5 text-xs text-amber-900">
              <span className="font-bold">Trip notes:</span> {itinerary.notes}
            </div>
          )}

          {/* Day-by-Day Plan Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Compass className="w-4 h-4 text-brand" />
                  <span>Day-by-Day Itinerary Plan</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {itinerary.days?.length || 0} scheduled days for this trip
                </p>
              </div>

              {!isAddingDay && (
                <button
                  onClick={() => setIsAddingDay(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-semibold shadow-xs transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Day</span>
                </button>
              )}
            </div>

            {/* Add Day Inline Form */}
            {isAddingDay && (
              <form
                onSubmit={handleSaveDay}
                className="bg-slate-50 border border-purple-200 rounded-2xl p-4 space-y-3 animate-in fade-in duration-150"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-xs font-bold text-brand">
                    Add Day {(itinerary.days?.length || 0) + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddingDay(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Day Title *
                  </label>
                  <input
                    type="text"
                    required

                    value={newDayTitle}
                    onChange={(e) => setNewDayTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Description & Schedule
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Describe timings, route, scenic points..."
                    value={newDayDesc}
                    onChange={(e) => setNewDayDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Hotel / Resort Stay
                    </label>
                    <input
                      type="text"

                      value={newDayHotel}
                      onChange={(e) => setNewDayHotel(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Included Meals
                    </label>
                    <div className="flex items-center gap-1.5 pt-0.5">
                      {['Breakfast', 'Lunch', 'Dinner'].map((meal) => {
                        const isSelected = newDayMeals.includes(meal)
                        return (
                          <button
                            key={meal}
                            type="button"
                            onClick={() => toggleMeal(meal)}
                            className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                              isSelected
                                ? 'bg-brand text-white'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {meal}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Activities tag list */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Key Highlights / Activities
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"

                      value={newActivityInput}
                      onChange={(e) => setNewActivityInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddActivity()
                        }
                      }}
                      className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={handleAddActivity}
                      className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-xs font-semibold text-slate-700"
                    >
                      Add
                    </button>
                  </div>

                  {newActivities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {newActivities.map((act, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 text-[11px] bg-purple-100 text-brand px-2 py-0.5 rounded-md"
                        >
                          <span>{act}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveActivity(i)}
                            className="hover:text-rose-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingDay(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold bg-brand text-white rounded-lg hover:bg-brand-hover"
                  >
                    Save Day
                  </button>
                </div>
              </form>
            )}

            {/* Days Timeline */}
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
              {itinerary.days?.map((day) => (
                <div key={day.id} className="relative group">
                  {/* Timeline bullet */}
                  <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-brand text-white flex items-center justify-center text-[10px] font-bold shadow-xs ring-4 ring-white">
                    {day.dayNumber}
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs hover:border-brand/30 transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-bold text-brand uppercase tracking-wider">
                          Day {day.dayNumber}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 mt-0.5">{day.title}</h4>
                      </div>

                      <button
                        onClick={() => handleDeleteDay(day.id)}
                        className="text-slate-300 hover:text-rose-600 p-1 rounded-md transition-colors"
                        title="Remove Day"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {day.description}
                    </p>

                    {/* Metadata pills */}
                    <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
                      {day.hotel && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                          <Hotel className="w-3 h-3 text-slate-400" />
                          <span>{day.hotel}</span>
                        </span>
                      )}

                      {day.meals && day.meals.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg">
                          <Utensils className="w-3 h-3 text-emerald-500" />
                          <span>{day.meals.join(', ')}</span>
                        </span>
                      )}
                    </div>

                    {/* Activities check items */}
                    {day.activities && day.activities.length > 0 && (
                      <div className="mt-3 space-y-1.5">
                        {day.activities.map((act, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span>{act}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Copy Itinerary Link</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition-all shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
