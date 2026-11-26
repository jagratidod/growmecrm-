import {
  LayoutGrid, CalendarDays, Inbox, Send, PhoneCall, GitFork, CalendarCheck, Receipt,
  Map, Package, Compass, Building2, Users, User, Plug, Bot, Zap, Globe, Share2,
  ListChecks, FileSpreadsheet, LogOut, X,
} from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { useRouter } from '../../../context/RouterContext'
import { useWorkspace } from '../../workspace/WorkspaceAccess'
import { routeModules } from '../../workspace/workspaceApi'
import '../../workspace/workspace.css'

const navigation = [
  { title: 'Workspace', items: [['Dashboard', '/dashboard', LayoutGrid], ['Websites', '/websites', Globe]] },
  { title: 'CRM', items: [
    ['Leads', '/leads', ListChecks], ['Follow-ups', '/follow-ups', CalendarCheck],
    ['Bookings', '/bookings', CalendarCheck], ['Calendar', '/calendar', CalendarDays],
    ['Inbox', '/inbox', Inbox], ['Communications', '/communications', Send],
    ['Call Log', '/call-log', PhoneCall], ['Bot Flows', '/bot-flows', GitFork],
    ['Invoices', '/invoices', FileSpreadsheet], ['Bills', '/bills', Receipt],
  ] },
  { title: 'Catalog', items: [['Packages', '/packages', Package], ['Itineraries', '/itineraries', Map], ['Hotels', '/hotels', Building2], ['Sightseeing', '/sightseeing', Compass]] },
  { title: 'Settings', items: [
    ['Team', '/team', Users], ['Organization', '/organization', Building2], ['My profile', '/profile', User],
    ['Host Page', '/host-page', Globe], ['LinkTree', '/linktree', Share2], ['Invoice Detail', '/invoice-detail', Receipt],
    ['Channels', '/channels', Plug], ['AI Agent', '/ai-agent', Bot], ['Automation', '/automation', Zap],
  ] },
] as const

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
  currentPath?: string
  onSelectMenu?: (menuName: string) => void
}

export function LeadsSidebar({ isOpen = false, onClose, currentPath, onSelectMenu }: SidebarProps) {
  const { logout, user } = useAuth()
  const { access } = useWorkspace()
  const { navigate, path } = useRouter()
  const agency = user?.organizationName || 'GrowMe Workspace'
  const initials = agency.split(/\s+/).map((word) => word[0]).join('').slice(0, 2).toUpperCase()
  return <>
    {isOpen && <button className="gm-sidebar-backdrop" aria-label="Close menu" onClick={onClose} />}
    <aside className={`gm-sidebar ${isOpen ? 'is-open' : ''}`}>
      <div className="gm-sidebar-brand"><span className="gm-sidebar-mark">{initials}</span>
        <div><strong>{agency}</strong><small>GrowMe Workspace</small></div>
        {onClose && <button className="gm-mobile gm-icon-button" aria-label="Close menu" onClick={onClose}><X size={18} /></button>}
      </div>
      <nav aria-label="Workspace navigation">
        {navigation.map(({ title, items }) => {
          const visible = items.filter(([, route]) => !routeModules[route] || access?.modules.includes(routeModules[route]))
          if (!visible.length) return null
          return <div className="gm-nav-group" key={title}><h2>{title}</h2>{visible.map(([name, route, Icon]) => {
            const active = currentPath === name || path === route || path.startsWith(`${route}/`)
            return <button key={route} aria-current={active ? 'page' : undefined} onClick={() => {
              onSelectMenu?.(name)
              navigate(route)
              onClose?.()
            }}><Icon size={17} />{name}</button>
          })}</div>
        })}
      </nav>
      {sessionStorage.getItem('growme_support_return') && <button className="gm-sidebar-return" onClick={() => {
        const original = JSON.parse(sessionStorage.getItem('growme_support_return') || '{}') as { token?: string; user?: string }
        sessionStorage.removeItem('growme_support_return')
        if (!original.token || !original.user) return
        sessionStorage.setItem('crm_auth_token', original.token)
        sessionStorage.setItem('crm_auth_user', original.user)
        window.location.assign('/super-admin/clients')
      }}>Return to Super Admin</button>}
      <div className="gm-sidebar-footer"><div><strong>{user?.name || 'Account'}</strong><small>{user?.role}</small></div><button aria-label="Sign out" onClick={async () => { await logout(); navigate('/login') }}><LogOut size={18} /></button></div>
    </aside>
  </>
}
