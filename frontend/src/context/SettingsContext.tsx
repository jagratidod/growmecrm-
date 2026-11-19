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

interface SettingsContextType {
  profile: UserProfileSettings
  updateProfile: (updates: Partial<UserProfileSettings>) => void
  channels: ChannelsSettings
  toggleChannel: (channel: 'whatsapp' | 'instagram') => void
  updateEmailConfig: (fromAddress: string, apiKey: string) => void
  aiAgent: AiAgentSettings
  updateAiAgent: (updates: Partial<AiAgentSettings>) => void
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
