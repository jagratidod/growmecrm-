import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import type { Itinerary, ItineraryDay, ItineraryFilters } from '../types/itinerary.types'

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
}

const STORAGE_KEY = 'treki_crm_itineraries_data'

const DEFAULT_ITINERARIES: Itinerary[] = [
  {
    id: 'itn-1',
    customerName: 'Aarav Mehta',
    email: 'aarav.mehta@gmail.com',
    phone: '+91 98201 44521',
    destination: 'Bali, Indonesia',
    status: 'Confirmed',
    departure: '2026-12-10',
    returnDate: '2026-12-15',
    travellers: 2,
    totalAmount: 185000,
    amountPaid: 95000,
    currency: 'INR',
    package: 'Bali Romantic Escape (5D/4N)',
    assignedTo: 'Kushal Pareta',
    notes: 'Honeymoon couple, requested sea-view pool villa in Seminyak.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    days: [
      {
        id: 'day-1',
        dayNumber: 1,
        title: 'Arrival at Denpasar & Sunset in Uluwatu',
        description: 'Airport welcome by private chauffeur, private transfer to Seminyak luxury pool villa. Evening visit to Uluwatu Temple with Kecak dance show.',
        activities: ['Private Airport Transfer', 'Villa Check-in', 'Uluwatu Sunset Temple Tour', 'Kecak Dance Show'],
        hotel: 'The Seminyak Beach Resort & Spa',
        meals: ['Dinner'],
      },
      {
        id: 'day-2',
        dayNumber: 2,
        title: 'Ubud Culture & Tegalalang Rice Terraces',
        description: 'Explore the spiritual heart of Bali. Visit the Sacred Monkey Forest, iconic Ubud Art Market, and the stunning Tegalalang rice terraces.',
        activities: ['Monkey Forest Sanctuary', 'Bali Swing experience', 'Tegalalang Terrace Walk', 'Coffee Plantation Tasting'],
        hotel: 'The Seminyak Beach Resort & Spa',
        meals: ['Breakfast', 'Lunch'],
      },
      {
        id: 'day-3',
        dayNumber: 3,
        title: 'Nusa Penida Island Speedboat Day Tour',
        description: 'Full day excursion to Nusa Penida: visit Kelingking T-Rex cliff, Angel Billabong, Broken Beach, and snorkel at Crystal Bay.',
        activities: ['Fast Boat to Nusa Penida', 'Kelingking Secret Point', 'Broken Beach & Angel Billabong', 'Snorkeling at Crystal Bay'],
        hotel: 'The Seminyak Beach Resort & Spa',
        meals: ['Breakfast', 'Packed Lunch'],
      },
    ],
  },
  {
    id: 'itn-2',
    customerName: 'Sneha Kapoor',
    email: 'sneha.k@outlook.com',
    phone: '+91 97112 88402',
    destination: 'Kashmir, India',
    status: 'Pending',
    departure: '2027-01-05',
    returnDate: '2027-01-11',
    travellers: 4,
    totalAmount: 220000,
    amountPaid: 60000,
    currency: 'INR',
    package: 'Kashmir Paradise Tour (6D/5N)',
    assignedTo: 'Priya Sharma',
    notes: 'Family trip with 2 seniors. Requires ground floor rooms and heated vehicles.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    days: [
      {
        id: 'day-1',
        dayNumber: 1,
        title: 'Arrival in Srinagar & Dal Lake Shikara Ride',
        description: 'Transfer to Dal Lake deluxe houseboat. Sunset Shikara ride covering floating gardens and Char Chinar.',
        activities: ['Houseboat check-in', '1-hour Shikara Ride', 'Local craft bazaar walk'],
        hotel: 'Mascot Deluxe Houseboats Srinagar',
        meals: ['Dinner'],
      },
      {
        id: 'day-2',
        dayNumber: 2,
        title: 'Srinagar to Gulmarg Gondola Cable Car Excursion',
        description: 'Scenic drive to Gulmarg. Phase 1 & Phase 2 Gondola ride up to Apharwat peak for snow activities.',
        activities: ['Gulmarg Valley Drive', 'Phase 1 & 2 Gondola Ride', 'Snow sledging'],
        hotel: 'Khyber Himalayan Resort & Spa',
        meals: ['Breakfast', 'Dinner'],
      },
    ],
  },
]

const ItinerariesContext = createContext<ItinerariesContextType | undefined>(undefined)

export const ItinerariesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [itineraries, setItineraries] = useState<Itinerary[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (e) {
      console.error('Failed to load itineraries from localStorage:', e)
    }
    return DEFAULT_ITINERARIES
  })

  const [filters, setFilters] = useState<ItineraryFilters>({
    search: '',
    status: 'All',
  })

  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [selectedItinerary, setSelectedItinerary] = useState<Itinerary | null>(null)

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
    const newItinerary: Itinerary = {
      ...data,
      id: `itn-${Date.now()}`,
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
  }

  const deleteItinerary = async (id: string) => {
    setItineraries((prev) => prev.filter((itn) => itn.id !== id))
    if (selectedItinerary && selectedItinerary.id === id) {
      setSelectedItinerary(null)
    }
  }

  const addDay = async (itineraryId: string, day: Omit<ItineraryDay, 'id' | 'dayNumber'>) => {
    setItineraries((prev) =>
      prev.map((itn) => {
        if (itn.id !== itineraryId) return itn
        const newDayNumber = (itn.days?.length || 0) + 1
        const newDay: ItineraryDay = {
          ...day,
          id: `day-${Date.now()}`,
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
