import React, { useState } from 'react'
import { ArrowLeft, ArrowRight, ShieldAlert, CreditCard, FileText } from 'lucide-react'
import { usePackages } from '../../../context/PackagesContext'
import { useToast } from '../../../components/ui/Toast'

interface PackagePoliciesFormProps {
  onNext: () => void
  onBack: () => void
}

export const PackagePoliciesForm: React.FC<PackagePoliciesFormProps> = ({ onNext, onBack }) => {
  const { activePackage, savePackage } = usePackages()
  const { toast } = useToast()

  const [cancellationPolicy, setCancellationPolicy] = useState(
    activePackage?.cancellationPolicy ?? ''
  )
  const [paymentTerms, setPaymentTerms] = useState(
    activePackage?.paymentTerms ?? ''
  )
  const [termsAndConditions, setTermsAndConditions] = useState(
    activePackage?.termsAndConditions ?? ''
  )

  const handleProceed = async () => {
    await savePackage({
      cancellationPolicy: cancellationPolicy.trim(),
      paymentTerms: paymentTerms.trim(),
      termsAndConditions: termsAndConditions.trim(),
    })
    toast({ title: 'Policies saved successfully', type: 'success' })
    onNext()
  }

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        {/* Cancellation policy */}
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            <label className="text-xs font-bold text-slate-800">Cancellation policy</label>
          </div>
          <textarea
            rows={4}

            value={cancellationPolicy}
            onChange={(e) => setCancellationPolicy(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand resize-none"
          />
        </div>

        {/* Payment terms */}
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <label className="text-xs font-bold text-slate-800">Payment terms</label>
          </div>
          <textarea
            rows={3}

            value={paymentTerms}
            onChange={(e) => setPaymentTerms(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand resize-none"
          />
        </div>

        {/* Terms & conditions */}
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <FileText className="w-4 h-4 text-brand" />
            <label className="text-xs font-bold text-slate-800">Terms & conditions</label>
          </div>
          <textarea
            rows={5}

            value={termsAndConditions}
            onChange={(e) => setTermsAndConditions(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand resize-none"
          />
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
          <span>Next: FAQs</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
