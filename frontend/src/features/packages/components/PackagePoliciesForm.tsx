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
    activePackage?.cancellationPolicy ||
      'Free cancellation up to 15 days before departure.\n50% cancellation fee between 14 to 7 days before departure.\nNon-refundable if cancelled within 7 days of departure.'
  )
  const [paymentTerms, setPaymentTerms] = useState(
    activePackage?.paymentTerms ||
      '25% advance to confirm, balance 7 days before travel.'
  )
  const [termsAndConditions, setTermsAndConditions] = useState(
    activePackage?.termsAndConditions ||
      'Any additional terms travellers should know...\n1. Passports must have a minimum validity of 6 months.\n2. Standard hotel check-in time is 2:00 PM and check-out is 11:00 AM.\n3. Early check-in or late check-out is subject to room availability.'
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
            placeholder="Free cancellation up to 15 days before departure..."
            value={cancellationPolicy}
            onChange={(e) => setCancellationPolicy(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372] resize-none"
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
            placeholder="25% advance to confirm, balance 7 days before travel..."
            value={paymentTerms}
            onChange={(e) => setPaymentTerms(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372] resize-none"
          />
        </div>

        {/* Terms & conditions */}
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <FileText className="w-4 h-4 text-[#453372]" />
            <label className="text-xs font-bold text-slate-800">Terms & conditions</label>
          </div>
          <textarea
            rows={5}
            placeholder="Any additional terms travellers should know..."
            value={termsAndConditions}
            onChange={(e) => setTermsAndConditions(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372] resize-none"
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
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#453372] hover:bg-[#37275d] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all active:scale-[0.98]"
        >
          <span>Next: FAQs</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
