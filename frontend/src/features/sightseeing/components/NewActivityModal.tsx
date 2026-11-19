import React, { useState, useEffect } from 'react'
import { X, UploadCloud, Link as LinkIcon, Compass } from 'lucide-react'
import { useSightseeing } from '../../../context/SightseeingContext'
import { useToast } from '../../../components/ui/Toast'
import type { SightseeingActivity } from '../../../types/sightseeing.types'

interface NewActivityModalProps {
  isOpen: boolean
  onClose: () => void
  activityToEdit?: SightseeingActivity | null
}

export const NewActivityModal: React.FC<NewActivityModalProps> = ({
  isOpen,
  onClose,
  activityToEdit,
}) => {
  const { addActivity, updateActivity } = useSightseeing()
  const { toast } = useToast()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (activityToEdit) {
      setName(activityToEdit.name)
      setDescription(activityToEdit.description)
      setCoverImage(activityToEdit.coverImage || '')
    } else {
      setName('')
      setDescription('')
      setCoverImage('')
    }
  }, [activityToEdit, isOpen])

  if (!isOpen) return null

  // Local image file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setCoverImage(reader.result)
          toast({ title: 'Cover image uploaded', type: 'success' })
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddUrl = () => {
    if (!urlInput.trim()) return
    setCoverImage(urlInput.trim())
    setUrlInput('')
    setShowUrlInput(false)
    toast({ title: 'Image URL applied', type: 'success' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast({ title: 'Please provide the activity name', type: 'error' })
      return
    }

    setIsSubmitting(true)
    try {
      if (activityToEdit) {
        await updateActivity(activityToEdit.id, {
          name: name.trim(),
          description: description.trim(),
          coverImage: coverImage || undefined,
        })
        toast({ title: 'Activity updated', type: 'success' })
      } else {
        await addActivity({
          name: name.trim(),
          description: description.trim(),
          coverImage: coverImage || undefined,
        })
        toast({ title: `Added "${name}" to sightseeing library`, type: 'success' })
      }
      onClose()
    } catch {
      toast({ title: 'Failed to save activity', type: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8">
        {/* Header matching screenshot 2 */}
        <div className="flex items-start justify-between p-6 border-b border-slate-100 bg-white">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {activityToEdit ? 'Edit activity' : 'New activity'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Add a reusable activity for your package day plans.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body matching screenshot 2 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Cover image dropzone */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">Cover image</label>
            <div className="relative border-2 border-dashed border-[#453372]/40 bg-purple-50/15 hover:bg-purple-50/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer group overflow-hidden">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />

              {coverImage ? (
                <div className="relative w-full h-32 rounded-xl overflow-hidden">
                  <img src={coverImage} alt="Activity cover" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-semibold">
                    Click to change image
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-purple-100 text-[#453372] flex items-center justify-center mb-2 shadow-2xs">
                    <UploadCloud className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <p className="text-xs font-bold text-slate-800">Upload image</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Drag & drop or click · PNG/JPG/WEBP · max 5 MB
                  </p>
                </>
              )}
            </div>

            {/* Paste URL row */}
            <div className="mt-2">
              {showUrlInput ? (
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com/activity.jpg"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={handleAddUrl}
                    className="px-3 py-1.5 text-xs font-semibold bg-[#453372] text-white rounded-lg"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(false)}
                    className="text-xs text-slate-400 hover:text-slate-600"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowUrlInput(true)}
                  className="text-[11px] text-slate-500 hover:text-[#453372] flex items-center gap-1 font-medium"
                >
                  <LinkIcon className="w-3 h-3" />
                  <span>or paste an image URL</span>
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Optional — shown when this activity is added to a package day.
            </p>
          </div>

          {/* Activity name */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Activity name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Gulmarg Excursion"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372] transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">Description</label>
            <textarea
              rows={4}
              placeholder="What travellers do here — pickup, sightseeing spots, activities..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372] resize-none transition-all"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              This text auto-fills the day when you pick this activity in a package.
            </p>
          </div>

          {/* Action Buttons matching screenshot 2 */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#453372] hover:bg-[#37275d] text-white text-sm font-semibold shadow-xs hover:shadow transition-all disabled:opacity-50"
            >
              <Compass className="w-4 h-4 text-purple-200" />
              <span>{isSubmitting ? 'Saving...' : activityToEdit ? 'Save changes' : 'Add activity'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
