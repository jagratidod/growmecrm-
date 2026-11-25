import React, { useState } from 'react'
import { Plus, Star, Trash2, Upload, User } from 'lucide-react'
import { useHostPage } from '../../../context/HostPageContext'
import { useToast } from '../../../components/ui/Toast'

export const HostReviewsCard: React.FC = () => {
  const { hostData, addReview, deleteReview } = useHostPage()
  const { toast } = useToast()

  const [name, setName] = useState('')
  const [rating, setRating] = useState('5')
  const [quote, setQuote] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result)
          toast({ title: 'Reviewer photo uploaded', type: 'success' })
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddReview = () => {
    if (!name.trim()) {
      toast({ title: 'Please enter a reviewer name', type: 'error' })
      return
    }
    if (!quote.trim()) {
      toast({ title: 'Please enter a quote', type: 'error' })
      return
    }

    const numericRating = Math.min(5, Math.max(1, parseInt(rating, 10) || 5))

    addReview({
      name: name.trim(),
      rating: numericRating,
      quote: quote.trim(),
      avatarUrl: avatarUrl || undefined,
    })

    // Reset form
    setName('')
    setRating('5')
    setQuote('')
    setAvatarUrl('')
  }

  const isEmpty = hostData.reviews.length === 0

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-6">
      <div>
        <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          Reviews
        </h2>
      </div>

      {/* Review creation form matching screenshot 3 */}
      <div className="flex flex-col sm:flex-row items-start gap-4 p-4 rounded-2xl border border-slate-200/90 bg-slate-50/40">
        {/* Avatar Upload Box on left */}
        <div className="relative shrink-0">
          <label className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-dashed border-slate-200 hover:border-purple-300 bg-white flex flex-col items-center justify-center text-center cursor-pointer transition-colors overflow-hidden group">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Reviewer avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <Upload className="w-5 h-5 text-slate-400 group-hover:text-brand mb-1 transition-colors" />
                <span className="text-[11px] font-semibold text-slate-500 group-hover:text-brand">
                  Upload
                </span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Inputs */}
        <div className="flex-1 w-full space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Reviewer name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
              />
            </div>
            <div className="w-16 sm:w-20">
              <input
                type="number"
                min={1}
                max={5}
                placeholder="5"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-center font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
              />
            </div>
          </div>

          <div>
            <textarea
              rows={3}
              placeholder="Their quote..."
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand resize-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleAddReview}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow transition-all active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add review</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reviews list / empty state matching screenshot 3 */}
      <div className="pt-2">
        {isEmpty ? (
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            No reviews yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hostData.reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-white hover:border-purple-200 transition-all flex items-start justify-between gap-3 shadow-2xs group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 text-brand flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                    {rev.avatarUrl ? (
                      <img
                        src={rev.avatarUrl}
                        alt={rev.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        {rev.name}
                      </h4>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star
                            key={i}
                            className="w-3 h-3 fill-amber-400 text-amber-400"
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 italic leading-relaxed">
                      "{rev.quote}"
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => deleteReview(rev.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                  title="Delete review"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
