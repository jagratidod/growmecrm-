import { useAuth } from './AuthContext'
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import type { CallLogEntry, CallLogFilters } from '../types/callLog.types'
import { callLogsService } from '../services/callLogsService'

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
  refreshCallLogs: () => Promise<void>
}

const STORAGE_PREFIX = 'treki_crm_call_logs_data'

const CallLogContext = createContext<CallLogContextType | undefined>(undefined)

export const CallLogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const STORAGE_KEY = `${STORAGE_PREFIX}:${user?.organizationId || 'guest'}`
  const [callLogs, setCallLogs] = useState<CallLogEntry[]>([])

  const [filters, setFilters] = useState<CallLogFilters>({
    user: 'All users',
    searchLead: '',
  })

  const [isLogModalOpen, setIsLogModalOpen] = useState(false)

  // Fetch call logs from backend
  const refreshCallLogs = useCallback(async () => {
    try {
      const res = await callLogsService.getCallLogs()
      if (res?.callLogs) {
        setCallLogs(res.callLogs)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(res.callLogs))
      }
    } catch {
      // offline fallback
    }
  }, [])

  useEffect(() => {
    refreshCallLogs()
  }, [refreshCallLogs])

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
    const tempId = `call-${Date.now()}`
    const newEntry: CallLogEntry = {
      ...data,
      id: tempId,
      createdAt: new Date().toISOString(),
    }
    setCallLogs((prev) => [newEntry, ...prev])

    callLogsService
      .logCall(data)
      .then((res) => {
        if (res?.callLog) {
          setCallLogs((prev) => prev.map((c) => (c.id === tempId ? res.callLog : c)))
        }
      })
      .catch(() => {})

    return newEntry
  }

  const deleteCallLog = async (id: string) => {
    setCallLogs((prev) => prev.filter((c) => c.id !== id))
    callLogsService.deleteCallLog(id).catch(() => {})
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
        refreshCallLogs,
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
