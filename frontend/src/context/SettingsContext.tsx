import { useRouter } from './RouterContext'
import { useWorkspace } from '../features/workspace/WorkspaceAccess'
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
  updateInvoiceDetail: (updates: Partial<InvoiceDetailSettings>) => Promise<void>
  automation: AutomationSettings
  updateAutomation: (updates: Partial<AutomationSettings>) => void
}

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
  const { path } = useRouter()
  const { access } = useWorkspace()
  const financeEnabled = access?.modules.includes('finance') && ['/invoices', '/invoice-detail'].includes(path)
  const communicationsSettings = access?.modules.includes('communications') && ['/channels', '/ai-agent', '/automation'].includes(path)
  const [profile, setProfile] = useState<UserProfileSettings>(() => user ? {
    fullName: user.name,
    email: user.email,
    role: user.role.charAt(0).toUpperCase() + user.role.slice(1),
    organization: user.organizationName || '',
    memberSince: user.memberSince || '',
    lastSignIn: user.lastSignIn || '',
  } : DEFAULT_PROFILE)
  const [channels, setChannels] = useState<ChannelsSettings>(DEFAULT_CHANNELS)
  const [aiAgent, setAiAgent] = useState<AiAgentSettings>(DEFAULT_AI_AGENT)
  const [organization, setOrganization] = useState<OrganizationSettings>({
    ...DEFAULT_ORGANIZATION,
    agencyName: user?.organizationName || '',
  })

  const [invoiceDetail, setInvoiceDetail] = useState(DEFAULT_INVOICE_DETAIL)

  useEffect(() => {
    if (!financeEnabled) return
    let active = true
    settingsService.getInvoiceDetail().then(
      ({ invoiceDetail }) => { if (active) setInvoiceDetail({ ...DEFAULT_INVOICE_DETAIL, ...invoiceDetail }) },
      (error: Error) => { if (active) console.warn('Could not load invoice details:', error.message) },
    )
    return () => { active = false }
  }, [financeEnabled])

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
    if (communicationsSettings && user?.organizationId) void fetchSettings()
  }, [communicationsSettings, user?.organizationId])

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

  const updateInvoiceDetail = async (updates: Partial<InvoiceDetailSettings>) => {
    const { invoiceDetail } = await settingsService.updateInvoiceDetail(updates)
    setInvoiceDetail({ ...DEFAULT_INVOICE_DETAIL, ...invoiceDetail })
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
