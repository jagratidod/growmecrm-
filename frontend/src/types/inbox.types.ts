export type ChannelType = 'whatsapp' | 'instagram'

export type ChatFilterType = 'All' | 'Unread' | 'Favourites' | 'Mine' | 'Unassigned'

export interface ChatMessage {
  id: string
  sender: 'contact' | 'agent' | 'system'
  content: string
  timestamp: string
  status?: 'sent' | 'delivered' | 'read'
}

export interface ChatConversation {
  id: string
  channel: ChannelType
  contactName: string
  contactPhone?: string
  contactHandle?: string
  contactAvatar?: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  stage: string
  isFavourite: boolean
  assignedTo: string
  messages: ChatMessage[]
}
