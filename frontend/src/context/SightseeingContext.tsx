import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import type { SightseeingActivity, SightseeingFilters } from '../types/sightseeing.types'

interface SightseeingContextType {
  activities: SightseeingActivity[]
  filteredActivities: SightseeingActivity[]
  filters: SightseeingFilters
  setSearch: (search: string) => void
  isModalOpen: boolean
  setIsModalOpen: (open: boolean) => void
  editingActivity: SightseeingActivity | null
  setEditingActivity: (activity: SightseeingActivity | null) => void
  addActivity: (data: Omit<SightseeingActivity, 'id' | 'createdAt' | 'updatedAt'>) => Promise<SightseeingActivity>
  updateActivity: (id: string, updates: Partial<SightseeingActivity>) => Promise<void>
  deleteActivity: (id: string) => Promise<void>
}

const STORAGE_KEY = 'treki_crm_sightseeing_data'

const DEFAULT_ACTIVITIES: SightseeingActivity[] = [
  {
    id: 'act-1',
    name: 'Gulmarg Gondola & Snow Excursion',
    coverImage: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    description: 'Scenic mountain drive to Gulmarg. Take the world-famous Gondola Cable Car to Phase 1 & Phase 2 at Apharwat Peak for skiing, snowboarding, and panoramic Himalayan vistas.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'act-2',
    name: 'Uluwatu Sunset Temple & Kecak Dance',
    coverImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
    description: 'Visit the dramatic sea cliff temple of Uluwatu perched 70 meters above the Indian Ocean. Witness the mesmerizing traditional Balinese Kecak fire dance against a golden sunset.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'act-3',
    name: 'Nusa Penida Speedboat Island Tour',
    coverImage: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80',
    description: 'High-speed catamaran cruise to Nusa Penida island. Visit iconic Kelingking Beach (T-Rex cliff), Broken Beach natural bridge, Angel Billabong, and snorkel at Crystal Bay.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const SightseeingContext = createContext<SightseeingContextType | undefined>(undefined)

export const SightseeingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activities, setActivities] = useState<SightseeingActivity[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.error('Failed to parse sightseeing activities from localStorage', e)
    }
    return DEFAULT_ACTIVITIES
  })

  const [filters, setFilters] = useState<SightseeingFilters>({
    search: '',
  })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState<SightseeingActivity | null>(null)

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

  const addActivity = async (
    data: Omit<SightseeingActivity, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<SightseeingActivity> => {
    const newActivity: SightseeingActivity = {
      ...data,
      id: `act-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setActivities((prev) => [newActivity, ...prev])
    return newActivity
  }

  const updateActivity = async (id: string, updates: Partial<SightseeingActivity>) => {
    setActivities((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
      )
    )
    if (editingActivity?.id === id) {
      setEditingActivity((prev) => (prev ? { ...prev, ...updates } : null))
    }
  }

  const deleteActivity = async (id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id))
    if (editingActivity?.id === id) {
      setEditingActivity(null)
    }
  }

  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      if (!filters.search) return true
      const q = filters.search.toLowerCase()
      return (
        act.name.toLowerCase().includes(q) ||
        act.description.toLowerCase().includes(q)
      )
    })
  }, [activities, filters])

  return (
    <SightseeingContext.Provider
      value={{
        activities,
        filteredActivities,
        filters,
        setSearch,
        isModalOpen,
        setIsModalOpen,
        editingActivity,
        setEditingActivity,
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
