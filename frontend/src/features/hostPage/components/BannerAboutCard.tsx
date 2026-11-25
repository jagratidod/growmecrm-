import React, { useState } from 'react'
import { UploadCloud, Link as LinkIcon, Trash2, Image as ImageIcon } from 'lucide-react'
import { useHostPage } from '../../../context/HostPageContext'
import { useToast } from '../../../components/ui/Toast'

export const BannerAboutCard: React.FC = () => {
  const { hostData, updateBannerImage, updateAboutUs } = useHostPage()
  const { toast } = useToast()
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [urlInput, setUrlInput] = useState('')

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          updateBannerImage(reader.result)
          toast({ title: 'Hero banner uploaded successfully', type: 'success' })
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return
    updateBannerImage(urlInput.trim())
    setUrlInput('')
    setShowUrlInput(false)
    toast({ title: 'Banner image URL applied', type: 'success' })
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-6">
      <div>
        <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          Banner & about
        </h2>
      </div>

      {/* Banner image section */}
      <div className="space-y-2">
        <label className="text-xs sm:text-sm font-semibold text-slate-700 block">
          Banner image
        </label>

        {hostData.bannerImage ? (
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 group h-48 sm:h-64 bg-slate-100">
            <img
              src={hostData.bannerImage}
              alt="Hero banner"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <label className="px-4 py-2 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer shadow-md inline-flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4" />
                <span>Replace</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <button
                type="button"
                onClick={() => updateBannerImage('')}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors shadow-md inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-slate-200 hover:border-purple-300 rounded-2xl p-8 sm:p-10 flex flex-col items-center justify-center text-center transition-colors bg-slate-50/40 relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-brand border border-purple-100 flex items-center justify-center mb-3 shadow-2xs pointer-events-none">
              <UploadCloud className="w-6 h-6 stroke-[1.75]" />
            </div>
            <p className="text-sm font-bold text-slate-900 pointer-events-none">Upload image</p>
            <p className="text-xs text-slate-400 mt-1 pointer-events-none">
              Drag & drop or click · PNG/JPG/WEBP · max 5 MB
            </p>
          </div>
        )}

        {/* Link / URL option */}
        <div className="pt-1">
          {showUrlInput ? (
            <div className="flex items-center gap-2 mt-2">
              <input
                type="url"

                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
              <button
                type="button"
                onClick={handleApplyUrl}
                className="px-3 py-1.5 rounded-lg bg-brand text-white text-xs font-semibold"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={() => setShowUrlInput(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowUrlInput(true)}
              className="text-xs text-brand hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              <LinkIcon className="w-3 h-3" />
              <span>or paste an image URL</span>
            </button>
          )}
          <p className="text-xs text-slate-400 mt-1">
            The big hero image at the top of your website.
          </p>
        </div>
      </div>

      {/* About us section matching screenshot 1 & 2 */}
      <div className="space-y-2">
        <label className="text-xs sm:text-sm font-semibold text-slate-700 block">
          About us
        </label>
        <textarea
          rows={5}
          placeholder="Tell visitors who you are, what you do and why travellers trust you..."
          value={hostData.aboutUs}
          onChange={(e) => updateAboutUs(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-slate-200/90 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand resize-y"
        />
      </div>
    </div>
  )
}
