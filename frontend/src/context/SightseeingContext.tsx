import { useAuth } from './AuthContext'
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

const STORAGE_PREFIX = 'treki_crm_sightseeing_data'

const SightseeingContext = createContext<SightseeingContextType | undefined>(undefined)

export const SightseeingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const STORAGE_KEY = `${STORAGE_PREFIX}:${user?.organizationId || 'guest'}`
  const [activities, setActivities] = useState<SightseeingActivity[]>([])

  const [isLoading, setIsLoading] = useState(false)
  const [filters, setFilters] = useState<SightseeingFilters>({
    search: '',
  })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState<SightseeingActivity | null>(null)

  // 1. Fetch activities from Backend API
  const refreshActivities = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await sightseeingService.getActivities()
      if (res?.activities) {
        setActivities(res.activities)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(res.activities))
      }
    } catch (err) {
      console.warn('[Sightseeing API] Falling back to local storage cache:', err)
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) setActivities(JSON.parse(saved))
      } catch {}
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshActivities()
  }, [refreshActivities])

  // Sync to local storage on changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(activities))
    } catch (e) {
      console.error('Failed to save sightseeing activities to localStorage', e)
    }
  }, [activities])

  const setSearch = (search: string) => {
    setFilters({ search })
  }

  // 2. Add Activity (Backend + Optimistic UI)
  const addActivity = async (
    data: Omit<SightseeingActivity, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<SightseeingActivity> => {
    const tempId = `act-${Date.now()}`
    const localItem: SightseeingActivity = {
      ...data,
      id: tempId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Optimistic update
    setActivities((prev) => [localItem, ...prev])

    try {
      const res = await sightseeingService.createActivity(data)
      if (res?.activity) {
        setActivities((prev) => prev.map((a) => (a.id === tempId ? res.activity : a)))
        return res.activity
      }
    } catch (err) {
      console.warn('[Sightseeing Create Error] Stored locally:', err)
    }

    return localItem
  }

  // 3. Update Activity (Backend + Optimistic UI)
  const updateActivity = async (id: string, updates: Partial<SightseeingActivity>) => {
    // Optimistic update
    setActivities((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
      )
    )
    if (editingActivity?.id === id) {
      setEditingActivity((prev) => (prev ? { ...prev, ...updates } : null))
    }

    try {
      const res = await sightseeingService.updateActivity(id, updates)
      if (res?.activity) {
        setActivities((prev) => prev.map((a) => (a.id === id ? res.activity : a)))
      }
    } catch (err) {
      console.warn('[Sightseeing Update Error] Applied locally:', err)
    }
  }

  // 4. Delete Activity (Backend + Optimistic UI)
  const deleteActivity = async (id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id))
    if (editingActivity?.id === id) {
      setEditingActivity(null)
    }

    try {
      await sightseeingService.deleteActivity(id)
    } catch (err) {
      console.warn('[Sightseeing Delete Error] Removed locally:', err)
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
