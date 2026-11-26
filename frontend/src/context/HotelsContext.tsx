import { useRouter } from './RouterContext'
import { useToast } from '../components/ui/Toast'
import { useWorkspace } from '../features/workspace/WorkspaceAccess'
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import type { Hotel, HotelFilters } from '../types/hotel.types'
import { hotelsService } from '../services/hotelsService'

interface HotelsContextType {
  hotels: Hotel[]
  filteredHotels: Hotel[]
  filters: HotelFilters
  isLoading: boolean
  setSearch: (search: string) => void
  setCityFilter: (city: string) => void
  setStarsFilter: (stars: number | 'All') => void
  isAddModalOpen: boolean
  setIsAddModalOpen: (open: boolean) => void
  editingHotel: Hotel | null
  setEditingHotel: (hotel: Hotel | null) => void
  addHotel: (data: Omit<Hotel, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Hotel>
  updateHotel: (id: string, updates: Partial<Hotel>) => Promise<void>
  deleteHotel: (id: string) => Promise<void>
  refreshHotels: () => Promise<void>
}

const HotelsContext = createContext<HotelsContextType | undefined>(undefined)

export const HotelsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { path } = useRouter()
  const enabled = (useWorkspace().access?.modules.includes('catalog')) && (['/hotels', '/packages'].includes(path))
  const { toast } = useToast()
  const [hotels, setHotels] = useState<Hotel[]>([])

  const [isLoading, setIsLoading] = useState(false)

  const [filters, setFilters] = useState<HotelFilters>({
    search: '',
    city: 'All',
    stars: 'All',
  })

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null)

  const refreshHotels = useCallback(async () => {
    if (!enabled) return
    setIsLoading(true)
    try {
      setHotels(await hotelsService.getHotels())
    } catch (error) {
      toast({ type: 'error', title: 'Could not load hotels', description: (error as Error).message })
    } finally {
      setIsLoading(false)
    }
  }, [enabled, toast])

  useEffect(() => {
    void refreshHotels()
  }, [refreshHotels])

  const setSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search }))
  }

  const setCityFilter = (city: string) => {
    setFilters((prev) => ({ ...prev, city }))
  }

  const setStarsFilter = (stars: number | 'All') => {
    setFilters((prev) => ({ ...prev, stars }))
  }

  const addHotel: HotelsContextType['addHotel'] = async (data) => {
    const hotel = await hotelsService.createHotel(data)
    setHotels((prev) => [hotel, ...prev.filter((item) => item.id !== hotel.id)])
    return hotel
  }

  const updateHotel: HotelsContextType['updateHotel'] = async (id, updates) => {
    const hotel = await hotelsService.updateHotel(id, updates)
    setHotels((prev) => prev.map((item) => item.id === id ? hotel : item))
    setEditingHotel((item) => item?.id === id ? hotel : item)
  }

  const deleteHotel: HotelsContextType['deleteHotel'] = async (id) => {
    try {
      await hotelsService.deleteHotel(id)
      setHotels((prev) => prev.filter((item) => item.id !== id))
      setEditingHotel((item) => item?.id === id ? null : item)
    } catch (error) {
      toast({ type: 'error', title: 'Could not delete hotel', description: (error as Error).message })
    }
  }

  const filteredHotels = useMemo(() => {
    return hotels.filter((hotel) => {
      const matchSearch =
        !filters.search ||
        hotel.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        hotel.city.toLowerCase().includes(filters.search.toLowerCase()) ||
        (hotel.address && hotel.address.toLowerCase().includes(filters.search.toLowerCase())) ||
        (hotel.notes && hotel.notes.toLowerCase().includes(filters.search.toLowerCase()))

      const matchCity = filters.city === 'All' || hotel.city.toLowerCase() === filters.city.toLowerCase()
      const matchStars = filters.stars === 'All' || hotel.stars === filters.stars

      return matchSearch && matchCity && matchStars
    })
  }, [hotels, filters])

  return (
    <HotelsContext.Provider
      value={{
        hotels,
        filteredHotels,
        filters,
        isLoading,
        setSearch,
        setCityFilter,
        setStarsFilter,
        isAddModalOpen,
        setIsAddModalOpen,
        editingHotel,
        setEditingHotel,
        addHotel,
        updateHotel,
        deleteHotel,
        refreshHotels,
      }}
    >
      {children}
    </HotelsContext.Provider>
  )
}

export const useHotels = () => {
  const context = useContext(HotelsContext)
  if (!context) {
    throw new Error('useHotels must be used within a HotelsProvider')
  }
  return context
}
