import React from 'react'
import {
  Search,
  Users,
  Inbox as InboxIcon,
  Star,
  User,
} from 'lucide-react'
import { useInbox } from '../../../context/InboxContext'
import type { ChatFilterType } from '../../../types/inbox.types'

const FILTER_TABS: ChatFilterType[] = ['All', 'Unread', 'Favourites', 'Mine', 'Unassigned']

const STAGES = [
  { name: 'All stages', color: 'border-slate-800 text-slate-800 bg-slate-900 text-white' },
  { name: 'New', color: 'border-blue-200 text-blue-600 bg-blue-50' },
  { name: 'Contacted', color: 'border-purple-200 text-purple-600 bg-purple-50' },
  { name: 'Qualified', color: 'border-pink-200 text-pink-600 bg-pink-50' },
  { name: 'Proposal', color: 'border-amber-200 text-amber-600 bg-amber-50' },
]

export const InboxSidebarList: React.FC = () => {
  const {
    activeChannel,
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
    toggleFavourite,
  } = useInbox()

  const channelConversations = conversations.filter((c) => c.channel === activeChannel)

  return (
    <div className="w-full lg:w-96 border-b lg:border-b-0 lg:border-r border-slate-200/80 bg-white flex flex-col h-full shrink-0">
      {/* Top Header Row matching screenshots */}
      <div className="p-4 sm:p-5 pb-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
            {activeChannel === 'whatsapp' ? 'Chats' : 'Messages'}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">
            {channelConversations.length} {channelConversations.length === 1 ? 'chat' : 'chats'}
          </span>
          <button
            type="button"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold transition-colors cursor-pointer"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Groups</span>
          </button>
        </div>
      </div>

      {/* Search Input matching screenshot */}
      <div className="px-4 py-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder={
              activeChannel === 'whatsapp'
                ? 'Search or start a new chat'
                : 'Search'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-100/70 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-slate-300 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Filter Tabs Row 1 (All, Unread, Favourites, Mine, Unassigned) */}
      <div className="px-4 py-1.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {FILTER_TABS.map((tab) => {
          const isActive = filterType === tab
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setFilterType(tab)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab}
            </button>
          )
        })}
      </div>

      {/* Filter Tabs Row 2 (Stage Pills: All stages · 0, New · 0, etc.) */}
      <div className="px-4 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none border-b border-slate-100">
        {STAGES.map((s) => {
          const isActive = selectedStage === s.name
          const stageCount =
            s.name === 'All stages'
              ? channelConversations.length
              : channelConversations.filter((c) => c.stage === s.name).length

          return (
            <button
              key={s.name}
              type="button"
              onClick={() => setSelectedStage(s.name)}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap border transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 border-slate-900 text-white'
                  : `${s.color} hover:opacity-80`
              }`}
            >
              {s.name} · {stageCount}
            </button>
          )
        })}
      </div>

      {/* Conversations List / Empty State */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
        {filteredConversations.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center my-12">
            {/* Rounded light-purple badge matching screenshots */}
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-brand mb-3 shadow-2xs">
              <InboxIcon className="w-6 h-6 stroke-[1.75]" />
            </div>

            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              No conversations yet
            </h3>

            <p className="text-xs text-slate-500 max-w-xs mt-1 leading-relaxed">
              {activeChannel === 'whatsapp'
                ? 'Incoming WhatsApp messages will show up here automatically.'
                : 'Incoming Instagram DMs will show up here automatically.'}
            </p>
          </div>
        ) : (
          filteredConversations.map((chat) => {
            const isSelected = selectedChat?.id === chat.id
            return (
              <div
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className={`p-3 rounded-xl transition-all cursor-pointer flex items-start gap-3 relative group ${
                  isSelected
                    ? 'bg-purple-50/70 border border-purple-200/80 shadow-2xs'
                    : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                {/* Contact Avatar */}
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full bg-purple-100 text-brand flex items-center justify-center font-bold text-xs overflow-hidden">
                    {chat.contactAvatar ? (
                      <img
                        src={chat.contactAvatar}
                        alt={chat.contactName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </div>
                  {/* Channel icon badge */}
                  <span
                    className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] ${
                      chat.channel === 'whatsapp' ? 'bg-[#00a884]' : 'bg-[#e1306c]'
                    }`}
                  >
                    {chat.channel === 'whatsapp' ? 'W' : 'IG'}
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {chat.contactName}
                    </h4>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {chat.lastMessageTime}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {chat.lastMessage}
                  </p>

                  <div className="flex items-center justify-between gap-2 mt-1.5">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      {chat.stage}
                    </span>

                    <div className="flex items-center gap-1">
                      {chat.unreadCount > 0 && (
                        <span className="w-4 h-4 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center">
                          {chat.unreadCount}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFavourite(chat.id)
                        }}
                        className="p-0.5 text-slate-300 hover:text-amber-400 transition-colors"
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${
                            chat.isFavourite ? 'fill-amber-400 text-amber-400' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
