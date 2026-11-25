import React from 'react'
import { Plus, Compass } from 'lucide-react'

interface SightseeingEmptyStateProps {
  onOpenNewModal: () => void
  isFiltered?: boolean
}

export const SightseeingEmptyState: React.FC<SightseeingEmptyStateProps> = ({
  onOpenNewModal,
  isFiltered = false,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-slate-200/90 p-12 sm:p-16 flex flex-col items-center justify-center text-center shadow-xs">
      {/* Compass / Location Icon Badge matching screenshot 1 */}
      <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-brand shadow-xs mb-4">
        <Compass className="w-7 h-7 stroke-[1.75]" />
      </div>

      <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
        {isFiltered ? 'No matching activities found' : 'No activities yet'}
      </h3>

      <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-1 mb-6 leading-relaxed">
        {isFiltered
          ? 'Try adjusting your search query for activity name or description.'
          : 'Add activities (with a photo and description) to reuse when building package day plans.'}
      </p>

      {!isFiltered && (
        <button
          onClick={onOpenNewModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-sm font-semibold shadow-xs hover:shadow transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>New activity</span>
        </button>
      )}
    </div>
  )
}
