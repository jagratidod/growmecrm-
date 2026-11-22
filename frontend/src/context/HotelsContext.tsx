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

const STORAGE_KEY = 'treki_crm_hotels_data'

const DEFAULT_HOTELS: Hotel[] = [
  {
    id: 'hotel-1',
    name: 'The Grand Bali Resort',
    city: 'Ubud',
    address: 'Jl. Raya Campuhan No. 12, Ubud, Gianyar, Bali',
    stars: 5,
    pricePerNight: 8500,
    currency: 'INR',
    phone: '+62 361 975 688',
    email: 'reservations@thegrandbali.com',
    notes: 'Contract rate: ₹8,500/night incl. breakfast & tax. Contact: Wayan (Sales Manager). 15% agency commission on pool villas.',
    photos: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'hotel-2',
    name: 'The Khyber Himalayan Resort & Spa',
    city: 'Gulmarg',
    address: 'Near Gondola Base Station, Gulmarg, Kashmir',
    stars: 5,
    pricePerNight: 22000,
    currency: 'INR',
    phone: '+91 1954 254 666',
    email: 'stay@khyberresort.com',
    notes: 'Direct walking distance to Gondola Phase 1. Winter rates locked at ₹22,000/night for deluxe mountain-view rooms. Free airport pickup on 3+ night bookings.',
    photos: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'hotel-3',
    name: 'Taj Holiday Village Resort & Spa',
    city: 'Goa',
    address: 'Sinquerim Beach, Candolim, Bardez, North Goa',
    stars: 5,
    pricePerNight: 14500,
    currency: 'INR',
    phone: '+91 832 664 5858',
    email: 'village.goa@tajhotels.com',
    notes: 'Beachfront cottages. Monsoon package special: Stay 3 Pay 2. Contact: Rohit Verma (Key Accounts).',
    photos: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const HotelsContext = createContext<HotelsContextType | undefined>(undefined)

export const HotelsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hotels, setHotels] = useState<Hotel[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.error('Failed to load hotels from localStorage', e)
    }
    return DEFAULT_HOTELS
  })

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
      if (data && data.length > 0) {
        setHotels(data)
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
      setHotels((prev) => [created, ...prev])
      return created
    } catch (err) {
      console.warn('Failed to save hotel to backend, falling back to local state:', err)
      const newHotel: Hotel = {
        ...data,
        id: `hotel-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setHotels((prev) => [newHotel, ...prev])
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
