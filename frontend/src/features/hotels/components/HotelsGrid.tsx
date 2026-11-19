import React from 'react'
import {
  MapPin,
  Star,
  Phone,
  Mail,
  Edit3,
  Trash2,
  Building2,
  FileText,
} from 'lucide-react'
import { useHotels } from '../../../context/HotelsContext'
import { useToast } from '../../../components/ui/Toast'
import type { Hotel } from '../../../types/hotel.types'

interface HotelsGridProps {
  onEditHotel: (hotel: Hotel) => void
}

export const HotelsGrid: React.FC<HotelsGridProps> = ({ onEditHotel }) => {
  const { filteredHotels, deleteHotel } = useHotels()
  const { toast } = useToast()

  const handleDelete = (e: React.MouseEvent, hotel: Hotel) => {
    e.stopPropagation()
    if (window.confirm(`Are you sure you want to remove ${hotel.name} from directory?`)) {
      deleteHotel(hotel.id)
      toast({ title: 'Hotel removed from directory', type: 'info' })
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredHotels.map((hotel) => {
        const coverPhoto = hotel.photos?.[0]

        return (
          <div
            key={hotel.id}
            onClick={() => onEditHotel(hotel)}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-[#453372]/30 transition-all cursor-pointer overflow-hidden flex flex-col group"
          >
            {/* Hotel Image & Star Rating */}
            <div className="relative h-44 bg-slate-100 overflow-hidden">
              {coverPhoto ? (
                <img
                  src={coverPhoto}
                  alt={hotel.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-indigo-50 text-[#453372]">
                  <Building2 className="w-12 h-12 stroke-[1.5]" />
                </div>
              )}

              {/* Stars badge */}
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-xs text-amber-300 text-xs font-bold flex items-center gap-1 shadow-2xs">
                <span>{hotel.stars}</span>
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              </div>

              {/* Photos count */}
              {hotel.photos?.length > 1 && (
                <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[11px] font-semibold">
                  +{hotel.photos.length} photos
                </div>
              )}

              {/* Price badge */}
              {hotel.pricePerNight > 0 && (
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-xs text-[#453372] text-xs font-extrabold shadow-xs">
                  ₹{hotel.pricePerNight.toLocaleString('en-IN')}{' '}
                  <span className="text-[10px] font-medium text-slate-500">/ night</span>
                </div>
              )}
            </div>

            {/* Content Details */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="font-semibold text-slate-700">{hotel.city}</span>
                </div>

                <h3 className="font-bold text-slate-900 text-base group-hover:text-[#453372] transition-colors line-clamp-1">
                  {hotel.name}
                </h3>

                {hotel.address && (
                  <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                    {hotel.address}
                  </p>
                )}
              </div>

              {/* Notes / Contract Rates */}
              {hotel.notes && (
                <div className="p-2.5 rounded-xl bg-purple-50/50 border border-purple-100/70 text-xs text-purple-950 flex items-start gap-2">
                  <FileText className="w-3.5 h-3.5 text-[#453372] shrink-0 mt-0.5" />
                  <p className="line-clamp-2 leading-relaxed text-[11px]">
                    {hotel.notes}
                  </p>
                </div>
              )}

              {/* Contact info & Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-500">
                  {hotel.phone && (
                    <a
                      href={`tel:${hotel.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 hover:text-[#453372] hover:bg-slate-100 rounded-lg transition-colors"
                      title={hotel.phone}
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                  {hotel.email && (
                    <a
                      href={`mailto:${hotel.email}`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 hover:text-[#453372] hover:bg-slate-100 rounded-lg transition-colors"
                      title={hotel.email}
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onEditHotel(hotel)}
                    className="p-1.5 text-slate-400 hover:text-[#453372] hover:bg-purple-50 rounded-lg transition-colors"
                    title="Edit hotel"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, hotel)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete hotel"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
