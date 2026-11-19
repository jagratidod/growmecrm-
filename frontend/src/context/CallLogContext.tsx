import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import type { CallLogEntry, CallLogFilters } from '../types/callLog.types'

interface CallLogContextType {
  callLogs: CallLogEntry[]
  filteredCallLogs: CallLogEntry[]
  filters: CallLogFilters
  setUserFilter: (user: string) => void
  setSearchLead: (search: string) => void
  isLogModalOpen: boolean
  setIsLogModalOpen: (open: boolean) => void
  logCall: (data: Omit<CallLogEntry, 'id' | 'createdAt'>) => Promise<CallLogEntry>
  deleteCallLog: (id: string) => Promise<void>
}

const STORAGE_KEY = 'treki_crm_call_logs_data'

const DEFAULT_CALL_LOGS: CallLogEntry[] = [
  {
    id: 'call-1',
    leadName: 'Aarav Mehta',
    leadPhone: '+91 98201 44521',
    userName: 'Kushal Pareta',
    outcome: 'Connected',
    notes: 'Discussed Bali romantic pool villa package. Client confirmed 4N/5D dates for Dec 10. Sending updated quote with flight options on WhatsApp.',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
  },
  {
    id: 'call-2',
    leadName: 'Sneha Kapoor',
    leadPhone: '+91 97112 88402',
    userName: 'Kushal Pareta',
    outcome: 'No answer',
    notes: 'Followed up on Kashmir winter family package quote. Phone rang but no answer. Sent reminder follow-up text.',
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
  },
  {
    id: 'call-3',
    leadName: 'Vikram Malhotra',
    leadPhone: '+91 98190 33410',
    userName: 'Priya Sharma',
    outcome: 'Connected',
    notes: 'Client interested in Goa heritage & beach package with watersports for family of 4. Requested weekend departure.',
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(), // 6 hours ago
  },
]

const CallLogContext = createContext<CallLogContextType | undefined>(undefined)

export const CallLogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [callLogs, setCallLogs] = useState<CallLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.error('Failed to parse call logs from localStorage', e)
    }
    return DEFAULT_CALL_LOGS
  })

  const [filters, setFilters] = useState<CallLogFilters>({
    user: 'Kushal Pareta', // matching screenshot dropdown selection!
    searchLead: '',
  })

  const [isLogModalOpen, setIsLogModalOpen] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(callLogs))
    } catch (e) {
      console.error('Failed to save call logs to localStorage', e)
    }
  }, [callLogs])

  const setUserFilter = (user: string) => {
    setFilters((prev) => ({ ...prev, user }))
  }

  const setSearchLead = (searchLead: string) => {
    setFilters((prev) => ({ ...prev, searchLead }))
  }

  const logCall = async (
    data: Omit<CallLogEntry, 'id' | 'createdAt'>
  ): Promise<CallLogEntry> => {
    const newEntry: CallLogEntry = {
      ...data,
      id: `call-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    setCallLogs((prev) => [newEntry, ...prev])
    return newEntry
  }

  const deleteCallLog = async (id: string) => {
    setCallLogs((prev) => prev.filter((c) => c.id !== id))
  }

  const filteredCallLogs = useMemo(() => {
    return callLogs.filter((entry) => {
      const matchUser =
        filters.user === 'All users' ||
        entry.userName.toLowerCase() === filters.user.toLowerCase()

      const matchSearch =
        !filters.searchLead ||
        entry.leadName.toLowerCase().includes(filters.searchLead.toLowerCase()) ||
        entry.leadPhone.toLowerCase().includes(filters.searchLead.toLowerCase()) ||
        (entry.notes && entry.notes.toLowerCase().includes(filters.searchLead.toLowerCase())) ||
        entry.outcome.toLowerCase().includes(filters.searchLead.toLowerCase())

      return matchUser && matchSearch
    })
  }, [callLogs, filters])

  return (
    <CallLogContext.Provider
      value={{
        callLogs,
        filteredCallLogs,
        filters,
        setUserFilter,
        setSearchLead,
        isLogModalOpen,
        setIsLogModalOpen,
        logCall,
        deleteCallLog,
      }}
    >
      {children}
    </CallLogContext.Provider>
  )
}

export const useCallLog = () => {
  const context = useContext(CallLogContext)
  if (!context) {
    throw new Error('useCallLog must be used within a CallLogProvider')
  }
  return context
}
