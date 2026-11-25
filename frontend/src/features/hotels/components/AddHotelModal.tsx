import React, { useState, useEffect } from 'react'
import { X, Image as ImageIcon, Link as LinkIcon, Building2, Plus, Trash2, Percent, BedDouble } from 'lucide-react'
import { useHotels } from '../../../context/HotelsContext'
import { useToast } from '../../../components/ui/Toast'
import { uploadService } from '../../../services/uploadService'
import type { Hotel, RoomType } from '../../../types/hotel.types'

interface AddHotelModalProps {
  isOpen: boolean
  onClose: () => void
  hotelToEdit?: Hotel | null
}

export const AddHotelModal: React.FC<AddHotelModalProps> = ({
  isOpen,
  onClose,
  hotelToEdit,
}) => {
  const { addHotel, updateHotel } = useHotels()
  const { toast } = useToast()

  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [stars, setStars] = useState<number>(3)
  const [pricePerNight, setPricePerNight] = useState<number>(0)
  const [currency, setCurrency] = useState('INR')
  const [commissionRate, setCommissionRate] = useState<number>(10)
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [newRoomName, setNewRoomName] = useState('')
  const [newRoomPrice, setNewRoomPrice] = useState<number | ''>('')
  const [newRoomInclusions, setNewRoomInclusions] = useState('')

  const [showUrlInput, setShowUrlInput] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)

  useEffect(() => {
    if (hotelToEdit) {
      setName(hotelToEdit.name)
      setCity(hotelToEdit.city)
      setAddress(hotelToEdit.address || '')
      setStars(hotelToEdit.stars || 3)
      setPricePerNight(hotelToEdit.pricePerNight || 0)
      setCurrency(hotelToEdit.currency || 'INR')
      setCommissionRate(hotelToEdit.commissionRate || 0)
      setPhone(hotelToEdit.phone || '')
      setEmail(hotelToEdit.email || '')
      setNotes(hotelToEdit.notes || '')
      setPhotos(hotelToEdit.photos || [])
      setRoomTypes(hotelToEdit.roomTypes || [])
    } else {
      setName('')
      setCity('')
      setAddress('')
      setStars(3)
      setPricePerNight(0)
      setCurrency('INR')
      setCommissionRate(10)
      setPhone('')
      setEmail('')
      setNotes('')
      setPhotos([])
      setRoomTypes([])
    }
  }, [hotelToEdit, isOpen])

  if (!isOpen) return null

  // Upload image directly to Cloudinary (with automatic fallback)
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (photos.length >= 8) {
        toast({ title: 'Maximum 8 photos allowed per hotel', type: 'error' })
        return
      }
      setIsUploadingPhoto(true)
      toast({ title: 'Uploading photo to Cloudinary...', type: 'info' })
      try {
        const cdnUrl = await uploadService.uploadImage(file, 'hotels')
        setPhotos((prev) => [...prev, cdnUrl])
        toast({ title: 'Photo uploaded and stored in Cloudinary!', type: 'success' })
      } catch (err) {
        toast({ title: 'Failed to process image file', type: 'error' })
      } finally {
        setIsUploadingPhoto(false)
      }
    }
  }

  const handleAddUrl = () => {
    if (!urlInput.trim()) return
    if (photos.length >= 8) {
      toast({ title: 'Maximum 8 photos allowed per hotel', type: 'error' })
      return
    }
    setPhotos((prev) => [...prev, urlInput.trim()])
    setUrlInput('')
    setShowUrlInput(false)
    toast({ title: 'Photo URL added', type: 'success' })
  }

  const handleRemovePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx))
  }

  // Room type handlers
  const handleAddRoomType = () => {
    if (!newRoomName.trim()) {
      toast({ title: 'Enter room category name (e.g. Deluxe Suite)', type: 'error' })
      return
    }
    const price = Number(newRoomPrice) || pricePerNight || 0
    setRoomTypes((prev) => [
      ...prev,
      {
        name: newRoomName.trim(),
        pricePerNight: price,
        inclusions: newRoomInclusions.trim() || 'Breakfast Included',
        capacity: 2,
      },
    ])
    setNewRoomName('')
    setNewRoomPrice('')
    setNewRoomInclusions('')
    toast({ title: 'Room tier added', type: 'success' })
  }

  const handleRemoveRoomType = (idx: number) => {
    setRoomTypes((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast({ title: 'Please provide the hotel name', type: 'error' })
      return
    }
    if (!city.trim()) {
      toast({ title: 'Please provide the city', type: 'error' })
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        name: name.trim(),
        city: city.trim(),
        address: address.trim() || undefined,
        stars: Math.min(5, Math.max(1, Number(stars) || 3)),
        pricePerNight: Number(pricePerNight) || 0,
        currency,
        commissionRate: Math.min(100, Math.max(0, Number(commissionRate) || 0)),
        roomTypes,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        notes: notes.trim() || undefined,
        photos,
      }

      if (hotelToEdit) {
        await updateHotel(hotelToEdit.id, payload)
        toast({ title: 'Hotel details updated', type: 'success' })
      } else {
        await addHotel(payload)
        toast({ title: `Added ${name} to directory`, type: 'success' })
      }
      onClose()
    } catch {
      toast({ title: 'Failed to save hotel', type: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-100 bg-white">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {hotelToEdit ? 'Edit partner hotel' : 'Add partner hotel'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Add a partner hotel with contract rates, room categories, and agency commission.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Photos Upload Section */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">Photos</label>
            <div className="flex flex-wrap items-center gap-3">
              {/* Photo Previews */}
              {photos.map((photo, idx) => (
                <div
                  key={idx}
                  className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 shadow-2xs group"
                >
                  <img
                    src={photo}
                    alt={`Hotel photo ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-rose-600 text-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {/* Upload Box */}
              {photos.length < 8 && (
                <div className="relative w-24 h-24 rounded-2xl border-2 border-dashed border-[#453372]/40 bg-purple-50/15 hover:bg-purple-50/30 transition-all flex flex-col items-center justify-center cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isUploadingPhoto}
                    onChange={handlePhotoUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                  />
                  {isUploadingPhoto ? (
                    <>
                      <div className="w-5 h-5 border-2 border-[#453372] border-t-transparent rounded-full animate-spin mb-1" />
                      <span className="text-[10px] font-bold text-[#453372]">Saving...</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-5 h-5 text-[#453372] transition-transform group-hover:scale-110 mb-1" />
                      <span className="text-[11px] font-bold text-[#453372]">Upload</span>
                    </>
                  )}
                </div>
              )}

              {/* URL paste helper */}
              {showUrlInput ? (
                <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <input
                    type="url"
                    placeholder="https://example.com/hotel.jpg"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 w-44"
                  />
                  <button
                    type="button"
                    onClick={handleAddUrl}
                    className="px-2.5 py-1 text-xs font-semibold bg-[#453372] text-white rounded-lg"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                photos.length < 8 && (
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(true)}
                    className="text-[11px] text-slate-500 hover:text-[#453372] flex items-center gap-1 font-medium ml-1"
                  >
                    <LinkIcon className="w-3 h-3" />
                    <span>paste URL</span>
                  </button>
                )
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Room, lobby, facade... shown in packages and itineraries (up to 8).
            </p>
          </div>

          {/* Hotel Name & City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Hotel name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="The Grand Bali Resort"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                City <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ubud"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372] transition-all"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">Address</label>
            <input
              type="text"
              placeholder="Street, area..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372] transition-all"
            />
          </div>

          {/* Pricing, Stars, Currency, Commission */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">Stars (1–5)</label>
              <input
                type="number"
                min="1"
                max="5"
                placeholder="3"
                value={stars}
                onChange={(e) => setStars(parseInt(e.target.value) || 3)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372] transition-all text-center"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">Base Rate / night</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={pricePerNight || ''}
                onChange={(e) => setPricePerNight(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372] transition-all"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="IDR">IDR (Rp)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1">
                <Percent className="w-3 h-3 text-[#453372]" />
                <span>Agency Comm. %</span>
              </label>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="10"
                value={commissionRate}
                onChange={(e) => setCommissionRate(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372] transition-all text-center"
              />
            </div>
          </div>

          {/* Contact (Phone & Email) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">Phone</label>
              <input
                type="tel"
                placeholder="+91-XXXX-XXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">Reservations Email</label>
              <input
                type="email"
                placeholder="reservations@hotel.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372] transition-all"
              />
            </div>
          </div>

          {/* Room Categories & Tiers Section */}
          <div className="p-4 rounded-xl bg-purple-50/40 border border-purple-100/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#453372] flex items-center gap-1.5 uppercase tracking-wider">
                <BedDouble className="w-4 h-4" />
                <span>Room Categories & Contract Tiers</span>
              </label>
              <span className="text-[11px] text-slate-500">{roomTypes.length} Tiers added</span>
            </div>

            {/* List of added room tiers */}
            {roomTypes.length > 0 && (
              <div className="space-y-2">
                {roomTypes.map((room, rIdx) => (
                  <div
                    key={rIdx}
                    className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 text-xs shadow-2xs"
                  >
                    <div>
                      <strong className="text-slate-800 font-semibold">{room.name}</strong>
                      <span className="text-slate-400 mx-1.5">•</span>
                      <span className="text-[#453372] font-bold">
                        ₹{room.pricePerNight?.toLocaleString('en-IN')} / night
                      </span>
                      {room.inclusions && (
                        <span className="text-slate-500 ml-2">({room.inclusions})</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveRoomType(rIdx)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors"
                      title="Remove tier"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input to add a new room tier */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <input
                type="text"
                placeholder="Tier e.g. Pool Villa"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                className="px-3 py-1.5 text-xs bg-white rounded-lg border border-slate-200 focus:outline-none focus:border-[#453372]"
              />
              <input
                type="number"
                placeholder="Rate / night"
                value={newRoomPrice}
                onChange={(e) => setNewRoomPrice(e.target.value ? parseFloat(e.target.value) : '')}
                className="px-3 py-1.5 text-xs bg-white rounded-lg border border-slate-200 focus:outline-none focus:border-[#453372]"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Inclusions e.g. Breakfast"
                  value={newRoomInclusions}
                  onChange={(e) => setNewRoomInclusions(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white rounded-lg border border-slate-200 focus:outline-none focus:border-[#453372]"
                />
                <button
                  type="button"
                  onClick={handleAddRoomType}
                  className="px-3 py-1.5 bg-[#453372] text-white rounded-lg text-xs font-semibold shrink-0 hover:bg-[#38275d] flex items-center gap-1 shadow-2xs"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">Contract Notes & Key Contacts</label>
            <textarea
              rows={3}
              placeholder="Contract rates, sales manager direct line, seasonal discount terms..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372] transition-all resize-none"
            />
          </div>

          {/* Action Buttons */}
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
              <Building2 className="w-4 h-4 text-purple-200" />
              <span>{isSubmitting ? 'Saving...' : hotelToEdit ? 'Save changes' : 'Add hotel'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
