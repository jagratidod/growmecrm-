import { useRouter } from './RouterContext'
import { useToast } from '../components/ui/Toast'
import { useWorkspace } from '../features/workspace/WorkspaceAccess'
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

const ItinerariesContext = createContext<ItinerariesContextType | undefined>(undefined)

export const ItinerariesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { path } = useRouter()
  const enabled = (useWorkspace().access?.modules.includes('catalog')) && ('/itineraries' === path)
  const { toast } = useToast()
  const [itineraries, setItineraries] = useState<Itinerary[]>([])

  const [filters, setFilters] = useState<ItineraryFilters>({
    search: '',
    status: 'All',
  })

  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [selectedItinerary, setSelectedItinerary] = useState<Itinerary | null>(null)

  // Fetch from backend API
  const refreshItineraries = useCallback(async () => {
    if (!enabled) return
    try {
      setItineraries((await itinerariesService.getItineraries()).itineraries)
    } catch (error) {
      toast({ type: 'error', title: 'Could not load itineraries', description: (error as Error).message })
    }
  }, [enabled, toast])

  useEffect(() => {
    void refreshItineraries()
  }, [refreshItineraries])

  const setSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search }))
  }

  const setStatusFilter = (status: ItineraryFilters['status']) => {
    setFilters((prev) => ({ ...prev, status }))
  }

  const addItinerary: ItinerariesContextType['addItinerary'] = async (data) => {
    const { itinerary } = await itinerariesService.createItinerary(data)
    setItineraries((prev) => [itinerary, ...prev])
    return itinerary
  }

  const applyUpdate = async (operation: Promise<{ itinerary: Itinerary }>) => {
    try {
      const { itinerary } = await operation
      setItineraries((prev) => prev.map((item) => item.id === itinerary.id ? itinerary : item))
      setSelectedItinerary((item) => item?.id === itinerary.id ? itinerary : item)
    } catch (error) {
      toast({ type: 'error', title: 'Could not update itinerary', description: (error as Error).message })
    }
  }

  const updateItinerary: ItinerariesContextType['updateItinerary'] = (id, updates) =>
    applyUpdate(itinerariesService.updateItinerary(id, updates))

  const deleteItinerary: ItinerariesContextType['deleteItinerary'] = async (id) => {
    try {
      await itinerariesService.deleteItinerary(id)
      setItineraries((prev) => prev.filter((item) => item.id !== id))
      setSelectedItinerary((item) => item?.id === id ? null : item)
    } catch (error) {
      toast({ type: 'error', title: 'Could not delete itinerary', description: (error as Error).message })
    }
  }

  const addDay: ItinerariesContextType['addDay'] = (id, day) =>
    applyUpdate(itinerariesService.addDay(id, day))

  const updateDay: ItinerariesContextType['updateDay'] = (id, dayId, updates) =>
    applyUpdate(itinerariesService.updateDay(id, dayId, updates))

  const deleteDay: ItinerariesContextType['deleteDay'] = (id, dayId) =>
    applyUpdate(itinerariesService.deleteDay(id, dayId))

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
