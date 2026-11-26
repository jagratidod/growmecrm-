import { Menu, UserPlus } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { useTeam } from '../../../context/TeamContext'

export function TeamHeader({ onOpenMobileMenu }: { onOpenMobileMenu?: () => void }) {
  const { setIsInviteModalOpen } = useTeam()
  const { user } = useAuth()
  const canManage = user?.role === 'owner' || user?.role === 'admin'

  return <header className="gm-row gm-heading mb-5">
    <div className="flex items-center gap-2">
      {onOpenMobileMenu && <button type="button" className="gm-mobile gm-icon-button" aria-label="Open menu" onClick={onOpenMobileMenu}><Menu size={20} /></button>}
      <h1>Team</h1>
    </div>
    {canManage && <button type="button" className="gm-button" onClick={() => setIsInviteModalOpen(true)}><UserPlus size={16} /> Invite teammate</button>}
  </header>
}
