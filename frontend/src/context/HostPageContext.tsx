import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { HostPageData, HostReview, HostContact } from '../types/hostPage.types'
import { hostPageService } from '../services/hostPageService'
import { useToast } from '../components/ui/Toast'

interface HostPageContextType {
  hostData: HostPageData
  updateBannerImage: (url: string) => void
  updateAboutUs: (aboutUs: string) => void
  updateContact: (contact: Partial<HostContact>) => void
  addReview: (review: Omit<HostReview, 'id' | 'createdAt'>) => Promise<void>
  deleteReview: (id: string) => Promise<void>
  isPublicPreviewOpen: boolean
  setIsPublicPreviewOpen: (open: boolean) => void
  saveWebsite: () => Promise<void>
  isLoading: boolean
  refreshHostPage: () => Promise<void>
}

const STORAGE_KEY = 'treki_crm_host_page_data'

const DEFAULT_HOST_DATA: HostPageData = {
  websiteUrl: 'https://joinetra.com/growme-crm',
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
  const [isLoading, setIsLoading] = useState(false)

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

  // Fetch host page from backend API
  const refreshHostPage = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await hostPageService.getHostPage()
      if (res?.hostPage) {
        setHostData(res.hostPage)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(res.hostPage))
      }
    } catch {
      // Fallback to local storage if offline or not logged in
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        try {
          setHostData(JSON.parse(saved))
        } catch {
          // ignore
        }
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshHostPage()
  }, [refreshHostPage])

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

  const addReview = async (reviewData: Omit<HostReview, 'id' | 'createdAt'>) => {
    // Optimistic local update
    const tempId = `rev-${Date.now()}`
    const tempReview: HostReview = {
      ...reviewData,
      id: tempId,
      createdAt: new Date().toISOString(),
    }
    setHostData((prev) => ({
      ...prev,
      reviews: [tempReview, ...prev.reviews],
    }))

    try {
      const res = await hostPageService.addReview(reviewData)
      if (res?.hostPage) {
        setHostData(res.hostPage)
      }
      toast({ title: 'Review added', type: 'success' })
    } catch {
      toast({ title: 'Review added locally', description: 'Saved offline.', type: 'info' })
    }
  }

  const deleteReview = async (id: string) => {
    setHostData((prev) => ({
      ...prev,
      reviews: prev.reviews.filter((r) => r.id !== id),
    }))

    try {
      const res = await hostPageService.deleteReview(id)
      if (res?.hostPage) {
        setHostData(res.hostPage)
      }
      toast({ title: 'Review removed', type: 'info' })
    } catch {
      // Revert if error
      toast({ title: 'Review removed locally', type: 'info' })
    }
  }

  const saveWebsite = async () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(hostData))
      const res = await hostPageService.updateHostPage({
        bannerImage: hostData.bannerImage,
        aboutUs: hostData.aboutUs,
        contact: hostData.contact,
      })
      if (res?.hostPage) {
        setHostData(res.hostPage)
      }
      toast({
        title: 'Website changes saved successfully',
        description: 'Your public mini-website has been updated.',
        type: 'success',
      })
    } catch {
      toast({
        title: 'Website changes saved locally',
        description: 'Changes are cached locally in your browser.',
        type: 'info',
      })
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
        isLoading,
        refreshHostPage,
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
