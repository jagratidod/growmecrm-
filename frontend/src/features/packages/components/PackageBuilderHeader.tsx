import React from 'react'
import { ChevronLeft, Package, Save } from 'lucide-react'
import { usePackages } from '../../../context/PackagesContext'

interface PackageBuilderHeaderProps {
  onBack: () => void
  onSave: () => void
  isSaving?: boolean
}

export const PackageBuilderHeader: React.FC<PackageBuilderHeaderProps> = ({
  onBack,
  onSave,
  isSaving = false,
}) => {
  const { activePackage } = usePackages()

  return (
    <div className="bg-white border-b border-slate-200/90 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      <div className="flex items-center gap-3">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors border border-slate-200/80"
          title="Back to Packages"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Package Icon & Name */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#1e1b4b] text-white flex items-center justify-center shadow-xs shrink-0">
            <Package className="w-5 h-5 stroke-[1.8]" />
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
              {activePackage?.name || 'New package'}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-extrabold tracking-wider text-amber-600 uppercase">
                {activePackage?.status || 'DRAFT'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={onSave}
        disabled={isSaving}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#453372] hover:bg-[#37275d] text-white text-sm font-semibold shadow-xs hover:shadow transition-all active:scale-[0.98] disabled:opacity-60"
      >
        {isSaving ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Saving...</span>
          </>
        ) : (
          <>
            <Save className="w-4 h-4 text-purple-200" />
            <span>Save package</span>
          </>
        )}
      </button>
    </div>
  )
}
