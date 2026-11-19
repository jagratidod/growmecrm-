import React, { useState } from 'react'
import { X } from 'lucide-react'
import { useBookings } from '../../../context/BookingsContext'
import type { BookingStatus } from '../../../types/booking.types'

export const NewBookingModal: React.FC = () => {
  const { isNewBookingModalOpen, setIsNewBookingModalOpen, addBooking } = useBookings()

  const [customerName, setCustomerName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [destination, setDestination] = useState('')
  const [status, setStatus] = useState<BookingStatus>('Pending')
  const [departure, setDeparture] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [travellers, setTravellers] = useState(2)
  const [totalAmount, setTotalAmount] = useState<number>(100000)
  const [amountPaid, setAmountPaid] = useState<number>(0)
  const [currency, setCurrency] = useState('INR')
  const [packageName, setPackageName] = useState('No package')
  const [assignedTo, setAssignedTo] = useState('Rahul Verma')
  const [notes, setNotes] = useState('')

  const [errors, setErrors] = useState<{ customerName?: string; destination?: string }>({})

  if (!isNewBookingModalOpen) return null

  const handleClose = () => {
    setIsNewBookingModalOpen(false)
    setErrors({})
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: { customerName?: string; destination?: string } = {}
    if (!customerName.trim()) {
      newErrors.customerName = 'Customer name is required'
    }
    if (!destination.trim()) {
      newErrors.destination = 'Destination is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    addBooking({
      customerName: customerName.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      destination: destination.trim(),
      status,
      departure: departure || new Date().toISOString().slice(0, 10),
      returnDate: returnDate || undefined,
      travellers: Number(travellers) || 1,
      totalAmount: Number(totalAmount) || 0,
      amountPaid: Number(amountPaid) || 0,
      currency,
      package: packageName !== 'No package' ? packageName : undefined,
      assignedTo: assignedTo !== 'Unassigned' ? assignedTo : undefined,
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

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 flex items-start justify-between border-b border-slate-100">
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
              New booking
            </h2>
            <p className="text-xs text-slate-400 font-normal mt-0.5">
              Create a trip booking for a customer.
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
          {/* Customer Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Customer name <span className="text-[#ff7675]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ananya Sharma"
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value)
                if (errors.customerName) setErrors((prev) => ({ ...prev, customerName: undefined }))
              }}
              className="w-full bg-[#f3f4f8]/50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#453372] focus:ring-2 focus:ring-[#453372]/15 transition"
            />
            {errors.customerName && (
              <p className="text-[11px] text-[#ff7675] mt-1 font-medium">{errors.customerName}</p>
            )}
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="customer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#f3f4f8]/50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#453372] focus:ring-2 focus:ring-[#453372]/15 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
              <input
                type="tel"
                placeholder="+91 98201 00000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#f3f4f8]/50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#453372] focus:ring-2 focus:ring-[#453372]/15 transition"
              />
            </div>
          </div>

          {/* Destination & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Destination <span className="text-[#ff7675]">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Bali, Indonesia"
                value={destination}
                onChange={(e) => {
                  setDestination(e.target.value)
                  if (errors.destination) setErrors((prev) => ({ ...prev, destination: undefined }))
                }}
                className="w-full bg-[#f3f4f8]/50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#453372] focus:ring-2 focus:ring-[#453372]/15 transition"
              />
              {errors.destination && (
                <p className="text-[11px] text-[#ff7675] mt-1 font-medium">{errors.destination}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as BookingStatus)}
                className="w-full bg-[#f3f4f8]/50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:border-[#453372] focus:ring-2 focus:ring-[#453372]/15 transition"
              >
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Departure, Return & Travellers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Departure</label>
              <input
                type="date"
                value={departure}
                onChange={(e) => setDeparture(e.target.value)}
                className="w-full bg-[#f3f4f8]/50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-[#453372] focus:ring-2 focus:ring-[#453372]/15 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Return</label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full bg-[#f3f4f8]/50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-[#453372] focus:ring-2 focus:ring-[#453372]/15 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Travellers</label>
              <input
                type="number"
                min="1"
                max="100"
                value={travellers}
                onChange={(e) => setTravellers(Number(e.target.value))}
                className="w-full bg-[#f3f4f8]/50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-[#453372] focus:ring-2 focus:ring-[#453372]/15 transition"
              />
            </div>
          </div>

          {/* Total amount, Amount paid & Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Total amount</label>
              <input
                type="number"
                min="0"
                step="1000"
                value={totalAmount}
                onChange={(e) => setTotalAmount(Number(e.target.value))}
                className="w-full bg-[#f3f4f8]/50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:border-[#453372] focus:ring-2 focus:ring-[#453372]/15 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Amount paid</label>
              <input
                type="number"
                min="0"
                step="1000"
                value={amountPaid}
                onChange={(e) => setAmountPaid(Number(e.target.value))}
                className="w-full bg-[#f3f4f8]/50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:border-[#453372] focus:ring-2 focus:ring-[#453372]/15 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-[#f3f4f8]/50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:border-[#453372] focus:ring-2 focus:ring-[#453372]/15 transition"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="AED">AED (د.إ)</option>
              </select>
            </div>
          </div>

          {/* Package & Assigned to */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Package</label>
              <select
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                className="w-full bg-[#f3f4f8]/50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:border-[#453372] focus:ring-2 focus:ring-[#453372]/15 transition"
              >
                <option value="No package">No package</option>
                <option value="Honeymoon Special Villa Package">Honeymoon Special Villa Package</option>
                <option value="Luxury Desert Safari & Marina Tour">Luxury Desert Safari & Marina Tour</option>
                <option value="Gulmarg Gondola & Dal Lake Houseboat">Gulmarg Gondola & Dal Lake Houseboat</option>
                <option value="Grand European Winter Wonder">Grand European Winter Wonder</option>
                <option value="Custom Family Package">Custom Family Package</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Assigned to</label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full bg-[#f3f4f8]/50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:border-[#453372] focus:ring-2 focus:ring-[#453372]/15 transition"
              >
                <option value="Unassigned">Unassigned</option>
                <option value="Rahul Verma">Rahul Verma</option>
                <option value="Priya Nair">Priya Nair</option>
                <option value="Kushal Pareta">Kushal Pareta</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Notes</label>
            <textarea
              rows={3}
              placeholder="Anything useful about this trip..."
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
              Create booking
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
