import React, { useState } from 'react'
import { LeadsSidebar } from '../leads/components/LeadsSidebar'
import { useLeads } from '../../context/LeadsContext'
import { useToast } from '../../components/ui/Toast'
import {
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Plus,
  Phone,
  MessageCircle,
  Search,
  Menu,
  X,
} from 'lucide-react'

interface FollowUpsPageProps {
  onNavigateMenu?: (menu: string) => void
}

interface FollowUpItem {
  id: string
  leadId: string
  leadName: string
  phone: string
  destination: string
  dueDate: string
  dueTime: string
  type: 'call' | 'whatsapp' | 'email' | 'meeting'
  note: string
  status: 'pending' | 'completed' | 'overdue'
}

export const FollowUpsPage: React.FC<FollowUpsPageProps> = ({ onNavigateMenu }) => {
  const { leads } = useLeads()
  const { toast } = useToast()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'overdue' | 'completed'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // Initial mock follow-ups with fallback to real leads
  const [followUps, setFollowUps] = useState<FollowUpItem[]>(() => {
    const saved = localStorage.getItem('treki_crm_follow_ups')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        // fallback
      }
    }
    return [
      {
        id: 'fu-1',
        leadId: 'lead-1',
        leadName: 'Amit Sharma',
        phone: '+91 98765 43210',
        destination: 'Kashmir Holiday Package',
        dueDate: '2026-11-20',
        dueTime: '11:30 AM',
        type: 'whatsapp',
        note: 'Send revised hotel quotation for 4-star Dal Lake houseboat upgrade.',
        status: 'pending',
      },
      {
        id: 'fu-2',
        leadId: 'lead-2',
        leadName: 'Pooja Verma',
        phone: '+91 98111 22334',
        destination: 'Goa Weekend Trip',
        dueDate: '2026-11-19',
        dueTime: '04:00 PM',
        type: 'call',
        note: 'Follow up on booking advance payment confirmation link.',
        status: 'overdue',
      },
      {
        id: 'fu-3',
        leadId: 'lead-3',
        leadName: 'Vikram Mehta',
        phone: '+91 99887 76655',
        destination: 'Dubai Family 6D/5N',
        dueDate: '2026-11-22',
        dueTime: '02:00 PM',
        type: 'call',
        note: 'Discuss flight timings and visa requirements for family members.',
        status: 'pending',
      },
      {
        id: 'fu-4',
        leadId: 'lead-4',
        leadName: 'Sneha Patel',
        phone: '+91 97766 55443',
        destination: 'Kerala Backwaters',
        dueDate: '2026-11-18',
        dueTime: '10:00 AM',
        type: 'whatsapp',
        note: 'Shared brochure and customized itinerary via WhatsApp.',
        status: 'completed',
      },
    ]
  })

  // Modal form states
  const [newLeadId, setNewLeadId] = useState(leads[0]?.id || '')
  const [newDueDate, setNewDueDate] = useState('2026-11-20')
  const [newDueTime, setNewDueTime] = useState('11:00 AM')
  const [newType, setNewType] = useState<'call' | 'whatsapp' | 'email' | 'meeting'>('call')
  const [newNote, setNewNote] = useState('')

  const saveFollowUps = (updated: FollowUpItem[]) => {
    setFollowUps(updated)
    localStorage.setItem('treki_crm_follow_ups', JSON.stringify(updated))
  }

  const handleToggleComplete = (id: string) => {
    const updated = followUps.map((item) => {
      if (item.id === id) {
        const nextStatus = item.status === 'completed' ? 'pending' : 'completed'
        return { ...item, status: nextStatus as 'pending' | 'completed' }
      }
      return item
    })
    saveFollowUps(updated)
    toast({
      type: 'success',
      title: 'Status Updated',
      description: 'Follow-up marked as completed.',
    })
  }

  const handleCreateFollowUp = (e: React.FormEvent) => {
    e.preventDefault()
    const selectedLead = leads.find((l) => l.id === newLeadId)
    const newItem: FollowUpItem = {
      id: `fu-${Date.now()}`,
      leadId: newLeadId,
      leadName: selectedLead ? selectedLead.name : 'Prospective Client',
      phone: selectedLead ? selectedLead.phone : '+91 98765 00000',
      destination: selectedLead ? selectedLead.destination : 'Custom Travel Inquiry',
      dueDate: newDueDate,
      dueTime: newDueTime,
      type: newType,
      note: newNote || 'Follow up on travel itinerary and quotes.',
      status: 'pending',
    }
    const updated = [newItem, ...followUps]
    saveFollowUps(updated)
    setIsAddModalOpen(false)
    setNewNote('')
    toast({
      type: 'success',
      title: 'Follow-up Scheduled',
      description: `Scheduled follow-up for ${newItem.leadName} on ${newItem.dueDate}.`,
    })
  }

  // Filter logic
  const filteredItems = followUps.filter((item) => {
    const matchesSearch =
      item.leadName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.note.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false

    if (filter === 'all') return true
    if (filter === 'completed') return item.status === 'completed'
    if (filter === 'overdue') return item.status === 'overdue'
    if (filter === 'today') return item.dueDate === '2026-11-19' && item.status !== 'completed'
    if (filter === 'upcoming') return item.dueDate > '2026-11-19' && item.status !== 'completed'
    return true
  })

  const stats = {
    total: followUps.length,
    today: followUps.filter((i) => i.dueDate === '2026-11-19' && i.status !== 'completed').length,
    overdue: followUps.filter((i) => i.status === 'overdue').length,
    completed: followUps.filter((i) => i.status === 'completed').length,
  }

  return (
    <div className="min-h-screen bg-[#f3f4f8] flex text-slate-800 font-sans">
      <LeadsSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        currentPath="Follow-ups"
        onSelectMenu={onNavigateMenu}
      />

      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <main className="flex-1 p-3 sm:p-5 lg:p-6 max-w-7xl w-full mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                  Follow-ups
                </h1>
                <p className="text-xs text-slate-400 font-medium">
                  Track scheduled calls, messages, and reminders for your travel leads.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#453372] text-white font-semibold text-xs shadow-md hover:bg-[#382860] transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add follow-up</span>
            </button>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">Due Today</span>
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-[#453372] flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-800">{stats.today}</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-amber-600">Overdue</span>
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-amber-600">{stats.overdue}</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-emerald-600">Completed</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-emerald-600">{stats.completed}</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">Total Tasks</span>
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-800">{stats.total}</p>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-100 shadow-xs mb-5 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by client or note..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#453372] transition"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {(['all', 'today', 'upcoming', 'overdue', 'completed'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition cursor-pointer ${
                    filter === tab
                      ? 'bg-[#453372] text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Follow-up Task List */}
          <div className="space-y-3">
            {filteredItems.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-xs">
                <Clock className="w-10 h-10 text-purple-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-700">No follow-ups found</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  You're all caught up! Schedule a new follow-up reminder for your travel inquiries.
                </p>
              </div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    item.status === 'completed'
                      ? 'border-slate-100 opacity-60'
                      : item.status === 'overdue'
                      ? 'border-amber-200'
                      : 'border-slate-100 hover:border-purple-200'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <button
                      onClick={() => handleToggleComplete(item.id)}
                      className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition cursor-pointer ${
                        item.status === 'completed'
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-300 hover:border-[#453372]'
                      }`}
                    >
                      {item.status === 'completed' && <CheckCircle2 className="w-4 h-4" />}
                    </button>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-slate-800">{item.leadName}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                          {item.destination}
                        </span>
                        {item.status === 'overdue' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            Overdue
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 font-normal leading-relaxed">{item.note}</p>
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {item.dueDate}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {item.dueTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <a
                      href={`https://wa.me/${item.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition"
                      title="Send WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                    <a
                      href={`tel:${item.phone}`}
                      className="p-2 rounded-xl bg-purple-50 text-[#453372] hover:bg-purple-100 transition"
                      title="Call Client"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      {/* Add Follow-Up Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-800">Schedule Follow-up</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFollowUp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Lead
                </label>
                <select
                  value={newLeadId}
                  onChange={(e) => setNewLeadId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#453372] bg-white"
                >
                  {leads.map((lead) => (
                    <option key={lead.id} value={lead.id}>
                      {lead.name} ({lead.destination})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#453372]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Time
                  </label>
                  <input
                    type="text"
                    value={newDueTime}
                    placeholder="e.g. 11:30 AM"
                    onChange={(e) => setNewDueTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#453372]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Follow-up Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['call', 'whatsapp', 'email'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNewType(t)}
                      className={`py-2 text-xs font-semibold capitalize rounded-xl border transition cursor-pointer ${
                        newType === t
                          ? 'border-[#453372] bg-purple-50 text-[#453372]'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Notes / Agenda
                </label>
                <textarea
                  rows={3}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="What do you need to discuss or share with the traveller?"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#453372] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#453372] hover:bg-[#382860] rounded-xl shadow-md transition cursor-pointer"
                >
                  Save follow-up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
