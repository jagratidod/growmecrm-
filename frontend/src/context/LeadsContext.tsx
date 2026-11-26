import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { useRouter } from './RouterContext'
import { useAuth } from './AuthContext'
import { useToast } from '../components/ui/Toast'
import { useWorkspace } from '../features/workspace/WorkspaceAccess'
import { leadsService } from '../services/leadsService'
import type {
  Lead,
  LeadFilters,
  LeadStats,
  LeadStage,
  LeadActivity,
} from '../types/lead.types'

interface LeadsContextType {
  leads: Lead[]
  loading: boolean
  loadError: string
  filteredLeads: Lead[]
  stats: LeadStats
  filters: LeadFilters
  setFilters: React.Dispatch<React.SetStateAction<LeadFilters>>
  updateFilter: <K extends keyof LeadFilters>(key: K, value: LeadFilters[K]) => void
  resetFilters: () => void
  addLead: (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'activities'>) => Promise<Lead | undefined>
  updateLead: (id: string, updates: Partial<Lead>) => void
  changeLeadStage: (id: string, newStage: LeadStage) => void
  deleteLead: (id: string) => void
  importLeads: (newLeads: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'activities'>[]) => Promise<number | undefined>
  addLeadActivity: (leadId: string, activity: Omit<LeadActivity, 'id' | 'leadId' | 'timestamp'>) => Promise<Lead | undefined>
  selectedLead: Lead | null
  setSelectedLead: (lead: Lead | null) => void
  isNewLeadModalOpen: boolean
  setIsNewLeadModalOpen: (open: boolean) => void
  isImportModalOpen: boolean
  setIsImportModalOpen: (open: boolean) => void
  isFiltersDrawerOpen: boolean
  setIsFiltersDrawerOpen: (open: boolean) => void
}

const INITIAL_FILTERS: LeadFilters = {
  search: '',
  stage: 'All',
  temperature: 'All',
  destination: '',
  assignedTo: '',
  customerType: 'All',
  source: 'All',
}

const LeadsContext = createContext<LeadsContextType | undefined>(undefined)

export const LeadsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user } = useAuth()
  const { path } = useRouter()
  const { access } = useWorkspace()
  const { toast } = useToast()
  const enabled = (Boolean(token && access?.modules.includes('leads'))) && (['/leads', '/follow-ups', '/call-log'].includes(path))
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [filters, setFilters] = useState<LeadFilters>(INITIAL_FILTERS)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isFiltersDrawerOpen, setIsFiltersDrawerOpen] = useState(false)

  useEffect(() => {
    if (!enabled) return
    let active = true
    const load = () => {
      leadsService.getLeads().then(({ leads }) => {
        if (active) { setLeads(leads); setLoadError(''); setLoading(false) }
      }, (error: Error) => {
        if (active) { setLoadError(error.message); setLoading(false) }
      })
    }
    load()
    window.addEventListener('focus', load)
    return () => { active = false; window.removeEventListener('focus', load) }
  }, [enabled, token])

  // Sync selectedLead when list updates
  useEffect(() => {
    if (selectedLead) {
      const refreshed = leads.find((l) => l.id === selectedLead.id)
      if (refreshed) {
        setSelectedLead(refreshed)
      }
    }
  }, [leads])

  const updateFilter = <K extends keyof LeadFilters>(key: K, value: LeadFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => setFilters(INITIAL_FILTERS)

  const stats = useMemo<LeadStats>(() => {
    const todayStr = new Date().toISOString().slice(0, 10)
    let todayCount = 0
    let convertedCount = 0

    leads.forEach((l) => {
      if (l.createdAt.startsWith(todayStr)) {
        todayCount++
      }
      if (l.status === 'Won' || l.temperature === 'Won') {
        convertedCount++
      }
    })

    return {
      overall: leads.length,
      today: todayCount,
      converted: convertedCount,
    }
  }, [leads])

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Search term
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase()
        const matchName = lead.name.toLowerCase().includes(query)
        const matchEmail = (lead.email || '').toLowerCase().includes(query)
        const matchPhone = lead.phone.toLowerCase().includes(query)
        const matchDest = lead.destination.toLowerCase().includes(query)
        const matchPackage = (lead.interestedPackage || '').toLowerCase().includes(query)
        if (!matchName && !matchEmail && !matchPhone && !matchDest && !matchPackage) {
          return false
        }
      }

      // Stage filter
      if (filters.stage && filters.stage !== 'All') {
        if (lead.status !== filters.stage) return false
      }

      // Temperature filter
      if (filters.temperature && filters.temperature !== 'All') {
        if (lead.temperature !== filters.temperature) return false
      }

      // Customer type
      if (filters.customerType && filters.customerType !== 'All') {
        if (lead.customerType !== filters.customerType) return false
      }

      // Source filter (WhatsApp, Instagram, Facebook, Website, etc.)
      if (filters.source && filters.source !== 'All') {
        if (lead.source !== filters.source) return false
      }

      // Assigned to
      if (filters.assignedTo && filters.assignedTo !== 'All') {
        if (lead.assignedTo !== filters.assignedTo) return false
      }

      // Destination filter
      if (filters.destination && filters.destination.trim()) {
        if (!lead.destination.toLowerCase().includes(filters.destination.toLowerCase())) {
          return false
        }
      }

      return true
    })
  }, [leads, filters])

  async function mutate<T>(mutation: () => Promise<T>): Promise<T | undefined> {
    try { return await mutation() }
    catch (error) { toast({ type: 'error', title: 'Lead update failed', description: (error as Error).message }) }
  }

  const replaceLead = (lead: Lead) => setLeads((previous) => previous.map((item) => item.id === lead.id ? lead : item))

  const addLead: LeadsContextType['addLead'] = (data) => mutate(async () => {
    const lead = await leadsService.createLead(data)
    setLeads((previous) => [lead, ...previous])
    return lead
  })
  const updateLead: LeadsContextType['updateLead'] = (id, updates) => {
    void mutate(async () => replaceLead(await leadsService.updateLead(id, updates)))
  }
  const changeLeadStage: LeadsContextType['changeLeadStage'] = (id, stage) => {
    void mutate(async () => replaceLead(await leadsService.changeStage(id, stage)))
  }
  const deleteLead: LeadsContextType['deleteLead'] = (id) => {
    void mutate(async () => {
      await leadsService.deleteLead(id)
      setLeads((previous) => previous.filter((lead) => lead.id !== id))
      setSelectedLead((previous) => previous?.id === id ? null : previous)
    })
  }
  const importLeads: LeadsContextType['importLeads'] = (rows) => mutate(async () => {
    const { count } = await leadsService.importLeads(rows)
    const { leads } = await leadsService.getLeads()
    setLeads(leads)
    return count
  })
  const addLeadActivity: LeadsContextType['addLeadActivity'] = (id, activity) => mutate(async () => {
    const lead = await leadsService.addActivity(id, { ...activity, author: user?.name || 'Agent' })
    replaceLead(lead)
    return lead
  })

  return (
    <LeadsContext.Provider
      value={{
        leads,
        loading,
        loadError,
        filteredLeads,
        stats,
        filters,
        setFilters,
        updateFilter,
        resetFilters,
        addLead,
        updateLead,
        changeLeadStage,
        deleteLead,
        importLeads,
        addLeadActivity,
        selectedLead,
        setSelectedLead,
        isNewLeadModalOpen,
        setIsNewLeadModalOpen,
        isImportModalOpen,
        setIsImportModalOpen,
        isFiltersDrawerOpen,
        setIsFiltersDrawerOpen,
      }}
    >
      {children}
    </LeadsContext.Provider>
  )
}

export function useLeads() {
  const context = useContext(LeadsContext)
  if (!context) {
    throw new Error('useLeads must be used within a LeadsProvider')
  }
  return context
}
