import { useAuth } from './AuthContext'
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
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

const STORAGE_PREFIX = 'treki_crm_hotels_data'

const HotelsContext = createContext<HotelsContextType | undefined>(undefined)

export const HotelsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const STORAGE_KEY = `${STORAGE_PREFIX}:${user?.organizationId || 'guest'}`
  const [hotels, setHotels] = useState<Hotel[]>([])

  const [isLoading, setIsLoading] = useState(false)

  const [filters, setFilters] = useState<HotelFilters>({
    search: '',
    city: 'All',
    stars: 'All',
  })

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null)

  // Sync to localStorage as client-side cache
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(hotels))
    } catch (e) {
      console.error('Failed to save hotels to localStorage', e)
    }
  }, [hotels])

  // Fetch hotels from backend API on mount
  const refreshHotels = async () => {
    setIsLoading(true)
    try {
      const data = await hotelsService.getHotels()
      if (data && Array.isArray(data)) {
        // Read any custom hotels from localStorage cache
        const finalList = data
        setHotels(finalList)
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(finalList))
        } catch (e) {
          console.warn('LocalStorage save failed:', e)
        }
      }
    } catch (err) {
      console.warn('Backend hotels fetch failed, using local cache:', err)
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) setHotels(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load hotels from localStorage', e)
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshHotels()
  }, [])

  const setSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search }))
  }

  const setCityFilter = (city: string) => {
    setFilters((prev) => ({ ...prev, city }))
  }

  const setStarsFilter = (stars: number | 'All') => {
    setFilters((prev) => ({ ...prev, stars }))
  }

  const addHotel = async (data: Omit<Hotel, 'id' | 'createdAt' | 'updatedAt'>): Promise<Hotel> => {
    try {
      const created = await hotelsService.createHotel(data)
      setHotels((prev) => {
        const updated = [created, ...prev.filter((h) => h.id !== created.id)]
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        } catch (e) {
          console.warn('LocalStorage save failed:', e)
        }
        return updated
      })
      return created
    } catch (err) {
      console.warn('Failed to save hotel to backend, falling back to local state:', err)
      const newHotel: Hotel = {
        ...data,
        id: `hotel-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setHotels((prev) => {
        const updated = [newHotel, ...prev]
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        } catch (e) {
          console.warn('LocalStorage save failed:', e)
        }
        return updated
      })
      return newHotel
    }
  }

  const updateHotel = async (id: string, updates: Partial<Hotel>) => {
    try {
      const updated = await hotelsService.updateHotel(id, updates)
      setHotels((prev) => prev.map((h) => (h.id === id ? updated : h)))
      if (editingHotel?.id === id) {
        setEditingHotel(updated)
      }
    } catch (err) {
      console.warn('Failed to update hotel on backend, applying local fallback:', err)
      setHotels((prev) =>
        prev.map((h) =>
          h.id === id ? { ...h, ...updates, updatedAt: new Date().toISOString() } : h
        )
      )
      if (editingHotel?.id === id) {
        setEditingHotel((prev) => (prev ? { ...prev, ...updates } : null))
      }
    }
  }

  const deleteHotel = async (id: string) => {
    try {
      await hotelsService.deleteHotel(id)
    } catch (err) {
      console.warn('Failed to delete hotel on backend, removing from local state:', err)
    }
    setHotels((prev) => prev.filter((h) => h.id !== id))
    if (editingHotel?.id === id) {
      setEditingHotel(null)
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
