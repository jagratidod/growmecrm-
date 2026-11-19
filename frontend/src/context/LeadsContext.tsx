import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import type {
  Lead,
  LeadFilters,
  LeadStats,
  LeadStage,
  LeadActivity,
} from '../types/lead.types'

interface LeadsContextType {
  leads: Lead[]
  filteredLeads: Lead[]
  stats: LeadStats
  filters: LeadFilters
  setFilters: React.Dispatch<React.SetStateAction<LeadFilters>>
  updateFilter: <K extends keyof LeadFilters>(key: K, value: LeadFilters[K]) => void
  resetFilters: () => void
  addLead: (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'activities'>) => Lead
  updateLead: (id: string, updates: Partial<Lead>) => void
  changeLeadStage: (id: string, newStage: LeadStage) => void
  deleteLead: (id: string) => void
  importLeads: (newLeads: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'activities'>[]) => number
  addLeadActivity: (leadId: string, activity: Omit<LeadActivity, 'id' | 'leadId' | 'timestamp'>) => void
  selectedLead: Lead | null
  setSelectedLead: (lead: Lead | null) => void
  isNewLeadModalOpen: boolean
  setIsNewLeadModalOpen: (open: boolean) => void
  isImportModalOpen: boolean
  setIsImportModalOpen: (open: boolean) => void
  isFiltersDrawerOpen: boolean
  setIsFiltersDrawerOpen: (open: boolean) => void
  loadDemoData: () => void
  clearAllLeads: () => void
}

const STORAGE_KEY = 'treki_crm_leads_data'

const INITIAL_FILTERS: LeadFilters = {
  search: '',
  stage: 'All',
  temperature: 'All',
  destination: '',
  assignedTo: '',
  customerType: 'All',
}

const DEMO_LEADS: Lead[] = [
  {
    id: 'lead-1',
    name: 'Aarav Mehta',
    email: 'aarav.mehta@gmail.com',
    phone: '+91 98201 44521',
    source: 'Website',
    status: 'Qualified',
    customerType: 'B2C',
    interestedPackage: 'Honeymoon Special',
    destination: 'Bali, Indonesia',
    travelDate: '2026-12-15',
    travelers: 2,
    budget: 180000,
    currency: 'INR',
    assignedTo: 'Kushal Pareta',
    temperature: 'Hot',
    tags: ['honeymoon', 'luxury', 'bali'],
    notes: 'Looking for a private villa with pool in Seminyak and Ubud tour.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    activities: [
      {
        id: 'act-1',
        leadId: 'lead-1',
        type: 'created',
        description: 'Lead captured from Website enquiry form.',
        timestamp: new Date().toISOString(),
        author: 'System',
      },
      {
        id: 'act-2',
        leadId: 'lead-1',
        type: 'stage_changed',
        description: 'Stage updated from New to Qualified.',
        timestamp: new Date().toISOString(),
        author: 'Kushal Pareta',
      },
    ],
  },
  {
    id: 'lead-2',
    name: 'Priya Sen & Family',
    email: 'priya.sen@outlook.com',
    phone: '+91 98450 12890',
    source: 'Referral',
    status: 'Proposal sent',
    customerType: 'B2C',
    interestedPackage: 'Family Getaway',
    destination: 'Switzerland & Paris',
    travelDate: '2026-11-28',
    travelers: 4,
    budget: 650000,
    currency: 'INR',
    assignedTo: 'Pooja Sharma',
    temperature: 'Warm',
    tags: ['family', 'europe', 'train pass'],
    notes: 'Requires 4-star hotels near railway stations.',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    activities: [
      {
        id: 'act-3',
        leadId: 'lead-2',
        type: 'created',
        description: 'Lead created manually by Pooja Sharma.',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        author: 'Pooja Sharma',
      },
    ],
  },
  {
    id: 'lead-3',
    name: 'Vikramaditya Corp Events',
    email: 'corporate@vikramaditya.co.in',
    phone: '+91 97112 88410',
    source: 'Google',
    status: 'Won',
    customerType: 'B2B',
    interestedPackage: 'Corporate Retreat',
    destination: 'Goa, India',
    travelDate: '2026-12-05',
    travelers: 25,
    budget: 1200000,
    currency: 'INR',
    assignedTo: 'Rahul Verma',
    temperature: 'Won',
    tags: ['corporate', 'conference', 'beach resort'],
    notes: 'Confirmed 25 beach view suites, banquet hall booked.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
    activities: [
      {
        id: 'act-4',
        leadId: 'lead-3',
        type: 'stage_changed',
        description: 'Contract signed. Stage marked Won!',
        timestamp: new Date().toISOString(),
        author: 'Rahul Verma',
      },
    ],
  },
]

const LeadsContext = createContext<LeadsContextType | undefined>(undefined)

export const LeadsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leads, setLeads] = useState<Lead[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch {
      // Fallback
    }
    // Start with empty to match Screenshot 2's "No leads yet" out of the box,
    // with quick demo button available!
    return []
  })

  const [filters, setFilters] = useState<LeadFilters>(INITIAL_FILTERS)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isFiltersDrawerOpen, setIsFiltersDrawerOpen] = useState(false)

  // Persist to localStorage whenever leads change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(leads))
    } catch {
      // Ignore
    }
  }, [leads])

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

  const addLead = (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'activities'>): Lead => {
    const now = new Date().toISOString()
    const newId = 'lead-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5)

    const newLead: Lead = {
      ...leadData,
      id: newId,
      createdAt: now,
      updatedAt: now,
      activities: [
        {
          id: 'act-' + Date.now(),
          leadId: newId,
          type: 'created',
          description: `Lead created manually via New Lead form.`,
          timestamp: now,
          author: 'Kushal Pareta',
        },
      ],
    }

    setLeads((prev) => [newLead, ...prev])
    return newLead
  }

  const updateLead = (id: string, updates: Partial<Lead>) => {
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id === id) {
          return {
            ...lead,
            ...updates,
            updatedAt: new Date().toISOString(),
          }
        }
        return lead
      })
    )
  }

  const changeLeadStage = (id: string, newStage: LeadStage) => {
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id === id && lead.status !== newStage) {
          const now = new Date().toISOString()
          const newActivity: LeadActivity = {
            id: 'act-' + Date.now(),
            leadId: id,
            type: 'stage_changed',
            description: `Stage changed from ${lead.status} to ${newStage}`,
            timestamp: now,
            author: 'Kushal Pareta',
          }
          return {
            ...lead,
            status: newStage,
            temperature: newStage === 'Won' ? 'Won' : newStage === 'Lost' ? 'Lost' : lead.temperature,
            updatedAt: now,
            activities: [newActivity, ...lead.activities],
          }
        }
        return lead
      })
    )
  }

  const deleteLead = (id: string) => {
    setLeads((prev) => prev.filter((lead) => lead.id !== id))
    if (selectedLead?.id === id) {
      setSelectedLead(null)
    }
  }

  const importLeads = (newLeadsData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'activities'>[]): number => {
    const now = new Date().toISOString()
    const mapped: Lead[] = newLeadsData.map((data, index) => {
      const id = 'lead-import-' + Date.now() + '-' + index
      return {
        ...data,
        id,
        createdAt: now,
        updatedAt: now,
        activities: [
          {
            id: 'act-import-' + index,
            leadId: id,
            type: 'created',
            description: 'Lead imported via CSV file.',
            timestamp: now,
            author: 'Kushal Pareta',
          },
        ],
      }
    })

    setLeads((prev) => [...mapped, ...prev])
    return mapped.length
  }

  const addLeadActivity = (
    leadId: string,
    activity: Omit<LeadActivity, 'id' | 'leadId' | 'timestamp'>
  ) => {
    const now = new Date().toISOString()
    const fullActivity: LeadActivity = {
      ...activity,
      id: 'act-' + Date.now(),
      leadId,
      timestamp: now,
    }

    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id === leadId) {
          return {
            ...lead,
            updatedAt: now,
            activities: [fullActivity, ...lead.activities],
          }
        }
        return lead
      })
    )
  }

  const loadDemoData = () => {
    setLeads(DEMO_LEADS)
  }

  const clearAllLeads = () => {
    setLeads([])
    setSelectedLead(null)
  }

  return (
    <LeadsContext.Provider
      value={{
        leads,
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
        loadDemoData,
        clearAllLeads,
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
