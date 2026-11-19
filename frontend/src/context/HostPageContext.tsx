import React, { createContext, useContext, useState, useEffect } from 'react'
import type { HostPageData, HostReview, HostContact } from '../types/hostPage.types'
import { useToast } from '../components/ui/Toast'

interface HostPageContextType {
  hostData: HostPageData
  updateBannerImage: (url: string) => void
  updateAboutUs: (aboutUs: string) => void
  updateContact: (contact: Partial<HostContact>) => void
  addReview: (review: Omit<HostReview, 'id' | 'createdAt'>) => void
  deleteReview: (id: string) => void
  isPublicPreviewOpen: boolean
  setIsPublicPreviewOpen: (open: boolean) => void
  saveWebsite: () => void
}

const STORAGE_KEY = 'treki_crm_host_page_data'

const DEFAULT_HOST_DATA: HostPageData = {
  websiteUrl: 'https://joinetra.com/treki-travels',
  bannerImage: '',
  aboutUs: '',
  contact: {
    phone: '',
    email: '',
    address: '',
  },
  reviews: [],
}

const HostPageContext = createContext<HostPageContextType | undefined>(undefined)

export const HostPageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast()

  const [hostData, setHostData] = useState<HostPageData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.error('Failed to load host page data from localStorage', e)
    }
    return DEFAULT_HOST_DATA
  })

  const [isPublicPreviewOpen, setIsPublicPreviewOpen] = useState(false)

  // Persist to localStorage whenever hostData updates
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(hostData))
    } catch (e) {
      console.error('Failed to save host page data to localStorage', e)
    }
  }, [hostData])

  const updateBannerImage = (url: string) => {
    setHostData((prev) => ({ ...prev, bannerImage: url }))
  }

  const updateAboutUs = (aboutUs: string) => {
    setHostData((prev) => ({ ...prev, aboutUs }))
  }

  const updateContact = (updates: Partial<HostContact>) => {
    setHostData((prev) => ({
      ...prev,
      contact: { ...prev.contact, ...updates },
    }))
  }

  const addReview = (reviewData: Omit<HostReview, 'id' | 'createdAt'>) => {
    const newReview: HostReview = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    setHostData((prev) => ({
      ...prev,
      reviews: [newReview, ...prev.reviews],
    }))
    toast({ title: 'Review added', type: 'success' })
  }

  const deleteReview = (id: string) => {
    setHostData((prev) => ({
      ...prev,
      reviews: prev.reviews.filter((r) => r.id !== id),
    }))
    toast({ title: 'Review removed', type: 'info' })
  }

  const saveWebsite = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(hostData))
      toast({
        title: 'Website changes saved successfully',
        description: 'Your public mini-website has been updated.',
        type: 'success',
      })
    } catch {
      toast({ title: 'Failed to save website', type: 'error' })
    }
  }

  return (
    <HostPageContext.Provider
      value={{
        hostData,
        updateBannerImage,
        updateAboutUs,
        updateContact,
        addReview,
        deleteReview,
        isPublicPreviewOpen,
        setIsPublicPreviewOpen,
        saveWebsite,
      }}
    >
      {children}
    </HostPageContext.Provider>
  )
}

export const useHostPage = () => {
  const context = useContext(HostPageContext)
  if (!context) {
    throw new Error('useHostPage must be used within a HostPageProvider')
  }
  return context
}
