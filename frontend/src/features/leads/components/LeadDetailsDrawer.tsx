import { useAuth } from '../../../context/AuthContext'
import { formatBookingAmount } from '../../bookings/formatBookingAmount'
import { useRouter } from '../../../context/RouterContext'
import { useWorkspace } from '../../workspace/WorkspaceAccess'
import { useTeam } from '../../../context/TeamContext'
import React, { useState } from 'react'
import {
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Package,
  Clock,
  Archive,
  MessageCircle,
  Plus,
} from 'lucide-react'
import { useLeads } from '../../../context/LeadsContext'
import { useToast } from '../../../components/ui/Toast'
import type { LeadStage } from '../../../types/lead.types'

export const LeadDetailsDrawer: React.FC = () => {
  const { members } = useTeam()
  const { user } = useAuth()
  const canArchive = ['owner', 'admin', 'manager'].includes(user?.role || '')
  const { navigate } = useRouter()
  const { access } = useWorkspace()
  const { selectedLead, setSelectedLead, changeLeadStage, updateLead, archiveLead, addLeadActivity } = useLeads()
  const { toast } = useToast()

  const [newNote, setNewNote] = useState('')

  if (!selectedLead) return null

  const legacyAssignees = selectedLead.assignedUserId ? [] : members.filter(({ name }) => name === selectedLead.assignedTo)
  const assignedId = selectedLead.assignedUserId || (legacyAssignees.length === 1 ? legacyAssignees[0].id : '')
  const dateLabel = (value: string) => new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNote.trim()) return

    const logged = await addLeadActivity(selectedLead.id, {
      type: 'note_added',
      description: newNote.trim(),
      author: '',
    })

    if (!logged) return
    toast({
      type: 'success',
      title: 'Note Logged',
      description: 'Activity timeline updated.',
    })

    setNewNote('')
  }

  const handleLogCall = async () => {
    const logged = await addLeadActivity(selectedLead.id, {
      type: 'call',
      description: `Call logged for ${selectedLead.name}.`,
      author: '',
    })
    if (!logged) return
    toast({
      type: 'info',
      title: 'Call Logged',
      description: `Recorded call to ${selectedLead.name}.`,
    })
  }

  const handleLogWhatsApp = () => {
    addLeadActivity(selectedLead.id, {
      type: 'whatsapp',
      description: `WhatsApp chat session initiated with customer.`,
      author: '',
    })
    const sanitizedPhone = selectedLead.phone.replace(/[^0-9]/g, '')
    if (sanitizedPhone) window.open(`https://wa.me/${sanitizedPhone}`, '_blank', 'noopener,noreferrer')
  }

  const handleLogEmail = () => {
    if (selectedLead.email) {
      addLeadActivity(selectedLead.id, {
        type: 'email',
        description: `Email composer opened for ${selectedLead.email}.`,
        author: '',
      })
      window.open(`mailto:${selectedLead.email}`, '_blank')
    } else {
      toast({
        type: 'error',
        title: 'No Email Available',
        description: 'This lead has no registered email address.',
      })
    }
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Lead details" className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                {selectedLead.customerType}
              </span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded ${
                  selectedLead.source === 'WhatsApp'
                    ? 'bg-emerald-100 text-emerald-800'
                    : selectedLead.source === 'Instagram'
                    ? 'bg-pink-100 text-pink-800'
                    : selectedLead.source === 'Facebook'
                    ? 'bg-blue-100 text-blue-800'
                    : selectedLead.source === 'Website'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-slate-200 text-slate-800'
                }`}
              >
                {selectedLead.source}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-500 text-white">
                {selectedLead.temperature}
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mt-2">{selectedLead.name}</h3>

          </div>

          <button
            aria-label="Close lead details"
            onClick={() => setSelectedLead(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!selectedLead.archivedAt && <div className="flex flex-wrap gap-2">
            <button type="button" className="gm-button"
              onClick={() => { setSelectedLead(null); navigate(`/follow-ups?lead=${encodeURIComponent(selectedLead.id)}`) }}>Schedule follow-up</button>
            {access?.modules.includes('bookings') && <button type="button" className="gm-button secondary"
              onClick={() => { setSelectedLead(null); navigate(`/bookings?lead=${encodeURIComponent(selectedLead.id)}`) }}>Create booking</button>}
          </div>}
          {/* Quick Communication Actions Bar */}
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={handleLogCall}
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 hover:border-brand hover:bg-purple-50/50 text-slate-700 hover:text-brand transition shadow-xs group"
            >
              <Phone className="w-4 h-4 text-slate-500 group-hover:text-brand mb-1" />
              <span className="text-xs font-medium">Log call</span>
            </button>

            <button
              onClick={handleLogWhatsApp}
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 text-slate-700 hover:text-emerald-600 transition shadow-xs group"
            >
              <MessageCircle className="w-4 h-4 text-slate-500 group-hover:text-emerald-600 mb-1" />
              <span className="text-xs font-medium">WhatsApp</span>
            </button>

            <button
              onClick={handleLogEmail}
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 hover:border-sky-400 hover:bg-sky-50/50 text-slate-700 hover:text-sky-600 transition shadow-xs group"
            >
              <Mail className="w-4 h-4 text-slate-500 group-hover:text-sky-600 mb-1" />
              <span className="text-xs font-medium">Email</span>
            </button>

            {canArchive && <button
              onClick={() => archiveLead(selectedLead.id, !selectedLead.archivedAt)}
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 hover:border-brand text-slate-700 transition"
            >
              <Archive className="w-4 h-4 mb-1" />
              <span className="text-xs font-medium">{selectedLead.archivedAt ? 'Restore' : 'Archive'}</span>
            </button>}
          </div>

          {/* Pipeline Stage & Assigned To Controls */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                Current Stage
              </label>
              <select
                value={selectedLead.status}
                disabled={Boolean(selectedLead.archivedAt)}
                onChange={(e) => changeLeadStage(selectedLead.id, e.target.value as LeadStage)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
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

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                Assigned Team Member
              </label>
              <select
                value={assignedId}
                onChange={(event) => updateLead(selectedLead.id, { assignedUserId: event.target.value || undefined, assignedTo: event.target.value ? undefined : 'Unassigned' })}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none"
              >
                <option value="">{!assignedId && selectedLead.assignedTo !== 'Unassigned' ? selectedLead.assignedTo + ' (legacy)' : 'Unassigned'}</option>
                {assignedId && !members.some(({ id }) => id === assignedId) && <option value={assignedId}>{selectedLead.assignedTo}</option>}
                {members.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}
              </select>
            </div>
          </div>

          {(selectedLead.stageChangedAt || selectedLead.proposalSentAt || selectedLead.lostReason) && <div className="space-y-1 text-sm">
            {selectedLead.stageChangedAt && <p>In this stage since {dateLabel(selectedLead.stageChangedAt)}</p>}
            {selectedLead.proposalSentAt && <p>Proposal marked sent on {dateLabel(selectedLead.proposalSentAt)}</p>}
            {selectedLead.lostReason && <p>Lost reason · {selectedLead.lostReason}</p>}
          </div>}
          {Boolean(selectedLead.linkedBookings?.length) && <section className="gm-card space-y-3">
            <h3 className="font-bold">Linked bookings</h3>
            {selectedLead.linkedBookings?.map((booking) => <div key={booking.id} className="gm-row">
              <button type="button" className="gm-text-button" onClick={() => { setSelectedLead(null); navigate('/bookings?' + new URLSearchParams({ booking: booking.id })) }}>{booking.destination}</button>
              <span className="text-sm">{booking.status} · {formatBookingAmount(booking.amountPaid, booking.currency)} paid of {formatBookingAmount(booking.totalAmount, booking.currency)}</span>
            </div>)}
          </section>}
          {/* Lead Information Cards */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Enquiry Particulars
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                <span className="text-slate-400 flex items-center gap-1 font-medium">
                  <Phone className="w-3.5 h-3.5" /> Phone Number
                </span>
                <p className="font-semibold text-slate-800">{selectedLead.phone}</p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                <span className="text-slate-400 flex items-center gap-1 font-medium">
                  <Mail className="w-3.5 h-3.5" /> Email
                </span>
                <p className="font-semibold text-slate-800 truncate">
                  {selectedLead.email || 'None provided'}
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                <span className="text-slate-400 flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" /> Destination
                </span>
                <p className="font-semibold text-slate-800">{selectedLead.destination}</p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                <span className="text-slate-400 flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5" /> Travel Date
                </span>
                <p className="font-semibold text-slate-800">
                  {selectedLead.travelDate || 'Flexible'}
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                <span className="text-slate-400 flex items-center gap-1 font-medium">
                  <Users className="w-3.5 h-3.5" /> Party Size
                </span>
                <p className="font-semibold text-slate-800">
                  {selectedLead.travelers} Traveler{selectedLead.travelers > 1 ? 's' : ''}
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                <span className="text-slate-400 flex items-center gap-1 font-medium">
                  <DollarSign className="w-3.5 h-3.5" /> Estimated Budget
                </span>
                <p className="font-semibold text-slate-800">
                  {selectedLead.currency} {selectedLead.budget.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Interested Package & Tags */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Package & Tags
            </h4>
            <div className="flex items-center gap-2 flex-wrap">
              {selectedLead.interestedPackage && (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-medium">
                  <Package className="w-3.5 h-3.5" />
                  {selectedLead.interestedPackage}
                </span>
              )}
              {selectedLead.tags.map((t) => (
                <span
                  key={t}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700"
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>

          {/* Notes */}
          {selectedLead.notes && (
            <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/80">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block mb-1">
                Client Notes
              </span>
              <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                {selectedLead.notes}
              </p>
            </div>
          )}

          {/* Activity Timeline */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand" /> Activity Timeline
              </h4>
              <span className="text-[10px] text-slate-400">
                {selectedLead.activities?.length || 0} events recorded
              </span>
            </div>

            {/* Quick Note Input */}
            <form onSubmit={handleAddNote} className="flex items-center gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Log a call note or follow-up update..."
                className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-brand"
              />
              <button
                type="submit"
                disabled={!newNote.trim()}
                className="p-2 rounded-xl bg-brand hover:bg-brand-hover text-white disabled:opacity-50 transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            {/* Timeline Events List */}
            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {[...(selectedLead.activities || [])].sort((first, second) => Date.parse(second.timestamp) - Date.parse(first.timestamp)).map((act) => (
                <div key={act.id} className="relative group">
                  <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-brand ring-4 ring-white"></div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-800 capitalize">
                        {(act.type || 'activity').replaceAll('_', ' ')}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(act.timestamp).toLocaleString('en-IN', {
                          day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{act.description}</p>
                    <span className="text-[10px] text-slate-400 font-medium">
                      by {act.author}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>
            Created:{' '}
            <strong className="text-slate-700">
              {new Date(selectedLead.createdAt).toLocaleDateString()}
            </strong>
          </span>
          <button
            onClick={() => setSelectedLead(null)}
            className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
