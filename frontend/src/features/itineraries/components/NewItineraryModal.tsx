import { usePackages } from '../../../context/PackagesContext'
import { useTeam } from '../../../context/TeamContext'
import React, { useState } from 'react'
import { X, MapPin, Sparkles } from 'lucide-react'
import { useItineraries } from '../../../context/ItinerariesContext'
import { useToast } from '../../../components/ui/Toast'
import type { ItineraryStatus } from '../../../types/itinerary.types'

interface NewItineraryModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated?: (itineraryId: string) => void
}

export const NewItineraryModal: React.FC<NewItineraryModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const { members } = useTeam()
  const { packages } = usePackages()
  const { addItinerary } = useItineraries()
  const { toast } = useToast()

  const [customerName, setCustomerName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [destination, setDestination] = useState('')
  const [status, setStatus] = useState<ItineraryStatus>('Pending')
  const [departure, setDeparture] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [travellers, setTravellers] = useState<number>(2)
  const [totalAmount, setTotalAmount] = useState<number>(0)
  const [amountPaid, setAmountPaid] = useState<number>(0)
  const [currency, setCurrency] = useState('INR')
  const [selectedPackage, setSelectedPackage] = useState('No package')
  const [assignedTo, setAssignedTo] = useState('Unassigned')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handlePackageChange = (pkgName: string) => {
    setSelectedPackage(pkgName)
    const travelPackage = packages.find(({ name }) => name === pkgName)
    if (!destination && travelPackage?.destination) setDestination(travelPackage.destination)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!customerName.trim()) {
      toast({ title: 'Please enter the customer name', type: 'error' })
      return
    }

    if (!destination.trim()) {
      toast({ title: 'Please enter the destination', type: 'error' })
      return
    }

    setIsSubmitting(true)
    try {
      const packageDays = packages.find(({ name }) => name === selectedPackage)?.itineraryDays?.map((day) => ({
        id: day.id,
        dayNumber: day.dayNumber,
        title: day.title,
        description: day.dayPlan,
        hotel: day.stay || undefined,
        activities: day.activities?.split(',').map((item) => item.trim()).filter(Boolean),
        meals: day.meals?.split(',').map((item) => item.trim()).filter(Boolean),
      }))

      const created = await addItinerary({
        customerName: customerName.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        destination: destination.trim(),
        status,
        departure: departure || new Date().toISOString().split('T')[0],
        returnDate: returnDate || undefined,
        travellers: Number(travellers) || 1,
        totalAmount: Number(totalAmount) || 0,
        amountPaid: Number(amountPaid) || 0,
        currency: currency || 'INR',
        package: selectedPackage !== 'No package' ? selectedPackage : undefined,
        assignedTo: assignedTo !== 'Unassigned' ? assignedTo : undefined,
        notes: notes.trim() || undefined,
        days: packageDays,
      })

      toast({ title: `Itinerary created for ${customerName}`, type: 'success' })
      onClose()
      if (onCreated) {
        onCreated(created.id)
      }
    } catch (error) {
      console.error(error)
      toast({ title: 'Failed to create itinerary', type: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-100 bg-white">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">New itinerary</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Choose a package to prefill the trip — or leave it blank — then design the day-by-day plan next.
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
          {/* Customer Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Customer name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required

              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
            />
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email</label>
              <input
                type="email"

                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Phone</label>
              <input
                type="tel"

                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
              />
            </div>
          </div>

          {/* Destination & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Destination <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required

                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ItineraryStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
              >
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Draft">Draft</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Departure, Return & Travellers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Departure</label>
              <div className="relative">
                <input
                  type="date"
                  value={departure}
                  onChange={(e) => setDeparture(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Return</label>
              <div className="relative">
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Travellers</label>
              <input
                type="number"
                min="1"
                placeholder="2"
                value={travellers}
                onChange={(e) => setTravellers(parseInt(e.target.value) || 1)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
              />
            </div>
          </div>

          {/* Total amount, Amount paid & Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Total amount</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={totalAmount || ''}
                onChange={(e) => setTotalAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Amount paid</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={amountPaid || ''}
                onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="AED">AED (د.إ)</option>
              </select>
            </div>
          </div>

          {/* Package & Assigned to */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">Package</label>
                {selectedPackage !== 'No package' && (
                  <span className="text-[11px] text-brand font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Auto-fills plan
                  </span>
                )}
              </div>
              <select
                value={selectedPackage}
                onChange={(e) => handlePackageChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
              >
                <option value="No package">No package</option>
                {packages.map(({ id, name }) => <option key={id} value={name}>{name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Assigned to</label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
              >
                <option value="Unassigned">Unassigned</option>
                {members.map(({ id, name }) => <option key={id} value={name}>{name}</option>)}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Notes</label>
            <textarea
              rows={3}
              placeholder="Anything useful about this trip..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all resize-none"
            />
          </div>

          {/* Actions */}
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
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-sm font-semibold shadow-sm hover:shadow transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-purple-200" />
              <span>{isSubmitting ? 'Creating...' : 'Create itinerary'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
