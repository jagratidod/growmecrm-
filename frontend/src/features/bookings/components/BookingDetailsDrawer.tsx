import React, { useState } from 'react'
import {
  X,
  MapPin,
  Trash2,
  FileText,
  CreditCard,
} from 'lucide-react'
import { useBookings } from '../../../context/BookingsContext'
import type { BookingStatus } from '../../../types/booking.types'

export const BookingDetailsDrawer: React.FC = () => {
  const { selectedBooking, setSelectedBooking, updateBooking, deleteBooking } = useBookings()
  const [addPaymentAmount, setAddPaymentAmount] = useState('')
  const [isAddingPayment, setIsAddingPayment] = useState(false)

  if (!selectedBooking) return null

  const formatCurrency = (val: number) => {
    return '₹' + Number(val || 0).toLocaleString('en-IN')
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const balanceDue = Math.max(0, (selectedBooking.totalAmount || 0) - (selectedBooking.amountPaid || 0))
  const percentPaid = Math.min(
    100,
    Math.round(((selectedBooking.amountPaid || 0) / (selectedBooking.totalAmount || 1)) * 100)
  )

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = Number(addPaymentAmount)
    if (!amount || amount <= 0) return

    const newPaid = (selectedBooking.amountPaid || 0) + amount
    updateBooking(selectedBooking.id, {
      amountPaid: Math.min(selectedBooking.totalAmount, newPaid),
    })
    setAddPaymentAmount('')
    setIsAddingPayment(false)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={() => setSelectedBooking(null)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/60">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-brand">
                  {selectedBooking.id}
                </span>
                <select
                  value={selectedBooking.status}
                  onChange={(e) =>
                    updateBooking(selectedBooking.id, { status: e.target.value as BookingStatus })
                  }
                  className="text-xs font-bold px-2.5 py-0.5 rounded-full border border-slate-200 bg-white cursor-pointer focus:outline-hidden"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <h3 className="text-lg font-black text-slate-800 tracking-tight mt-1.5">
                {selectedBooking.customerName}
              </h3>
              <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-[#ff7675]" />
                {selectedBooking.destination}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedBooking(null)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-5 space-y-5 flex-1">
            {/* Quick Contacts */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-canvas border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                  Phone
                </span>
                <span className="text-xs font-bold text-slate-800 mt-1 block truncate">
                  {selectedBooking.phone || 'N/A'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-canvas border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                  Email
                </span>
                <span className="text-xs font-bold text-slate-800 mt-1 block truncate">
                  {selectedBooking.email || 'N/A'}
                </span>
              </div>
            </div>

            {/* Travel Details */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-2.5">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Trip Details
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 block">Departure</span>
                  <span className="font-bold text-slate-700">{formatDate(selectedBooking.departure)}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Return</span>
                  <span className="font-bold text-slate-700">{formatDate(selectedBooking.returnDate)}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Travellers</span>
                  <span className="font-bold text-slate-700">{selectedBooking.travellers} Pax</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Assigned Staff</span>
                  <span className="font-bold text-slate-700">{selectedBooking.assignedTo || 'Unassigned'}</span>
                </div>
              </div>

              {selectedBooking.package && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400 block">Selected Package</span>
                  <span className="text-xs font-bold text-brand">{selectedBooking.package}</span>
                </div>
              )}
            </div>

            {/* Financial & Payment Card */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-brand" /> Financials & Payment
                </h4>
                <button
                  type="button"
                  onClick={() => setIsAddingPayment(!isAddingPayment)}
                  className="text-xs font-bold text-brand hover:underline"
                >
                  + Add Deposit
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold block">TOTAL</span>
                  <span className="text-xs font-black text-slate-800 mt-0.5 block">
                    {formatCurrency(selectedBooking.totalAmount)}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                  <span className="text-[10px] text-emerald-600 font-bold block">COLLECTED</span>
                  <span className="text-xs font-black text-emerald-700 mt-0.5 block">
                    {formatCurrency(selectedBooking.amountPaid)}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-100">
                  <span className="text-[10px] text-amber-600 font-bold block">PENDING</span>
                  <span className="text-xs font-black text-amber-700 mt-0.5 block">
                    {formatCurrency(balanceDue)}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-[#22c55e] rounded-full transition-all duration-300"
                  style={{ width: `${percentPaid}%` }}
                />
              </div>

              {/* Add Payment Form */}
              {isAddingPayment && (
                <form onSubmit={handleRecordPayment} className="pt-2 border-t border-slate-100 flex gap-2">
                  <input
                    type="number"
                    min="1"
                    placeholder="Amount (₹)..."
                    value={addPaymentAmount}
                    onChange={(e) => setAddPaymentAmount(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:border-brand"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-xl bg-brand text-white text-xs font-bold hover:bg-brand-hover transition"
                  >
                    Save
                  </button>
                </form>
              )}
            </div>

            {/* Notes Section */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" /> Booking Notes
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed bg-canvas p-3 rounded-xl border border-slate-100">
                {selectedBooking.notes || 'No notes added for this booking yet.'}
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (confirm(`Delete booking for ${selectedBooking.customerName}?`)) {
                  deleteBooking(selectedBooking.id)
                }
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 p-2 rounded-xl hover:bg-rose-50 transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete booking</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedBooking(null)}
              className="px-4 py-2 rounded-xl bg-brand text-white text-xs font-bold hover:bg-brand-hover transition"
            >
              Close
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}
