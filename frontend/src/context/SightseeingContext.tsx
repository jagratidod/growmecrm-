import { useRouter } from './RouterContext'
import { useToast } from '../components/ui/Toast'
import { useWorkspace } from '../features/workspace/WorkspaceAccess'
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import type { SightseeingActivity, SightseeingFilters } from '../types/sightseeing.types'
import { sightseeingService } from '../services/sightseeingService'

interface SightseeingContextType {
  activities: SightseeingActivity[]
  filteredActivities: SightseeingActivity[]
  filters: SightseeingFilters
  isLoading: boolean
  setSearch: (search: string) => void
  isModalOpen: boolean
  setIsModalOpen: (open: boolean) => void
  editingActivity: SightseeingActivity | null
  setEditingActivity: (activity: SightseeingActivity | null) => void
  refreshActivities: () => Promise<void>
  addActivity: (data: Omit<SightseeingActivity, 'id' | 'createdAt' | 'updatedAt'>) => Promise<SightseeingActivity>
  updateActivity: (id: string, updates: Partial<SightseeingActivity>) => Promise<void>
  deleteActivity: (id: string) => Promise<void>
}

const SightseeingContext = createContext<SightseeingContextType | undefined>(undefined)

export const SightseeingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { path } = useRouter()
  const enabled = (useWorkspace().access?.modules.includes('catalog')) && (['/sightseeing', '/packages'].includes(path))
  const { toast } = useToast()
  const [activities, setActivities] = useState<SightseeingActivity[]>([])

  const [isLoading, setIsLoading] = useState(false)
  const [filters, setFilters] = useState<SightseeingFilters>({
    search: '',
  })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState<SightseeingActivity | null>(null)

  // 1. Fetch activities from Backend API
  const refreshActivities = useCallback(async () => {
    if (!enabled) return
    setIsLoading(true)
    try {
      setActivities((await sightseeingService.getActivities()).activities)
    } catch (error) {
      toast({ type: 'error', title: 'Could not load activities', description: (error as Error).message })
    } finally {
      setIsLoading(false)
    }
  }, [enabled, toast])

  useEffect(() => {
    void refreshActivities()
  }, [refreshActivities])

  const setSearch = (search: string) => {
    setFilters({ search })
  }

  const addActivity: SightseeingContextType['addActivity'] = async (data) => {
    const { activity } = await sightseeingService.createActivity(data)
    setActivities((prev) => [activity, ...prev])
    return activity
  }

  const updateActivity: SightseeingContextType['updateActivity'] = async (id, updates) => {
    const { activity } = await sightseeingService.updateActivity(id, updates)
    setActivities((prev) => prev.map((item) => item.id === id ? activity : item))
    setEditingActivity((item) => item?.id === id ? activity : item)
  }

  const deleteActivity: SightseeingContextType['deleteActivity'] = async (id) => {
    try {
      await sightseeingService.deleteActivity(id)
      setActivities((prev) => prev.filter((item) => item.id !== id))
      setEditingActivity((item) => item?.id === id ? null : item)
    } catch (error) {
      toast({ type: 'error', title: 'Could not delete activity', description: (error as Error).message })
    }
  }

  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      if (!filters.search) return true
      const q = filters.search.toLowerCase()
      return (
        act.name.toLowerCase().includes(q) ||
        act.description.toLowerCase().includes(q) ||
        (act.destination && act.destination.toLowerCase().includes(q))
      )
    })
  }, [activities, filters])

  return (
    <SightseeingContext.Provider
      value={{
        activities,
        filteredActivities,
        filters,
        isLoading,
        setSearch,
        isModalOpen,
        setIsModalOpen,
        editingActivity,
        setEditingActivity,
        refreshActivities,
        addActivity,
        updateActivity,
        deleteActivity,
      }}
    >
      {children}
    </SightseeingContext.Provider>
  )
}

export const useSightseeing = () => {
  const context = useContext(SightseeingContext)
  if (!context) {
    throw new Error('useSightseeing must be used within a SightseeingProvider')
  }
  return context
}
