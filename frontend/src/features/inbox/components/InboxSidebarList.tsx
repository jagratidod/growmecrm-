import { Search, Inbox, Star } from 'lucide-react'
import { useInbox } from '../../../context/InboxContext'
import { leadStages } from '../../../types/lead.types'
import type { ChatFilterType } from '../../../types/inbox.types'

const filters: ChatFilterType[] = ['All', 'Unread', 'Favourites', 'Mine', 'Unassigned']
const stages = [...leadStages.slice(0, 3), 'Proposal', ...leadStages.slice(3)]

export function InboxSidebarList() {
  const {
    activeChannel, conversations, filteredConversations, selectedChat, setSelectedChat, searchQuery,
    setSearchQuery, filterType, setFilterType, selectedStage, setSelectedStage,
    toggleFavourite, loading, loadError, refreshConversations,
  } = useInbox()
  const count = conversations.filter((chat) => chat.channel === activeChannel).length
  const filterActive = Boolean(searchQuery || filterType !== 'All' || selectedStage !== 'All stages')

  return <aside className="gm-inbox-list" aria-label="Conversations">
    <div className="gm-inbox-toolbar">
      <div className="gm-row"><h2>Conversations</h2><small>{count} total</small></div>
      <label className="gm-crm-search"><Search size={15} /><input type="search" aria-label="Search conversations" placeholder="Search conversations" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} /></label>
      <div className="gm-inbox-filters">
        <select aria-label="Conversation filter" value={filterType} onChange={(event) => setFilterType(event.target.value as ChatFilterType)}>
          {filters.map((filter) => <option key={filter}>{filter}</option>)}
        </select>
        <select aria-label="Conversation stage" value={selectedStage} onChange={(event) => setSelectedStage(event.target.value)}>
          {['All stages', ...stages].map((stage) => <option key={stage}>{stage}</option>)}
        </select>
      </div>
    </div>
    <div className="gm-inbox-rows" aria-busy={loading}>
      {loadError ? <div className="gm-inbox-feedback" role="alert">{loadError}<button className="gm-text-button" onClick={refreshConversations}>Retry</button></div>
        : loading && !count ? <p className="gm-inbox-feedback" role="status">Loading conversations…</p>
        : filteredConversations.length ? <ul>{filteredConversations.map((chat) => <li key={chat.id} className={selectedChat?.id === chat.id ? 'is-selected' : ''}>
          <button className="gm-inbox-row" type="button" aria-current={selectedChat?.id === chat.id ? 'true' : undefined} onClick={() => setSelectedChat(chat)}>
            <span className="gm-inbox-avatar">{chat.contactName.trim().charAt(0).toUpperCase() || '?'}</span>
            <span className="gm-inbox-preview"><strong>{chat.contactName}</strong><small>{chat.lastMessage || chat.stage}</small></span>
            {chat.unreadCount > 0 && <span className="gm-inbox-unread" aria-label={`${chat.unreadCount} unread`}>{chat.unreadCount}</span>}
          </button>
          <button className="gm-icon-button gm-inbox-favourite" type="button" aria-label={`Favourite ${chat.contactName}`} aria-pressed={chat.isFavourite} onClick={() => toggleFavourite(chat.id)}><Star size={17} fill={chat.isFavourite ? 'currentColor' : 'none'} /></button>
        </li>)}</ul> : <div className="gm-inbox-feedback"><Inbox size={22} /><p>{filterActive ? 'No matching conversations.' : 'No conversations yet.'}</p>
          {filterActive && <button type="button" className="gm-text-button" onClick={() => { setSearchQuery(''); setFilterType('All'); setSelectedStage('All stages') }}>Clear filters</button>}
        </div>}
    </div>
  </aside>
}
