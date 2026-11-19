import React from 'react'
import { Wallet, Plus } from 'lucide-react'
import { useBills } from '../../../context/BillsContext'

export const BillsEmptyState: React.FC = () => {
  const { setIsAddBillModalOpen, loadDemoData } = useBills()

  return (
    <div className="bg-[#f3f4f8]/50 rounded-2xl border-2 border-dashed border-slate-200/90 p-12 sm:p-16 text-center my-4">
      {/* Wallet Icon with soft purple tint */}
      <div className="w-16 h-16 rounded-2xl bg-[#453372]/10 text-[#453372] flex items-center justify-center mx-auto mb-4 shadow-xs">
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
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#453372] hover:bg-[#382760] text-white text-xs sm:text-sm font-semibold shadow-sm shadow-[#453372]/30 transition active:scale-[0.99]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add bill</span>
        </button>

        <button
          type="button"
          onClick={loadDemoData}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold shadow-xs transition"
        >
          <span>Load Demo Bills</span>
        </button>
      </div>
    </div>
  )
}
