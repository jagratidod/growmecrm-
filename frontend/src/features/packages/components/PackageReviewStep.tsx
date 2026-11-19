import React, { useState } from 'react'
import { ArrowLeft, Save } from 'lucide-react'
import { usePackages } from '../../../context/PackagesContext'
import { useToast } from '../../../components/ui/Toast'

interface PackageReviewStepProps {
  onBack: () => void
  onFinished: () => void
}

export const PackageReviewStep: React.FC<PackageReviewStepProps> = ({ onBack, onFinished }) => {
  const { activePackage, savePackage } = usePackages()
  const { toast } = useToast()

  const [isPublishToggled, setIsPublishToggled] = useState<boolean>(
    activePackage?.status === 'PUBLISHED' || true
  )
  const [showOnLinkTree, setShowOnLinkTree] = useState<boolean>(
    activePackage?.showOnLinkTree !== undefined ? activePackage.showOnLinkTree : true
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!activePackage) return null

  const handleCreatePackage = async () => {
    setIsSubmitting(true)
    try {
      const finalStatus = isPublishToggled ? 'PUBLISHED' : 'DRAFT'
      await savePackage({
        status: finalStatus,
        showOnLinkTree,
      })
      toast({
        title: isPublishToggled ? '🎉 Package Published!' : 'Package Created & Saved as Draft',
        description: `Package "${activePackage.name}" is now ready in your workspace.`,
        type: 'success',
      })
      onFinished()
    } catch {
      toast({ title: 'Failed to save package', type: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const durationText = `${activePackage.duration?.nights || 1}N / ${activePackage.duration?.days || 2}D`
  const categoriesText =
    activePackage.categories && activePackage.categories.length > 0
      ? activePackage.categories.join(', ')
      : '—'
  const priceText = `₹${(activePackage.price || 0).toLocaleString('en-IN')}`
  const daysCount = activePackage.itineraryDays?.length || 0
  const faqsCount = activePackage.faqs?.length || 0
  const highlightsCount = activePackage.highlights?.length || 0
  const publicSlugText = activePackage.slug || 'auto-generated'

  const reviewRows = [
    { label: 'Name', value: activePackage.name || '—' },
    { label: 'Destination', value: activePackage.destination || '—' },
    { label: 'Duration', value: durationText },
    { label: 'Price', value: priceText },
    { label: 'Categories', value: categoriesText },
    { label: 'Itinerary days', value: daysCount },
    { label: 'FAQs', value: faqsCount },
    { label: 'Highlights', value: highlightsCount },
    { label: 'Public slug', value: publicSlugText },
  ]

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6 animate-in fade-in duration-200">
      {/* 1. Review Summary Card matching screenshot 1 */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            REVIEW
          </h4>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Double-check everything, then publish or save as draft.
          </p>
        </div>

        {/* Details Table Card */}
        <div className="rounded-xl border border-slate-200/90 divide-y divide-slate-100 overflow-hidden">
          {reviewRows.map((row, idx) => (
            <div
              key={idx}
              className="px-5 py-3.5 flex items-center justify-between text-xs sm:text-sm"
            >
              <span className="font-semibold text-slate-600">{row.label}</span>
              <span className="font-semibold text-slate-900">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Publish this package Toggle Box matching screenshot 1 & 2 */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Publish this package</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Published packages appear on your host page and can be attached to bookings.
          </p>
        </div>

        {/* Purple Toggle Switch */}
        <button
          type="button"
          onClick={() => setIsPublishToggled(!isPublishToggled)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            isPublishToggled ? 'bg-[#453372]' : 'bg-slate-300'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
              isPublishToggled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* 3. Show on LinkTree Toggle Box matching screenshot 2 */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Show on LinkTree</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            ON = this package's card appears automatically on your public LinkTree page.
          </p>
        </div>

        {/* Green Toggle Switch matching screenshot */}
        <button
          type="button"
          onClick={() => setShowOnLinkTree(!showOnLinkTree)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            showOnLinkTree ? 'bg-[#10b981]' : 'bg-slate-300'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
              showOnLinkTree ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* 4. LinkTree Categories Box matching screenshot 2 */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-1">
        <h4 className="text-sm font-bold text-slate-900">LinkTree Categories</h4>
        <p className="text-xs text-slate-500 leading-relaxed">
          Which tabs this package appears under on your LinkTree page. No categories yet — create them under LinkTree → Manage Categories.
        </p>
      </div>

      {/* 5. Bottom Navigation matching screenshot 2 */}
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
          onClick={handleCreatePackage}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#453372] hover:bg-[#37275d] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all active:scale-[0.98] disabled:opacity-60"
        >
          <Save className="w-4 h-4 text-purple-200" />
          <span>{isSubmitting ? 'Creating package...' : 'Create package'}</span>
        </button>
      </div>
    </div>
  )
}
