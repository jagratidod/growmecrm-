import React, { useState } from 'react'
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Calendar,
  Sparkles,
  Share2,
  Globe,
  FileCheck,
  Tag,
  ShieldCheck,
  Send,
} from 'lucide-react'
import { usePackages } from '../../../context/PackagesContext'
import { useToast } from '../../../components/ui/Toast'

interface PackageReviewStepProps {
  onBack: () => void
  onFinished: () => void
}

export const PackageReviewStep: React.FC<PackageReviewStepProps> = ({ onBack, onFinished }) => {
  const { activePackage, savePackage } = usePackages()
  const { toast } = useToast()
  const [isPublishing, setIsPublishing] = useState(false)

  if (!activePackage) return null

  const handlePublish = async () => {
    setIsPublishing(true)
    try {
      await savePackage({
        status: 'PUBLISHED',
      })
      toast({
        title: '🎉 Package Published Successfully!',
        description: `Your package "${activePackage.name}" is now live and ready for booking.`,
        type: 'success',
      })
      onFinished()
    } catch {
      toast({ title: 'Failed to publish package', type: 'error' })
    } finally {
      setIsPublishing(false)
    }
  }

  const handleSaveDraft = async () => {
    await savePackage({ status: 'DRAFT' })
    toast({ title: 'Package draft saved', type: 'info' })
    onFinished()
  }

  const publicLink = `${window.location.origin}/packages/${activePackage.slug || 'package'}`

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(publicLink)
    toast({ title: 'Public booking URL copied to clipboard!', type: 'success' })
  }

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6 animate-in fade-in duration-200">
      {/* Review Header Banner */}
      <div className="bg-gradient-to-r from-[#453372] to-[#5c3e9c] rounded-2xl p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-white/20 text-purple-100">
              {activePackage.status || 'DRAFT'}
            </span>
            <span className="text-xs text-purple-200 font-semibold">
              {activePackage.brochureDesign} Brochure Design
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 tracking-tight">
            {activePackage.name}
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-xs text-purple-200 mt-1">
            <span className="flex items-center gap-1 text-white font-medium">
              <MapPin className="w-3.5 h-3.5 text-rose-300" />
              {activePackage.destination}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {activePackage.duration?.nights || 1}N / {activePackage.duration?.days || 2}D
            </span>
            <span>•</span>
            <span className="text-white font-bold text-sm">
              ₹{activePackage.price?.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Copy Public Link"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Review Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Details (2 cols) */}
        <div className="md:col-span-2 space-y-6">
          {/* Booking Page & Description */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#453372]" />
              <span>Public Booking Header</span>
            </h4>
            <p className="text-sm text-slate-800 font-medium">
              {activePackage.bookingTitle || 'Curated Luxury Tour Experience'}
            </p>
            {activePackage.description && (
              <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
                {activePackage.description}
              </p>
            )}

            {/* Categories */}
            {activePackage.categories && activePackage.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {activePackage.categories.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1 text-xs font-semibold bg-purple-50 text-[#453372] px-2.5 py-1 rounded-lg"
                  >
                    <Tag className="w-3 h-3" />
                    <span>{c}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Day-by-day Itinerary Summary */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#453372]" />
              <span>Itinerary Overview ({activePackage.itineraryDays?.length || 0} Days)</span>
            </h4>

            <div className="space-y-3">
              {activePackage.itineraryDays?.map((day) => (
                <div
                  key={day.id}
                  className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#453372]">Day {day.dayNumber}: {day.title || 'Sightseeing & Leisure'}</span>
                    {day.stay && <span className="text-slate-500 font-medium">Stay: {day.stay}</span>}
                  </div>
                  {day.dayPlan && (
                    <p className="text-xs text-slate-600 whitespace-pre-line line-clamp-2">
                      {day.dayPlan}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Inclusions & Exclusions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <h5 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Inclusions</span>
              </h5>
              <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                {activePackage.inclusions || 'No inclusions specified'}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <h5 className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Exclusions</span>
              </h5>
              <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                {activePackage.exclusions || 'No exclusions specified'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Sidebar Details (1 col) */}
        <div className="space-y-6">
          {/* Pricing Box */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Pricing Structure
            </h4>
            <div>
              <div className="text-[11px] text-slate-400">Base Price (Per Person)</div>
              <div className="text-2xl font-black text-slate-900 mt-0.5">
                ₹{activePackage.price?.toLocaleString('en-IN')}
              </div>
              {activePackage.bookingAmount && (
                <div className="text-xs text-emerald-600 font-medium mt-1">
                  Seat Advance: ₹{activePackage.bookingAmount?.toLocaleString('en-IN')}
                </div>
              )}
            </div>

            {activePackage.pricingOptions && activePackage.pricingOptions.length > 0 && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-[11px] font-bold text-slate-500 uppercase">Pricing Options</div>
                {activePackage.pricingOptions.map((opt) => (
                  <div key={opt.id} className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">{opt.label}</span>
                    <span className="font-bold text-slate-900">₹{opt.price.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats Pill */}
          <div className="bg-purple-50/50 rounded-2xl p-5 border border-purple-100/70 space-y-3">
            <h5 className="text-xs font-bold text-[#453372] uppercase tracking-wider">
              Package Completeness
            </h5>
            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex items-center justify-between">
                <span>Itinerary Days</span>
                <span className="font-bold">{activePackage.itineraryDays?.length || 0} Days</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Frequently Asked Questions</span>
                <span className="font-bold">{activePackage.faqs?.length || 0} FAQs</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Highlights</span>
                <span className="font-bold">{activePackage.highlights?.length || 0} Points</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Gallery Photos</span>
                <span className="font-bold">{activePackage.galleryImages?.length || 0} Photos</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors shadow-2xs"
          >
            <FileCheck className="w-4 h-4 inline-block mr-1.5" />
            <span>Save as Draft</span>
          </button>

          <button
            type="button"
            onClick={handlePublish}
            disabled={isPublishing}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#453372] hover:bg-[#37275d] text-white text-xs sm:text-sm font-bold shadow-sm hover:shadow transition-all active:scale-[0.98] disabled:opacity-60"
          >
            <Send className="w-4 h-4 text-purple-200" />
            <span>{isPublishing ? 'Publishing...' : 'Publish Package'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
