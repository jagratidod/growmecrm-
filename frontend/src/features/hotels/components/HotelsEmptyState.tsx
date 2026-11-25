import React from 'react'
import { Plus, Building2 } from 'lucide-react'

interface HotelsEmptyStateProps {
  onOpenAddModal: () => void
  isFiltered?: boolean
}

export const HotelsEmptyState: React.FC<HotelsEmptyStateProps> = ({
  onOpenAddModal,
  isFiltered = false,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-slate-200/90 p-12 sm:p-16 flex flex-col items-center justify-center text-center shadow-xs">
      {/* Hotel Icon Badge */}
      <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-brand shadow-xs mb-4">
        <Building2 className="w-7 h-7 stroke-[1.75]" />
      </div>

      <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
        {isFiltered ? 'No matching hotels found' : 'No hotels yet'}
      </h3>

      <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-1 mb-6 leading-relaxed">
        {isFiltered
          ? 'Try adjusting your search query for hotel name or city.'
          : 'Build your partner directory so quotes and itineraries come together faster.'}
      </p>

      {!isFiltered && (
        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-sm font-semibold shadow-xs hover:shadow transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Add hotel</span>
        </button>
      )}
    </div>
  )
}
