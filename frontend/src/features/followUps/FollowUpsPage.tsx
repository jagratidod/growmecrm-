import { useRouter } from '../../context/RouterContext'
import React, { useState, useEffect, useMemo } from 'react'
import { LeadsSidebar } from '../leads/components/LeadsSidebar'
import { useLeadOptions } from '../leads/useLeadOptions'
import { useTeam } from '../../context/TeamContext'
import { useToast } from '../../components/ui/Toast'
import { followUpsService, type FollowUpItem } from '../../services/followUpsService'
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
  RefreshCw,
  Trash2,
  Edit2,
  ChevronDown,
  User as UserIcon,
} from 'lucide-react'

interface FollowUpsPageProps {
  onNavigateMenu?: (menu: string) => void
}

export const FollowUpsPage: React.FC<FollowUpsPageProps> = ({ onNavigateMenu }) => {
  const { search, navigate } = useRouter()
  const { members } = useTeam()
  const { toast } = useToast()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'due' | 'today' | 'upcoming' | 'overdue' | 'completed'>(() => new URLSearchParams(search).get('status') === 'due' ? 'due' : 'all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(() => !followUpsService.getCachedFollowUps())
  const [loadError, setLoadError] = useState('')

  const todayStr = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Kolkata' })

  const [followUps, setFollowUps] = useState<FollowUpItem[]>(() => followUpsService.getCachedFollowUps()?.followUps || [])

  // New task modal states (matching uploaded design)
  const [taskLeadId, setTaskLeadId] = useState('')
  const [leadSearch, setLeadSearch] = useState('')
  const { options: leads, error: leadOptionsError } = useLeadOptions(isAddModalOpen, leadSearch, taskLeadId)
  const [isSaving, setIsSaving] = useState(false)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskType, setTaskType] = useState<'follow-up' | 'call' | 'meeting' | 'email' | 'whatsapp'>('follow-up')
  const [taskDate, setTaskDate] = useState(todayStr)
  const [taskTime, setTaskTime] = useState('10:00')
  const [taskAssignee, setTaskAssignee] = useState('unassigned')
  const [taskNotes, setTaskNotes] = useState('')

  // Edit modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<FollowUpItem | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDueDate, setEditDueDate] = useState('')
  const [editDueTime, setEditDueTime] = useState('')
  const [editType, setEditType] = useState<'follow-up' | 'call' | 'whatsapp' | 'email' | 'meeting'>('follow-up')
  const [editAssignee, setEditAssignee] = useState('unassigned')
  const [editNote, setEditNote] = useState('')

  useEffect(() => {
    const query = new URLSearchParams(search)
    if (query.get('status') === 'due') setFilter('due')
    const leadId = query.get('lead')
    if (!leadId) return
    setTaskLeadId(leadId)
    setIsAddModalOpen(true)
    navigate('/follow-ups', { replace: true })
  }, [search, navigate])

  const handleOpenEdit = (item: FollowUpItem) => {
    setEditingItem(item)
    setEditTitle(item.title || item.leadName)
    setEditDueDate(item.dueDate)
    setEditDueTime(item.dueTime)
    setEditType(item.type)
    setEditAssignee(item.assignedTo || 'unassigned')
    setEditNote(item.note)
    setIsEditModalOpen(true)
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem || isSaving) return

    const selectedMember = members.find((m) => m.id === editAssignee)
    const assignedName = selectedMember
      ? selectedMember.name
      : editAssignee === 'unassigned'
      ? 'Unassigned'
      : editAssignee

    const updatedData = {
      title: editTitle,
      dueDate: editDueDate,
      dueTime: editDueTime,
      type: editType,
      assignedTo: editAssignee !== 'unassigned' ? editAssignee : '',
      assignedToName: assignedName,
      note: editNote,
    }

    setIsSaving(true)
    try {
      const res = await followUpsService.updateFollowUp(editingItem.id, updatedData)
      if (res?.followUp) {
        setFollowUps((prev) => prev.map((f) => (f.id === editingItem.id ? res.followUp : f)))
      }
      setIsEditModalOpen(false)
      toast({
        type: 'success',
        title: 'Task Updated',
        description: 'Changes saved successfully.',
      })
    } catch (error) {
      toast({ type: 'error', title: 'Could not update task', description: (error as Error).message })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteFollowUp = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the follow-up for ${name}?`)) return

    try {
      await followUpsService.deleteFollowUp(id)
      setFollowUps((prev) => prev.filter((item) => item.id !== id))
      toast({
        type: 'success',
        title: 'Follow-up Deleted',
        description: `Follow-up for ${name} removed.`,
      })
    } catch (error) {
      toast({ type: 'error', title: 'Could not delete follow-up', description: (error as Error).message })
    }
  }

  // 1. Fetch Follow-ups from Backend API on mount
  const fetchFollowUps = async (signal?: AbortSignal, fresh = false) => {
    if (!followUpsService.getCachedFollowUps()) setIsLoading(true)
    setLoadError('')
    try {
      const res = await followUpsService.getFollowUps(undefined, signal, fresh)
      if (res?.followUps) {
        setFollowUps(res.followUps)
      }
    } catch (error) {
      if (!signal?.aborted) setLoadError((error as Error).message)
    } finally {
      if (!signal?.aborted) setIsLoading(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    void fetchFollowUps(controller.signal)
    return () => controller.abort()
  }, [])

  // 2. Toggle Status (Completed <-> Pending)
  const handleToggleComplete = async (id: string) => {
    try {
      const res = await followUpsService.toggleStatus(id)
      if (res?.followUp) {
        setFollowUps((prev) => prev.map((f) => (f.id === id ? res.followUp : f)))
      }
      toast({
        type: 'success',
        title: 'Status Updated',
        description: res.message || 'Follow-up status updated.',
      })
    } catch (error) {
      toast({ type: 'error', title: 'Could not update task status', description: (error as Error).message })
    }
  }

  // 3. Create Follow-Up / Task
  const handleCreateFollowUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSaving) return
    if (!taskTitle.trim()) {
      toast({
        type: 'error',
        title: 'Validation Error',
        description: 'Please describe what needs doing.',
      })
      return
    }

    if (!taskDate) {
      toast({
        type: 'error',
        title: 'Validation Error',
        description: 'Please select a date.',
      })
      return
    }

    const matchedLead = leads.find((lead) => lead.id === taskLeadId)
    if (taskLeadId && !matchedLead) {
      toast({ type: 'error', title: 'Select an available lead.' })
      return
    }

    const selectedMember = members.find((m) => m.id === taskAssignee)
    const assignedName = selectedMember
      ? selectedMember.name
      : taskAssignee === 'unassigned'
      ? 'Unassigned'
      : taskAssignee

    const payload = {
      title: taskTitle.trim(),
      leadId: matchedLead?.id || undefined,
      leadName: matchedLead ? matchedLead.name : taskTitle.trim(),
      phone: matchedLead?.phone || '',
      destination: matchedLead?.destination || '',
      dueDate: taskDate,
      dueTime: taskTime || '10:00',
      type: taskType,
      assignedTo: taskAssignee !== 'unassigned' ? taskAssignee : undefined,
      assignedToName: assignedName,
      note: taskNotes.trim(),
    }

    setIsSaving(true)
    try {
      const res = await followUpsService.createFollowUp(payload)
      if (res?.followUp) {
        setFollowUps((prev) => [res.followUp, ...prev])
      }
      toast({
        type: 'success',
        title: 'Task Scheduled',
        description: `Scheduled "${payload.title}" for ${payload.dueDate}.`,
      })
    } catch (error) {
      toast({ type: 'error', title: 'Could not schedule task', description: (error as Error).message })
      return
    } finally {
      setIsSaving(false)
    }

    setIsAddModalOpen(false)
    setTaskTitle('')
    setTaskLeadId('')
    setTaskNotes('')
    setTaskDate(todayStr)
    setTaskTime('10:00')
    setTaskAssignee('unassigned')
    setTaskType('follow-up')
  }

  // Filter logic
  const filteredItems = useMemo(() => {
    return followUps.filter((item) => {
      const q = searchQuery.toLowerCase()
      const matchesSearch =
        (item.title && item.title.toLowerCase().includes(q)) ||
        item.leadName.toLowerCase().includes(q) ||
        item.destination.toLowerCase().includes(q) ||
        item.note.toLowerCase().includes(q) ||
        (item.assignedToName && item.assignedToName.toLowerCase().includes(q))

      if (!matchesSearch) return false

      if (filter === 'all') return true
      if (filter === 'due') return item.dueDate <= todayStr && item.status !== 'completed'
      if (filter === 'completed') return item.status === 'completed'
      if (filter === 'overdue') return item.dueDate < todayStr && item.status !== 'completed'
      if (filter === 'today') return item.dueDate === todayStr && item.status !== 'completed'
      if (filter === 'upcoming') return item.dueDate > todayStr && item.status !== 'completed'
      return true
    })
  }, [followUps, filter, searchQuery, todayStr])

  // Calculated Stats
  const stats = useMemo(() => {
    return {
      total: followUps.length,
      today: followUps.filter((i) => i.dueDate === todayStr && i.status !== 'completed').length,
      overdue: followUps.filter((i) => i.dueDate < todayStr && i.status !== 'completed').length,
      completed: followUps.filter((i) => i.status === 'completed').length,
    }
  }, [followUps, todayStr])

  return (
    <div className="min-h-screen bg-canvas flex text-slate-800 font-sans">
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

            <div className="flex items-center gap-2">
              <button
                onClick={() => void fetchFollowUps(undefined, true)}
                disabled={isLoading}
                className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-brand hover:bg-purple-50 transition cursor-pointer"
                title="Refresh from server"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => { setTaskLeadId(''); setIsAddModalOpen(true) }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand text-white font-semibold text-xs shadow-md hover:bg-brand-hover transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add follow-up</span>
              </button>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">Due Today</span>
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-brand flex items-center justify-center">
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
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-brand transition"
              />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto pb-1 sm:pb-0">
              {(['all', 'due', 'today', 'upcoming', 'overdue', 'completed'] as const).map((tab) => (
                <button
                  key={tab}
                  aria-pressed={filter === tab}
                  onClick={() => {
                    setFilter(tab)
                    if (new URLSearchParams(search).has('status')) navigate('/follow-ups', { replace: true })
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition cursor-pointer ${
                    filter === tab
                      ? 'bg-brand text-white shadow-xs'
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
            {isLoading ? <p role="status">Loading follow-ups…</p> : loadError ? (
              <div className="gm-card gm-list">
                <p role="alert" className="gm-error">{loadError}</p>
                <button type="button" className="gm-button secondary" onClick={() => void fetchFollowUps(undefined, true)}>Retry</button>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-xs">
                <Clock className="w-10 h-10 text-purple-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-700">No follow-ups found</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  {followUps.length ? 'Try a different filter or search.' : 'Schedule a task to track your next action.'}
                </p>
              </div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    item.status === 'completed'
                      ? 'border-slate-100 opacity-60'
                      : item.dueDate < todayStr
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
                          : 'border-slate-300 hover:border-brand'
                      }`}
                    >
                      {item.status === 'completed' && <CheckCircle2 className="w-4 h-4" />}
                    </button>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-slate-900">
                          {item.title || item.leadName}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 capitalize">
                          {item.type || 'follow-up'}
                        </span>
                        {item.destination && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                            {item.destination}
                          </span>
                        )}
                        {item.assignedToName && item.assignedToName !== 'Unassigned' && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-50 text-brand flex items-center gap-1">
                            <UserIcon className="w-3 h-3" />
                            {item.assignedToName}
                          </span>
                        )}
                        {(item.dueDate < todayStr && item.status !== 'completed') && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            Overdue
                          </span>
                        )}
                      </div>
                      {item.note && item.note !== item.title && (
                        <p className="text-xs text-slate-600 font-normal leading-relaxed">{item.note}</p>
                      )}
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

                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                    <a
                      href={`https://wa.me/${item.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                        `Hi ${item.leadName}, following up regarding your travel inquiry for ${item.destination}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition"
                      title="Send WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                    <a
                      href={`tel:${item.phone}`}
                      className="p-2 rounded-xl bg-purple-50 text-brand hover:bg-purple-100 transition"
                      title="Call Client"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="p-2 rounded-xl bg-slate-50 text-slate-600 hover:text-brand hover:bg-purple-50 transition cursor-pointer"
                      title="Edit Follow-up"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteFollowUp(item.id, item.leadName)}
                      className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Delete Follow-up"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      {/* Add Follow-Up / New Task Modal (matching reference screenshot) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">New task</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Schedule a call, meeting, or follow-up reminder.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFollowUp} className="space-y-4">
              <label className="gm-form text-sm font-medium">
                Linked lead
                <input type="search" aria-label="Search leads for follow-up" placeholder="Search leads by name or phone" value={leadSearch} onChange={(event) => setLeadSearch(event.target.value)} />
                {leadOptionsError && <small role="alert">{leadOptionsError}</small>}
                <select value={taskLeadId} onChange={(event) => setTaskLeadId(event.target.value)}>
                  <option value="">No lead</option>
                  {taskLeadId && !leads.some((lead) => lead.id === taskLeadId) && <option value={taskLeadId}>Loading selected lead…</option>}
                  {leads.map((lead) => <option key={lead.id} value={lead.id}>{lead.name} · {lead.destination}</option>)}
                </select>
              </label>
              {/* Field 1: What needs doing? * */}
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1.5">
                  What needs doing? <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}

                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-brand focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400 text-slate-800 transition"
                  autoFocus
                />
              </div>

              {/* Field 2: 3-column row: Type, Date *, Time */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-1.5">
                    Type
                  </label>
                  <div className="relative">
                    <select
                      value={taskType}
                      onChange={(e) => setTaskType(e.target.value as any)}
                      className="w-full appearance-none px-3.5 py-2.5 pr-8 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-brand focus:ring-4 focus:ring-indigo-500/10 bg-white text-slate-800 transition cursor-pointer"
                    >
                      <option value="follow-up">Follow-up</option>
                      <option value="call">Call</option>
                      <option value="meeting">Meeting</option>
                      <option value="email">Email</option>
                      <option value="whatsapp">WhatsApp</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Date * */}
                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-1.5">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={taskDate}
                      onChange={(e) => setTaskDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 pr-9 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-brand focus:ring-4 focus:ring-indigo-500/10 text-slate-800 transition"
                    />
                    <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Time */}
                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-1.5">
                    Time
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={taskTime}
                      onChange={(e) => setTaskTime(e.target.value)}
                      placeholder="10:00"
                      className="w-full px-3.5 py-2.5 pr-9 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-brand focus:ring-4 focus:ring-indigo-500/10 text-slate-800 transition"
                    />
                    <Clock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Field 3: Assign to */}
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1.5">
                  Assign to
                </label>
                <div className="relative">
                  <select
                    value={taskAssignee}
                    onChange={(e) => setTaskAssignee(e.target.value)}
                    className="w-full appearance-none px-3.5 py-2.5 pr-9 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-brand focus:ring-4 focus:ring-indigo-500/10 bg-white text-slate-800 transition cursor-pointer"
                  >
                    <option value="unassigned">Unassigned</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.role})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Field 4: Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1.5">
                  Notes
                </label>
                <input
                  type="text"
                  value={taskNotes}
                  onChange={(e) => setTaskNotes(e.target.value)}
                  placeholder="Optional context..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-brand focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400 text-slate-800 transition"
                />
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition cursor-pointer shadow-2xs"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={isSaving}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-brand hover:bg-[#4338ca] rounded-xl shadow-md shadow-indigo-500/20 transition cursor-pointer"
                >
                  Schedule task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Edit task</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Update task details, schedule, or assignee.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1.5">
                  What needs doing? <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Task description"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-brand focus:ring-4 focus:ring-indigo-500/10 text-slate-800 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-1.5">
                    Type
                  </label>
                  <div className="relative">
                    <select
                      value={editType}
                      onChange={(e) => setEditType(e.target.value as any)}
                      className="w-full appearance-none px-3.5 py-2.5 pr-8 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-brand focus:ring-4 focus:ring-indigo-500/10 bg-white text-slate-800 transition cursor-pointer"
                    >
                      <option value="follow-up">Follow-up</option>
                      <option value="call">Call</option>
                      <option value="meeting">Meeting</option>
                      <option value="email">Email</option>
                      <option value="whatsapp">WhatsApp</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-1.5">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={editDueDate}
                      onChange={(e) => setEditDueDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 pr-9 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-brand focus:ring-4 focus:ring-indigo-500/10 text-slate-800 transition"
                    />
                    <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-1.5">
                    Time
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={editDueTime}
                      onChange={(e) => setEditDueTime(e.target.value)}
                      placeholder="10:00"
                      className="w-full px-3.5 py-2.5 pr-9 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-brand focus:ring-4 focus:ring-indigo-500/10 text-slate-800 transition"
                    />
                    <Clock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1.5">
                  Assign to
                </label>
                <div className="relative">
                  <select
                    value={editAssignee}
                    onChange={(e) => setEditAssignee(e.target.value)}
                    className="w-full appearance-none px-3.5 py-2.5 pr-9 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-brand focus:ring-4 focus:ring-indigo-500/10 bg-white text-slate-800 transition cursor-pointer"
                  >
                    <option value="unassigned">Unassigned</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.role})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1.5">
                  Notes
                </label>
                <input
                  type="text"
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  placeholder="Optional context..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-brand focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400 text-slate-800 transition"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition cursor-pointer shadow-2xs"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={isSaving}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-brand hover:bg-[#4338ca] rounded-xl shadow-md shadow-indigo-500/20 transition cursor-pointer"
                >
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
