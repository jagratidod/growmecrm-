import { useState } from 'react'
import { ArrowLeft, Menu } from 'lucide-react'
import { LeadsSidebar } from '../leads/components/LeadsSidebar'
import { InboxHeader } from './components/InboxHeader'
import { InboxSidebarList } from './components/InboxSidebarList'
import { InboxEmptyPane } from './components/InboxEmptyPane'
import { InboxChatPane } from './components/InboxChatPane'
import { NewChatModal } from './components/NewChatModal'
import { useInbox } from '../../context/InboxContext'

export function InboxPage() {
  const { selectedChat, setSelectedChat, openingChat, threadError, refreshConversations } = useInbox()
  const [menuOpen, setMenuOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)

  return <div className="gm-shell">
    {!expanded && <LeadsSidebar isOpen={menuOpen} onClose={() => setMenuOpen(false)} />}
    <main className="gm-main gm-crm-content">
      {!expanded && <button type="button" className="gm-mobile gm-icon-button" aria-label="Open menu" onClick={() => setMenuOpen(true)}><Menu size={20} /></button>}
      <InboxHeader isFullscreen={expanded} onToggleFullscreen={() => setExpanded(!expanded)} />
      <div className={`gm-inbox-layout ${selectedChat ? 'has-thread' : ''}`}>
        <InboxSidebarList />
        <section className="gm-inbox-thread" aria-label="Conversation thread">
          {selectedChat ? (openingChat || threadError ? <div className="gm-inbox-empty">
            <button className="gm-button secondary gm-inbox-back" type="button" onClick={() => setSelectedChat(null)}><ArrowLeft size={16} /> Conversations</button>
            {threadError ? <p role="alert">{threadError}</p> : <p role="status">Loading conversation…</p>}
            {threadError && <button className="gm-button secondary" type="button" onClick={refreshConversations}>Retry</button>}
          </div> : <InboxChatPane key={selectedChat.id} />) : <InboxEmptyPane />}
        </section>
      </div>
      <NewChatModal />
    </main>
  </div>
}
