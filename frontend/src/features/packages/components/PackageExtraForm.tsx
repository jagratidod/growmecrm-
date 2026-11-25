import React, { useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Sparkles,
  X,
  Link as LinkIcon,
} from 'lucide-react'
import { usePackages } from '../../../context/PackagesContext'
import { useToast } from '../../../components/ui/Toast'

interface PackageExtraFormProps {
  onNext: () => void
  onBack: () => void
}

export const PackageExtraForm: React.FC<PackageExtraFormProps> = ({ onNext, onBack }) => {
  const { activePackage, savePackage } = usePackages()
  const { toast } = useToast()

  const [highlightInput, setHighlightInput] = useState('')
  const [highlights, setHighlights] = useState<string[]>(
    activePackage?.highlights ?? []
  )

  const [galleryImages, setGalleryImages] = useState<string[]>(
    activePackage?.galleryImages ?? []
  )

  const [showUrlModal, setShowUrlModal] = useState(false)
  const [imageUrlInput, setImageUrlInput] = useState('')

  // Add highlight
  const handleAddHighlight = () => {
    if (!highlightInput.trim()) return
    const h = highlightInput.trim()
    if (!highlights.includes(h)) {
      setHighlights((prev) => [...prev, h])
      toast({ title: 'Highlight added', type: 'info' })
    }
    setHighlightInput('')
  }

  const handleRemoveHighlight = (idx: number) => {
    setHighlights((prev) => prev.filter((_, i) => i !== idx))
  }

  // Handle local gallery image upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setGalleryImages((prev) => [...prev, reader.result as string])
          toast({ title: 'Gallery image uploaded', type: 'success' })
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle image URL add
  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return
    setGalleryImages((prev) => [...prev, imageUrlInput.trim()])
    setImageUrlInput('')
    setShowUrlModal(false)
    toast({ title: 'Image URL added to gallery', type: 'success' })
  }

  const handleRemoveGalleryImage = (idx: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleProceed = async () => {
    await savePackage({
      highlights,
      galleryImages,
    })
    toast({ title: 'Extras & gallery saved', type: 'success' })
    onNext()
  }

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-8">
        {/* SECTION 1: HIGHLIGHTS */}
        <div className="space-y-3">
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              HIGHLIGHTS
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Punchy one-liners shown as bullet highlights.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"

              value={highlightInput}
              onChange={(e) => setHighlightInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddHighlight()
                }
              }}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
            />
            <button
              type="button"
              onClick={handleAddHighlight}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add highlight</span>
            </button>
          </div>

          {/* List of Highlights */}
          {highlights.length > 0 && (
            <div className="space-y-2 pt-2">
              {highlights.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl bg-purple-50/40 border border-purple-100/70 text-xs sm:text-sm text-slate-800"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand shrink-0" />
                    <span>{h}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveHighlight(i)}
                    className="text-slate-400 hover:text-rose-500 p-1 rounded-md"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 2: GALLERY IMAGES */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              GALLERY IMAGES
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Paste image URLs — thumbnails preview below.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-1">
            {/* Gallery Previews */}
            {galleryImages.map((img, idx) => (
              <div
                key={idx}
                className="relative w-28 h-28 rounded-2xl overflow-hidden border border-slate-200 shadow-2xs group"
              >
                <img
                  src={img}
                  alt={`Gallery ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveGalleryImage(idx)}
                  className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-rose-600 text-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* "+ Add image" dashed box matching screenshot */}
            <div className="relative w-28 h-28 rounded-2xl border-2 border-dashed border-slate-300 hover:border-brand/60 hover:bg-purple-50/20 transition-all flex flex-col items-center justify-center cursor-pointer group">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <Plus className="w-6 h-6 text-slate-400 group-hover:text-brand transition-colors mb-1" />
              <span className="text-xs font-bold text-slate-600 group-hover:text-brand">
                Add image
              </span>
            </div>

            {/* Or paste URL button */}
            <button
              type="button"
              onClick={() => setShowUrlModal(true)}
              className="text-xs text-slate-500 hover:text-brand flex items-center gap-1 font-medium underline-offset-2 hover:underline ml-2"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>or paste image URL</span>
            </button>
          </div>

          {/* Paste URL inline row */}
          {showUrlModal && (
            <div className="flex items-center gap-2 pt-2 max-w-md bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <input
                type="url"

                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-3 py-1.5 bg-brand text-white text-xs font-semibold rounded-lg"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setShowUrlModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
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
          <span>Next: Review</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
