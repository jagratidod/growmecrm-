import { MessageCircle, Maximize2, Minimize2, Plus, RefreshCw } from 'lucide-react'
import { InstagramIcon } from './InstagramIcon'
import { useInbox } from '../../../context/InboxContext'

export function InboxHeader({ isFullscreen, onToggleFullscreen }: { isFullscreen: boolean; onToggleFullscreen: () => void }) {
  const { activeChannel, setActiveChannel, setIsNewChatModalOpen, refreshConversations, loading } = useInbox()

  return <header className="space-y-4">
    <div className="gm-heading"><h1>Inbox</h1></div>
    <div className="gm-row">
      <div className="gm-stage-filters !m-0" role="group" aria-label="Inbox channel">
        <button type="button" aria-pressed={activeChannel === 'whatsapp'} onClick={() => setActiveChannel('whatsapp')}><MessageCircle size={16} /> WhatsApp</button>
        <button type="button" aria-pressed={activeChannel === 'instagram'} onClick={() => setActiveChannel('instagram')}><InstagramIcon className="w-4 h-4" /> Instagram</button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button className="gm-button secondary" type="button" aria-label="Refresh inbox" onClick={refreshConversations} disabled={loading}><RefreshCw size={15} /></button>
        <button className="gm-button secondary gm-inbox-expand" type="button" onClick={onToggleFullscreen} aria-label={isFullscreen ? 'Exit expanded view' : 'Expand inbox'}>
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
        <button className="gm-button" type="button" onClick={() => setIsNewChatModalOpen(true)}><Plus size={16} /> New conversation</button>
      </div>
    </div>
  </header>
}
