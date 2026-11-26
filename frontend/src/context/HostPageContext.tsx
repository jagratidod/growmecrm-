import React, { createContext, useContext, useState, useCallback } from 'react'
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

const DEFAULT_HOST_DATA: HostPageData = {
  websiteUrl: '',
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

  const [hostData, setHostData] = useState<HostPageData>(DEFAULT_HOST_DATA)
  const [isPublicPreviewOpen, setIsPublicPreviewOpen] = useState(false)

  const refreshHostPage = useCallback(async () => {
    setIsLoading(true)
    try {
      const { hostPage } = await hostPageService.getHostPage()
      setHostData(hostPage)
    } catch (error) {
      toast({ title: 'Could not load site', description: (error as Error).message, type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

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

  const addReview: HostPageContextType['addReview'] = async (review) => {
    try {
      const { hostPage } = await hostPageService.addReview(review)
      setHostData(hostPage)
      toast({ title: 'Review added', type: 'success' })
    } catch (error) {
      toast({ title: 'Could not save review', description: (error as Error).message, type: 'error' })
    }
  }

  const deleteReview: HostPageContextType['deleteReview'] = async (id) => {
    try {
      const { hostPage } = await hostPageService.deleteReview(id)
      setHostData(hostPage)
    } catch (error) {
      toast({ title: 'Could not delete review', description: (error as Error).message, type: 'error' })
    }
  }

  const saveWebsite = async () => {
    try {
      const { hostPage } = await hostPageService.updateHostPage({
        bannerImage: hostData.bannerImage,
        aboutUs: hostData.aboutUs,
        contact: hostData.contact,
      })
      setHostData(hostPage)
      toast({ title: 'Website changes saved', type: 'success' })
    } catch (error) {
      toast({ title: 'Could not save site', description: (error as Error).message, type: 'error' })
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
