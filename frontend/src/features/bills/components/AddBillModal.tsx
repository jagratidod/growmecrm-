import React, { useState } from 'react'
import { X } from 'lucide-react'
import { useBills } from '../../../context/BillsContext'
import { useBookings } from '../../../context/BookingsContext'
import type { BillCategory } from '../../../types/bill.types'

export const AddBillModal: React.FC = () => {
  const { isAddBillModalOpen, setIsAddBillModalOpen, addBill } = useBills()
  const { bookings } = useBookings()

  const [vendor, setVendor] = useState('')
  const [category, setCategory] = useState<BillCategory>('Hotel')
  const [totalAmount, setTotalAmount] = useState<number>(0)
  const [amountPaid, setAmountPaid] = useState<number>(0)
  const [currency, setCurrency] = useState('INR')
  const [billDate, setBillDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [linkedTripId, setLinkedTripId] = useState('')
  const [notes, setNotes] = useState('')

  const [error, setError] = useState('')

  if (!isAddBillModalOpen) return null

  const handleClose = () => {
    setIsAddBillModalOpen(false)
    setVendor('')
    setCategory('Hotel')
    setTotalAmount(0)
    setAmountPaid(0)
    setCurrency('INR')
    setLinkedTripId('')
    setNotes('')
    setError('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!vendor.trim()) {
      setError('Vendor name is required')
      return
    }
    if (!totalAmount || totalAmount <= 0) {
      setError('Total amount must be greater than 0')
      return
    }

    const linkedBooking = bookings.find((b) => b.id === linkedTripId)
    const linkedTripName = linkedBooking
      ? `${linkedBooking.customerName} (${linkedBooking.destination})`
      : undefined

    addBill({
      vendor: vendor.trim(),
      category,
      totalAmount: Number(totalAmount),
      amountPaid: Number(amountPaid) || 0,
      currency,
      billDate: billDate || new Date().toISOString().slice(0, 10),
      linkedTripId: linkedTripId || undefined,
      linkedTripName,
      notes: notes.trim() || undefined,
    })

    handleClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 flex items-start justify-between border-b border-slate-100">
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
              Add a bill
            </h2>
            <p className="text-xs text-slate-400 font-normal mt-0.5">
              Record a vendor cost — link it to a trip to track margin.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
          {/* Vendor & Category Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Vendor <span className="text-[#ff7675]">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Bali Grand Hotel"
                value={vendor}
                onChange={(e) => {
                  setVendor(e.target.value)
                  if (error) setError('')
                }}
                className="w-full bg-[#f3f4f8]/50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#453372] focus:ring-2 focus:ring-[#453372]/15 transition"
              />
              {error && (
                <p className="text-[11px] text-[#ff7675] mt-1 font-medium">{error}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as BillCategory)}
                className="w-full bg-[#f3f4f8]/50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:border-[#453372] focus:ring-2 focus:ring-[#453372]/15 transition cursor-pointer"
              >
                <option value="Hotel">Hotel</option>
                <option value="Flight">Flight</option>
                <option value="Transport">Transport</option>
                <option value="Sightseeing">Sightseeing</option>
                <option value="Visa">Visa</option>
                <option value="Insurance">Insurance</option>
                <option value="General">General</option>
              </select>
            </div>
          </div>

          {/* Total amount & Amount paid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Total amount <span className="text-[#ff7675]">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="500"
                required
                value={totalAmount === 0 ? '' : totalAmount}
                onChange={(e) => setTotalAmount(Number(e.target.value))}
                placeholder="0"
                className="w-full bg-[#f3f4f8]/50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:border-[#453372] focus:ring-2 focus:ring-[#453372]/15 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Amount paid</label>
              <input
                type="number"
                min="0"
                step="500"
                value={amountPaid === 0 ? '' : amountPaid}
                onChange={(e) => setAmountPaid(Number(e.target.value))}
                placeholder="0"
                className="w-full bg-[#f3f4f8]/50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:border-[#453372] focus:ring-2 focus:ring-[#453372]/15 transition"
              />
            </div>
          </div>

          {/* Currency & Bill date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-[#f3f4f8]/50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:border-[#453372] focus:ring-2 focus:ring-[#453372]/15 transition cursor-pointer"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="AED">AED (د.إ)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bill date</label>
              <input
                type="date"
                value={billDate}
                onChange={(e) => setBillDate(e.target.value)}
                className="w-full bg-[#f3f4f8]/50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:border-[#453372] focus:ring-2 focus:ring-[#453372]/15 transition"
              />
            </div>
          </div>

          {/* Link to a trip */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Link to a trip</label>
            <select
              value={linkedTripId}
              onChange={(e) => setLinkedTripId(e.target.value)}
              className="w-full bg-[#f3f4f8]/50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:border-[#453372] focus:ring-2 focus:ring-[#453372]/15 transition cursor-pointer"
            >
              <option value="">No trip (general cost)</option>
              {bookings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.customerName} — {b.destination} ({b.status})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Optional — leave empty for general agency costs.
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Notes</label>
            <textarea
              rows={3}
              placeholder="Reference number, payment method..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#f3f4f8]/50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#453372] focus:ring-2 focus:ring-[#453372]/15 transition"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs sm:text-sm font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#453372] hover:bg-[#382760] text-white text-xs sm:text-sm font-semibold shadow-sm shadow-[#453372]/30 transition active:scale-[0.99]"
            >
              Add bill
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
