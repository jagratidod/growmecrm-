import React from 'react'
import {
  Calendar,
  MapPin,
  Users,
  Eye,
  Trash2,
  Phone,
  Mail,
} from 'lucide-react'
import { useBookings } from '../../../context/BookingsContext'
import type { BookingStatus } from '../../../types/booking.types'

export const BookingsTable: React.FC = () => {
  const { filteredBookings, setSelectedBooking, deleteBooking, updateBookingStatus } = useBookings()

  const statusBadgeConfig: Record<BookingStatus, { bg: string; text: string; dot: string }> = {
    Pending: {
      bg: 'bg-amber-50 border-amber-200',
      text: 'text-amber-700',
      dot: 'bg-[#ffb800]',
    },
    Confirmed: {
      bg: 'bg-blue-50 border-blue-200',
      text: 'text-blue-700',
      dot: 'bg-blue-500',
    },
    Ongoing: {
      bg: 'bg-purple-50 border-purple-200',
      text: 'text-[#453372]',
      dot: 'bg-[#453372]',
    },
    Completed: {
      bg: 'bg-emerald-50 border-emerald-200',
      text: 'text-emerald-700',
      dot: 'bg-[#22c55e]',
    },
    Cancelled: {
      bg: 'bg-slate-100 border-slate-200',
      text: 'text-slate-600',
      dot: 'bg-slate-400',
    },
  }

  const formatCurrency = (val: number) => {
    return '₹' + Number(val || 0).toLocaleString('en-IN')
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700 border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 bg-[#f3f4f8] text-[#453372] font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Destination & Package</th>
              <th className="py-3 px-4">Dates</th>
              <th className="py-3 px-4">Travellers</th>
              <th className="py-3 px-4">Payment Progress</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredBookings.map((booking) => {
              const statusCfg = statusBadgeConfig[booking.status] || statusBadgeConfig.Pending
              const percentPaid = Math.min(
                100,
                Math.round(((booking.amountPaid || 0) / (booking.totalAmount || 1)) * 100)
              )
              const balanceRemaining = Math.max(0, (booking.totalAmount || 0) - (booking.amountPaid || 0))

              return (
                <tr
                  key={booking.id}
                  className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                  onClick={() => setSelectedBooking(booking)}
                >
                  {/* Customer Column */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#453372]/10 text-[#453372] font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                        {booking.customerName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-slate-800 block truncate group-hover:text-[#453372] transition-colors">
                          {booking.customerName}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          {booking.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {booking.phone}
                            </span>
                          )}
                          {booking.email && (
                            <span className="hidden sm:flex items-center gap-1 truncate max-w-[120px]">
                              <Mail className="w-3 h-3" />
                              {booking.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Destination & Package Column */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <MapPin className="w-3.5 h-3.5 text-[#ff7675] shrink-0" />
                      <span className="truncate">{booking.destination}</span>
                    </div>
                    {booking.package && (
                      <p className="text-[11px] text-slate-400 font-medium truncate max-w-[180px] mt-0.5">
                        {booking.package}
                      </p>
                    )}
                  </td>

                  {/* Travel Dates Column */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-[#453372] shrink-0" />
                      <span>{formatDate(booking.departure)}</span>
                    </div>
                    {booking.returnDate && (
                      <p className="text-[10px] text-slate-400 mt-0.5 pl-5">
                        to {formatDate(booking.returnDate)}
                      </p>
                    )}
                  </td>

                  {/* Travellers Column */}
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold text-xs">
                      <Users className="w-3 h-3 text-slate-500" />
                      <span>{booking.travellers || 1} Pax</span>
                    </span>
                  </td>

                  {/* Payment Progress Column */}
                  <td className="py-3 px-4 min-w-[160px]">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="font-extrabold text-slate-800">
                        {formatCurrency(booking.totalAmount)}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {percentPaid}% paid
                      </span>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1.5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          percentPaid === 100
                            ? 'bg-[#22c55e]'
                            : percentPaid > 50
                            ? 'bg-[#ffb800]'
                            : 'bg-[#453372]'
                        }`}
                        style={{ width: `${percentPaid}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                      <span>Paid: {formatCurrency(booking.amountPaid)}</span>
                      {balanceRemaining > 0 && (
                        <span className="text-amber-600 font-medium">
                          Due: {formatCurrency(balanceRemaining)}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Status Badge Column */}
                  <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={booking.status}
                      onChange={(e) => updateBookingStatus(booking.id, e.target.value as BookingStatus)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition cursor-pointer focus:outline-hidden ${statusCfg.bg} ${statusCfg.text}`}
                    >
                      <option value="Pending">● Pending</option>
                      <option value="Confirmed">● Confirmed</option>
                      <option value="Ongoing">● Ongoing</option>
                      <option value="Completed">● Completed</option>
                      <option value="Cancelled">● Cancelled</option>
                    </select>
                  </td>

                  {/* Action Column */}
                  <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setSelectedBooking(booking)}
                        title="View Booking Details"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#453372] hover:bg-purple-50 transition"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete the booking for ${booking.customerName}?`)) {
                            deleteBooking(booking.id)
                          }
                        }}
                        title="Delete Booking"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
