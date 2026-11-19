import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import type { ChannelType, ChatFilterType, ChatConversation, ChatMessage } from '../types/inbox.types'
import { useToast } from '../components/ui/Toast'

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
  sendMessage: (chatId: string, content: string) => void
  toggleFavourite: (chatId: string) => void
  startNewChat: (data: { contactName: string; contactPhone?: string; contactHandle?: string; initialMessage?: string }) => void
  isNewChatModalOpen: boolean
  setIsNewChatModalOpen: (open: boolean) => void
  loadDemoConversations: () => void
  clearAllConversations: () => void
}

const STORAGE_KEY = 'treki_crm_inbox_data'

const DEMO_CONVERSATIONS: ChatConversation[] = [
  {
    id: 'chat-1',
    channel: 'whatsapp',
    contactName: 'Aarav Mehta',
    contactPhone: '+91 98201 44521',
    contactAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
    lastMessage: 'Hi! Could you share the Bali 5D/4N itinerary brochure?',
    lastMessageTime: '10:45 AM',
    unreadCount: 1,
    stage: 'New',
    isFavourite: true,
    assignedTo: 'Kushal Pareta',
    messages: [
      {
        id: 'msg-1',
        sender: 'contact',
        content: 'Hello, I saw your travel package on Instagram and wanted to check availability for December.',
        timestamp: '10:42 AM',
        status: 'read',
      },
      {
        id: 'msg-2',
        sender: 'agent',
        content: 'Hi Aarav! Wonderful to hear from you. We have prime dates open for Bali with private pool villas.',
        timestamp: '10:44 AM',
        status: 'read',
      },
      {
        id: 'msg-3',
        sender: 'contact',
        content: 'Hi! Could you share the Bali 5D/4N itinerary brochure?',
        timestamp: '10:45 AM',
        status: 'delivered',
      },
    ],
  },
  {
    id: 'chat-2',
    channel: 'instagram',
    contactName: 'Priya Sen',
    contactHandle: '@priya.wanderlust',
    contactAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
    lastMessage: 'Sounds great! What is the booking deposit?',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
    stage: 'Qualified',
    isFavourite: false,
    assignedTo: 'Kushal Pareta',
    messages: [
      {
        id: 'msg-201',
        sender: 'contact',
        content: 'Hey Treki Travels! Loving your recent reels from Gulmarg.',
        timestamp: 'Yesterday 4:15 PM',
        status: 'read',
      },
      {
        id: 'msg-202',
        sender: 'agent',
        content: 'Thanks Priya! We have our winter wonderland batches starting next week.',
        timestamp: 'Yesterday 4:30 PM',
        status: 'read',
      },
      {
        id: 'msg-203',
        sender: 'contact',
        content: 'Sounds great! What is the booking deposit?',
        timestamp: 'Yesterday 4:32 PM',
        status: 'read',
      },
    ],
  },
]

const InboxContext = createContext<InboxContextType | undefined>(undefined)

export const InboxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast()

  // Default to empty array to match the screenshots (which both show 0 chats)
  const [conversations, setConversations] = useState<ChatConversation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.error('Failed to parse inbox conversations', e)
    }
    return []
  })

  // Channel switcher (defaults to 'whatsapp' as in screenshot 2)
  const [activeChannel, setActiveChannel] = useState<ChannelType>('whatsapp')
  const [selectedChat, setSelectedChat] = useState<ChatConversation | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<ChatFilterType>('All')
  const [selectedStage, setSelectedStage] = useState('All stages')
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false)

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
    } catch (e) {
      console.error('Failed to save inbox data', e)
    }
  }, [conversations])

  // Reset selected chat if channel changes and chat isn't in that channel
  useEffect(() => {
    if (selectedChat && selectedChat.channel !== activeChannel) {
      setSelectedChat(null)
    }
  }, [activeChannel, selectedChat])

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
        const msgMatch = c.lastMessage.toLowerCase().includes(q)
        if (!nameMatch && !phoneMatch && !handleMatch && !msgMatch) return false
      }

      // Filter tabs
      if (filterType === 'Unread' && c.unreadCount === 0) return false
      if (filterType === 'Favourites' && !c.isFavourite) return false
      if (filterType === 'Mine' && c.assignedTo !== 'Kushal Pareta') return false
      if (filterType === 'Unassigned' && c.assignedTo) return false

      // Stage filter
      if (selectedStage !== 'All stages' && c.stage !== selectedStage) {
        return false
      }

      return true
    })
  }, [conversations, activeChannel, searchQuery, filterType, selectedStage])

  const sendMessage = (chatId: string, content: string) => {
    if (!content.trim()) return

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'agent',
      content: content.trim(),
      timestamp: new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      }).format(new Date()),
      status: 'delivered',
    }

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === chatId) {
          const updatedMessages = [...c.messages, newMsg]
          const updatedChat = {
            ...c,
            lastMessage: newMsg.content,
            lastMessageTime: newMsg.timestamp,
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
  }

  const toggleFavourite = (chatId: string) => {
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
  }

  const startNewChat = (data: {
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

    const newChat: ChatConversation = {
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

    setConversations((prev) => [newChat, ...prev])
    setSelectedChat(newChat)
    setIsNewChatModalOpen(false)
    toast({ title: 'New chat started', type: 'success' })
  }

  const loadDemoConversations = () => {
    setConversations(DEMO_CONVERSATIONS)
    setSelectedChat(DEMO_CONVERSATIONS[0])
    toast({ title: 'Demo conversations loaded', type: 'info' })
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
