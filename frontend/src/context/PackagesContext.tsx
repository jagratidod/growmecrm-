import { useRouter } from './RouterContext'
import React, { createContext, useContext, useState, useEffect } from 'react'
import { useWorkspace } from '../features/workspace/WorkspaceAccess'
import { useToast } from '../components/ui/Toast'
import { packagesService } from '../services/packagesService'
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

const NEW_PACKAGE_INITIAL: Omit<TravelPackage, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '',
  code: '',
  status: 'DRAFT',
  brochureDesign: 'Signature',
  template: '',
  categories: [],
  slug: '',
  duration: { nights: 1, days: 2 },
  bookingTitle: '',
  destination: '',
  price: 0,
  originalPrice: 0,
  currency: 'INR',
  route: '',
  bookingAmount: 0,
  pricingOptions: [],
  bannerImage: '',
  whatsappBannerImage: '',
  whatsappDescription: '',
  description: '',
  contactNumber: '',
  contactEmail: '',
  itineraryDays: [],
  inclusions: '',
  exclusions: '',
  pickupDropPoints: '',
  thingsToCarry: '',
  cancellationPolicy: '',
  paymentTerms: '',
  termsAndConditions: '',
  faqs: [],
  highlights: [],
  galleryImages: [],
}

const PackagesContext = createContext<PackagesContextType | undefined>(undefined)

export const PackagesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { access } = useWorkspace()
  const { toast } = useToast()
  const { path } = useRouter()
  const enabled = (access?.modules.includes('catalog')) && (['/packages', '/leads', '/bookings', '/itineraries'].includes(path))
  const [packages, setPackages] = useState<TravelPackage[]>([])

  const [activePackage, setActivePackage] = useState<TravelPackage | null>(null)
  const [isBuilderOpen, setIsBuilderOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  useEffect(() => {
    if (!enabled) return
    let active = true
    packagesService.getPackages().then(
      (items) => { if (active) setPackages(items) },
      (error: Error) => { if (active) toast({ type: 'error', title: 'Could not load packages', description: error.message }) },
    )
    return () => { active = false }
  }, [enabled, toast])

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
    const existing = activePackage && packages.some((item) => item.id === activePackage.id)
    const data = { ...(activePackage || NEW_PACKAGE_INITIAL), ...pkgData }
    const saved = existing
      ? await packagesService.updatePackage(activePackage.id, data)
      : await packagesService.createPackage(data)
    setPackages((previous) => existing ? previous.map((item) => item.id === saved.id ? saved : item) : [saved, ...previous])
    setActivePackage(saved)
    return saved
  }

  const deletePackage = async (id: string) => {
    await packagesService.deletePackage(id)
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
