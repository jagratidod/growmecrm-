import React from 'react'
import { Wallet, Plus } from 'lucide-react'
import { useBills } from '../../../context/BillsContext'

export const BillsEmptyState: React.FC = () => {
  const { setIsAddBillModalOpen } = useBills()

  return (
    <div className="bg-canvas/50 rounded-2xl border-2 border-dashed border-slate-200/90 p-12 sm:p-16 text-center my-4">
      {/* Wallet Icon with soft purple tint */}
      <div className="w-16 h-16 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mx-auto mb-4 shadow-xs">
        <Wallet className="w-8 h-8 stroke-[2]" />
      </div>

      <h3 className="text-lg font-bold text-slate-800 tracking-tight">
        No bills yet
      </h3>
      <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-md mx-auto leading-relaxed">
        Record what you pay vendors so every trip shows a real margin.
      </p>

      <div className="flex items-center justify-center gap-3 mt-6">
        <button
          type="button"
          onClick={() => setIsAddBillModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs sm:text-sm font-semibold shadow-sm shadow-brand/30 transition active:scale-[0.99]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add bill</span>
        </button>

        </div>
    </div>
  )
}
