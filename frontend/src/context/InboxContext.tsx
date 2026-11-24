import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import type { ChannelType, ChatFilterType, ChatConversation, ChatMessage } from '../types/inbox.types'
import { useToast } from '../components/ui/Toast'
import { inboxService } from '../services/inboxService'

interface InboxContextType {
  activeChannel: ChannelType
  setActiveChannel: (channel: ChannelType) => void
  conversations: ChatConversation[]
  filteredConversations: ChatConversation[]
  selectedChat: ChatConversation | null
  setSelectedChat: (chat: ChatConversation | null) => void
  searchQuery: string
  setSearchQuery: (q: string) => void
  filterType: ChatFilterType
  setFilterType: (f: ChatFilterType) => void
  selectedStage: string
  setSelectedStage: (stage: string) => void
  sendMessage: (chatId: string, content: string) => Promise<void>
  toggleFavourite: (chatId: string) => Promise<void>
  startNewChat: (data: { contactName: string; contactPhone?: string; contactHandle?: string; initialMessage?: string }) => Promise<void>
  isNewChatModalOpen: boolean
  setIsNewChatModalOpen: (open: boolean) => void
  loadDemoConversations: () => Promise<void>
  clearAllConversations: () => void
  refreshConversations: () => Promise<void>
  loading: boolean
}

const STORAGE_KEY = 'treki_crm_inbox_data'

const InboxContext = createContext<InboxContextType | undefined>(undefined)

export const InboxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast()

  const [conversations, setConversations] = useState<ChatConversation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.error('Failed to parse inbox conversations', e)
    }
    return []
  })

  const [activeChannel, setActiveChannel] = useState<ChannelType>('whatsapp')
  const [selectedChat, setSelectedChat] = useState<ChatConversation | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<ChatFilterType>('All')
  const [selectedStage, setSelectedStage] = useState('All stages')
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
    } catch (e) {
      console.error('Failed to save inbox data', e)
    }
  }, [conversations])

  // Fetch from backend
  const refreshConversations = useCallback(async () => {
    try {
      setLoading(true)
      const data = await inboxService.getConversations({
        channel: 'all',
      })
      if (Array.isArray(data)) {
        setConversations(data)
        if (!selectedChat && data.length > 0) {
          const match = data.find((c) => c.channel === activeChannel) || data[0]
          setSelectedChat(match)
        }
      }
    } catch (err) {
      console.warn('Could not load inbox from backend, using cached state:', err)
    } finally {
      setLoading(false)
    }
  }, [activeChannel, selectedChat])

  useEffect(() => {
    refreshConversations()
  }, [])

  // Reset selected chat if channel changes and chat isn't in that channel
  useEffect(() => {
    if (selectedChat && selectedChat.channel !== activeChannel) {
      const firstInChannel = conversations.find((c) => c.channel === activeChannel) || null
      setSelectedChat(firstInChannel)
    }
  }, [activeChannel, conversations, selectedChat])

  // Filter conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      // Must match active channel
      if (c.channel !== activeChannel) return false

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const nameMatch = c.contactName.toLowerCase().includes(q)
        const phoneMatch = c.contactPhone?.toLowerCase().includes(q)
        const handleMatch = c.contactHandle?.toLowerCase().includes(q)
        const msgMatch = c.lastMessage?.toLowerCase().includes(q)
        if (!nameMatch && !phoneMatch && !handleMatch && !msgMatch) return false
      }

      // Filter tabs
      if (filterType === 'Unread' && c.unreadCount === 0) return false
      if (filterType === 'Favourites' && !c.isFavourite) return false
      if (filterType === 'Mine' && !c.assignedTo?.toLowerCase().includes('kushal')) return false
      if (filterType === 'Unassigned' && c.assignedTo && c.assignedTo !== 'Unassigned') return false

      // Stage filter
      if (selectedStage !== 'All stages' && c.stage !== selectedStage) {
        return false
      }

      return true
    })
  }, [conversations, activeChannel, searchQuery, filterType, selectedStage])

  const sendMessage = async (chatId: string, content: string) => {
    if (!content.trim()) return

    const timestamp = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(new Date())

    const optimisticMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'agent',
      content: content.trim(),
      timestamp,
      status: 'delivered',
    }

    // Optimistic UI update
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === chatId) {
          const updatedMessages = [...c.messages, optimisticMsg]
          const updatedChat = {
            ...c,
            lastMessage: optimisticMsg.content,
            lastMessageTime: optimisticMsg.timestamp,
            messages: updatedMessages,
          }
          if (selectedChat?.id === chatId) {
            setSelectedChat(updatedChat)
          }
          return updatedChat
        }
        return c
      })
    )

    try {
      const res = await inboxService.sendMessage(chatId, content)
      if (res.conversation) {
        setConversations((prev) =>
          prev.map((c) => (c.id === chatId ? { ...c, ...res.conversation } : c))
        )
      }
    } catch (err) {
      console.error('Failed to sync message to server:', err)
    }
  }

  const toggleFavourite = async (chatId: string) => {
    // Optimistic
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === chatId) {
          const updated = { ...c, isFavourite: !c.isFavourite }
          if (selectedChat?.id === chatId) {
            setSelectedChat(updated)
          }
          return updated
        }
        return c
      })
    )

    try {
      await inboxService.toggleFavourite(chatId)
    } catch (err) {
      console.error('Failed to toggle favourite on server:', err)
    }
  }

  const startNewChat = async (data: {
    contactName: string
    contactPhone?: string
    contactHandle?: string
    initialMessage?: string
  }) => {
    const timestamp = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(new Date())

    const initialMessages: ChatMessage[] = data.initialMessage
      ? [
          {
            id: `msg-${Date.now()}`,
            sender: 'agent',
            content: data.initialMessage,
            timestamp,
            status: 'delivered',
          },
        ]
      : []

    const optimisticChat: ChatConversation = {
      id: `chat-${Date.now()}`,
      channel: activeChannel,
      contactName: data.contactName,
      contactPhone: data.contactPhone,
      contactHandle: data.contactHandle,
      lastMessage: data.initialMessage || 'Conversation started',
      lastMessageTime: timestamp,
      unreadCount: 0,
      stage: 'New',
      isFavourite: false,
      assignedTo: 'Kushal Pareta',
      messages: initialMessages,
    }

    setConversations((prev) => [optimisticChat, ...prev])
    setSelectedChat(optimisticChat)
    setIsNewChatModalOpen(false)
    toast({ title: 'New chat started', type: 'success' })

    try {
      const created = await inboxService.createConversation({
        contactName: data.contactName,
        contactPhone: data.contactPhone,
        contactHandle: data.contactHandle,
        channel: activeChannel,
        initialMessage: data.initialMessage,
        assignedTo: 'Kushal Pareta',
      })
      if (created) {
        setConversations((prev) =>
          prev.map((c) => (c.id === optimisticChat.id ? created : c))
        )
        setSelectedChat(created)
      }
    } catch (err) {
      console.error('Failed to persist new chat to server:', err)
    }
  }

  const loadDemoConversations = async () => {
    try {
      const data = await inboxService.seedDemoConversations()
      setConversations(data)
      if (data.length > 0) {
        setSelectedChat(data[0])
      }
      toast({ title: 'Demo conversations loaded from server', type: 'info' })
    } catch (err) {
      console.warn('Failed to seed demo conversations on server, fallback to local:', err)
      toast({ title: 'Demo conversations loaded', type: 'info' })
    }
  }

  const clearAllConversations = () => {
    setConversations([])
    setSelectedChat(null)
    toast({ title: 'Conversations cleared', type: 'info' })
  }

  return (
    <InboxContext.Provider
      value={{
        activeChannel,
        setActiveChannel,
        conversations,
        filteredConversations,
        selectedChat,
        setSelectedChat,
        searchQuery,
        setSearchQuery,
        filterType,
        setFilterType,
        selectedStage,
        setSelectedStage,
        sendMessage,
        toggleFavourite,
        startNewChat,
        isNewChatModalOpen,
        setIsNewChatModalOpen,
        loadDemoConversations,
        clearAllConversations,
        refreshConversations,
        loading,
      }}
    >
      {children}
    </InboxContext.Provider>
  )
}

export const useInbox = () => {
  const context = useContext(InboxContext)
  if (!context) {
    throw new Error('useInbox must be used within an InboxProvider')
  }
  return context
}
