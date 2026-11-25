import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import type { ChannelType, ChatFilterType, ChatConversation } from '../types/inbox.types'
import { useToast } from '../components/ui/Toast'
import { inboxService } from '../services/inboxService'
import { useAuth } from './AuthContext'

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
  refreshConversations: () => Promise<void>
  loading: boolean
}

const InboxContext = createContext<InboxContextType | undefined>(undefined)

export const InboxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast()
  const { user } = useAuth()

  const [conversations, setConversations] = useState<ChatConversation[]>([])

  const [activeChannel, setActiveChannel] = useState<ChannelType>('whatsapp')
  const [selectedChat, setSelectedChat] = useState<ChatConversation | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<ChatFilterType>('All')
  const [selectedStage, setSelectedStage] = useState('All stages')
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

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
      console.warn('Could not load inbox:', err)
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
      if (filterType === 'Mine' && (!user?.name || c.assignedTo !== user.name)) return false
      if (filterType === 'Unassigned' && c.assignedTo && c.assignedTo !== 'Unassigned') return false

      // Stage filter
      if (selectedStage !== 'All stages' && c.stage !== selectedStage) {
        return false
      }

      return true
    })
  }, [conversations, activeChannel, searchQuery, filterType, selectedStage, user?.name])

  const updateConversation = (conversation: ChatConversation) => {
    setConversations((previous) => previous.map((item) => item.id === conversation.id ? conversation : item))
    setSelectedChat((current) => current?.id === conversation.id ? conversation : current)
  }

  const sendMessage = async (chatId: string, content: string) => {
    if (!content.trim()) return
    try {
      const { conversation } = await inboxService.sendMessage(chatId, content)
      updateConversation(conversation)
    } catch (error) {
      toast({ type: 'error', title: 'Could not save message', description: (error as Error).message })
      throw error
    }
  }

  const toggleFavourite = async (chatId: string) => {
    try {
      updateConversation(await inboxService.toggleFavourite(chatId))
    } catch (error) {
      toast({ type: 'error', title: 'Could not update conversation', description: (error as Error).message })
    }
  }

  const startNewChat: InboxContextType['startNewChat'] = async (data) => {
    try {
      const created = await inboxService.createConversation({ ...data, channel: activeChannel })
      setConversations((previous) => [created, ...previous])
      setSelectedChat(created)
      setIsNewChatModalOpen(false)
      toast({ title: 'Conversation created', type: 'success' })
    } catch (error) {
      toast({ type: 'error', title: 'Could not create conversation', description: (error as Error).message })
      throw error
    }
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
