import React from 'react'
import { Plus, PhoneCall } from 'lucide-react'

interface CallLogEmptyStateProps {
  onOpenLogModal: () => void
  isFiltered?: boolean
}

export const CallLogEmptyState: React.FC<CallLogEmptyStateProps> = ({
  onOpenLogModal,
  isFiltered = false,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-slate-200/90 p-12 sm:p-16 flex flex-col items-center justify-center text-center shadow-xs">
      {/* Phone Icon Badge matching screenshot 1 */}
      <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[#453372] shadow-xs mb-4">
        <PhoneCall className="w-7 h-7 stroke-[1.75]" />
      </div>

      <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
        {isFiltered ? 'No calls match your filters' : 'No calls logged yet'}
      </h3>

      <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-1 mb-6 leading-relaxed">
        {isFiltered
          ? 'Try selecting "All users" or clearing the lead search filter.'
          : 'Log your first call to start building the call history.'}
      </p>

      {!isFiltered && (
        <button
          onClick={onOpenLogModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#453372] hover:bg-[#37275d] text-white text-sm font-semibold shadow-xs hover:shadow transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Log a call</span>
        </button>
      )}
    </div>
  )
}
