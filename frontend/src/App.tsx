import React, { lazy, Suspense, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './components/ui/Toast'
import { LeadsProvider } from './context/LeadsContext'
import { BookingsProvider } from './context/BookingsContext'
import { TeamProvider } from './context/TeamContext'
import { BillsProvider } from './context/BillsContext'
import { SettingsProvider } from './context/SettingsContext'
import { ItinerariesProvider } from './context/ItinerariesContext'
import { PackagesProvider } from './context/PackagesContext'
import { HotelsProvider } from './context/HotelsContext'
import { SightseeingProvider } from './context/SightseeingContext'
import { HostPageProvider } from './context/HostPageContext'
import { InboxProvider } from './context/InboxContext'
import { CalendarProvider } from './context/CalendarContext'
import { CallLogProvider } from './context/CallLogContext'
import { RouterProvider, useRoutePending, useRouter } from './context/RouterContext'
import { WorkspaceAccess, useWorkspace } from './features/workspace/WorkspaceAccess'
import { clientPages, preloadWorkspaceRoute } from './features/workspace/workspaceRoutes'
import { routeModules, websitePaths } from './features/workspace/workspaceApi'

const AuthPage = lazy(() => import('./features/auth/AuthPage').then((page) => ({ default: page.AuthPage })))
const AcceptInvitePage = lazy(() => import('./features/workspace/AcceptInvitePage').then((page) => ({ default: page.AcceptInvitePage })))
const PlatformConsole = lazy(() => import('./features/workspace/PlatformConsole').then((page) => ({ default: page.PlatformConsole })))
const SuperAdminDashboard = lazy(() => import('./features/superAdmin/SuperAdminDashboard').then((page) => ({ default: page.SuperAdminDashboard })))
const TenantsPage = lazy(() => import('./features/superAdmin/TenantsPage').then((page) => ({ default: page.TenantsPage })))
const SubscriptionsPage = lazy(() => import('./features/superAdmin/SubscriptionsPage').then((page) => ({ default: page.SubscriptionsPage })))
const AnnouncementsPage = lazy(() => import('./features/superAdmin/AnnouncementsPage').then((page) => ({ default: page.AnnouncementsPage })))
const AuditLogsPage = lazy(() => import('./features/superAdmin/AuditLogsPage').then((page) => ({ default: page.AuditLogsPage })))
const WebhookHealthPage = lazy(() => import('./features/superAdmin/WebhookHealthPage').then((page) => ({ default: page.WebhookHealthPage })))
const PlatformSettingsPage = lazy(() => import('./features/superAdmin/PlatformSettingsPage').then((page) => ({ default: page.PlatformSettingsPage })))


const MarketingApp = lazy(() => import('./features/marketing/App.jsx'))
const marketingRoutes = new Set([
  '/', '/about', '/services', '/industries', '/portfolio', '/process', '/careers',
  '/contact', '/get-a-quote', '/privacy-policy', '/terms-and-conditions',
])
const isMarketingPage = (path: string) => marketingRoutes.has(path) ||
  /^\/(services|industries|portfolio)\/[^/]+$/.test(path)

const { '/dashboard': DashboardPage, '/websites': WebsitesPage } = clientPages

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, isRestoringSession, user } = useAuth()
  const { path, navigate } = useRouter()
  const { access, loading: accessLoading } = useWorkspace()

  const legacyWebsitePath = path === '/linktree' ? websitePaths.linkTree : path === '/host-page' ? websitePaths.hostPage : undefined
  const knownClientRoute = path === '/dashboard' || path === '/websites' || path.startsWith('/websites/') || Boolean(clientPages[path])
  const isMarketingRoute = isMarketingPage(path)
  const isSuperAdminRoute = path === '/super-admin' || path.startsWith('/super-admin/')
  const isSuperAdminAuthRoute = path === '/super-admin/login' || path === '/super-admin/forgot-password'
  const hasSuperAdminSession = isAuthenticated && user?.role === 'super_admin'
  const isAuthRoute = isSuperAdminAuthRoute ||
    path === '/login' ||
    path === '/signup' ||
    path === '/register' ||
    path === '/forgot-password' ||
    path === '/accept-invite'

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated && !isAuthRoute && !isMarketingRoute) {
      navigate(isSuperAdminRoute ? '/super-admin/login' : '/login', { replace: true })
    } else if (hasSuperAdminSession && (!isSuperAdminRoute || isSuperAdminAuthRoute)) {
      navigate('/super-admin/clients', { replace: true })
    } else if (isAuthenticated && !hasSuperAdminSession && !isSuperAdminAuthRoute) {
      if (isSuperAdminRoute) {
        navigate('/super-admin/login', { replace: true })
      } else if (legacyWebsitePath && !accessLoading) {
        navigate(access?.modules.includes('websites') ? legacyWebsitePath : '/dashboard', { replace: true })
      } else if (!legacyWebsitePath && !knownClientRoute) {
        navigate('/dashboard', { replace: true })
      }
    }
  }, [isLoading, isAuthenticated, hasSuperAdminSession, navigate, isAuthRoute, isMarketingRoute, isSuperAdminRoute, isSuperAdminAuthRoute, legacyWebsitePath, access, accessLoading, knownClientRoute])

  const modules = access?.modules
  useEffect(() => {
    if (!isAuthenticated || !modules || hasSuperAdminSession) return
    // Start after the current page and its first requests have had a chance to load.
    const timer = window.setTimeout(() => {
      for (const route of ['/dashboard', '/leads', '/bookings']) {
        if (!routeModules[route] || modules.includes(routeModules[route])) preloadWorkspaceRoute(route)
      }
    }, 500)
    return () => window.clearTimeout(timer)
  }, [isAuthenticated, hasSuperAdminSession, modules])

  if (isRestoringSession || (isLoading && !isAuthRoute) || (isAuthenticated && accessLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500">Initializing CRM Session...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated && isMarketingRoute) {
    return <Suspense fallback={<div className="min-h-screen bg-cream" />}>
      <MarketingApp />
    </Suspense>
  }

  if (isSuperAdminAuthRoute && !hasSuperAdminSession) return <AuthPage />

  if (!isAuthenticated && isAuthRoute) {
    return path === '/accept-invite' ? <AcceptInvitePage /> : <AuthPage />
  }

  if (!isAuthenticated || isAuthRoute || legacyWebsitePath) return null

  const requestedModule = routeModules[path] || (path.startsWith('/websites/') ? 'websites' : undefined)
  if (user?.role !== 'super_admin' && (path.startsWith('/super-admin') || (requestedModule && !access?.modules.includes(requestedModule)))) {
    return <DashboardPage />
  }
  if (user?.role === 'super_admin' && !path.startsWith('/super-admin')) return null
  if (path === '/super-admin/clients' || path.startsWith('/super-admin/clients/')) return <PlatformConsole />
  if (path === '/websites' || path.startsWith('/websites/')) return <WebsitesPage />

  // Super Admin Routes:
  if (path === '/super-admin' || path === '/super-admin/dashboard') {
    return <SuperAdminDashboard />
  }

  if (path === '/super-admin/tenants' || path === '/super-admin/admins') {
    return <TenantsPage />
  }

  if (path === '/super-admin/subscriptions' || path === '/super-admin/plans') {
    return <SubscriptionsPage />
  }

  if (path === '/super-admin/announcements' || path === '/super-admin/broadcasts') {
    return <AnnouncementsPage />
  }

  if (path === '/super-admin/audit-logs') {
    return <AuditLogsPage />
  }

  if (path === '/super-admin/webhooks') {
    return <WebhookHealthPage />
  }

  if (path === '/super-admin/settings') {
    return <PlatformSettingsPage />
  }

  const ClientPage = clientPages[path]
  if (ClientPage) return <ClientPage />

  return <DashboardPage />
}

function RouteProgress() {
  const isPending = useRoutePending()
  return isPending ? <div className="gm-route-progress" role="status" aria-label="Switching page" /> : null
}

export default function App() {
  return (
    <RouterProvider>
      <ToastProvider>
        <AuthProvider>
          <WorkspaceAccess>
          <LeadsProvider>
            <BookingsProvider>
              <TeamProvider>
                <BillsProvider>
                  <ItinerariesProvider>
                    <PackagesProvider>
                      <HotelsProvider>
                        <SightseeingProvider>
                          <HostPageProvider>
                            <InboxProvider>
                              <CalendarProvider>
                                <CallLogProvider>
                                  <SettingsProvider>
                                    <RouteProgress />
                                    <Suspense fallback={<div className="min-h-screen bg-canvas" role="status" aria-label="Loading page" />}>
                                      <AppContent />
                                    </Suspense>
                                  </SettingsProvider>
                                </CallLogProvider>
                              </CalendarProvider>
                            </InboxProvider>
                          </HostPageProvider>
                        </SightseeingProvider>
                      </HotelsProvider>
                    </PackagesProvider>
                  </ItinerariesProvider>
                </BillsProvider>
              </TeamProvider>
            </BookingsProvider>
          </LeadsProvider>
          </WorkspaceAccess>
        </AuthProvider>
      </ToastProvider>
    </RouterProvider>
  )
}
