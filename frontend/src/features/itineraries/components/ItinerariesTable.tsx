import React from 'react'
import {
  MapPin,
  Calendar,
  Users,
  Route,
  Trash2,
  Share2,
  ChevronRight,
  PackageCheck,
} from 'lucide-react'
import { useItineraries } from '../../../context/ItinerariesContext'
import { useToast } from '../../../components/ui/Toast'
import type { Itinerary, ItineraryStatus } from '../../../types/itinerary.types'

interface ItinerariesTableProps {
  onOpenDetails: (itinerary: Itinerary) => void
}

const statusConfig: Record<ItineraryStatus, { bg: string; text: string; dot: string }> = {
  Confirmed: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  Pending: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  Draft: { bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-400' },
  Completed: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
}

export const ItinerariesTable: React.FC<ItinerariesTableProps> = ({ onOpenDetails }) => {
  const { filteredItineraries, deleteItinerary } = useItineraries()
  const { toast } = useToast()

  const handleDelete = (e: React.MouseEvent, itn: Itinerary) => {
    e.stopPropagation()
    if (window.confirm(`Are you sure you want to delete itinerary for ${itn.customerName}?`)) {
      deleteItinerary(itn.id)
      toast({ title: 'Itinerary deleted', type: 'info' })
    }
  }

  const handleShare = (e: React.MouseEvent, itn: Itinerary) => {
    e.stopPropagation()
    const shareUrl = `${window.location.origin}/itineraries/view/${itn.id}`
    navigator.clipboard?.writeText(shareUrl)
    toast({ title: 'Itinerary PDF link copied to clipboard!', type: 'success' })
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 px-5">Customer</th>
              <th className="py-3.5 px-4">Destination</th>
              <th className="py-3.5 px-4">Trip Dates & Plan</th>
              <th className="py-3.5 px-4">Package</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Price</th>
              <th className="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredItineraries.map((itn) => {
              const statusStyle = statusConfig[itn.status] || statusConfig.Draft
              const dayCount = itn.days?.length || 1

              return (
                <tr
                  key={itn.id}
                  onClick={() => onOpenDetails(itn)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  {/* Customer */}
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#453372] border border-purple-100 flex items-center justify-center font-bold text-xs shrink-0">
                        {itn.customerName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 group-hover:text-[#453372] transition-colors">
                          {itn.customerName}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {itn.email || itn.phone || 'No direct contact'}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Destination */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5 font-medium text-slate-800">
                      <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>{itn.destination}</span>
                    </div>
                    {itn.travellers && (
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Users className="w-3 h-3" />
                        <span>{itn.travellers} {itn.travellers === 1 ? 'traveller' : 'travellers'}</span>
                      </div>
                    )}
                  </td>

                  {/* Dates & Day Count */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{itn.departure}</span>
                      {itn.returnDate && <span>→ {itn.returnDate}</span>}
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-[#453372] bg-purple-50 px-2 py-0.5 rounded-md w-fit">
                      <Route className="w-3 h-3" />
                      <span>{dayCount} {dayCount === 1 ? 'Day Plan' : 'Days Plan'}</span>
                    </div>
                  </td>

                  {/* Package */}
                  <td className="py-4 px-4">
                    {itn.package ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100/60 max-w-[180px] truncate">
                        <PackageCheck className="w-3 h-3 shrink-0" />
                        <span className="truncate">{itn.package}</span>
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Custom plan</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyle.bg} ${statusStyle.text}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                      {itn.status}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="py-4 px-4">
                    <div className="font-bold text-slate-900">
                      ₹{itn.totalAmount.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[11px] text-emerald-600 font-medium">
                      Paid: ₹{itn.amountPaid.toLocaleString('en-IN')}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onOpenDetails(itn)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#453372]/10 text-[#453372] hover:bg-[#453372] hover:text-white transition-colors"
                        title="Open Day-by-Day Plan"
                      >
                        <Route className="w-3 h-3" />
                        <span>Plan</span>
                      </button>

                      <button
                        onClick={(e) => handleShare(e, itn)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Share PDF link"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => handleDelete(e, itn)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete itinerary"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#453372] transition-colors ml-1" />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="lg:hidden divide-y divide-slate-100">
        {filteredItineraries.map((itn) => {
          const statusStyle = statusConfig[itn.status] || statusConfig.Draft
          const dayCount = itn.days?.length || 1

          return (
            <div
              key={itn.id}
              onClick={() => onOpenDetails(itn)}
              className="p-4 space-y-3 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{itn.customerName}</h4>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{itn.destination}</span>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusStyle.bg} ${statusStyle.text}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                  {itn.status}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{itn.departure}</span>
                </div>
                <div className="font-semibold text-[#453372]">
                  {dayCount} {dayCount === 1 ? 'Day Plan' : 'Days'}
                </div>
                <div className="font-bold text-slate-900">
                  ₹{itn.totalAmount.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onOpenDetails(itn)
                  }}
                  className="text-xs font-semibold text-[#453372] flex items-center gap-1"
                >
                  <Route className="w-3.5 h-3.5" />
                  <span>Design Day-by-day</span>
                </button>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => handleShare(e, itn)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, itn)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
