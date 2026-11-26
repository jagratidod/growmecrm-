import React, { useState, useEffect } from 'react'
import { LeadsSidebar } from '../leads/components/LeadsSidebar'
import { useToast } from '../../components/ui/Toast'
import { campaignsService } from '../../services/campaignsService'
import type { CampaignItem } from '../../services/campaignsService'
import {
  Send,
  Plus,
  Search,
  MessageCircle,
  Mail,
  Menu,
  X,
  Users,
} from 'lucide-react'

interface CommunicationsPageProps {
  onNavigateMenu?: (menu: string) => void
}

export const CommunicationsPage: React.FC<CommunicationsPageProps> = ({ onNavigateMenu }) => {
  const { toast } = useToast()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [channelFilter, setChannelFilter] = useState<'all' | 'whatsapp' | 'email'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)

  const [campaigns, setCampaigns] = useState<CampaignItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [requestNumber, setRequestNumber] = useState(0)

  useEffect(() => {
    let active = true
    setLoading(true)
    setLoadError('')
    campaignsService.getCampaigns().then(
      (data) => { if (active) setCampaigns(data) },
      (error: Error) => { if (active) setLoadError(error.message) },
    ).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [requestNumber])

  // New campaign modal form
  const [title, setTitle] = useState('')
  const [channel, setChannel] = useState<'whatsapp' | 'email'>('whatsapp')
  const [audience, setAudience] = useState('All Active Leads')
  const [message, setMessage] = useState('')

  const [isSaving, setIsSaving] = useState(false)
  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSaving) return
    setIsSaving(true)
    try {
      const created = await campaignsService.createCampaign({ title, channel, audience, message })
      setCampaigns((prev) => [created, ...prev])
      setIsNewModalOpen(false)
      setTitle('')
      setMessage('')
      toast({ type: 'success', title: 'Campaign draft saved' })
    } catch (error) {
      toast({ type: 'error', title: 'Could not save campaign', description: (error as Error).message })
    } finally {
      setIsSaving(false)
    }
  }

  const filtered = campaigns.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase())
    if (!matchesSearch) return false
    if (channelFilter === 'all') return true
    return c.channel === channelFilter
  })

  return (
    <div className="min-h-screen bg-canvas flex text-slate-800 font-sans">
      <LeadsSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        currentPath="Communications"
        onSelectMenu={onNavigateMenu}
      />

      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <main className="flex-1 p-3 sm:p-5 lg:p-6 max-w-7xl w-full mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <button
                aria-label="Open menu"
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                  Communications
                </h1>
                <p className="text-xs text-slate-400 font-medium">
                  Campaign drafts and history
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsNewModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand text-white font-semibold text-xs shadow-md hover:bg-brand-hover transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New campaign draft</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-100 shadow-xs mb-5 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                aria-label="Search campaigns"
                placeholder="Search campaigns"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-brand transition"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {(['all', 'whatsapp', 'email'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setChannelFilter(tab)}
                  aria-pressed={channelFilter === tab}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition cursor-pointer ${
                    channelFilter === tab
                      ? 'bg-brand text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Campaigns List */}
          {loadError ? <div className="gm-error" role="alert">{loadError} <button className="gm-text-button" onClick={() => setRequestNumber((value) => value + 1)}>Retry</button></div>
            : loading ? <p role="status">Loading campaigns…</p>
            : !filtered.length ? <div className="gm-crm-empty"><Send className="mx-auto mb-3 text-brand" size={24} /><h2>{campaigns.length ? 'No matching campaigns' : 'No campaigns yet'}</h2></div>
            : <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <div key={item.id} className="p-4 sm:p-5 hover:bg-slate-50/50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
                        item.channel === 'whatsapp'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-purple-50 text-brand'
                      }`}
                    >
                      {item.channel === 'whatsapp' ? (
                        <MessageCircle className="w-5 h-5" />
                      ) : (
                        <Mail className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-800">{item.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {item.audience}{item.status === 'sent' && ` (${item.recipientCount} recipients)`}
                        </span>
                        {item.sentAt && <span>{item.sentAt}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        item.status === 'sent'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : item.status === 'scheduled'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.status}
                    </span>
                    {item.openRate !== '-' && (
                      <span className="text-xs font-semibold text-slate-600">
                        Read: <span className="font-bold text-emerald-600">{item.openRate}</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>}
        </main>
      </div>

      {/* New Broadcast Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-800">New campaign draft</h2>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  required

                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Channel
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setChannel('whatsapp')}
                    className={`py-2 text-xs font-semibold rounded-xl border transition cursor-pointer ${
                      channel === 'whatsapp'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    WhatsApp Broadcast
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannel('email')}
                    className={`py-2 text-xs font-semibold rounded-xl border transition cursor-pointer ${
                      channel === 'email'
                        ? 'border-purple-600 bg-purple-50 text-brand'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Email Newsletter
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Target Audience
                </label>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-brand bg-white"
                >
                  <option value="All Active Leads">All Active Leads</option>
                  <option value="Proposal Sent Stage">Proposal Sent Stage</option>
                  <option value="Past Travellers & Bookings">Past Travellers & Bookings</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Broadcast Message
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-brand resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 text-xs font-semibold text-white bg-brand hover:bg-brand-hover rounded-xl shadow-md transition cursor-pointer"
                >
                  Save draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
