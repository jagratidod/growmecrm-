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
  plan?: string
  maxSeats?: number
  maxLeads?: number
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

const STORAGE_KEY = 'treki_crm_settings_data'

const DEFAULT_PROFILE: UserProfileSettings = {
  fullName: 'Agency Owner',
  email: 'owner@agency.com',
  role: 'Owner',
  organization: 'GrowMe CRM',
  memberSince: 'Today',
  lastSignIn: 'Just now',
}

const DEFAULT_CHANNELS: ChannelsSettings = {
  whatsappConnected: false,
  instagramConnected: false,
  emailConnected: false,
  emailFromAddress: 'bookings@youragency.com',
  emailApiKey: 're_xxxxxxxxxxxx',
}

const DEFAULT_AI_AGENT: AiAgentSettings = {
  tone: 'Friendly, warm and professional',
  systemPrompt:
    'You are the assistant for Wander & Co. Travel — always mention our 24/7 support line if asked about emergencies...',
  keyFacts:
    'We specialise in Kashmir, Ladakh and Himachal packages. Payment: 30% advance, balance before departure.',
}

const DEFAULT_ORGANIZATION: OrganizationSettings = {
  agencyName: 'GrowMe CRM',
  logoUrl: '',
  primaryColor: '#4F46E5',
  secondaryColor: '#0D9488',
}

const DEFAULT_INVOICE_DETAIL: InvoiceDetailSettings = {
  secondPhone: '+91 98765 43210',
  secondEmail: 'accounts@agency.com',
  state: 'Maharashtra',
  stateCode: '27',
  bankName: 'HDFC Bank, Andheri branch',
  bankAccountNumber: '50100123456789',
  ifscCode: 'HDFC0001234',
  gstin: '27AAAAA0000A1Z5',
  pan: 'AAAAA0000A',
  hsnSacCode: '998552',
  signatureImage: '',
  signatoryTitle: 'Director',
  termsAndConditions:
    'We declare that there is no tax payable under reverse charge mechanism.\nThe total invoice value mentioned herein shall be non-refundable in nature.',
}

const DEFAULT_AUTOMATION: AutomationSettings = {
  enabled: false,
  nudgeAfterHours: 48,
  nudgeMessage:
    'Just checking in — happy to help if you still have questions about your trip! Let us know.',
  logs: [
    {
      id: 'log-1',
      timestamp: 'Today, 11:30 PM',
      status: 'Checked',
      details: 'Evaluated 4 open leads. None exceeded 48h silence threshold.',
    },
    {
      id: 'log-2',
      timestamp: 'Today, 11:15 PM',
      status: 'Skipped',
      leadName: 'Aarav Mehta',
      channel: 'WhatsApp',
      details: 'Last message was 18 hours ago (under 48h threshold).',
    },
  ],
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfileSettings>(() => {
    try {
      const authUserStr = localStorage.getItem('crm_auth_user') || sessionStorage.getItem('crm_auth_user')
      if (authUserStr) {
        const authUser = JSON.parse(authUserStr)
        if (authUser?.name) {
          const orgName = (authUser.organizationName && authUser.organizationName !== 'Treki Travels')
            ? authUser.organizationName
            : (localStorage.getItem('crm_current_agency') || 'GrowMe CRM')
          return {
            fullName: authUser.name,
            email: authUser.email || 'user@agency.com',
            role: authUser.role ? (authUser.role.charAt(0).toUpperCase() + authUser.role.slice(1)) : 'Owner',
            organization: orgName,
            memberSince: authUser.memberSince || 'Today',
            lastSignIn: authUser.lastSignIn || 'Just now',
          }
        }
      }
      const saved = localStorage.getItem(STORAGE_KEY + '_profile')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.organization === 'Treki Travels' || !parsed.organization) {
          parsed.organization = localStorage.getItem('crm_current_agency') || 'GrowMe CRM'
        }
        if (parsed.fullName === 'Kushal Pareta') {
          parsed.fullName = 'Agency Owner'
        }
        return parsed
      }
    } catch {
      // ignore
    }
    return DEFAULT_PROFILE
  })

  const [channels, setChannels] = useState<ChannelsSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_channels')
      if (saved) return JSON.parse(saved)
    } catch {
      // ignore
    }
    return DEFAULT_CHANNELS
  })

  const [aiAgent, setAiAgent] = useState<AiAgentSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_ai')
      if (saved) return JSON.parse(saved)
    } catch {
      // ignore
    }
    return DEFAULT_AI_AGENT
  })

  useEffect(() => {
    try {
      const authUserStr = localStorage.getItem('crm_auth_user') || sessionStorage.getItem('crm_auth_user')
      if (authUserStr) {
        const authUser = JSON.parse(authUserStr)
        const orgName = (authUser.organizationName && authUser.organizationName !== 'Treki Travels')
          ? authUser.organizationName
          : (localStorage.getItem('crm_current_agency') || 'GrowMe CRM')

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

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY + '_profile', JSON.stringify(profile))
    } catch {
      // ignore
    }
  }, [profile])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY + '_channels', JSON.stringify(channels))
    } catch {
      // ignore
    }
  }, [channels])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY + '_ai', JSON.stringify(aiAgent))
    } catch {
      // ignore
    }
  }, [aiAgent])

  const [organization, setOrganization] = useState<OrganizationSettings>(() => {
    try {
      const authUserStr = localStorage.getItem('crm_auth_user') || sessionStorage.getItem('crm_auth_user')
      if (authUserStr) {
        const authUser = JSON.parse(authUserStr)
        if (authUser?.organizationName && authUser.organizationName !== 'Treki Travels') {
          return {
            agencyName: authUser.organizationName,
            logoUrl: '',
            primaryColor: '#4F46E5',
            secondaryColor: '#0D9488',
          }
        }
      }
      const saved = localStorage.getItem(STORAGE_KEY + '_org')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.agencyName === 'Treki Travels' || !parsed.agencyName) {
          parsed.agencyName = localStorage.getItem('crm_current_agency') || 'GrowMe CRM'
        }
        return parsed
      }
    } catch {
      // ignore
    }
    return DEFAULT_ORGANIZATION
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY + '_org', JSON.stringify(organization))
    } catch {
      // ignore
    }
  }, [organization])

  const [invoiceDetail, setInvoiceDetail] = useState<InvoiceDetailSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_invoice')
      if (saved) return JSON.parse(saved)
    } catch {
      // ignore
    }
    return DEFAULT_INVOICE_DETAIL
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY + '_invoice', JSON.stringify(invoiceDetail))
    } catch {
      // ignore
    }
  }, [invoiceDetail])

  const [automation, setAutomation] = useState<AutomationSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_automation')
      if (saved) return JSON.parse(saved)
    } catch {
      // ignore
    }
    return DEFAULT_AUTOMATION
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY + '_automation', JSON.stringify(automation))
    } catch {
      // ignore
    }
  }, [automation])

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
        console.warn('Could not fetch settings from server, using local cache:', err)
      }
    }
    fetchSettings()
  }, [])

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
