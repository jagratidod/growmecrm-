import React, { createContext, useContext, useState, useEffect } from 'react'

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

const STORAGE_KEY = 'treki_crm_settings_data'

const DEFAULT_PROFILE: UserProfileSettings = {
  fullName: 'Kushal Pareta',
  email: 'kushal@trekitravels.com',
  role: 'Admin',
  organization: 'Treki Travels',
  memberSince: '8 Oct 2026',
  lastSignIn: '18 Nov 2026, 12:39',
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
  agencyName: 'Treki Travels',
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
      const saved = localStorage.getItem(STORAGE_KEY + '_profile')
      if (saved) return JSON.parse(saved)
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
      const saved = localStorage.getItem(STORAGE_KEY + '_org')
      if (saved) return JSON.parse(saved)
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

  const updateProfile = (updates: Partial<UserProfileSettings>) => {
    setProfile((prev) => ({ ...prev, ...updates }))
  }

  const toggleChannel = (channel: 'whatsapp' | 'instagram') => {
    setChannels((prev) => {
      if (channel === 'whatsapp') {
        return { ...prev, whatsappConnected: !prev.whatsappConnected }
      }
      return { ...prev, instagramConnected: !prev.instagramConnected }
    })
  }

  const updateEmailConfig = (fromAddress: string, apiKey: string) => {
    setChannels((prev) => ({
      ...prev,
      emailFromAddress: fromAddress,
      emailApiKey: apiKey,
      emailConnected: Boolean(apiKey.trim()),
    }))
  }

  const updateAiAgent = (updates: Partial<AiAgentSettings>) => {
    setAiAgent((prev) => ({ ...prev, ...updates }))
  }

  const updateOrganization = (updates: Partial<OrganizationSettings>) => {
    setOrganization((prev) => ({ ...prev, ...updates }))
  }

  const updateInvoiceDetail = (updates: Partial<InvoiceDetailSettings>) => {
    setInvoiceDetail((prev) => ({ ...prev, ...updates }))
  }

  const updateAutomation = (updates: Partial<AutomationSettings>) => {
    setAutomation((prev) => ({ ...prev, ...updates }))
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
