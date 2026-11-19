import React from 'react'
import { UploadCloud, Plus, Menu } from 'lucide-react'
import { useLeads } from '../../../context/LeadsContext'

interface LeadsHeaderProps {
  onOpenMobileMenu?: () => void
}

export const LeadsHeader: React.FC<LeadsHeaderProps> = ({ onOpenMobileMenu }) => {
  const { setIsNewLeadModalOpen, setIsImportModalOpen, leads, loadDemoData, clearAllLeads } = useLeads()

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6">
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Leads
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-normal">
            Track and manage every enquiry in one place.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
        {/* Helper quick actions for testing */}
        {leads.length === 0 ? (
          <button
            type="button"
            onClick={loadDemoData}
            className="text-xs text-indigo-600 hover:text-indigo-800 bg-indigo-50 border border-indigo-200 px-3 py-2 rounded-lg font-medium transition"
            title="Load 3 sample leads to preview populated table"
          >
            Load Sample Data
          </button>
        ) : (
          <button
            type="button"
            onClick={clearAllLeads}
            className="text-xs text-slate-500 hover:text-rose-600 px-2.5 py-2 rounded-lg font-medium transition"
            title="Clear all leads to preview empty state"
          >
            Empty View
          </button>
        )}

        <button
          type="button"
          onClick={() => setIsImportModalOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold shadow-xs transition active:scale-[0.99]"
        >
          <UploadCloud className="w-4 h-4 text-slate-500" />
          <span>Import CSV</span>
        </button>

        <button
          type="button"
          onClick={() => setIsNewLeadModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 sm:px-4.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-indigo-600/25 transition active:scale-[0.99]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New lead</span>
        </button>
      </div>
    </div>
  )
}
