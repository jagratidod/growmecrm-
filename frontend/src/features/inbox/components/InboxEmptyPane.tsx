import { MessageCircle } from 'lucide-react'
export function InboxEmptyPane() {
  return <div className="gm-inbox-empty"><MessageCircle size={27} /><h2>Select a conversation</h2><p>Messages appear here when you open a conversation.</p></div>
}
