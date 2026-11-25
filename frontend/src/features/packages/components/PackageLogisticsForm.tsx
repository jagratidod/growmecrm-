import React, { useState } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle, MapPin, Backpack } from 'lucide-react'
import { usePackages } from '../../../context/PackagesContext'
import { useToast } from '../../../components/ui/Toast'

interface PackageLogisticsFormProps {
  onNext: () => void
  onBack: () => void
}

export const PackageLogisticsForm: React.FC<PackageLogisticsFormProps> = ({ onNext, onBack }) => {
  const { activePackage, savePackage } = usePackages()
  const { toast } = useToast()

  const [inclusions, setInclusions] = useState(
    activePackage?.inclusions ?? ''
  )
  const [exclusions, setExclusions] = useState(
    activePackage?.exclusions ?? ''
  )
  const [pickupDropPoints, setPickupDropPoints] = useState(
    activePackage?.pickupDropPoints ?? ''
  )
  const [thingsToCarry, setThingsToCarry] = useState(
    activePackage?.thingsToCarry ?? ''
  )

  const handleProceed = async () => {
    await savePackage({
      inclusions: inclusions.trim(),
      exclusions: exclusions.trim(),
      pickupDropPoints: pickupDropPoints.trim(),
      thingsToCarry: thingsToCarry.trim(),
    })
    toast({ title: 'Logistics saved successfully', type: 'success' })
    onNext()
  }

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        {/* 2x2 Grid matching screenshot */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Inclusions */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <label className="text-xs font-bold text-slate-800">Inclusions</label>
            </div>
            <textarea
              rows={6}

              value={inclusions}
              onChange={(e) => setInclusions(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand resize-none font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">One per line.</p>
          </div>

          {/* Exclusions */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <XCircle className="w-4 h-4 text-rose-500" />
              <label className="text-xs font-bold text-slate-800">Exclusions</label>
            </div>
            <textarea
              rows={6}

              value={exclusions}
              onChange={(e) => setExclusions(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand resize-none font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">One per line.</p>
          </div>

          {/* Pickup / drop points */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <MapPin className="w-4 h-4 text-sky-600" />
              <label className="text-xs font-bold text-slate-800">Pickup / drop points</label>
            </div>
            <textarea
              rows={6}

              value={pickupDropPoints}
              onChange={(e) => setPickupDropPoints(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand resize-none font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">Where the trip starts and ends.</p>
          </div>

          {/* Things to carry */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Backpack className="w-4 h-4 text-amber-600" />
              <label className="text-xs font-bold text-slate-800">Things to carry</label>
            </div>
            <textarea
              rows={6}

              value={thingsToCarry}
              onChange={(e) => setThingsToCarry(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand resize-none font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">One per line.</p>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={handleProceed}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all active:scale-[0.98]"
        >
          <span>Next: Policies</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
