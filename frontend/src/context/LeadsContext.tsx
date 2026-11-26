import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { Dispatch, ReactNode, SetStateAction } from 'react'
import { useRouter } from './RouterContext'
import { useAuth } from './AuthContext'
import { useToast } from '../components/ui/Toast'
import { useWorkspace } from '../features/workspace/WorkspaceAccess'
import { leadsService, type LeadsApiResponse } from '../services/leadsService'
import type { CsvLeadRow, Lead, LeadActivity, LeadFilters, LeadStage } from '../types/lead.types'

type NewLead = Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'activities'>
type NewActivity = Omit<LeadActivity, 'id' | 'leadId' | 'timestamp'>
type Sort = { field: keyof Lead; direction: 'asc' | 'desc' }

interface LeadState {
  leads: Lead[]
  stats: LeadsApiResponse['stats']
  pagination: LeadsApiResponse['pagination']
  loading: boolean
  loadError: string
  refresh: () => void
  filters: LeadFilters
  updateFilter: <K extends keyof LeadFilters>(key: K, value: LeadFilters[K]) => void
  resetFilters: () => void
  sort: Sort
  setSort: (field: keyof Lead) => void
  setPage: (page: number) => void
  addLead: (data: NewLead, requestId?: string) => Promise<Lead | undefined>
  updateLead: (id: string, updates: Partial<Lead>) => void
  changeLeadStage: (id: string, stage: LeadStage, lostReason?: string) => Promise<Lead | undefined>
  archiveLead: (id: string, archived: boolean) => void
  importLeads: (rows: CsvLeadRow[]) => Promise<Awaited<ReturnType<typeof leadsService.importLeads>> | undefined>
  addLeadActivity: (id: string, data: NewActivity) => Promise<Lead | undefined>
  selectedLead: Lead | null
  setSelectedLead: Dispatch<SetStateAction<Lead | null>>
  lostLeadId: string | null
  setLostLeadId: Dispatch<SetStateAction<string | null>>
  isNewLeadModalOpen: boolean
  setIsNewLeadModalOpen: (open: boolean) => void
  isImportModalOpen: boolean
  setIsImportModalOpen: (open: boolean) => void
  isFiltersDrawerOpen: boolean
  setIsFiltersDrawerOpen: (open: boolean) => void
}

const defaults: LeadFilters = { search: '', stage: 'All', temperature: 'All', destination: '', assignedTo: '', customerType: 'All', source: 'All', view: 'all' }
const empty: LeadsApiResponse = { leads: [], stats: { overall: 0, today: 0, converted: 0, open: 0, stages: {} }, pagination: { page: 1, total: 0, totalPages: 1 } }
const Context = createContext<LeadState | undefined>(undefined)

export function LeadsProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  const { path } = useRouter()
  const { access } = useWorkspace()
  const { toast } = useToast()
  const enabled = path === '/leads' && Boolean(token && access?.modules.includes('leads'))
  const [result, setResult] = useState(empty)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [filters, setFilters] = useState(defaults)
  const [page, setPage] = useState(1)
  const [sort, updateSort] = useState<Sort>({ field: 'createdAt', direction: 'desc' })
  const [revision, setRevision] = useState(0)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [lostLeadId, setLostLeadId] = useState<string | null>(null)
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isFiltersDrawerOpen, setIsFiltersDrawerOpen] = useState(false)
  const refresh = useCallback(() => setRevision((number) => number + 1), [])

  useEffect(() => {
    if (!enabled) return
    const controller = new AbortController()
    setLoading(true)
    const timer = window.setTimeout(() => {
      leadsService.getLeads({ ...filters, page, sort: sort.field, direction: sort.direction }, controller.signal)
        .then(
          (data) => { if (!controller.signal.aborted) { setResult(data); setLoadError('') } },
          (error: Error) => { if (!controller.signal.aborted) setLoadError(error.message) },
        ).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    }, filters.search ? 180 : 0)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [enabled, filters, page, sort, revision])

  useEffect(() => {
    if (!enabled) return
    window.addEventListener('focus', refresh)
    return () => window.removeEventListener('focus', refresh)
  }, [enabled, refresh])

  const updateFilter = useCallback(<K extends keyof LeadFilters>(key: K, value: LeadFilters[K]) => {
    setPage(1)
    setFilters((previous) => ({ ...previous, [key]: value }))
  }, [])
  const resetFilters = useCallback(() => { setPage(1); setFilters(defaults) }, [])

  const setSort = (field: keyof Lead) => {
    setPage(1)
    updateSort((prior) => ({ field, direction: prior.field === field && prior.direction === 'asc' ? 'desc' : 'asc' }))
  }

  async function mutate<T>(operation: () => Promise<T>) {
    try {
      const value = await operation()
      refresh()
      return value
    } catch (error) {
      toast({ type: 'error', title: 'Lead update failed', description: (error as Error).message })
    }
  }
  const updateDrawer = (lead: Lead) => setSelectedLead((current) => current?.id === lead.id ? { ...current, ...lead, archivedAt: lead.archivedAt, lostReason: lead.lostReason, closedAt: lead.closedAt } : current)
  const changeLeadStage: LeadState['changeLeadStage'] = async (id, stage, reason) => {
    if (stage === 'Lost' && !reason) { setLostLeadId(id); return }
    return mutate(async () => {
      const lead = await leadsService.changeStage(id, stage, reason)
      updateDrawer(lead)
      return lead
    })
  }

  return <Context.Provider value={{
    ...result, loading, loadError, refresh, filters, updateFilter, resetFilters, sort, setSort, setPage,
    addLead: (data, requestId) => mutate(() => leadsService.createLead(data, requestId)),
    updateLead: (id, updates) => { void mutate(async () => updateDrawer(await leadsService.updateLead(id, updates))) },
    changeLeadStage,
    archiveLead: (id, archived) => { void mutate(async () => {
      const lead = await leadsService.archiveLead(id, archived)
      updateDrawer({ ...lead, archivedAt: lead.archivedAt })
      toast({ type: 'success', title: archived ? 'Lead archived' : 'Lead restored' })
    }) },
    importLeads: (rows) => mutate(() => leadsService.importLeads(rows)),
    addLeadActivity: (id, data) => mutate(async () => {
      const lead = await leadsService.addActivity(id, data)
      updateDrawer(lead)
      return lead
    }),
    selectedLead, setSelectedLead, lostLeadId, setLostLeadId, isNewLeadModalOpen, setIsNewLeadModalOpen,
    isImportModalOpen, setIsImportModalOpen, isFiltersDrawerOpen, setIsFiltersDrawerOpen,
  }}>{children}</Context.Provider>
}

export function useLeads() {
  const state = useContext(Context)
  if (!state) throw new Error('useLeads must be used within a LeadsProvider')
  return state
}
