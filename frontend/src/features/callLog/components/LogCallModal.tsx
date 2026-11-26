import { useAuth } from '../../../context/AuthContext'
import React, { useState } from 'react'
import { X, Search, PhoneCall, User } from 'lucide-react'
import { useCallLog } from '../../../context/CallLogContext'
import { useLeads } from '../../../context/LeadsContext'
import { useToast } from '../../../components/ui/Toast'
import type { PredefinedOutcome } from '../../../types/callLog.types'

interface LogCallModalProps {
  isOpen: boolean
  onClose: () => void
}

const PREDEFINED_OUTCOMES: PredefinedOutcome[] = [
  'Connected',
  'No answer',
  'Voicemail',
  'Busy',
  'Wrong number',
]

export const LogCallModal: React.FC<LogCallModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth()
  const { logCall } = useCallLog()
  const { leads } = useLeads()
  const { toast } = useToast()

  const [leadQuery, setLeadQuery] = useState('')
  const [selectedLead, setSelectedLead] = useState<{ name: string; phone: string } | null>(null)
  const [isLeadDropdownOpen, setIsLeadDropdownOpen] = useState(false)

  const [selectedOutcome, setSelectedOutcome] = useState<string>('Connected')
  const [customOutcome, setCustomOutcome] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  // Matching leads suggestions
  const matchingLeads = leads.filter(
    (l) =>
      l.name.toLowerCase().includes(leadQuery.toLowerCase()) ||
      (l.phone && l.phone.includes(leadQuery))
  )

  const handleSelectLead = (lead: { name: string; phone?: string }) => {
    setSelectedLead({ name: lead.name, phone: lead.phone || '' })
    setLeadQuery(`${lead.name} (${lead.phone || 'No phone'})`)
    setIsLeadDropdownOpen(false)
  }

  const handleSelectOutcome = (outcome: string) => {
    setSelectedOutcome(outcome)
    setCustomOutcome('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const finalLeadName = selectedLead?.name || leadQuery.trim()
    const finalLeadPhone = selectedLead?.phone || ''
    const finalOutcome = customOutcome.trim() || selectedOutcome

    if (!finalLeadName) {
      toast({ title: 'Please select or enter the lead name', type: 'error' })
      return
    }

    setIsSubmitting(true)
    try {
      await logCall({
        leadName: finalLeadName,
        leadPhone: finalLeadPhone,
        userName: user?.name || '',
        outcome: finalOutcome,
        notes: notes.trim() || undefined,
      })

      toast({
        title: 'Call logged successfully',
        description: `Logged call with ${finalLeadName} (${finalOutcome})`,
        type: 'success',
      })

      // Reset
      setLeadQuery('')
      setSelectedLead(null)
      setSelectedOutcome('Connected')
      setCustomOutcome('')
      setNotes('')
      onClose()
    } catch {
      toast({ title: 'Failed to log call', type: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8">
        {/* Modal Header matching screenshot 2 */}
        <div className="flex items-start justify-between p-6 border-b border-slate-100 bg-white">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Log a call</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Record who you called, the outcome, and any notes.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form matching screenshot 2 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Lead Search & Select Input */}
          <div className="relative">
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Lead <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                required
                placeholder="Search leads by name or phone..."
                value={leadQuery}
                onChange={(e) => {
                  setLeadQuery(e.target.value)
                  setSelectedLead(null)
                  setIsLeadDropdownOpen(true)
                }}
                onFocus={() => setIsLeadDropdownOpen(true)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
              />
            </div>

            {/* Quick Suggestions Dropdown */}
            {isLeadDropdownOpen && matchingLeads.length > 0 && (
              <div className="absolute left-0 top-full mt-1.5 w-full bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-20 max-h-48 overflow-y-auto">
                {matchingLeads.slice(0, 5).map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => handleSelectLead(l)}
                    className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center justify-between text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-brand" />
                      <span className="font-semibold text-slate-900">{l.name}</span>
                    </div>
                    <span className="text-slate-400 font-mono">{l.phone || 'No phone'}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Outcome Section matching screenshot 2 */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-slate-800">Outcome</label>

            {/* Outcome Chips */}
            <div className="flex flex-wrap gap-2">
              {PREDEFINED_OUTCOMES.map((out) => {
                const isSelected = selectedOutcome === out && !customOutcome
                return (
                  <button
                    key={out}
                    type="button"
                    onClick={() => handleSelectOutcome(out)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-brand text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    {out}
                  </button>
                )
              })}
            </div>

            {/* Custom Outcome Input */}
            <input
              type="text"
              placeholder="Or type a custom outcome..."
              value={customOutcome}
              onChange={(e) => setCustomOutcome(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
            />
          </div>

          {/* Notes Textarea matching screenshot 2 */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">Notes</label>
            <textarea
              rows={4}
              placeholder="What was discussed..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand resize-none transition-all"
            />
          </div>

          {/* Action Buttons matching screenshot 2 */}
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
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-sm font-semibold shadow-xs hover:shadow transition-all disabled:opacity-50"
            >
              <PhoneCall className="w-4 h-4 text-purple-200" />
              <span>{isSubmitting ? 'Logging...' : 'Log call'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
