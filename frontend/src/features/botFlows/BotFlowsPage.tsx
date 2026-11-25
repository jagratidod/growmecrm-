import React, { useState, useEffect, useCallback } from 'react'
import { LeadsSidebar } from '../leads/components/LeadsSidebar'
import { useToast } from '../../components/ui/Toast'
import {
  GitFork,
  Plus,
  Menu,
  Zap,
  Trash2,
  X,
  Search,
  MessageCircle,
  Globe,
  Loader2,
} from 'lucide-react'

const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
)
import {
  botFlowsService,
  type BotFlowItem,
  type BotChannel,
  type BotTriggerType,
} from '../../services/botFlowsService'

interface BotFlowsPageProps {
  onNavigateMenu?: (menu: string) => void
}

const TRIGGER_PRESETS: Array<{ label: string; type: BotTriggerType; defaultText: string }> = [
  {
    label: 'First Inbound Message',
    type: 'FIRST_MESSAGE',
    defaultText: 'First message from new phone number or DM',
  },
  {
    label: 'Get Quote Button Clicked',
    type: 'GET_QUOTE',
    defaultText: 'Traveller clicks "Get Quote" button',
  },
  {
    label: 'After Hours Auto-Reply',
    type: 'OFF_HOURS',
    defaultText: 'Message received outside configured business hours',
  },
  {
    label: 'Trip Completed / Post-Travel',
    type: 'TRIP_COMPLETED',
    defaultText: 'Booking status changes to "Trip Completed"',
  },
  {
    label: 'Keyword Match',
    type: 'KEYWORD',
    defaultText: 'Message contains configured keywords',
  },
]

export const BotFlowsPage: React.FC<BotFlowsPageProps> = ({ onNavigateMenu }) => {
  const { toast } = useToast()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [flows, setFlows] = useState<BotFlowItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedChannel, setSelectedChannel] = useState<BotChannel | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Create Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formName, setFormName] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formChannel, setFormChannel] = useState<BotChannel>('all')
  const [formTriggerType, setFormTriggerType] = useState<BotTriggerType>('FIRST_MESSAGE')
  const [formTrigger, setFormTrigger] = useState(TRIGGER_PRESETS[0].defaultText)
  const [formInitialMessage, setFormInitialMessage] = useState('')

  // Fetch flows from API
  const fetchFlows = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await botFlowsService.getBotFlows()
      setFlows(res.flows)
    } catch (error) {
      toast({ type: 'error', title: 'Could not load flows', description: (error as Error).message })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchFlows()
  }, [fetchFlows])

  // Toggle active/pause
  const handleToggle = async (id: string) => {
    const target = flows.find((f) => f.id === id)
    if (!target) return

    const newEnabled = !target.enabled

    // Optimistic update
    setFlows((prev) =>
      prev.map((f) => (f.id === id ? { ...f, enabled: newEnabled } : f))
    )

    try {
      await botFlowsService.toggleBotFlow(id)
      toast({
        type: newEnabled ? 'success' : 'info',
        title: newEnabled ? 'Bot Flow Activated' : 'Bot Flow Paused',
        description: `${target.name} is now ${newEnabled ? 'live' : 'paused'}.`,
      })
    } catch {
      // Revert if API failed
      setFlows((prev) =>
        prev.map((f) => (f.id === id ? { ...f, enabled: target.enabled } : f))
      )
      toast({
        type: 'error',
        title: 'Update Failed',
        description: 'Could not update flow status.',
      })
    }
  }

  // Delete Flow
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return

    const prevFlows = [...flows]
    setFlows((prev) => prev.filter((f) => f.id !== id))

    try {
      await botFlowsService.deleteBotFlow(id)
      toast({
        type: 'info',
        title: 'Flow Deleted',
        description: `"${name}" has been removed.`,
      })
    } catch {
      setFlows(prevFlows)
      toast({
        type: 'error',
        title: 'Delete Failed',
        description: 'Failed to delete flow from backend.',
      })
    }
  }

  // Handle Create Submit
  const handleCreateFlow = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim() || !formInitialMessage.trim()) {
      toast({ type: 'error', title: 'Enter a flow name and an initial message' })
      return
    }

    try {
      setIsSubmitting(true)
      const newFlowData = {
        name: formName.trim(),
        description: formDescription.trim(),
        channel: formChannel,
        trigger: formTrigger.trim(),
        triggerType: formTriggerType,
        enabled: false,
        stepsCount: 1,
        steps: [
          {
            id: 'step-1',
            stepNumber: 1,
            stepType: 'send_message' as const,
            content: formInitialMessage.trim(),
            options: [],
            delaySeconds: 1,
          },
        ],
      }

      const res = await botFlowsService.createBotFlow(newFlowData)
      if (res?.flow) {
        setFlows((prev) => [res.flow, ...prev])
      } else {
        await fetchFlows()
      }

      toast({
        type: 'success',
        title: 'Bot Flow Created',
      })

      // Reset and close
      setFormName('')
      setFormDescription('')
      setFormInitialMessage('')
      setFormChannel('all')
      setFormTriggerType('FIRST_MESSAGE')
      setFormTrigger(TRIGGER_PRESETS[0].defaultText)
      setIsCreateModalOpen(false)
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Creation Failed',
        description: err.message || 'Could not create bot flow.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter flows
  const filteredFlows = flows.filter((f) => {
    const matchesChannel =
      selectedChannel === 'all' || f.channel === 'all' || f.channel === selectedChannel
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.trigger.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesChannel && matchesSearch
  })

  return (
    <div className="min-h-screen bg-canvas flex text-slate-800 font-sans">
      <LeadsSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        currentPath="Bot Flows"
        onSelectMenu={onNavigateMenu}
      />

      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <main className="flex-1 p-3 sm:p-5 lg:p-6 max-w-7xl w-full mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                  <span>Bot Flows</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-brand border border-purple-200">
                    AI Automated
                  </span>
                </h1>
                <p className="text-xs text-slate-400 font-medium">
                  Conversational automation, lead qualification, and quick-reply triggers for WhatsApp & Instagram.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand text-white font-semibold text-xs shadow-md hover:bg-brand-hover transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create bot flow</span>
            </button>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-xs mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Channel Pills */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setSelectedChannel('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  selectedChannel === 'all'
                    ? 'bg-brand text-white'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>All Channels</span>
              </button>
              <button
                onClick={() => setSelectedChannel('whatsapp')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  selectedChannel === 'whatsapp'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
              <button
                onClick={() => setSelectedChannel('instagram')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  selectedChannel === 'instagram'
                    ? 'bg-pink-600 text-white'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <InstagramIcon className="w-3.5 h-3.5" />
                <span>Instagram</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search bot flows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand focus:bg-white transition"
              />
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-brand mb-3" />
              <p className="text-xs font-medium">Loading automation flows...</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredFlows.length === 0 && (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-brand flex items-center justify-center mx-auto mb-3">
                <GitFork className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 mb-1">No Bot Flows Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                {searchQuery
                  ? 'No flows match your current search query.'
                  : 'Start by creating your first automated chat response or lead qualifier.'}
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand text-white font-semibold text-xs shadow-sm hover:bg-brand-hover transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create first flow</span>
              </button>
            </div>
          )}

          {/* Flow Cards Grid */}
          {!isLoading && filteredFlows.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFlows.map((flow) => (
                <div
                  key={flow.id}
                  className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col justify-between hover:border-purple-200 transition"
                >
                  <div>
                    {/* Top row: Icon + Channel + Toggle */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-purple-50 text-brand flex items-center justify-center font-bold">
                          <GitFork className="w-4 h-4" />
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            flow.channel === 'whatsapp'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : flow.channel === 'instagram'
                              ? 'bg-pink-50 text-pink-700 border border-pink-200'
                              : 'bg-purple-50 text-brand border border-purple-200'
                          }`}
                        >
                          {flow.channel}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleToggle(flow.id)}
                          aria-label={`Toggle ${flow.name}`}
                          className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                            flow.enabled ? 'bg-brand' : 'bg-slate-300'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full bg-white shadow-xs absolute top-0.5 transition-transform ${
                              flow.enabled ? 'left-5.5' : 'left-0.5'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-bold text-sm text-slate-800 mb-1.5">{flow.name}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed mb-4">
                      {flow.description}
                    </p>
                  </div>

                  {/* Bottom Trigger & Action Bar */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="truncate max-w-[170px] sm:max-w-[210px]" title={flow.trigger}>
                        {flow.trigger}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-semibold text-slate-600 text-[11px]">
                        {flow.stepsCount || flow.steps?.length || 0} steps
                      </span>

                      {/* Delete flow */}
                      <button
                        onClick={() => handleDelete(flow.id, flow.name)}
                        title="Delete flow"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* CREATE BOT FLOW MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <GitFork className="w-5 h-5 text-brand" />
                  <span>Create Bot Flow</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Automate chat replies and lead qualification for WhatsApp & Instagram.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateFlow} className="space-y-4">
              {/* Flow Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Flow Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required

                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition"
                />
              </div>

              {/* Channel Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Channel</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormChannel('all')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      formChannel === 'all'
                        ? 'bg-purple-50 border-brand text-brand'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>All</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormChannel('whatsapp')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      formChannel === 'whatsapp'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormChannel('instagram')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      formChannel === 'instagram'
                        ? 'bg-pink-50 border-pink-600 text-pink-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <InstagramIcon className="w-3.5 h-3.5" />
                    <span>Instagram</span>
                  </button>
                </div>
              </div>

              {/* Trigger Preset Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Trigger Event <span className="text-red-500">*</span>
                </label>
                <select
                  value={formTriggerType}
                  onChange={(e) => {
                    const selected = TRIGGER_PRESETS.find((p) => p.type === e.target.value)
                    setFormTriggerType(e.target.value as BotTriggerType)
                    if (selected) {
                      setFormTrigger(selected.defaultText)
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition"
                >
                  {TRIGGER_PRESETS.map((preset) => (
                    <option key={preset.type} value={preset.type}>
                      {preset.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Trigger Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Trigger Description / Condition
                </label>
                <input
                  type="text"
                  required
                  value={formTrigger}
                  onChange={(e) => setFormTrigger(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-brand transition"
                />
              </div>

              {/* Initial Bot Welcome / Prompt Message */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Initial Message / Question Prompt
                </label>
                <textarea
                  rows={3}
                  value={formInitialMessage}
                  onChange={(e) => setFormInitialMessage(e.target.value)}
                  placeholder="Enter the automated reply message..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-brand transition"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notes / Internal Summary
                </label>
                <textarea
                  rows={2}
                  placeholder="What is the business goal of this flow?"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-brand transition"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand text-white font-semibold text-xs shadow-md hover:bg-brand-hover disabled:opacity-60 transition cursor-pointer"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save & Activate Flow</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
