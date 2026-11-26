import {
  LayoutGrid, CalendarDays, Inbox, Send, PhoneCall, GitFork, CalendarCheck, Receipt,
  Map, Package, Compass, Building2, Users, User, Plug, Bot, Zap, Globe,
  ListChecks, FileSpreadsheet, LogOut, X, Bell,
} from 'lucide-react'
import { useEffect, useLayoutEffect, useRef } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useRouter } from '../../../context/RouterContext'
import { useWorkspace } from '../../workspace/WorkspaceAccess'
import { preloadWorkspaceRoute } from '../../workspace/workspaceRoutes'
import { routeModules } from '../../workspace/workspaceApi'

const navigation = [
  { title: 'Workspace', items: [['Dashboard', '/dashboard', LayoutGrid], ['Websites', '/websites', Globe]] },
  { title: 'CRM', items: [
    ['Leads', '/leads', ListChecks], ['Follow-ups', '/follow-ups', Bell],
    ['Bookings', '/bookings', CalendarCheck], ['Events', '/events', CalendarDays], ['Calendar', '/calendar', CalendarDays],
  ] },
  { title: 'Communication', items: [
    ['Inbox', '/inbox', Inbox], ['Communications', '/communications', Send],
    ['Call Log', '/call-log', PhoneCall], ['Bot Flows', '/bot-flows', GitFork],
  ] },
  { title: 'Finance', items: [
    ['Invoices', '/invoices', FileSpreadsheet], ['Bills', '/bills', Receipt],
  ] },
  { title: 'Catalog', items: [['Packages', '/packages', Package], ['Itineraries', '/itineraries', Map], ['Hotels', '/hotels', Building2], ['Sightseeing', '/sightseeing', Compass]] },
  { title: 'Settings', items: [
    ['Team', '/team', Users], ['Organization', '/organization', Building2],
    ['Invoice Detail', '/invoice-detail', Receipt],
    ['Channels', '/channels', Plug], ['AI Agent', '/ai-agent', Bot], ['Automation', '/automation', Zap],
  ] },
] as const

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
  currentPath?: string
  onSelectMenu?: (menuName: string) => void
}

export function LeadsSidebar({ isOpen = false, onClose, onSelectMenu }: SidebarProps) {
  const { logout, user } = useAuth()
  const { access } = useWorkspace()
  const { navigate, path, sidebar } = useRouter()
  const navigationRef = useRef<HTMLElement>(null)
  useLayoutEffect(() => {
    if (navigationRef.current) navigationRef.current.scrollTop = sidebar.scrollTop
  }, [sidebar])
  const agency = user?.organizationName || 'GrowMe Workspace'
  useEffect(() => {
    if (!isOpen || !onClose) return
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [isOpen, onClose])
  const isCurrent = (route: string) => path === route || path.startsWith(`${route}/`)
  const initials = agency.split(/\s+/).map((word) => word[0]).join('').slice(0, 2).toUpperCase()
  return <>
    {isOpen && <button className="gm-sidebar-backdrop" aria-label="Close menu" onClick={onClose} />}
    <aside className={`gm-sidebar ${isOpen ? 'is-open' : ''}`}>
      <div className="gm-sidebar-brand"><span className="gm-sidebar-mark">{initials}</span>
        <div><strong>{agency}</strong><small>GrowMe Workspace</small></div>
        {onClose && <button className="gm-mobile gm-icon-button" aria-label="Close menu" onClick={onClose}><X size={18} /></button>}
      </div>
      <nav ref={navigationRef} aria-label="Workspace navigation" onScroll={(event) => { sidebar.scrollTop = event.currentTarget.scrollTop }}>
        {navigation.map(({ title, items }) => {
          const visible = items.filter(([, route]) => !routeModules[route] || access?.modules.includes(routeModules[route]))
          if (!visible.length) return null
          const links = visible.map(([name, route, Icon]) => <a key={route} href={route}
            aria-current={isCurrent(route) ? 'page' : undefined}
            onPointerEnter={() => preloadWorkspaceRoute(route)} onFocus={() => preloadWorkspaceRoute(route)}
            onClick={(event) => {
              if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
              event.preventDefault()
              onSelectMenu?.(name)
              navigate(route)
              onClose?.()
            }}><Icon size={17} aria-hidden="true" />{name}</a>)
          return <div className="gm-nav-group" key={title}>
            {title !== 'Workspace' && <p className="gm-nav-group-label">{title}</p>}
            {links}
          </div>
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
      <div className="gm-sidebar-footer"><a className="gm-sidebar-profile" href="/profile" onPointerEnter={() => preloadWorkspaceRoute('/profile')} onFocus={() => preloadWorkspaceRoute('/profile')} aria-current={path === '/profile' ? 'page' : undefined} onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
        event.preventDefault()
        navigate('/profile')
        onClose?.()
      }}><User size={17} aria-hidden="true" /><div><strong>{user?.name || 'My profile'}</strong><small>My profile</small></div></a><button aria-label="Sign out" onClick={async () => { await logout(); navigate('/login') }}><LogOut size={18} /></button></div>
    </aside>
  </>
}
