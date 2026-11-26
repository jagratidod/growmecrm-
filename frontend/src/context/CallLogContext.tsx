import { useRouter } from './RouterContext'
import { useToast } from '../components/ui/Toast'
import { useWorkspace } from '../features/workspace/WorkspaceAccess'
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

const CallLogContext = createContext<CallLogContextType | undefined>(undefined)

export const CallLogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { path } = useRouter()
  const enabled = (useWorkspace().access?.modules.includes('communications')) && ('/call-log' === path)
  const { toast } = useToast()
  const [callLogs, setCallLogs] = useState<CallLogEntry[]>([])

  const [filters, setFilters] = useState<CallLogFilters>({
    user: 'All users',
    searchLead: '',
  })

  const [isLogModalOpen, setIsLogModalOpen] = useState(false)

  // Fetch call logs from backend
  const refreshCallLogs = useCallback(async () => {
    if (!enabled) return
    try {
      setCallLogs((await callLogsService.getCallLogs()).callLogs)
    } catch (error) {
      toast({ type: 'error', title: 'Could not load call logs', description: (error as Error).message })
    }
  }, [enabled, toast])

  useEffect(() => {
    void refreshCallLogs()
  }, [refreshCallLogs])

  const setUserFilter = (user: string) => {
    setFilters((prev) => ({ ...prev, user }))
  }

  const setSearchLead = (searchLead: string) => {
    setFilters((prev) => ({ ...prev, searchLead }))
  }

  const logCall: CallLogContextType['logCall'] = async (data) => {
    const { callLog } = await callLogsService.logCall(data)
    setCallLogs((prev) => [callLog, ...prev])
    return callLog
  }

  const deleteCallLog: CallLogContextType['deleteCallLog'] = async (id) => {
    try {
      await callLogsService.deleteCallLog(id)
      setCallLogs((prev) => prev.filter((item) => item.id !== id))
    } catch (error) {
      toast({ type: 'error', title: 'Could not delete call', description: (error as Error).message })
    }
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
