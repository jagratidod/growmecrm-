import React, { useState } from 'react'
import {
  GripVertical,
  Trash2,
  MapPin,
  Plus,
  ArrowRight,
  ArrowLeft,
  X,
  Image as ImageIcon,
  Link as LinkIcon,
  Building2,
} from 'lucide-react'
import { usePackages } from '../../../context/PackagesContext'
import { useSightseeing } from '../../../context/SightseeingContext'
import { useHotels } from '../../../context/HotelsContext'
import { useToast } from '../../../components/ui/Toast'
import type { PackageItineraryDay } from '../../../types/package.types'

interface PackageItineraryFormProps {
  onNext: () => void
  onBack: () => void
}

export const PackageItineraryForm: React.FC<PackageItineraryFormProps> = ({ onNext, onBack }) => {
  const { activePackage, savePackage } = usePackages()
  const { activities: sightseeingActivities } = useSightseeing()
  const { hotels: partnerHotels } = useHotels()
  const { toast } = useToast()

  const [days, setDays] = useState<PackageItineraryDay[]>(() => {
    if (activePackage?.itineraryDays && activePackage.itineraryDays.length > 0) {
      return activePackage.itineraryDays
    }
    return [
      {
        id: `day-${Date.now()}-1`,
        dayNumber: 1,
        title: '',
        dayPlan: '',
        hotelType: 'No hotel / custom stay',
        stay: '',
        activities: '',
        meals: '',
        distance: '',
        notes: '',
        photos: [],
      },
    ]
  })

  const [activeUrlDayId, setActiveUrlDayId] = useState<string | null>(null)
  const [photoUrlInput, setPhotoUrlInput] = useState('')

  // Update a single day's field
  const handleUpdateDay = (dayId: string, field: keyof PackageItineraryDay, value: any) => {
    setDays((prev) =>
      prev.map((d) => (d.id === dayId ? { ...d, [field]: value } : d))
    )
  }

  // Select a partner hotel from directory
  const handleSelectPartnerHotel = (dayId: string, hotelId: string) => {
    const hotel = partnerHotels.find((h) => h.id === hotelId)
    if (!hotel) return

    const tierName =
      hotel.stars >= 5
        ? '5-Star Luxury Villa'
        : hotel.stars === 4
        ? '4-Star Premium Resort'
        : '3-Star Deluxe Hotel'

    setDays((prev) =>
      prev.map((d) => {
        if (d.id !== dayId) return d
        const newPhotos = [...(d.photos || [])]
        if (hotel.photos?.[0] && !newPhotos.includes(hotel.photos[0])) {
          newPhotos.push(hotel.photos[0])
        }
        return {
          ...d,
          hotelType: tierName,
          stay: `${hotel.name}, ${hotel.city}`,
          photos: newPhotos,
        }
      })
    )
    toast({
      title: `Selected ${hotel.name}`,
      description: `Auto-filled stay details and photo from Hotels directory`,
      type: 'success',
    })
  }

  // Add new day
  const handleAddDay = () => {
    const nextNumber = days.length + 1
    const newDay: PackageItineraryDay = {
      id: `day-${Date.now()}-${nextNumber}`,
      dayNumber: nextNumber,
      title: '',
      dayPlan: '',
      hotelType: 'No hotel / custom stay',
      stay: '',
      activities: '',
      meals: '',
      distance: '',
      notes: '',
      photos: [],
    }
    setDays((prev) => [...prev, newDay])
    toast({ title: `Day ${nextNumber} added to plan`, type: 'info' })
  }

  // Remove a day
  const handleRemoveDay = (dayId: string) => {
    if (days.length === 1) {
      toast({ title: 'An itinerary requires at least 1 day', type: 'error' })
      return
    }
    const remaining = days
      .filter((d) => d.id !== dayId)
      .map((d, index) => ({ ...d, dayNumber: index + 1 }))
    setDays(remaining)
    toast({ title: 'Day removed', type: 'info' })
  }

  // Handle local photo upload
  const handlePhotoUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    dayId: string
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const photoUrl = reader.result
          setDays((prev) =>
            prev.map((d) =>
              d.id === dayId
                ? { ...d, photos: [...(d.photos || []), photoUrl] }
                : d
            )
          )
          toast({ title: 'Day photo uploaded', type: 'success' })
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddPhotoUrl = (dayId: string) => {
    if (!photoUrlInput.trim()) return
    setDays((prev) =>
      prev.map((d) =>
        d.id === dayId
          ? { ...d, photos: [...(d.photos || []), photoUrlInput.trim()] }
          : d
      )
    )
    setPhotoUrlInput('')
    setActiveUrlDayId(null)
    toast({ title: 'Photo URL added', type: 'success' })
  }

  const handleRemovePhoto = (dayId: string, photoIdx: number) => {
    setDays((prev) =>
      prev.map((d) =>
        d.id === dayId
          ? { ...d, photos: d.photos?.filter((_, i) => i !== photoIdx) }
          : d
      )
    )
  }

  // Save and proceed
  const handleProceed = async () => {
    await savePackage({
      itineraryDays: days,
    })
    onNext()
  }

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6 animate-in fade-in duration-200">
      {/* Section Header */}
      <div>
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          ITINERARY
        </h4>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Build the day-by-day plan — the stay, activities and photos on each day become its own page in the brochure PDF.
        </p>
      </div>

      {/* Day Cards List */}
      <div className="space-y-6">
        {days.map((day) => (
          <div
            key={day.id}
            className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200/80 shadow-xs space-y-4 transition-all hover:border-slate-300 relative group"
          >
            {/* Day Title Row matching screenshot 1 */}
            <div className="flex items-center gap-3">
              {/* Day Number Badge */}
              <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                {day.dayNumber}
              </div>

              {/* Day Title Input */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder={`Day ${day.dayNumber} title`}
                  value={day.title}
                  onChange={(e) => handleUpdateDay(day.id, 'title', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200/90 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand bg-white transition-all"
                />
              </div>

              {/* Grip Handle */}
              <div className="text-slate-300 hover:text-slate-500 cursor-grab p-1">
                <GripVertical className="w-4 h-4" />
              </div>

              {/* Delete Day Button */}
              <button
                type="button"
                onClick={() => handleRemoveDay(day.id)}
                className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Delete Day"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Sightseeing notice / selector + AI Generate Button Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              {sightseeingActivities.length === 0 ? (
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>No sightseeing activities yet — add some on the Sightseeing page</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <select
                    onChange={(e) => {
                      const actId = e.target.value
                      if (!actId) return
                      const act = sightseeingActivities.find((a) => a.id === actId)
                      if (act) {
                        setDays((prev) =>
                          prev.map((d) =>
                            d.id === day.id
                              ? {
                                  ...d,
                                  title: d.title || act.name,
                                  dayPlan: d.dayPlan
                                    ? `${d.dayPlan}\n${act.description}`
                                    : act.description,
                                  photos:
                                    act.coverImage && !d.photos?.includes(act.coverImage)
                                      ? [...(d.photos || []), act.coverImage]
                                      : d.photos,
                                }
                              : d
                          )
                        )
                        toast({ title: `Added "${act.name}" to Day ${day.dayNumber}`, type: 'success' })
                      }
                      e.target.value = ''
                    }}
                    defaultValue=""
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-brand border border-purple-200 cursor-pointer focus:outline-none transition-all shadow-2xs"
                  >
                    <option value="" disabled>+ Add activity from Sightseeing library</option>
                    {sightseeingActivities.map((act) => (
                      <option key={act.id} value={act.id}>
                        {act.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              </div>

            {/* Day Plan Textarea */}
            <div>
              <textarea
                rows={4}
                placeholder="Day plan — pickup time, transfers, what happens today... (one point per line)"
                value={day.dayPlan}
                onChange={(e) => handleUpdateDay(day.id, 'dayPlan', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand resize-none"
              />
            </div>

            {/* Partner Hotel Selector & Stay Details */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-brand" />
                  <span>Accommodation & Stay</span>
                </label>
                {partnerHotels.length > 0 && (
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value) {
                        handleSelectPartnerHotel(day.id, e.target.value)
                        e.target.value = ''
                      }
                    }}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-brand border border-purple-200 cursor-pointer focus:outline-none transition-all shadow-2xs"
                  >
                    <option value="" disabled>🏨 Choose from Partner Hotels directory</option>
                    {partnerHotels.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name} ({h.stars}★, {h.city}) — ₹{h.pricePerNight?.toLocaleString('en-IN')}/n
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <select
                    value={day.hotelType || 'No hotel / custom stay'}
                    onChange={(e) => handleUpdateDay(day.id, 'hotelType', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 text-xs sm:text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                  >
                    <option value="No hotel / custom stay">No hotel / custom stay</option>
                    <option value="3-Star Deluxe Hotel">3-Star Deluxe Hotel</option>
                    <option value="4-Star Premium Resort">4-Star Premium Resort</option>
                    <option value="5-Star Luxury Villa">5-Star Luxury Villa</option>
                    <option value="Boutique Heritage Haveli">Boutique Heritage Haveli</option>
                    <option value="Riverside Alpine Camp">Riverside Alpine Camp</option>
                    <option value="Houseboat Deluxe Stay">Houseboat Deluxe Stay</option>
                  </select>
                </div>

                <div>
                  <input
                    type="text"

                    value={day.stay || ''}
                    onChange={(e) => handleUpdateDay(day.id, 'stay', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                  />
                </div>
              </div>
            </div>

            {/* Activities & Meals */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Activities — rafting, bonfire, trek... (comma separated)"
                  value={day.activities || ''}
                  onChange={(e) => handleUpdateDay(day.id, 'activities', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                />
              </div>

              <div>
                <input
                  type="text"

                  value={day.meals || ''}
                  onChange={(e) => handleUpdateDay(day.id, 'meals', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                />
              </div>
            </div>

            {/* Distance & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <input
                  type="text"

                  value={day.distance || ''}
                  onChange={(e) => handleUpdateDay(day.id, 'distance', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                />
              </div>

              <div className="sm:col-span-2">
                <textarea
                  rows={2}

                  value={day.notes || ''}
                  onChange={(e) => handleUpdateDay(day.id, 'notes', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200/90 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand resize-none"
                />
              </div>
            </div>

            {/* Photo Upload Area matching screenshot 1 and 2 */}
            <div className="pt-2">
              <div className="flex flex-wrap items-center gap-3">
                {/* Uploaded day photos */}
                {day.photos &&
                  day.photos.map((photo, pIdx) => (
                    <div
                      key={pIdx}
                      className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 shadow-2xs group/photo"
                    >
                      <img
                        src={photo}
                        alt={`Day ${day.dayNumber} photo ${pIdx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(day.id, pIdx)}
                        className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-rose-600 text-white rounded-full transition-colors opacity-0 group-hover/photo:opacity-100"
                        title="Remove photo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                {/* Upload dashed square box matching screenshot */}
                <div className="relative w-24 h-24 rounded-2xl border-2 border-dashed border-slate-300 hover:border-brand/50 hover:bg-purple-50/20 transition-all flex flex-col items-center justify-center cursor-pointer group/upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e, day.id)}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <ImageIcon className="w-5 h-5 text-slate-400 group-hover/upload:text-brand transition-colors mb-1" />
                  <span className="text-[11px] font-semibold text-slate-600 group-hover/upload:text-brand">
                    Upload
                  </span>
                </div>

                {/* URL upload helper */}
                {activeUrlDayId === day.id ? (
                  <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                    <input
                      type="url"

                      value={photoUrlInput}
                      onChange={(e) => setPhotoUrlInput(e.target.value)}
                      className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 w-48"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddPhotoUrl(day.id)}
                      className="px-2.5 py-1 text-xs font-semibold bg-brand text-white rounded-lg"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveUrlDayId(null)}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveUrlDayId(day.id)}
                    className="text-[11px] text-slate-400 hover:text-brand flex items-center gap-1 font-medium"
                  >
                    <LinkIcon className="w-3 h-3" />
                    <span>paste URL</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Full-width "+ Add day" dashed button matching screenshot 2 */}
      <div>
        <button
          type="button"
          onClick={handleAddDay}
          className="w-full py-3.5 rounded-2xl border-2 border-dashed border-slate-300 hover:border-brand/60 hover:bg-purple-50/20 text-slate-600 hover:text-brand font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
        >
          <Plus className="w-4 h-4" />
          <span>Add day</span>
        </button>
      </div>

      {/* Bottom Navigation matching screenshot 2 */}
      <div className="flex items-center justify-between pt-4">
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
          <span>Next: Logistics</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
