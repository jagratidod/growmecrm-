import { useAuth } from './AuthContext'
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import type { Itinerary, ItineraryDay, ItineraryFilters } from '../types/itinerary.types'
import { itinerariesService } from '../services/itinerariesService'

interface ItinerariesContextType {
  itineraries: Itinerary[]
  filteredItineraries: Itinerary[]
  filters: ItineraryFilters
  setSearch: (search: string) => void
  setStatusFilter: (status: ItineraryFilters['status']) => void
  isNewModalOpen: boolean
  setIsNewModalOpen: (open: boolean) => void
  selectedItinerary: Itinerary | null
  setSelectedItinerary: (itinerary: Itinerary | null) => void
  addItinerary: (data: Omit<Itinerary, 'id' | 'createdAt' | 'updatedAt' | 'days'> & { days?: ItineraryDay[] }) => Promise<Itinerary>
  updateItinerary: (id: string, updates: Partial<Itinerary>) => Promise<void>
  deleteItinerary: (id: string) => Promise<void>
  addDay: (itineraryId: string, day: Omit<ItineraryDay, 'id' | 'dayNumber'>) => Promise<void>
  updateDay: (itineraryId: string, dayId: string, updates: Partial<ItineraryDay>) => Promise<void>
  deleteDay: (itineraryId: string, dayId: string) => Promise<void>
  refreshItineraries: () => Promise<void>
}

const STORAGE_PREFIX = 'treki_crm_itineraries_data'

const ItinerariesContext = createContext<ItinerariesContextType | undefined>(undefined)

export const ItinerariesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const STORAGE_KEY = `${STORAGE_PREFIX}:${user?.organizationId || 'guest'}`
  const [itineraries, setItineraries] = useState<Itinerary[]>([])

  const [filters, setFilters] = useState<ItineraryFilters>({
    search: '',
    status: 'All',
  })

  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [selectedItinerary, setSelectedItinerary] = useState<Itinerary | null>(null)

  // Fetch from backend API
  const refreshItineraries = useCallback(async () => {
    try {
      const res = await itinerariesService.getItineraries()
      if (res?.itineraries) {
        setItineraries(res.itineraries)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(res.itineraries))
      }
    } catch {
      // offline fallback
    }
  }, [])

  useEffect(() => {
    refreshItineraries()
  }, [refreshItineraries])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(itineraries))
    } catch (e) {
      console.error('Failed to save itineraries to localStorage:', e)
    }
  }, [itineraries])

  const setSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search }))
  }

  const setStatusFilter = (status: ItineraryFilters['status']) => {
    setFilters((prev) => ({ ...prev, status }))
  }

  const addItinerary = async (
    data: Omit<Itinerary, 'id' | 'createdAt' | 'updatedAt' | 'days'> & { days?: ItineraryDay[] }
  ): Promise<Itinerary> => {
    const tempId = `itn-${Date.now()}`
    const newItinerary: Itinerary = {
      ...data,
      id: tempId,
      days: data.days || [
        {
          id: `day-${Date.now()}-1`,
          dayNumber: 1,
          title: 'Arrival & Welcome',
          description: `Welcome to ${data.destination}! Private check-in and leisure evening.`,
          activities: ['Airport pickup', 'Hotel check-in', 'Evening welcome dinner'],
          meals: ['Dinner'],
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setItineraries((prev) => [newItinerary, ...prev])

    itinerariesService
      .createItinerary(data)
      .then((res) => {
        if (res?.itinerary) {
          setItineraries((prev) => prev.map((itn) => (itn.id === tempId ? res.itinerary : itn)))
          if (selectedItinerary && selectedItinerary.id === tempId) {
            setSelectedItinerary(res.itinerary)
          }
        }
      })
      .catch(() => {})

    return newItinerary
  }

  const updateItinerary = async (id: string, updates: Partial<Itinerary>) => {
    setItineraries((prev) =>
      prev.map((itn) =>
        itn.id === id ? { ...itn, ...updates, updatedAt: new Date().toISOString() } : itn
      )
    )
    if (selectedItinerary && selectedItinerary.id === id) {
      setSelectedItinerary((prev) => (prev ? { ...prev, ...updates, updatedAt: new Date().toISOString() } : null))
    }

    itinerariesService.updateItinerary(id, updates).catch(() => {})
  }

  const deleteItinerary = async (id: string) => {
    setItineraries((prev) => prev.filter((itn) => itn.id !== id))
    if (selectedItinerary && selectedItinerary.id === id) {
      setSelectedItinerary(null)
    }

    itinerariesService.deleteItinerary(id).catch(() => {})
  }

  const addDay = async (itineraryId: string, day: Omit<ItineraryDay, 'id' | 'dayNumber'>) => {
    const tempDayId = `day-${Date.now()}`
    setItineraries((prev) =>
      prev.map((itn) => {
        if (itn.id !== itineraryId) return itn
        const newDayNumber = (itn.days?.length || 0) + 1
        const newDay: ItineraryDay = {
          ...day,
          id: tempDayId,
          dayNumber: newDayNumber,
        }
        const updatedDays = [...(itn.days || []), newDay]
        const updated = { ...itn, days: updatedDays, updatedAt: new Date().toISOString() }
        if (selectedItinerary && selectedItinerary.id === itineraryId) {
          setSelectedItinerary(updated)
        }
        return updated
      })
    )

    itinerariesService.addDay(itineraryId, day).catch(() => {})
  }

  const updateDay = async (itineraryId: string, dayId: string, updates: Partial<ItineraryDay>) => {
    setItineraries((prev) =>
      prev.map((itn) => {
        if (itn.id !== itineraryId) return itn
        const updatedDays = itn.days.map((d) => (d.id === dayId ? { ...d, ...updates } : d))
        const updated = { ...itn, days: updatedDays, updatedAt: new Date().toISOString() }
        if (selectedItinerary && selectedItinerary.id === itineraryId) {
          setSelectedItinerary(updated)
        }
        return updated
      })
    )

    itinerariesService.updateDay(itineraryId, dayId, updates).catch(() => {})
  }

  const deleteDay = async (itineraryId: string, dayId: string) => {
    setItineraries((prev) =>
      prev.map((itn) => {
        if (itn.id !== itineraryId) return itn
        const remaining = itn.days
          .filter((d) => d.id !== dayId)
          .map((d, index) => ({ ...d, dayNumber: index + 1 }))
        const updated = { ...itn, days: remaining, updatedAt: new Date().toISOString() }
        if (selectedItinerary && selectedItinerary.id === itineraryId) {
          setSelectedItinerary(updated)
        }
        return updated
      })
    )

    itinerariesService.deleteDay(itineraryId, dayId).catch(() => {})
  }

  const filteredItineraries = useMemo(() => {
    return itineraries.filter((itn) => {
      const matchSearch =
        !filters.search ||
        itn.customerName.toLowerCase().includes(filters.search.toLowerCase()) ||
        itn.destination.toLowerCase().includes(filters.search.toLowerCase()) ||
        (itn.package && itn.package.toLowerCase().includes(filters.search.toLowerCase())) ||
        (itn.email && itn.email.toLowerCase().includes(filters.search.toLowerCase()))

      const matchStatus = filters.status === 'All' || itn.status === filters.status

      return matchSearch && matchStatus
    })
  }, [itineraries, filters])

  return (
    <ItinerariesContext.Provider
      value={{
        itineraries,
        filteredItineraries,
        filters,
        setSearch,
        setStatusFilter,
        isNewModalOpen,
        setIsNewModalOpen,
        selectedItinerary,
        setSelectedItinerary,
        addItinerary,
        updateItinerary,
        deleteItinerary,
        addDay,
        updateDay,
        deleteDay,
        refreshItineraries,
      }}
    >
      {children}
    </ItinerariesContext.Provider>
  )
}

export const useItineraries = () => {
  const context = useContext(ItinerariesContext)
  if (!context) {
    throw new Error('useItineraries must be used within an ItinerariesProvider')
  }
  return context
}
