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
import { RouterProvider, useRouter } from './context/RouterContext'
import { AuthPage } from './features/auth/AuthPage'
import { WorkspaceAccess, useWorkspace } from './features/workspace/WorkspaceAccess'
import { WorkspaceHome, WebsitesPage } from './features/workspace/WorkspacePages'
import { AcceptInvitePage } from './features/workspace/AcceptInvitePage'
import { PlatformConsole } from './features/workspace/PlatformConsole'
import { routeModules } from './features/workspace/workspaceApi'
import { LeadsPage } from './features/leads/LeadsPage'
import { BookingsPage } from './features/bookings/BookingsPage'
import { TeamPage } from './features/team/TeamPage'
import { BillsPage } from './features/bills/BillsPage'
import { ItinerariesPage } from './features/itineraries/ItinerariesPage'
import { PackagesPage } from './features/packages/PackagesPage'
import { HotelsPage } from './features/hotels/HotelsPage'
import { SightseeingPage } from './features/sightseeing/SightseeingPage'
import { HostPage } from './features/hostPage/HostPage'
import { InboxPage } from './features/inbox/InboxPage'
import { CalendarPage } from './features/calendar/CalendarPage'
import { CallLogPage } from './features/callLog/CallLogPage'
import { FollowUpsPage } from './features/followUps/FollowUpsPage'
import { InvoicesPage } from './features/invoices/InvoicesPage'
import { LinkTreePage } from './features/linkTree/LinkTreePage'
import { CommunicationsPage } from './features/communications/CommunicationsPage'
import { BotFlowsPage } from './features/botFlows/BotFlowsPage'
import { ProfilePage } from './features/settings/ProfilePage'
import { ChannelsPage } from './features/settings/ChannelsPage'
import { AiAgentPage } from './features/settings/AiAgentPage'
import { OrganizationPage } from './features/settings/OrganizationPage'
import { InvoiceDetailPage } from './features/settings/InvoiceDetailPage'
import { AutomationPage } from './features/settings/AutomationPage'
import { SuperAdminDashboard } from './features/superAdmin/SuperAdminDashboard'
import { TenantsPage } from './features/superAdmin/TenantsPage'
import { SubscriptionsPage } from './features/superAdmin/SubscriptionsPage'
import { AnnouncementsPage } from './features/superAdmin/AnnouncementsPage'
import { AuditLogsPage } from './features/superAdmin/AuditLogsPage'
import { WebhookHealthPage } from './features/superAdmin/WebhookHealthPage'
import { PlatformSettingsPage } from './features/superAdmin/PlatformSettingsPage'

const MarketingApp = lazy(() => import('./features/marketing/App.jsx'))
const marketingRoutes = new Set([
  '/', '/about', '/services', '/industries', '/portfolio', '/process', '/careers',
  '/contact', '/get-a-quote', '/privacy-policy', '/terms-and-conditions',
])
const isMarketingPage = (path: string) => marketingRoutes.has(path) ||
  /^\/(services|industries|portfolio)\/[^/]+$/.test(path)

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, isRestoringSession, user } = useAuth()
  const { path, navigate } = useRouter()
  const { access, loading: accessLoading } = useWorkspace()

  const isMarketingRoute = isMarketingPage(path)
  const isAuthRoute =
    path === '/login' ||
    path === '/signup' ||
    path === '/register' ||
    path === '/forgot-password' ||
    path === '/accept-invite'

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated && !isAuthRoute && !isMarketingRoute) navigate('/login', { replace: true })
    if (isAuthenticated && user?.role === 'super_admin' && !path.startsWith('/super-admin')) {
      navigate('/super-admin/clients', { replace: true })
    } else if (isAuthenticated && user?.role !== 'super_admin' && (isAuthRoute || isMarketingRoute || path.startsWith('/super-admin'))) {
      navigate('/dashboard', { replace: true })
    }
  }, [isLoading, isAuthenticated, user?.role, path, navigate, isAuthRoute, isMarketingRoute])

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

  if (!isAuthenticated) {
    return path === '/accept-invite' ? <AcceptInvitePage /> : <AuthPage />
  }

  const requestedModule = routeModules[path] || (path.startsWith('/websites/') ? 'websites' : undefined)
  if (user?.role !== 'super_admin' && (path.startsWith('/super-admin') || (requestedModule && !access?.modules.includes(requestedModule)))) {
    return <WorkspaceHome />
  }
  if (user?.role === 'super_admin' && !path.startsWith('/super-admin')) return null
  if (path === '/super-admin/clients' || path.startsWith('/super-admin/clients/')) return <PlatformConsole />
  if (path === '/websites' || path.startsWith('/websites/')) return <WebsitesPage />

  const handleMenuNavigation = (menuName: string) => {
    if (menuName === 'Dashboard') {
      navigate('/dashboard')
    } else if (menuName === 'Leads') {
      navigate('/leads')
    } else if (menuName === 'Bookings') {
      navigate('/bookings')
    } else if (menuName === 'Bills') {
      navigate('/bills')
    } else if (menuName === 'Team') {
      navigate('/team')
    } else if (menuName === 'Itineraries') {
      navigate('/itineraries')
    } else if (menuName === 'Packages') {
      navigate('/packages')
    } else if (menuName === 'Sightseeing') {
      navigate('/sightseeing')
    } else if (menuName === 'Hotels') {
      navigate('/hotels')
    } else if (menuName === 'Websites') {
      navigate('/websites')
    } else if (menuName === 'Host Page') {
      navigate('/host-page')
    } else if (menuName === 'Inbox') {
      navigate('/inbox')
    } else if (menuName === 'Calendar' || menuName === 'Events') {
      navigate('/calendar')
    } else if (menuName === 'Call Log') {
      navigate('/call-log')
    } else if (menuName === 'Follow-ups') {
      navigate('/follow-ups')
    } else if (menuName === 'Invoices') {
      navigate('/invoices')
    } else if (menuName === 'LinkTree') {
      navigate('/linktree')
    } else if (menuName === 'Communications') {
      navigate('/communications')
    } else if (menuName === 'Bot Flows') {
      navigate('/bot-flows')
    } else if (menuName === 'My profile') {
      navigate('/profile')
    } else if (menuName === 'Channels') {
      navigate('/channels')
    } else if (menuName === 'AI Agent') {
      navigate('/ai-agent')
    } else if (menuName === 'Organization') {
      navigate('/organization')
    } else if (menuName === 'Invoice Detail') {
      navigate('/invoice-detail')
    } else if (menuName === 'Automation') {
      navigate('/automation')
    } else {
      navigate('/leads')
    }
  }

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

  // Authenticated CRM Routes:
  if (path === '/bookings') {
    return <BookingsPage onNavigateMenu={handleMenuNavigation} />
  }

  if (path === '/bills') {
    return <BillsPage onNavigateMenu={handleMenuNavigation} />
  }

  if (path === '/team') {
    return <TeamPage onNavigateMenu={handleMenuNavigation} />
  }

  if (path === '/itineraries') {
    return <ItinerariesPage onNavigateMenu={handleMenuNavigation} />
  }

  if (path === '/packages') {
    return <PackagesPage onNavigateMenu={handleMenuNavigation} />
  }

  if (path === '/sightseeing') {
    return <SightseeingPage onNavigateMenu={handleMenuNavigation} />
  }

  if (path === '/hotels') {
    return <HotelsPage onNavigateMenu={handleMenuNavigation} />
  }

  if (path === '/host-page') {
    return <HostPage onNavigateMenu={handleMenuNavigation} />
  }

  if (path === '/inbox') {
    return <InboxPage onNavigateMenu={handleMenuNavigation} />
  }

  if (path === '/calendar' || path === '/events') {
    return <CalendarPage onNavigateMenu={handleMenuNavigation} />
  }

  if (path === '/call-log') {
    return <CallLogPage onNavigateMenu={handleMenuNavigation} />
  }

  if (path === '/follow-ups') {
    return <FollowUpsPage onNavigateMenu={handleMenuNavigation} />
  }

  if (path === '/invoices') {
    return <InvoicesPage onNavigateMenu={handleMenuNavigation} />
  }

  if (path === '/linktree') {
    return <LinkTreePage onNavigateMenu={handleMenuNavigation} />
  }

  if (path === '/communications') {
    return <CommunicationsPage onNavigateMenu={handleMenuNavigation} />
  }

  if (path === '/bot-flows') {
    return <BotFlowsPage onNavigateMenu={handleMenuNavigation} />
  }

  if (path === '/profile') {
    return <ProfilePage onNavigateMenu={handleMenuNavigation} />
  }

  if (path === '/channels') {
    return <ChannelsPage onNavigateMenu={handleMenuNavigation} />
  }

  if (path === '/ai-agent') {
    return <AiAgentPage onNavigateMenu={handleMenuNavigation} />
  }

  if (path === '/organization') {
    return <OrganizationPage onNavigateMenu={handleMenuNavigation} />
  }

  if (path === '/invoice-detail') {
    return <InvoiceDetailPage onNavigateMenu={handleMenuNavigation} />
  }

  if (path === '/automation') {
    return <AutomationPage onNavigateMenu={handleMenuNavigation} />
  }

  if (path === '/dashboard') {
    return <WorkspaceHome />
  }

  if (path === '/leads') {
    return <LeadsPage onNavigateMenu={handleMenuNavigation} />
  }

  return <WorkspaceHome />
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
                                    <AppContent />
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
