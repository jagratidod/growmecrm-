import React from 'react'
import { CalendarCheck, Plus } from 'lucide-react'
import { useBookings } from '../../../context/BookingsContext'

export const BookingsEmptyState: React.FC = () => {
  const { setIsNewBookingModalOpen } = useBookings()

  return (
    <div className="bg-canvas/50 rounded-2xl border-2 border-dashed border-slate-200/90 p-12 sm:p-16 text-center my-4">
      {/* Icon with soft purple tint */}
      <div className="w-16 h-16 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mx-auto mb-4 shadow-xs">
        <CalendarCheck className="w-8 h-8 stroke-[2]" />
      </div>

      <h3 className="text-lg font-bold text-slate-800 tracking-tight">
        No bookings yet
      </h3>
      <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-md mx-auto leading-relaxed">
        Convert a won lead into a booking, or create one from scratch to start managing deposits, departure dates, and passenger itineraries.
      </p>

      <div className="flex items-center justify-center gap-3 mt-6">
        <button
          type="button"
          onClick={() => setIsNewBookingModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs sm:text-sm font-semibold shadow-sm shadow-brand/30 transition active:scale-[0.99]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New booking</span>
        </button>


      </div>
    </div>
  )
}
