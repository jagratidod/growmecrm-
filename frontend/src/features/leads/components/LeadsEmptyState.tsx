import React from 'react'
import { Calendar, Plus } from 'lucide-react'
import { useLeads } from '../../../context/LeadsContext'

export const LeadsEmptyState: React.FC = () => {
  const { setIsNewLeadModalOpen } = useLeads()

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-12 sm:p-20 text-center flex flex-col items-center justify-center shadow-xs">
      <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-indigo-600 shadow-xs mb-4">
        <Calendar className="w-7 h-7 stroke-[1.8]" />
      </div>

      <h3 className="text-base sm:text-lg font-bold text-slate-800">No leads yet</h3>
      <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm">
        Add your first enquiry to start building your pipeline.
      </p>

      <button
        type="button"
        onClick={() => setIsNewLeadModalOpen(true)}
        className="mt-6 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-indigo-600/25 transition active:scale-[0.99]"
      >
        <Plus className="w-4 h-4 stroke-[2.5]" />
        <span>Add a lead</span>
      </button>
    </div>
  )
}
