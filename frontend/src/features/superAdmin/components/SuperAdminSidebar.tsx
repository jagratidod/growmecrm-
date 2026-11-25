import {
  LayoutDashboard, Building2, CreditCard, Megaphone, History, Activity, Sliders, LogOut, X, Crown,
} from 'lucide-react'
import { useRouter } from '../../../context/RouterContext'
import { useAuth } from '../../../context/AuthContext'

interface SuperAdminSidebarProps {
  isOpen?: boolean
  onClose?: () => void
  currentPath?: string
}

const navigationItems = [
  { name: 'Clients', icon: Building2, path: '/super-admin/clients' },
  { name: 'Dashboard', icon: LayoutDashboard, path: '/super-admin' },
  { name: 'Agencies & Admins', icon: Building2, path: '/super-admin/tenants' },
  { name: 'Subscription Models', icon: CreditCard, path: '/super-admin/subscriptions' },
  { name: 'Global Broadcasts', icon: Megaphone, path: '/super-admin/announcements' },
  { name: 'Security Audit Logs', icon: History, path: '/super-admin/audit-logs' },
  { name: 'Webhook Health', icon: Activity, path: '/super-admin/webhooks' },
  { name: 'Platform Settings', icon: Sliders, path: '/super-admin/settings' },
]

export function SuperAdminSidebar({ isOpen = false, onClose, currentPath = 'Dashboard' }: SuperAdminSidebarProps) {
  const { navigate } = useRouter()
  const { user, logout } = useAuth()

  return (
    <>
      {isOpen && <button className="gm-sidebar-backdrop" aria-label="Close menu" onClick={onClose} />}
      <aside className={`gm-sidebar ${isOpen ? 'is-open' : ''}`}>
        <div className="gm-sidebar-brand">
          <span className="gm-sidebar-mark"><Crown size={19} /></span>
          <div><strong>GrowMe</strong><small>Platform administration</small></div>
          {onClose && <button className="gm-mobile gm-icon-button" aria-label="Close menu" onClick={onClose}><X size={18} /></button>}
        </div>
        <nav aria-label="Super Admin navigation">
          <div className="gm-nav-group">
            <h2>Administration</h2>
            {navigationItems.map(({ name, path, icon: Icon }) =>
              <button key={path} type="button" aria-current={currentPath === name ? 'page' : undefined}
                onClick={() => { navigate(path); onClose?.() }}>
                <Icon size={17} /> <span>{name}</span>
              </button>
            )}
          </div>
        </nav>
        <div className="gm-sidebar-footer">
          <div><strong>{user?.name || 'Super Admin'}</strong><small>Super Admin</small></div>
          <button aria-label="Sign out" onClick={async () => { await logout(); navigate('/login') }}><LogOut size={18} /></button>
        </div>
      </aside>
    </>
  )
}
