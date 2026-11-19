import React, { createContext, useContext, useState, useEffect } from 'react'
import type { TravelPackage } from '../types/package.types'

interface PackagesContextType {
  packages: TravelPackage[]
  activePackage: TravelPackage | null
  setActivePackage: (pkg: TravelPackage | null) => void
  isBuilderOpen: boolean
  setIsBuilderOpen: (open: boolean) => void
  currentStep: number
  setCurrentStep: (step: number) => void
  startNewPackage: () => void
  editPackage: (pkg: TravelPackage) => void
  savePackage: (pkgData: Partial<TravelPackage>) => Promise<TravelPackage>
  deletePackage: (id: string) => Promise<void>
}

const STORAGE_KEY = 'treki_crm_packages_data'

const DEFAULT_PACKAGES: TravelPackage[] = [
  {
    id: 'pkg-1',
    name: 'BALI_V1_2026',
    code: 'BALI-2026',
    status: 'DRAFT',
    brochureDesign: 'Signature',
    template: 'Bali Honeymoon & Leisure',
    categories: ['Honeymoon', 'Beach', 'International'],
    slug: 'bali-v1-2026',
    duration: { nights: 4, days: 5 },
    bookingTitle: 'Experience Bali Paradise: Private Pool Villas & Temples',
    destination: 'Bali, Indonesia',
    price: 13999,
    originalPrice: 16000,
    currency: 'INR',
    route: 'Delhi to Delhi',
    bookingAmount: 5000,
    pricingOptions: [
      { id: 'po-1', label: 'Double Sharing (Per Person)', price: 13999 },
      { id: 'po-2', label: 'Single Occupancy Villa', price: 21999 },
      { id: 'po-3', label: 'Child with Bed (Under 12)', price: 9999 },
      { id: 'po-4', label: 'Peak Season Surcharge (Dec/Jan)', price: 17999, isPeakSeason: true },
    ],
    bannerImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
    whatsappBannerImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
    whatsappDescription: '🌴 Book Bali 5D/4N with Private Villa & Uluwatu Sunset Tour starting at just ₹13,999! Limited slots available.',
    description: 'Immerse yourself in tropical serenity with our signature Bali 5D/4N holiday package. Enjoy luxury pool villa stays, private airport transfers, Ubud artisan tour, and Nusa Penida island speedboat cruise.',
    contactNumber: '+91-98765-43210',
    contactEmail: 'hello@trekitravels.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pkg-2',
    name: 'KASHMIR_BLISS_2026',
    code: 'KSH-2026',
    status: 'PUBLISHED',
    brochureDesign: 'Adventure',
    template: 'Kashmir Valley & Snow Tour',
    categories: ['Mountains', 'Snow', 'Family'],
    slug: 'kashmir-bliss-2026',
    duration: { nights: 5, days: 6 },
    bookingTitle: 'Enchanting Kashmir: Dal Lake Houseboat & Gulmarg Gondola',
    destination: 'Srinagar, Gulmarg & Pahalgam',
    price: 24999,
    originalPrice: 29999,
    currency: 'INR',
    route: 'Srinagar to Srinagar',
    bookingAmount: 7000,
    pricingOptions: [
      { id: 'po-k1', label: 'Twin Sharing Deluxe', price: 24999 },
      { id: 'po-k2', label: 'Family Suite (4 Guests)', price: 44999 },
    ],
    bannerImage: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=1200&q=80',
    whatsappBannerImage: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=800&q=80',
    whatsappDescription: '❄️ Experience heaven on earth! 6 Days Kashmir with Gulmarg Gondola & Dal Lake Houseboat @ ₹24,999.',
    description: 'Explore breathtaking valleys, snow-capped peaks, shikara rides on Dal Lake, and world-class luxury houseboats in Kashmir.',
    contactNumber: '+91-98765-43210',
    contactEmail: 'hello@trekitravels.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const NEW_PACKAGE_INITIAL: Omit<TravelPackage, 'id' | 'createdAt' | 'updatedAt'> = {
  name: 'BALI_V1_2026',
  code: '',
  status: 'DRAFT',
  brochureDesign: 'Signature',
  template: '',
  categories: [],
  slug: 'bali-v1-2026',
  duration: { nights: 1, days: 2 },
  bookingTitle: '',
  destination: 'Bali, Indonesia',
  price: 13999,
  originalPrice: 16000,
  currency: 'INR',
  route: 'Delhi to Delhi',
  bookingAmount: 5000,
  pricingOptions: [],
  bannerImage: '',
  whatsappBannerImage: '',
  whatsappDescription: '',
  description: '',
  contactNumber: '+91-XXXX-XXXX',
  contactEmail: 'hello@example.com',
}

const PackagesContext = createContext<PackagesContextType | undefined>(undefined)

export const PackagesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [packages, setPackages] = useState<TravelPackage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.error('Failed to parse packages from localStorage', e)
    }
    return DEFAULT_PACKAGES
  })

  const [activePackage, setActivePackage] = useState<TravelPackage | null>(null)
  const [isBuilderOpen, setIsBuilderOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(packages))
    } catch (e) {
      console.error('Failed to save packages to localStorage', e)
    }
  }, [packages])

  const startNewPackage = () => {
    const fresh: TravelPackage = {
      ...NEW_PACKAGE_INITIAL,
      id: `pkg-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setActivePackage(fresh)
    setCurrentStep(1)
    setIsBuilderOpen(true)
  }

  const editPackage = (pkg: TravelPackage) => {
    setActivePackage(pkg)
    setCurrentStep(1)
    setIsBuilderOpen(true)
  }

  const savePackage = async (pkgData: Partial<TravelPackage>): Promise<TravelPackage> => {
    const now = new Date().toISOString()
    let saved: TravelPackage

    if (activePackage && packages.some((p) => p.id === activePackage.id)) {
      // Update existing
      saved = {
        ...activePackage,
        ...pkgData,
        updatedAt: now,
      }
      setPackages((prev) => prev.map((p) => (p.id === saved.id ? saved : p)))
    } else {
      // Create new
      saved = {
        ...(activePackage || NEW_PACKAGE_INITIAL),
        ...pkgData,
        id: activePackage?.id || `pkg-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      } as TravelPackage
      setPackages((prev) => [saved, ...prev])
    }

    setActivePackage(saved)
    return saved
  }

  const deletePackage = async (id: string) => {
    setPackages((prev) => prev.filter((p) => p.id !== id))
    if (activePackage?.id === id) {
      setActivePackage(null)
      setIsBuilderOpen(false)
    }
  }

  return (
    <PackagesContext.Provider
      value={{
        packages,
        activePackage,
        setActivePackage,
        isBuilderOpen,
        setIsBuilderOpen,
        currentStep,
        setCurrentStep,
        startNewPackage,
        editPackage,
        savePackage,
        deletePackage,
      }}
    >
      {children}
    </PackagesContext.Provider>
  )
}

export const usePackages = () => {
  const context = useContext(PackagesContext)
  if (!context) {
    throw new Error('usePackages must be used within a PackagesProvider')
  }
  return context
}
