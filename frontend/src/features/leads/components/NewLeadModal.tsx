import React, { useState } from 'react'
import { X, Calendar as CalendarIcon } from 'lucide-react'
import { useLeads } from '../../../context/LeadsContext'
import { useToast } from '../../../components/ui/Toast'
import type { LeadStage, CustomerType, LeadSource, LeadTemperature } from '../../../types/lead.types'

export const NewLeadModal: React.FC = () => {
  const { isNewLeadModalOpen, setIsNewLeadModalOpen, addLead } = useLeads()
  const { toast } = useToast()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [source, setSource] = useState<LeadSource>('Manual')
  const [status, setStatus] = useState<LeadStage>('New')
  const [customerType, setCustomerType] = useState<CustomerType>('B2C')
  const [interestedPackage, setInterestedPackage] = useState('None')
  const [destination, setDestination] = useState('')
  const [travelDate, setTravelDate] = useState('')
  const [travelers, setTravelers] = useState(2)
  const [budget, setBudget] = useState(2500)
  const [currency, setCurrency] = useState('INR')
  const [assignedTo, setAssignedTo] = useState('Unassigned')
  const [temperature, setTemperature] = useState<LeadTemperature>('Hot')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({})

  if (!isNewLeadModalOpen) return null

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const trimmed = tagInput.trim().toLowerCase()
      if (trimmed && !tags.includes(trimmed)) {
        setTags([...tags, trimmed])
        setTagInput('')
      }
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove))
  }

  const handleClose = () => {
    setIsNewLeadModalOpen(false)
    setErrors({})
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: { name?: string; phone?: string } = {}
    if (!name.trim()) newErrors.name = 'Name is required'
    if (!phone.trim()) newErrors.phone = 'Phone number is required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    addLead({
      name: name.trim(),
      email: email.trim() || undefined,
      phone: phone.trim(),
      source,
      status,
      customerType,
      interestedPackage: interestedPackage === 'None' ? undefined : interestedPackage,
      destination: destination.trim() || 'Flexible Destination',
      travelDate: travelDate || undefined,
      travelers: Number(travelers) || 2,
      budget: Number(budget) || 0,
      currency,
      assignedTo,
      temperature,
      tags,
      notes: notes.trim() || undefined,
    })

    toast({
      type: 'success',
      title: 'Lead Created Successfully',
      description: `${name} has been added to your sales pipeline.`,
    })

    // Reset & Close
    setName('')
    setEmail('')
    setPhone('')
    setDestination('')
    setTravelDate('')
    setTravelers(2)
    setBudget(2500)
    setTags([])
    setNotes('')
    setIsNewLeadModalOpen(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between shrink-0">
          <div>
            <h3 className="text-lg font-bold text-slate-900 leading-tight">New lead</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Add a new enquiry to your pipeline.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }))
              }}
              placeholder="Full name"
              className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition ${
                errors.name
                  ? 'border-rose-400 ring-2 ring-rose-100'
                  : 'border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
              }`}
            />
            {errors.name && (
              <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.name}</p>
            )}
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value)
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }))
                }}
                placeholder="+1 555 000 0000"
                className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition ${
                  errors.phone
                    ? 'border-rose-400 ring-2 ring-rose-100'
                    : 'border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                }`}
              />
              {errors.phone && (
                <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.phone}</p>
              )}
            </div>
          </div>

          {/* Source & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as LeadSource)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="Manual">Manual</option>
                <option value="Website">Website</option>
                <option value="Facebook">Facebook</option>
                <option value="Instagram">Instagram</option>
                <option value="Google">Google</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Referral">Referral</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as LeadStage)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Proposal sent">Proposal sent</option>
                <option value="Negotiation">Negotiation</option>
                <option value="Won">Won</option>
                <option value="Lost">Lost</option>
              </select>
            </div>
          </div>

          {/* Customer type & Interested package */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Customer type
              </label>
              <select
                value={customerType}
                onChange={(e) => setCustomerType(e.target.value as CustomerType)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="B2C">B2C</option>
                <option value="B2B">B2B</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Interested package
              </label>
              <select
                value={interestedPackage}
                onChange={(e) => setInterestedPackage(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="None">None</option>
                <option value="Honeymoon Special">Honeymoon Special</option>
                <option value="Adventure Trek">Adventure Trek</option>
                <option value="Family Getaway">Family Getaway</option>
                <option value="Luxury Villa Escape">Luxury Villa Escape</option>
                <option value="Corporate Retreat">Corporate Retreat</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Optional — helps the team see what they're after.
              </p>
            </div>
          </div>

          {/* Destination & Travel date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Destination
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Bali, Indonesia"
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Travel date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
                <CalendarIcon className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Travelers, Budget & Currency (3 cols) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Travelers</label>
              <input
                type="number"
                min="1"
                value={travelers}
                onChange={(e) => setTravelers(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Budget</label>
              <input
                type="number"
                min="0"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="AED">AED</option>
              </select>
            </div>
          </div>

          {/* Assigned to & Temperature */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assigned to
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="Unassigned">Unassigned</option>
                <option value="Kushal Pareta">Kushal Pareta</option>
                <option value="Pooja Sharma">Pooja Sharma</option>
                <option value="Rahul Verma">Rahul Verma</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lead Temperature
              </label>
              <select
                value={temperature}
                onChange={(e) => setTemperature(e.target.value as LeadTemperature)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="Hot">Hot</option>
                <option value="Warm">Warm</option>
                <option value="Cold">Cold</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tags</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-slate-400 hover:text-rose-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Add a tag"
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Press Enter after each — e.g. honeymoon, hot lead.
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything useful about this enquiry..."
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none"
            />
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2.5 rounded-xl bg-[#453372] hover:bg-[#382760] text-white text-sm font-semibold shadow-sm shadow-[#453372]/25 transition active:scale-[0.99]"
          >
            Create lead
          </button>
        </div>
      </div>
    </div>
  )
}
