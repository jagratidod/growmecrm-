import React, { useState } from 'react'
import { LeadsSidebar } from '../leads/components/LeadsSidebar'
import { InboxHeader } from './components/InboxHeader'
import { InboxSidebarList } from './components/InboxSidebarList'
import { InboxEmptyPane } from './components/InboxEmptyPane'
import { InboxChatPane } from './components/InboxChatPane'
import { NewChatModal } from './components/NewChatModal'
import { useInbox } from '../../context/InboxContext'
import { Menu } from 'lucide-react'

interface InboxPageProps {
  onNavigateMenu?: (menu: string) => void
}

export const InboxPage: React.FC<InboxPageProps> = ({ onNavigateMenu }) => {
  const { selectedChat } = useInbox()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  return (
    <div className="min-h-screen bg-canvas flex text-slate-800 font-sans">
      {/* Sidebar with active Inbox tab cutout */}
      {!isFullscreen && (
        <LeadsSidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          currentPath="Inbox"
          onSelectMenu={onNavigateMenu}
        />
      )}

      {/* Main CRM Application Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Mobile Top App Bar */}
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-brand text-white flex items-center justify-center font-bold text-xs">
              TT
            </div>
            <span className="font-bold text-sm text-slate-900">Inbox</span>
          </div>
          <div className="w-9" />
        </div>

        <main className="flex-1 p-3 sm:p-5 lg:p-8 max-w-7xl w-full mx-auto space-y-5 flex flex-col">
          {/* Header */}
          <InboxHeader
            isFullscreen={isFullscreen}
            onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
          />

          {/* Main 2-Panel Inbox Box matching screenshots */}
          <div className="flex-1 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col lg:flex-row h-[78vh] min-h-[580px]">
            {/* Left Chat / Conversation List */}
            <InboxSidebarList />

            {/* Right Message Pane (Empty state or active chat) */}
            {selectedChat ? <InboxChatPane /> : <InboxEmptyPane />}
          </div>
        </main>
      </div>

      {/* Start New Chat Modal */}
      <NewChatModal />
    </div>
  )
}
