import { useAuth } from './AuthContext'
import React, { createContext, useContext, useState, useEffect } from 'react'
import { settingsService } from '../services/settingsService'

export interface UserProfileSettings {
  fullName: string
  email: string
  role: string
  organization: string
  memberSince: string
  lastSignIn: string
}

export interface ChannelsSettings {
  whatsappConnected: boolean
  instagramConnected: boolean
  emailConnected: boolean
  emailFromAddress: string
  emailApiKey: string
}

export interface AiAgentSettings {
  tone: string
  systemPrompt: string
  keyFacts: string
}

export interface OrganizationSettings {
  agencyName: string
  logoUrl?: string
  primaryColor: string
  secondaryColor: string
}

export interface InvoiceDetailSettings {
  secondPhone: string
  secondEmail: string
  state: string
  stateCode: string
  bankName: string
  bankAccountNumber: string
  ifscCode: string
  gstin: string
  pan: string
  hsnSacCode: string
  signatureImage?: string
  signatoryTitle: string
  termsAndConditions: string
}

export interface AutomationLogEntry {
  id: string
  timestamp: string
  status: 'Sent' | 'Skipped' | 'Checked' | 'Failed'
  leadName?: string
  channel?: 'WhatsApp' | 'Instagram' | 'Email'
  details: string
}

export interface AutomationSettings {
  enabled: boolean
  nudgeAfterHours: number
  nudgeMessage: string
  logs: AutomationLogEntry[]
}

interface SettingsContextType {
  profile: UserProfileSettings
  updateProfile: (updates: Partial<UserProfileSettings>) => void
  channels: ChannelsSettings
  toggleChannel: (channel: 'whatsapp' | 'instagram') => void
  updateEmailConfig: (fromAddress: string, apiKey: string) => void
  aiAgent: AiAgentSettings
  updateAiAgent: (updates: Partial<AiAgentSettings>) => void
  organization: OrganizationSettings
  updateOrganization: (updates: Partial<OrganizationSettings>) => void
  invoiceDetail: InvoiceDetailSettings
  updateInvoiceDetail: (updates: Partial<InvoiceDetailSettings>) => void
  automation: AutomationSettings
  updateAutomation: (updates: Partial<AutomationSettings>) => void
}

const INVOICE_STORAGE_PREFIX = 'growme_invoice_preferences'

const DEFAULT_PROFILE: UserProfileSettings = {
  fullName: '',
  email: '',
  role: '',
  organization: '',
  memberSince: '',
  lastSignIn: '',
}

const DEFAULT_CHANNELS: ChannelsSettings = {
  whatsappConnected: false,
  instagramConnected: false,
  emailConnected: false,
  emailFromAddress: '',
  emailApiKey: '',
}

const DEFAULT_AI_AGENT: AiAgentSettings = {
  tone: '',
  systemPrompt:
    '',
  keyFacts:
    '',
}

const DEFAULT_ORGANIZATION: OrganizationSettings = {
  agencyName: '',
  logoUrl: '',
  primaryColor: '#4F46E5',
  secondaryColor: '#0D9488',
}

const DEFAULT_INVOICE_DETAIL: InvoiceDetailSettings = {
  secondPhone: '',
  secondEmail: '',
  state: '',
  stateCode: '',
  bankName: '',
  bankAccountNumber: '',
  ifscCode: '',
  gstin: '',
  pan: '',
  hsnSacCode: '',
  signatureImage: '',
  signatoryTitle: '',
  termsAndConditions:
    '',
}

const DEFAULT_AUTOMATION: AutomationSettings = {
  enabled: false,
  nudgeAfterHours: 48,
  nudgeMessage:
    '',
  logs: [],
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const invoiceStorageKey = user?.organizationId ? `${INVOICE_STORAGE_PREFIX}:${user.organizationId}` : ''
  const [profile, setProfile] = useState<UserProfileSettings>(() => {
    try {
      const authUserStr = localStorage.getItem('crm_auth_user') || sessionStorage.getItem('crm_auth_user')
      if (authUserStr) {
        const authUser = JSON.parse(authUserStr)
        if (authUser?.name) {
          const orgName = authUser.organizationName || ''
          return {
            fullName: authUser.name,
            email: authUser.email || '',
            role: authUser.role ? (authUser.role.charAt(0).toUpperCase() + authUser.role.slice(1)) : 'Owner',
            organization: orgName,
            memberSince: authUser.memberSince || '',
            lastSignIn: authUser.lastSignIn || '',
          }
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_PROFILE
  })

  const [channels, setChannels] = useState<ChannelsSettings>(DEFAULT_CHANNELS)

  const [aiAgent, setAiAgent] = useState<AiAgentSettings>(DEFAULT_AI_AGENT)

  useEffect(() => {
    try {
      const authUserStr = localStorage.getItem('crm_auth_user') || sessionStorage.getItem('crm_auth_user')
      if (authUserStr) {
        const authUser = JSON.parse(authUserStr)
        const orgName = authUser.organizationName || ''

        if (authUser?.name) {
          setProfile((prev) => ({
            ...prev,
            fullName: authUser.name,
            email: authUser.email || prev.email,
            role: authUser.role ? (authUser.role.charAt(0).toUpperCase() + authUser.role.slice(1)) : prev.role,
            organization: orgName,
          }))
        }
        if (orgName) {
          setOrganization((prev) => ({
            ...prev,
            agencyName: orgName,
          }))
        }
      }
    } catch {}
  }, [])

  const [organization, setOrganization] = useState<OrganizationSettings>(() => {
    try {
      const authUserStr = localStorage.getItem('crm_auth_user') || sessionStorage.getItem('crm_auth_user')
      if (authUserStr) {
        const authUser = JSON.parse(authUserStr)
        if (authUser?.organizationName) {
          return {
            agencyName: authUser.organizationName,
            logoUrl: '',
            primaryColor: '#4F46E5',
            secondaryColor: '#0D9488',
          }
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_ORGANIZATION
  })

  const [invoiceDetail, setInvoiceDetail] = useState<InvoiceDetailSettings>(() => {
    try {
      const saved = invoiceStorageKey ? localStorage.getItem(invoiceStorageKey) : null
      if (saved) return JSON.parse(saved)
    } catch {
      // ignore
    }
    return DEFAULT_INVOICE_DETAIL
  })

  useEffect(() => {
    try {
      if (invoiceStorageKey) localStorage.setItem(invoiceStorageKey, JSON.stringify(invoiceDetail))
    } catch {
      // ignore
    }
  }, [invoiceDetail, invoiceStorageKey])

  const [automation, setAutomation] = useState<AutomationSettings>(DEFAULT_AUTOMATION)

  // Fetch remote settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingsService.getSettings()
        if (data) {
          if (data.channels) setChannels((prev) => ({ ...prev, ...data.channels }))
          if (data.aiAgent) setAiAgent((prev) => ({ ...prev, ...data.aiAgent }))
          if (data.automation) setAutomation((prev) => ({ ...prev, ...data.automation }))
        }
      } catch (err) {
        console.warn('Could not fetch workspace settings:', err)
      }
    }
    if (user?.organizationId) fetchSettings()
  }, [user?.organizationId])

  const updateProfile = (updates: Partial<UserProfileSettings>) => {
    setProfile((prev) => ({ ...prev, ...updates }))
  }

  const toggleChannel = async (channel: 'whatsapp' | 'instagram') => {
    let nextChannels: ChannelsSettings | null = null
    setChannels((prev) => {
      const updated = {
        ...prev,
        [channel === 'whatsapp' ? 'whatsappConnected' : 'instagramConnected']:
          !prev[channel === 'whatsapp' ? 'whatsappConnected' : 'instagramConnected'],
      }
      nextChannels = updated
      return updated
    })

    if (nextChannels) {
      try {
        await settingsService.updateChannels(nextChannels)
      } catch (err) {
        console.error('Failed to sync channel toggle to server:', err)
      }
    }
  }

  const updateEmailConfig = async (fromAddress: string, apiKey: string) => {
    const updatedChannels: ChannelsSettings = {
      ...channels,
      emailFromAddress: fromAddress,
      emailApiKey: apiKey,
      emailConnected: Boolean(apiKey.trim()),
    }
    setChannels(updatedChannels)

    try {
      await settingsService.updateChannels(updatedChannels)
    } catch (err) {
      console.error('Failed to sync email config to server:', err)
    }
  }

  const updateAiAgent = async (updates: Partial<AiAgentSettings>) => {
    const updatedAi: AiAgentSettings = { ...aiAgent, ...updates }
    setAiAgent(updatedAi)

    try {
      await settingsService.updateAiAgent(updatedAi)
    } catch (err) {
      console.error('Failed to sync AI Agent config to server:', err)
    }
  }

  const updateOrganization = (updates: Partial<OrganizationSettings>) => {
    setOrganization((prev) => ({ ...prev, ...updates }))
  }

  const updateInvoiceDetail = (updates: Partial<InvoiceDetailSettings>) => {
    setInvoiceDetail((prev) => ({ ...prev, ...updates }))
  }

  const updateAutomation = async (updates: Partial<AutomationSettings>) => {
    const updatedAuto: AutomationSettings = { ...automation, ...updates }
    setAutomation(updatedAuto)

    try {
      await settingsService.updateAutomation(updatedAuto)
    } catch (err) {
      console.error('Failed to sync automation settings to server:', err)
    }
  }

  return (
    <SettingsContext.Provider
      value={{
        profile,
        updateProfile,
        channels,
        toggleChannel,
        updateEmailConfig,
        aiAgent,
        updateAiAgent,
        organization,
        updateOrganization,
        invoiceDetail,
        updateInvoiceDetail,
        automation,
        updateAutomation,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
