import React from 'react'
import { Plus, Route, Sparkles } from 'lucide-react'

interface ItinerariesEmptyStateProps {
  onOpenNewModal: () => void
  isFiltered?: boolean
}

export const ItinerariesEmptyState: React.FC<ItinerariesEmptyStateProps> = ({
  onOpenNewModal,
  isFiltered = false,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-slate-200/90 p-12 sm:p-16 flex flex-col items-center justify-center text-center shadow-xs">
      <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-brand shadow-xs mb-4">
        <Route className="w-7 h-7 stroke-[1.75]" />
      </div>

      <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
        {isFiltered ? 'No matching itineraries found' : 'No itineraries yet'}
      </h3>

      <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-1 mb-6 leading-relaxed">
        {isFiltered
          ? 'Try adjusting your search keywords or status filter to see other itineraries.'
          : 'Start a new itinerary, or open a booking and design its day-by-day plan.'}
      </p>

      {!isFiltered && (
        <button
          onClick={onOpenNewModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-sm font-semibold shadow-sm hover:shadow transition-all active:scale-[0.98]"
        >
          <Sparkles className="w-4 h-4 text-purple-200" />
          <Plus className="w-4 h-4" />
          <span>New itinerary</span>
        </button>
      )}
    </div>
  )
}
